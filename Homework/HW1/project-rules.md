# Project Iron Rules (HW1: Production Enterprise Data-Grid)

These rules are absolute and non-negotiable for the entire project lifecycle.

## 1. Tech Stack & Language
*   **Allowed**: Vanilla HTML5, CSS3, and ES6+ JavaScript (Modules).
*   **Forbidden**: No frameworks (React, Vue, Angular, etc.), no CDNs (no external libraries or fonts), and no transpilers/bundlers (No Babel, Webpack, Vite).

## 2. Syntax & Variables
*   **Allowed**: Only `const` and `let`.
*   **Forbidden**: `var` is strictly FORBIDDEN under any circumstances.

## 3. DOM Manipulation & Security
*   **Forbidden**: `innerHTML` is strictly FORBIDDEN for injecting user data or mock data (use `textContent` or `document.createElement`).
*   **Forbidden**: Inline event handlers (e.g., `onclick="..."`, `onkeydown="..."`) are strictly FORBIDDEN.
*   **Mandatory**: Use Event Delegation (Shape B) exclusively. Events must be handled at the container level using `event.target.closest()` and `dataset.vid` for identification.

## 4. Event Handling
*   **Allowed**: Use the `keydown` event along with `event.key` for all keyboard interactions.
*   **Forbidden**: `keypress` is strictly FORBIDDEN.
*   **Forbidden**: `event.keyCode` and `event.which` are strictly FORBIDDEN (deprecated).

## 5. Git & Version Control
*   **Mandatory**: Atomic commits. Each commit must represent one single logical change.
*   **Forbidden**: Bundling CSS changes and JS changes in the same commit is strictly FORBIDDEN. (e.g., You must commit `style: ...` separately from `feat: ...`).

## 6. Documentation & Slide Deviations
*   **Mandatory**: If you fix a bug, refactor, or change any logic presented in the provided slides/materials, you MUST leave a comment using this exact format: 
    `// DEVIATION FROM SLIDE: [Brief explanation of why the change was made]`