// js/reactive-engine.js

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
  attachDelegationHub(container);
  resetCursor();
  stateStore.handlers.clear();
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

// Local renderToDOM (copy factory từ Ex1 + bổ sung vid assignment cho delegation).
function renderToDOM(vnode) {
  if (vnode === null || vnode === undefined || typeof vnode === 'boolean') {
    return document.createTextNode('');
  }
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode));
  }
  if (vnode.type === 'TEXT_ELEMENT') {
    const value = vnode.props && vnode.props.nodeValue;
    return document.createTextNode(value == null ? '' : String(value));
  }

  const el = document.createElement(vnode.type);
  const props = vnode.props || {};
  const children = props.children || [];

  for (const [propName, propValue] of Object.entries(props)) {
    if (propName === 'children') continue;
    if (propName === 'nodeValue') continue;

    if (propName.startsWith('on') && typeof propValue === 'function') {
      const eventType = PROP_TO_EVENT_TYPE[propName];
      if (!eventType) continue;
      const vid = String(stateStore.vidCounter++);
      el.dataset.vid = vid;
      stateStore.handlers.set(vid, { type: eventType, fn: propValue });
      // Không để onclick=... trong DOM.
      el.removeAttribute(propName);
      continue;
    }

    if (propValue === null || propValue === undefined || propValue === false) continue;

    if (propName === 'className') {
      el.setAttribute('class', propValue);
      continue;
    }

    el.setAttribute(propName, propValue);
  }

  for (const child of children) {
    el.appendChild(renderToDOM(child));
  }

  return el;
}

export function attachDelegationHub(container) {
  if (container.dataset.hubAttached === 'true') return;
  container.dataset.hubAttached = 'true';

  const dispatch = (e) => {
    let node = e.target;
    while (node && node !== container) {
      const vid = node.dataset?.vid;
      if (vid && stateStore.handlers.has(vid)) {
        const entry = stateStore.handlers.get(vid);
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
// (4) Local renderToDOM factory copied into this file (Ex1's version cannot be
//     safely mutated from here) so vid assignment stays consistent with hub.