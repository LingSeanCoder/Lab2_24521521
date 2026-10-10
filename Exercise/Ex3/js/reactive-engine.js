// js/reactive-engine.js

import { renderToDOM, handlerMap, vidCounterRef } from './render.js';

const stateStore = {
  hooks: [],
  cursor: 0,
  rootContainer: null,
  rootComponent: null,
  scheduled: false,
};

function resetCursor() {
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
  handlerMap.clear();
  const tree = stateStore.rootComponent();
  const dom = renderToDOM(tree);
  stateStore.rootContainer.replaceChildren(dom);
}

function attachDelegationHub(container) {
  if (container.dataset.hubAttached === 'true') return;
  container.dataset.hubAttached = 'true';
  const dispatch = (e) => {
    let node = e.target;
    while (node && node !== container) {
      const vid = node.dataset?.vid;
      if (vid && handlerMap.has(vid)) {
        const fn = handlerMap.get(vid)?.handlers?.[e.type];
        if (typeof fn === 'function') {
          fn(e);
          return;
        }
      }
      node = node.parentNode;
    }
  };
  ['click', 'keydown', 'input', 'change', 'submit'].forEach((t) =>
    container.addEventListener(t, dispatch)
  );
}

export function renderApp(componentFn, container) {
  stateStore.rootComponent = componentFn;
  stateStore.rootContainer = container;
  resetCursor();
  handlerMap.clear();
  const tree = componentFn();
  const dom = renderToDOM(tree);
  container.replaceChildren(dom);
  attachDelegationHub(container);
}

// DEVIATION FROM SLIDE: useState snapshots cursor idx before incrementing,
// then reads hook by that idx — fixes slide p.18 bug where increment
// happens before read.