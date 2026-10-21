// js/vdom.js

const EVENT_PROP_MAP = Object.freeze({
  onClick: 'click',
  onKeyDown: 'keydown',
  onInput: 'input'
});

const EVENT_TYPES = Object.freeze([...new Set(Object.values(EVENT_PROP_MAP))]);

const handlerMap = new Map();
let vidCounter = 0;

export function createElement(type, props, ...children) {
  const flatChildren = children.flat().map((child) => {
    if (child === null || child === undefined || child === false || child === true) {
      return createTextElement('');
    }
    if (typeof child === 'object') {
      return child;
    }
    return createTextElement(String(child));
  });

  const mergedProps = { ...(props || {}), children: flatChildren };

  // FIX p.11: freeze props (except the children array) and the whole VNode
  Object.freeze(mergedProps);
  return Object.freeze({ type, props: mergedProps });
}

export function createTextElement(text) {
  return Object.freeze({
    type: 'TEXT_ELEMENT',
    props: Object.freeze({ nodeValue: text, children: [] })
  });
}

function applyProps(el, props) {
  const handlers = {};

  for (const key of Object.keys(props)) {
    if (key === 'children') continue;

    const value = props[key];

    // FIX p.20: route through EVENT_PROP_MAP (onKeyDown -> 'keydown', never 'onKeydown')
    if (Object.prototype.hasOwnProperty.call(EVENT_PROP_MAP, key)) {
      handlers[EVENT_PROP_MAP[key]] = value;
      continue;
    }

    if (key === 'className' || key === 'class') {
      el.className = value;
      continue;
    }

    if (key === 'style' && value && typeof value === 'object') {
      for (const styleKey of Object.keys(value)) {
        el.style[styleKey] = value[styleKey];
      }
      continue;
    }

    if (key === 'dataset' && value && typeof value === 'object') {
      for (const dsKey of Object.keys(value)) {
        el.dataset[dsKey] = value[dsKey];
      }
      continue;
    }

    if (key === 'id') {
      el.id = value;
      continue;
    }

    if (key === 'tabIndex') {
      el.tabIndex = value;
      continue;
    }

    if (key === 'role' || key === 'scope' || key.startsWith('aria-')) {
      el.setAttribute(key, value);
      continue;
    }

    if (typeof value === 'boolean') {
      if (value) el.setAttribute(key, '');
      else el.removeAttribute(key);
      continue;
    }

    if (value !== null && value !== undefined) {
      el.setAttribute(key, String(value));
    }
  }

  return handlers;
}

function createDOM(vnode) {
  if (vnode.type === 'TEXT_ELEMENT') {
    return document.createTextNode(vnode.props.nodeValue);
  }

  const el = document.createElement(vnode.type);
  const handlers = applyProps(el, vnode.props);

  if (Object.keys(handlers).length > 0) {
    vidCounter += 1;
    const vid = `vid_${vidCounter}`;
    // FIX p.12: assign dataset.vid BEFORE storing in Map, otherwise delegation dies
    el.dataset.vid = vid;
    handlerMap.set(vid, { handlers });
  }

  const children = vnode.props.children || [];
  for (const child of children) {
    el.appendChild(createDOM(child));
  }

  return el;
}

export function renderToDOM(vnode, container) {
  handlerMap.clear();
  vidCounter = 0;
  container.replaceChildren();
  const dom = createDOM(vnode);
  container.appendChild(dom);
}

function delegatedHandler(e) {
  const target = e.target instanceof Element ? e.target.closest('[data-vid]') : null;
  if (!target) return;

  const handler = handlerMap.get(target.dataset.vid)?.handlers?.[e.type];
  if (typeof handler === 'function') {
    handler.call(target, e);
  }
}

function attachDelegatedListeners() {
  // One delegated handler function (not per-element) attached per event type on document.body
  for (const eventType of EVENT_TYPES) {
    document.body.addEventListener(eventType, delegatedHandler, false);
  }
}

if (document.body) {
  attachDelegatedListeners();
} else {
  document.addEventListener('DOMContentLoaded', attachDelegatedListeners, { once: true });
}