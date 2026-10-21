Nguyễn Đình Sang - 24521521
# HW1: Production Enterprise Data-Grid (WCAG 2.2 AA)

## Introduction

A production-grade, fully accessible Data-Grid component built with vanilla web technologies. The grid supports sorting, filtering, and pagination while meeting WCAG 2.2 Level AA compliance and achieving a perfect 100/100 Lighthouse score for Accessibility and Best Practices.

**Key Features:**
- Full keyboard navigation (Arrow keys, Enter, Space) with roving tabindex
- ARIA grid semantics with native table structure
- Screen reader support for sorting, selection, and pagination state
- 4.5:1 color contrast and visible focus indicators
- Zero `div`-soup: only native `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th scope="col">`, `<td>`, and `<button>`

## Tech Stack

- **HTML5** (native semantic elements)
- **CSS3** (custom properties, focus-visible, prefers-reduced-motion)
- **ES6+ JavaScript** (modules, closures, event delegation)

No frameworks, no CDNs, no Babel, no build step.

## Architecture

- **Virtual DOM (VNode)**: A minimal `render(state)` → `mount(vnode)` → `diff(old, new)` pipeline for efficient DOM updates.
- **Event Delegation (Shape B)**: A single listener on the grid container routes events via `event.target.closest('[data-vid]')` and `dataset.vid` to identify the target cell or control. No per-cell listeners.
- **Zero div-soup**: All layout and structure use native table elements with `role="grid"`, `role="row"`, and `role="gridcell"` applied to the appropriate native elements. No `<div>` wrappers for layout.

## Getting Started

1. Clone or download this repository.
2. Open `index.html` using **Live Server** (VS Code extension) or any static file server.
3. The grid loads with 30 mock users and is immediately keyboard-navigable.

> **Note:** Opening `index.html` directly via `file://` may block ES module imports. Always use a local server.

## Project Structure
```
.
├── index.html
├── styles.css
├── js/
│   ├── main.js
│   ├── types.js
│   ├── mock-data.js
│   ├── vnode.js
│   ├── state.js
│   └── grid.js
└── README.md
```

## Accessibility Contract

- WCAG 2.2 Level AA compliant
- 4.5:1 minimum color contrast
- Full screen reader support (tested with VoiceOver and NVDA)
- Keyboard-only operation: Arrow keys navigate cells, Enter selects a row, Space toggles selection
- Roving tabindex: exactly one cell has `tabindex="0"` at any time

## Verification

- Lighthouse: 100/100 Accessibility and Best Practices
- Axe-core: zero violations
- Manual screen reader testing passed