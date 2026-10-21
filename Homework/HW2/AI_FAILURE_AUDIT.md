# AI_FAILURE_AUDIT.md

Audit of potential critical errors and anti-patterns in HW2: Concurrent FIFO Audio Visualizer Queue Engine, based on the provided contract and specifications.

---

## 1. Async Promise Wrapper Anti-Pattern

**Problem:**
The provided contract snippet declares `async enqueue(trackUrl: string): Promise<AudioBuffer>`, but the implementation inside creates and returns a `new Promise`. If an error occurs synchronously before the Promise executor is called, or if the `resolve`/`reject` callbacks are not properly wired to the queue's processing logic, the returned Promise will hang indefinitely (memory leak / UI freeze).

**Contract Snippet (Buggy):**
```typescript
async enqueue(trackUrl: string): Promise<AudioBuffer> {
  const controller = new AbortController();
  return new Promise((resolve, reject) => {
    this.queue.push({ trackUrl, controller, resolve, reject });
  });
  this.processNext();
}
```

**Fix:**
Since the function is already `async`, you do not need to manually wrap it in `new Promise` unless you are bridging a callback-based API. If you must use `new Promise`, ensure `reject` is called for every possible failure path (e.g., `try/catch` inside the executor). Even better, refactor to avoid the `async` keyword if returning a manual Promise, or properly `await` the queue processing.

**Correct Approach:**
```typescript
enqueue(trackUrl: string): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    this.queue.push({ trackUrl, controller, resolve, reject });
    this.processNext().catch(reject); // Catch unexpected errors in the processor
  });
}
```

---

## 2. Unhandled `AbortError` in Fetch/Decode

**Problem:**
When `AbortController.abort()` is called, `fetch()` throws a `DOMException` with the name `AbortError`. If the `catch` block treats all errors equally (e.g., logging them as network failures or rejecting the Promise without cleanup), it will crash the app or pollute the console with false errors.

**Buggy Code:**
```javascript
try {
  const response = await fetch(url, { signal: controller.signal });
  const arrayBuffer = await response.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
} catch (error) {
  console.error("Failed to load track", error); // Will log errors even on valid aborts
  throw error;
}
```

**Fix:**
Always check `error.name === 'AbortError'` to gracefully handle cancellations.

**Correct Code:**
```javascript
try {
  const response = await fetch(url, { signal: controller.signal });
  const arrayBuffer = await response.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log(`Track download aborted: ${url}`);
    // Handle silently or reject with a specific cancellation error
  } else {
    console.error(`Failed to load track: ${url}`, error);
  }
  throw error;
}
```

---

## 3. Memory Leak via Uncleaned Audio Nodes

**Problem:**
`AudioBufferSourceNode` and `AnalyserNode` are created for playback. If they are not explicitly disconnected after the audio finishes playing (`onended`) or is aborted, they will remain in memory, referencing the `AudioContext` and causing a memory leak.

**Buggy Code:**
```javascript
const source = audioContext.createBufferSource();
source.buffer = audioBuffer;
source.connect(analyser);
source.start(0);
// Missing onended cleanup
```

**Fix:**
Explicitly call `disconnect()` on the source node when playback ends or is aborted. You must also clear the `onended` callback to break the reference chain.

**Correct Code:**
```javascript
const source = audioContext.createBufferSource();
source.buffer = audioBuffer;
source.connect(analyser);
source.start(0);

source.onended = () => {
  source.onended = null;
  source.disconnect();
  analyser.disconnect(); // If analyser is not reused globally
  
  // Notify queue to process next item
};
```

---

## 4. Visualizer CPU Leak (Missing `cancelAnimationFrame`)

**Problem:**
The visualizer uses `requestAnimationFrame` (rAF) to draw at 60fps. If the user pauses, stops the audio, or navigates away, and the rAF loop is not canceled, the browser will continue executing the render loop indefinitely, causing high CPU usage and battery drain.

**Buggy Code:**
```javascript
function draw() {
  requestAnimationFrame(draw);
  // ... drawing logic ...
}
draw(); // Starts an infinite loop
```

**Fix:**
Store the `requestAnimationFrame` ID and call `cancelAnimationFrame` when the audio state changes to paused/stopped.

**Correct Code:**
```javascript
let rafId = null;

function draw() {
  // ... drawing logic ...
  rafId = requestAnimationFrame(draw);
}

function startVisualizer() {
  if (!rafId) draw();
}

function stopVisualizer() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
```