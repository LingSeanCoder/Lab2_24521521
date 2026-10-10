// --- FILE 2: js/reactive-engine.js ---

import { renderToDOM, handlerMap } from './render.js';

export const stateStore = {
  hooks: [],           // [{ value }]
  cursor: 0,
  rootContainer: null,
  rootComponent: null,
  scheduled: false,
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

export function renderApp(componentFn, container) {
  stateStore.rootComponent = componentFn;
  stateStore.rootContainer = container;
  attachDelegationHub(container);
  resetCursor();
  handlerMap.clear();
  const tree = componentFn();
  const dom = renderToDOM(tree);
  container.replaceChildren(dom);
}

const EVENT_PROP_MAP = {
  click:    'onClick',
  keydown:  'onKeyDown',
  keyup:    'onKeyUp',
  input:    'onInput',
  change:   'onChange',
  focus:    'onFocus',
  blur:     'onBlur',
  submit:   'onSubmit',
};

const PROP_TO_EVENT_TYPE = Object.fromEntries(
  Object.entries(EVENT_PROP_MAP).map(([type, prop]) => [prop, type])
);

export function attachDelegationHub(container) {
  if (container.dataset.hubAttached === 'true') return;
  container.dataset.hubAttached = 'true';

  const dispatch = (e) => {
    let node = e.target;
    while (node && node !== container) {
      const vid = node.dataset?.vid;
      if (vid && handlerMap.has(vid)) {
        const entry = handlerMap.get(vid);
        if (entry.type === e.type) {
          entry.fn(e);
          return;
        }
      }
      node = node.parentNode;
    }
  };

  // Attach MỘT listener cho mỗi event type, không phải cho mỗi node.
  ['click', 'keydown', 'keyup', 'input', 'change', 'focus', 'blur', 'submit']
    .forEach(type => container.addEventListener(type, dispatch));
}

// DEVIATION FROM SLIDE: fixed useState cursor bug (slide p.18 reads hooks[cursor]
// after increment, returning wrong index).
// DEVIATION FROM SLIDE:
// (1) use EVENT_PROP_MAP instead of string manipulation to avoid onKeydown bug.
// (2) attach listener per event type on root, not one per node.
// (3) renderToDOM must set dataset.vid — slide's renderToDOM (p.12) omits this.