# HW3: High-Concurrency Flash-Sale E-Commerce Engine

## Introduction

A realistic simulation of a high-traffic e-commerce flash sale (modeled after Shopee/Lazada 11.11 Mega Sales). This project focuses on solving two critical frontend challenges in high-concurrency environments:

1.  **Zero-Drift Countdown Timer**: An accurate millisecond countdown that does not drift or lose synchronization when the browser tab is throttled or the main thread is blocked.
2.  **Optimistic Inventory Lock**: A finite state machine that safely handles inventory reservation, lock expiry, and checkout without causing race conditions or overselling.

## Key Features

*   **Precision Anti-Drift Timer**: Utilizes `requestAnimationFrame` combined with `Date.now()` delta calculations to guarantee absolute timing accuracy, completely avoiding the drift-prone `setInterval` approach.
*   **Optimistic Inventory State Machine**: Manages product availability through distinct states (`AVAILABLE`, `LOCKED`, `SOLD_OUT`). When a user initiates a purchase, the item is instantly locked for a specific duration. If the checkout is not completed, the lock expires, and the item returns to the available pool.
*   **No Framework, No Dependencies**: Built entirely with vanilla web technologies for maximum performance and zero overhead.

## Tech Stack

*   **HTML5** (Semantic structure)
*   **CSS3** (Responsive layout, transitions)
*   **Vanilla ES6+ JavaScript** (Modules, Classes, State Machines)

No React, Vue, Angular, CDNs, or Babel. Just pure, native web APIs.

## Architecture

*   **Timer Engine (`timer.js`)**: Uses a `requestAnimationFrame` loop to constantly compare the `targetTime` against the current `Date.now()`, ensuring the UI updates exactly when the time changes, regardless of frame rate drops.
*   **Inventory State Machine (`inventory.js`)**: 
    *   `AVAILABLE`: Item is in stock and can be purchased.
    *   `LOCKED`: Item is temporarily reserved by a user (e.g., for 5 minutes).
    *   `SOLD_OUT`: Item has been successfully purchased.
    *   Utilizes timeouts to automatically transition `LOCKED` items back to `AVAILABLE` if the reservation expires.

## Getting Started

1.  Clone or download this repository.
2.  Open the project folder in your code editor.
3.  Serve the `index.html` file using **Live Server** (VS Code extension) or any local static server.
4.  Observe the countdown timer accuracy and test the inventory locking mechanism by clicking the "Buy Now" button on available items.