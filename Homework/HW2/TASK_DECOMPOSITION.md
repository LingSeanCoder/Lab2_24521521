# Work Breakdown Structure (WBS) - HW2: Concurrent FIFO Audio Visualizer Queue Engine

## 1. Task/Phase Breakdown

### Phase 1: Documentation & Architecture
*   **Task 1.1: Architecture Blueprint**
    *   **Input**: HW2 Specifications (FIFO Queue, Web Audio API, 60fps constraint).
    *   **Output**: `README.md` and `ARCHITECTURE.md` detailing the data flow: `enqueue` -> `fetch` -> `decodeAudioData` -> `AudioBufferSourceNode` -> `AnalyserNode` -> `Canvas`. Explicitly document the `AbortController` lifecycle and node cleanup strategy.

### Phase 2: Audio Queue Engine (Core Logic)
*   **Task 2.1: FIFO Queue Manager (`AudioTaskQueue` class)**
    *   **Input**: Track URLs.
    *   **Output**: A class with `enqueue(trackUrl)` returning a Promise. Internal `queue` array, `isProcessing` flag, and `processNext()` method. Must use `AbortController` for each task.
*   **Task 2.2: Fetch & Decode Pipeline**
    *   **Input**: Track URL and `AbortSignal`.
    *   **Output**: Function that fetches the audio file (`.arrayBuffer()`), decodes it via `AudioContext.decodeAudioData()`, and returns the `AudioBuffer`. Must handle `AbortError` gracefully.
*   **Task 2.3: Playback & Memory Cleanup**
    *   **Input**: `AudioBuffer`.
    *   **Output**: Function creating `AudioBufferSourceNode`, connecting to `AnalyserNode` and destination, starting playback, and rigorously implementing `source.onended = () => { source.disconnect(); ... }` to prevent memory leaks.

### Phase 3: Visualizer Engine
*   **Task 3.1: AnalyserNode Setup**
    *   **Input**: `AudioContext`.
    *   **Output**: Configured `AnalyserNode` with `fftSize = 256` (or 512). A method to extract `Uint8Array` frequency data.
*   **Task 3.2: 60fps Canvas Renderer**
    *   **Input**: Frequency data array, Canvas 2D Context.
    *   **Output**: A `requestAnimationFrame` (rAF) loop that clears the canvas (`clearRect`) and draws bars (or a waveform) based on the data. Must include a `cancelAnimationFrame` mechanism to stop drawing when audio stops.

### Phase 4: UI & Entry Point (DOM/Events)
*   **Task 4.1: HTML Skeleton & CSS**
    *   **Input**: UI requirements.
    *   **Output**: `index.html` with a `<canvas>` element, an input for track URLs, and buttons (Add, Play, Stop/Cancel). `styles.css` for layout.
*   **Task 4.2: Event Delegation & Integration**
    *   **Input**: HTML Skeleton, Audio Queue, Visualizer.
    *   **Output**: `main.js` attaching a single event listener to the UI container. Wires up the "Add Track" button to `queue.enqueue()`, and the "Stop" button to `controller.abort()` and `cancelAnimationFrame()`.

### Phase 5: Testing & Optimization
*   **Task 5.1: Manual QA**
    *   **Input**: Completed application.
    *   **Output**: Test report verifying: 1) Multiple tracks queue and play sequentially, 2) Canceling a track skips to the next without breaking, 3) Visualizer syncs with audio, 4) Chrome DevTools Memory tab shows no leaks after playing 10+ tracks.

---

## 2. Risks & Mitigations

| Risk | Description | Mitigation |
| :--- | :--- | :--- |
| **FIFO Queue Deadlock** | If a fetch or decode fails, the Promise rejects, but the `isProcessing` flag might not be reset, or `processNext()` is never called again. The entire queue freezes. | **Mandatory:** Wrap the execution of a task in `try...catch...finally`. Ensure `this.processNext()` is called inside the `finally` block so the queue always moves forward, regardless of success or failure. |
| **Memory Leaks** | `AudioBufferSourceNode` and `AnalyserNode` are kept alive by the browser's Web Audio graph if not explicitly disconnected, causing memory spikes over time. | **Mandatory:** Assign an `onended` handler to the `AudioBufferSourceNode` that calls `.disconnect()` on all connected nodes. Also, remove event listeners and nullify references. |
| **Canvas Performance Drop** | Creating DOM elements, calling state updates, or doing heavy math inside the `requestAnimationFrame` loop will drop frames below 60fps. | Only use pure Canvas 2D API commands (`clearRect`, `fillRect`, `beginPath`) inside the rAF loop. Do not trigger UI updates or re-renders from inside the animation loop. |
| **AbortError Crash** | When `AbortController.abort()` is called, the `fetch` API throws a DOMException. If unhandled, it crashes the app. | Check `error.name === 'AbortError'` in the `catch` block and handle it silently (or log a clean cancellation message). |

---

## 3. Commit Milestones

*Rule: No mixing CSS and JS in the same commit. Each commit must be functional and atomic.*

*   **Commit 1**: `chore: setup project structure and basic html`
*   **Commit 2**: `docs: add architecture blueprint and README`
*   **Commit 3**: `feat: implement AudioTaskQueue and FIFO logic`
*   **Commit 4**: `feat: add fetch and decode pipeline with AbortController`
*   **Commit 5**: `feat: implement AudioBufferSourceNode playback and cleanup`
*   **Commit 6**: `feat: add AnalyserNode setup and frequency extraction`
*   **Commit 7**: `feat: implement 60fps Canvas visualizer loop`
*   **Commit 8**: `feat: wire up UI events using Event Delegation`
*   **Commit 9**: `style: add CSS for layout and visualizer presentation`
*   **Commit 10**: `fix: resolve memory leaks and queue deadlocks (if any)`