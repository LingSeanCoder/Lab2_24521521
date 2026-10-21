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

// Hàng đợi phát nhạc (để các bài không đè lên nhau)
let isPlaying = false;
const playbackQueue = [];

function playNext() {
    if (isPlaying || playbackQueue.length === 0) return;
    isPlaying = true;

    const { audioBuffer, statusSpan } = playbackQueue.shift();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);

    source.onended = () => {
        source.disconnect();
        isPlaying = false;
        statusSpan.textContent = 'Played';
        statusSpan.className = 'status-done';
        playNext(); // Phát bài tiếp theo
    };

    statusSpan.textContent = 'Playing';
    statusSpan.className = 'status-playing';
    
    // Reset visualizer trước khi vẽ bài mới để không bị đè RAF
    visualizer.stop(); 
    source.start(0);
    visualizer.draw();
}

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
            if (statusSpan.textContent !== 'Playing' && statusSpan.textContent !== 'Played') {
                statusSpan.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                statusSpan.className = `status-${status}`;
            }
        });

        if (audioBuffer) {
            playbackQueue.push({ audioBuffer, statusSpan });
            playNext();
        }
    } catch (error) {
        console.error('Playback failed:', error);
    }
});

abortBtn.addEventListener('click', () => {
    queue.abortCurrent();
});