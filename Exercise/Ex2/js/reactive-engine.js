// js/reactive-engine.js

import { renderToDOM } from './mini-react/index.js';

export const stateStore = {
  hooks: [],           // [{ value }]
  cursor: 0,
  rootContainer: null,
  rootComponent: null,
  scheduled: false,
  handlers: new Map(), // vid -> { type, fn }
  vidCounter: 0,
};

export function resetCursor() {
  stateStore.cursor = 0;
}

export function useState(initialValue) {
  const idx = stateStore.cursor;
  stateStore.cursor += 1;

  if (stateStore.hooks[idx] === undefined) {
    stateStore.hooks[idx] = {
      value: typeof initialValue === 'function' ? initialValue() : initialValue,
    };
  }

  const hook = stateStore.hooks[idx];

  const setState = (next) => {
    const resolved = typeof next === 'function' ? next(hook.value) : next;
    if (Object.is(resolved, hook.value)) return;
    hook.value = resolved;
    scheduleRender();
  };

  // RETURN ĐÚNG: hook.value (không phải hooks[cursor] sau khi tăng)
  return [hook.value, setState];
}

function scheduleRender() {
  if (stateStore.scheduled) return;
  stateStore.scheduled = true;
  queueMicrotask(() => {
    stateStore.scheduled = false;
    performRender();
  });
}

function performRender() {
  if (!stateStore.rootContainer || !stateStore.rootComponent) return;
  resetCursor();
  stateStore.handlers.clear();
  const tree = stateStore.rootComponent();
  const dom = renderToDOM(tree);
  stateStore.rootContainer.replaceChildren(dom);
}

export function renderApp(componentFn, container) {
  stateStore.rootComponent = componentFn;
  stateStore.rootContainer = container;
  resetCursor();
  stateStore.handlers.clear();
  const tree = componentFn();
  const dom = renderToDOM(tree);
  container.replaceChildren(dom);
}

// DEVIATION FROM SLIDE: fixed useState cursor bug (slide p.18 reads hooks[cursor]
// after increment, returning wrong index).