# Work Breakdown Structure (WBS) - HW1: Production Enterprise Data-Grid (WCAG 2.2 AA)

## 1. Task/Phase Breakdown

### Phase 1: Setup & Documentation
*   **Task 1.1: Project Initialization**
    *   **Input**: HW1 requirements.
    *   **Output**: Project directory with `index.html`, `main.ts` (or `main.js`), `styles.css`. ESLint and Prettier configuration.
*   **Task 1.2: Architecture Documentation**
    *   **Input**: Architectural constraints (Vanilla JS, VNode, Event Delegation Shape B).
    *   **Output**: `README.md` or `ARCHITECTURE.md` describing the data flow, VNode lifecycle, and Event Delegation design.

### Phase 2: Data Contracts & State Management
*   **Task 2.1: Define Types/Interfaces**
    *   **Input**: `data-grid-contract.ts` specifications.
    *   **Output**: `types.ts` file containing exact definitions for `ColumnDef<T>` and `DataGridProps<T>`.
*   **Task 2.2: Mock Data & State Store**
    *   **Input**: Data structures from `types.ts`.
    *   **Output**: `mock-data.js` with sample data. A simple state store (using closures/objects) managing: `data`, `sortedBy`, `filterQuery`, `currentPage`, `activeCell`, and `selectedRows`.

### Phase 3: Core Logic (VNode & Event Delegation)
*   **Task 3.1: VNode Engine**
    *   **Input**: Current application state.
    *   **Output**: `render(state)` function generating a VNode tree. `mount(vnode, container)` function converting VNodes to real DOM. `diff(oldVNode, newVNode)` function for optimized DOM updates.
*   **Task 3.2: Event Delegation System (Shape B)**
    *   **Input**: Grid container DOM.
    *   **Output**: A single event listener on the container. Event routing mechanism based on `event.target` and `data-*` attributes to trigger actions (Sort, Filter, Select, Navigate).
*   **Task 3.3: Data Processing Logic (Sort, Filter, Pagination)**
    *   **Input**: Raw data, sort/filter/page parameters.
    *   **Output**: `getProcessedData()` function returning the sorted, filtered, and paginated data array.

### Phase 4: UI & Accessibility (Zero div-soup)
*   **Task 4.1: Native Table Skeleton**
    *   **Input**: Processed data (Phase 3).
    *   **Output**: Pure DOM structure using `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th scope="col">`, `<td>`, `<button>`. Strictly no `<div>` for layout.
*   **Task 4.2: ARIA Grid Semantics**
    *   **Input**: Native Table Skeleton.
    *   **Output**: Assign `role="grid"` to `<table>`, `role="row"` to `<tr>`, `role="gridcell"` to `<td>`, `role="columnheader"` to `<th>`. Add `aria-sort`, `aria-selected`, `aria-rowcount`, `aria-colcount` attributes.
*   **Task 4.3: Keyboard Navigation (Roving Tabindex)**
    *   **Input**: Keyboard events from Event Delegation.
    *   **Output**: Focus movement logic using Arrow keys (Up/Down/Left/Right). Enter key for row selection, Space to toggle. Manage `tabindex="0"` on the active cell and `tabindex="-1"` on all others.
*   **Task 4.4: Styling (CSS)**
    *   **Input**: DOM Skeleton.
    *   **Output**: `styles.css` ensuring color contrast (4.5:1), visible focus outlines, and avoiding `outline: none` without a proper alternative.

### Phase 5: Verification & QA
*   **Task 5.1: Lighthouse Audit**
    *   **Input**: Built application.
    *   **Output**: Lighthouse report achieving 100/100 for Accessibility and Best Practices. Fix all warnings.
*   **Task 5.2: Screen Reader Testing**
    *   **Input**: Built application.
    *   **Output**: Manual testing report (VoiceOver/NVDA) confirming the grid is announced correctly regarding structure, order, and state.

---

## 2. Risks & Mitigations

| Risk | Description | Mitigation |
| :--- | :--- | :--- |
| **Keyboard Navigation (Roving Tabindex)** | Focus is lost during DOM re-render (due to VNode diffing) or the user gets trapped inside the grid. | Store `activeCell` in State. Before re-rendering, save the ID of the focused cell. After rendering, call `.focus()` on that cell again. Ensure only one cell has `tabindex="0"` and others have `-1`. Handle `Tab` and `Shift+Tab` to allow exiting the grid. |
| **Native Table vs ARIA Grid** | Screen readers may conflict between the default semantics of `<table>` and `role="grid"` (e.g., announcing "table" twice or failing to recognize column/row structure). | Add `role="presentation"` to `<thead>` and `<tbody>` if necessary so the screen reader only reads the `role="grid"`. Use `aria-rowindex` and `aria-colindex` for each cell. Ensure `<th>` has `role="columnheader"` and `scope="col"`. |
| **Race Condition (Async)** | If filter/sort is processed asynchronously (simulating an API fetch), stale data might overwrite newer data. | Use `AbortController` or a sequence ID counter. Only update State if the response's `requestId` matches the latest `requestId`. |
| **Lighthouse < 100** | Accessibility score is deducted due to poor contrast, missing alt text, or ARIA attribute errors. | Integrate `axe-core` during development for automated checks. Use tools to verify contrast ratios (Stark, Contrast Checker). Strictly review mandatory ARIA attributes for the grid. |
| **Event Delegation Errors** | Click events are misattributed to the wrong target when elements are nested (e.g., a button inside a `<th>`). | Use the `closest()` method in the Event Listener to find the exact element with the `data-action` attribute (e.g., `e.target.closest('[data-action="sort"]')`). |

---

## 3. Commit Milestones

*Rule: Do not bundle CSS and JS in the same commit. Each commit must be a complete logical unit, and the application must not have syntax errors.*

*   **Commit 1**: `chore: setup project and basic html structure`
*   **Commit 2**: `feat: define data-grid types and contracts`
*   **Commit 3**: `feat: implement VNode rendering engine`
*   **Commit 4**: `feat: implement event delegation architecture`
*   **Commit 5**: `feat: add data processing logic (sort, filter, pagination)`
*   **Commit 6**: `feat: build native table UI skeleton`
*   **Commit 7**: `feat: add ARIA grid semantics and attributes`
*   **Commit 8**: `feat: implement keyboard navigation (roving tabindex)`
*   **Commit 9**: `style: add CSS for layout, contrast, and focus states`
*   **Commit 10**: `fix: resolve accessibility issues and pass Lighthouse 100/100`