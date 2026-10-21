# HW2: Concurrent FIFO Audio Visualizer Queue Engine

## Introduction

An advanced asynchronous audio management system that handles a queue of audio tracks, decodes them using the Web Audio API, and visualizes the frequency spectrum in real-time. The engine ensures safe concurrent operations, supports mid-flight task cancellation, and maintains strict memory hygiene by explicitly cleaning up audio nodes.

## Key Features

*   **Asynchronous FIFO Queue**: Manages simultaneous track downloads and audio buffer decoding sequentially, ensuring only one track is processed at a time.
*   **Concurrency Control**: Implements a robust Promise-based queue (`AudioTaskQueue`) that safely manages the processing state, preventing race conditions and overlapping audio playback.
*   **Task Cancellation**: Utilizes `AbortController` to cleanly abort pending fetches or ongoing decoding processes, ensuring stale tracks do not play or leak resources.
*   **Memory Safety**: Explicitly disconnects `AudioBufferSourceNode` instances upon track completion or abortion to prevent memory leaks and audio context degradation.
*   **Real-time Visualization**: Integrates `AnalyserNode` (FFT size 256/512) with a `requestAnimationFrame` loop to render a 60fps Canvas visualizer without React state thrashing or layout thrashing.

## Tech Stack

*   **HTML5** (Canvas API)
*   **CSS3**
*   **ES6+ JavaScript** (Modules, Promises, Async/Await, Classes)

No frameworks, no CDNs, no Babel, and no build tools. Pure, modern web standards.

## Getting Started

1.  Clone or download this repository.
2.  Open the project folder in your code editor.
3.  Serve the `index.html` file using **Live Server** (VS Code extension) or any local static server.
    *   *Note: Web Audio API and ES Modules require a secure context (`http://localhost` or `https://`). Opening the file directly via `file://` will not work.*
4.  Interact with the UI to enqueue tracks, observe the queue processing, test the abort functionality, and watch the audio visualizer respond to the playback.