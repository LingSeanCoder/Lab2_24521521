export class AudioTaskQueue {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.queue = [];
        this.isProcessing = false;
        this.activeController = null;
    }

    enqueue(trackUrl, onStatusChange) {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            this.queue.push({
                trackUrl,
                controller,
                resolve,
                reject,
                onStatusChange
            });
            this.processNext();
        });
    }

    async processNext() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        const task = this.queue.shift();
        this.isProcessing = true;
        this.activeController = task.controller;

        if (task.onStatusChange) {
            task.onStatusChange('loading');
        }

        try {
            const response = await fetch(task.trackUrl, { signal: task.controller.signal });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            task.resolve(audioBuffer);
            
            if (task.onStatusChange) {
                task.onStatusChange('success');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                task.reject(new Error('Aborted'));
                if (task.onStatusChange) {
                    task.onStatusChange('aborted');
                }
            } else {
                task.reject(error);
                if (task.onStatusChange) {
                    task.onStatusChange('error');
                }
            }
        } finally {
            this.isProcessing = false;
            this.activeController = null;
            this.processNext();
        }
    }

    abortCurrent() {
        if (this.activeController) {
            this.activeController.abort();
        }
    }
}