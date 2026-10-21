export class AudioVisualizer {
    constructor(canvasElement, audioContext) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.audioContext = audioContext;

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.connect(this.audioContext.destination);

        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        this.rafId = null;
    }

    getAnalyser() {
        return this.analyser;
    }

    draw() {
        // Hủy RAF cũ trước khi tạo mới để tránh rò rỉ
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        this.rafId = requestAnimationFrame(this.draw.bind(this));
        
        this.analyser.getByteFrequencyData(this.dataArray);

        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Sửa công thức tính width để không bị tràn Canvas
        const barWidth = (this.canvas.width / this.bufferLength);
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height;

            this.ctx.fillStyle = `rgb(74, 144, 226)`;
            // Trừ 1px để tạo khoảng cách giữa các cột
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 1, barHeight);

            x += barWidth;
        }
    }

    stop() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
}