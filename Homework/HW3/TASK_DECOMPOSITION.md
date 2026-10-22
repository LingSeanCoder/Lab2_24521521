# Work Breakdown Structure (WBS) - HW3: High-Concurrency Flash-Sale E-Commerce Engine

## 1. Task/Phase Breakdown

### Phase 1: Docs & Audit
*   **Task 1.1: Project Initialization & Rules**
    *   **Input**: HW3 Specifications and constraints.
    *   **Output**: `README.md` and `project-rules.md` defining the project scope, tech stack (Vanilla JS), and strict coding standards (No `var`, No `setInterval`, No `innerHTML`).
*   **Task 1.2: AI Failure Audit**
    *   **Input**: Common AI pitfalls in concurrency and timing.
    *   **Output**: `AI_FAILURE_AUDIT.md` documenting at least 3 critical flaws (Drift Timer, Race Condition, Lock Memory Leak) and their fixes.
*   **Task 1.3: Task Decomposition**
    *   **Input**: Mindmap structure.
    *   **Output**: `TASK_DECOMPOSITION.md` (this file) detailing the WBS, Risks, and Commit Milestones.

### Phase 2: Core Logic
*   **Task 2.1: Anti-Drift Timer (`js/timer.js`)**
    *   **Input**: Target duration (ms) and a callback function.
    *   **Output**: A module using `requestAnimationFrame` and `Date.now()` delta to calculate precise remaining time. Returns a cleanup function (`cancelAnimationFrame`).
*   **Task 2.2: Inventory State Machine (`js/inventory.js`)**
    *   **Input**: Initial stock quantity.
    *   **Output**: A class managing states (`AVAILABLE`, `LOCKED`, `SOLD_OUT`). Includes methods for `reserve()` and `checkout()`.
*   **Task 2.3: Optimistic Lock & Expiry**
    *   **Input**: Lock duration (e.g., 15 seconds).
    *   **Output**: Integrated into the State Machine. Uses `setTimeout` to auto-revert `LOCKED` items to `AVAILABLE` if `checkout()` isn't called. Must use `clearTimeout` on successful checkout to prevent memory leaks.

### Phase 3: UI & Integration
*   **Task 3.1: HTML Structure (`index.html`)**
    *   **Input**: UI requirements.
    *   **Output**: Semantic HTML skeleton containing a Flash Sale header, a countdown timer display, and a product card grid.
*   **Task 3.2: CSS Flash Sale Theme (`styles.css`)**
    *   **Input**: Visual guidelines (Shopee/Lazada 11.11 style).
    *   **Output**: CSS with vibrant reds/oranges, hover effects, and distinct visual states for buttons (`Available` vs `Locked` vs `Sold Out`).
*   **Task 3.3: Main Integration (`js/main.js`)**
    *   **Input**: HTML, CSS, Timer, and Inventory modules.
    *   **Output**: A single Event Delegation listener on the container. Handles "Buy Now" clicks, triggers the state machine, updates DOM elements (timers, buttons, stock counts), and handles UI cleanup.

### Phase 4: Verification
*   **Task 4.1: Concurrency & Drift Testing**
    *   **Input**: Finished application.
    *   **Output**: Manual QA verifying:
        1. Timer doesn't drift when tab is backgrounded (Throttling test).
        2. Double-clicking "Buy" rapidly does not oversell (Race condition test).
        3. Locked items automatically unlock after 15 seconds (Expiry test).
*   **Task 4.2: Git Versioning**
    *   **Input**: Source code.
    *   **Output**: At least 8 discrete, atomic commits following Conventional Commits, ensuring CSS and JS are committed separately.

---

## 2. Risks & Mitigations

| Risk | Description | Mitigation |
| :--- | :--- | :--- |
| **Timer Drift** | Using `setInterval` causes the countdown to fall out of sync with real-world time, especially when the browser tab is backgrounded. | **Mandatory:** Use `requestAnimationFrame` combined with `Date.now()` delta calculations. Never use `setInterval` for the core time loop. |
| **Race Condition (Overselling)** | Multiple rapid clicks pass the `stock > 0` check before the state updates, causing inventory to go negative. | **Mandatory:** Implement a synchronous State Machine. Lock the state (`AVAILABLE` -> `LOCKED`) immediately upon click, before any async operations. Reject subsequent clicks if state is not `AVAILABLE`. |
| **Deadlock / Memory Leak** | A user clicks "Buy" (locking the item) but abandons the page. The item is locked forever, and the timeout function leaks memory. | **Mandatory:** Use a `setTimeout` (e.g., 15s) to auto-revert `LOCKED` states back to `AVAILABLE`. Explicitly call `clearTimeout` if the user successfully checks out. |
| **UI State Desync** | The UI button says "Buy" but the internal state machine says `LOCKED` due to missed DOM updates. | Centralize state rendering. Any state change in `inventory.js` must trigger a dedicated `render()` function to sync the DOM strictly with the data state. |

---

## 3. Commit Milestones

*Rule: Minimum 8 commits. No mixing CSS and JS in the same commit. Each commit must be functional and atomic.*

*   **Commit 1**: `chore: initialize project structure and README`
*   **Commit 2**: `docs: add project rules and AI failure audit`
*   **Commit 3**: `feat: implement anti-drift timer with requestAnimationFrame`
*   **Commit 4**: `feat: implement inventory state machine with optimistic locking`
*   **Commit 5**: `feat: build semantic HTML structure for product cards`
*   **Commit 6**: `style: add flash sale theme and state-based button styles`
*   **Commit 7**: `feat: wire up event delegation and integrate timer with UI`
*   **Commit 8**: `fix: resolve lock expiry memory leak and cleanup timers`
*   **Commit 9**: `test: verify concurrency edge cases and timer accuracy`