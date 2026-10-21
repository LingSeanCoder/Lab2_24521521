import { AudioTaskQueue } from './audio-queue.js';
import { AudioVisualizer } from './visualizer.js';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const canvas = document.getElementById('visualizer');
const visualizer = new AudioVisualizer(canvas, audioContext);
const queue = new AudioTaskQueue(audioContext);
const analyser = visualizer.getAnalyser();

const urlInput = document.getElementById('url-input');
const addBtn = document.getElementById('add-btn');
const abortBtn = document.getElementById('abort-btn');
const queueList = document.getElementById('queue-list');

addBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    const li = document.createElement('li');
    const urlSpan = document.createElement('span');
    urlSpan.textContent = url;
    
    const statusSpan = document.createElement('span');
    statusSpan.textContent = 'Pending';
    statusSpan.className = 'status-loading';
    
    li.appendChild(urlSpan);
    li.appendChild(statusSpan);
    queueList.appendChild(li);
    
    urlInput.value = '';

    try {
        const audioBuffer = await queue.enqueue(url, (status) => {
            statusSpan.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            statusSpan.className = `status-${status}`;
        });

        if (audioBuffer) {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            
            source.connect(analyser);
            
            source.onended = () => {
                source.disconnect();
                visualizer.stop();
                statusSpan.textContent = 'Played';
                statusSpan.className = 'status-done';
            };
            
            source.start(0);
            visualizer.draw();
        }
    } catch (error) {
        console.error('Playback failed:', error);
    }
});

abortBtn.addEventListener('click', () => {
    queue.abortCurrent();
});