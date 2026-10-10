// js/render.js

export const TEXT_ELEMENT = 'TEXT_ELEMENT';
export const handlerMap = new Map();
export const vidCounterRef = { value: 0 };

// DEVIATION FROM CONTRACT (approved option B):
// Gom 1 vid / element, value đổi thành { handlers: { <eventType>: fn } }
// để 1 element có thể mang nhiều event handler mà không ghi đè dataset.vid.
// Root delegation phải lookup: handlerMap.get(vid)?.handlers[e.type]

export function createElement(type, config, ...children) {
  const props = { ...(config || {}), children: [] };
  const key = props.key;
  delete props.key;

  children.flat(Infinity).forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    props.children.push(
      typeof child === 'object' ? child : createTextElement(child)
    );
  });

  if (key !== undefined) props.key = key;
  return Object.freeze({ type, props });
}

export function createTextElement(text) {
  return Object.freeze({
    type: TEXT_ELEMENT,
    props: { nodeValue: String(text), children: [] },
  });
}

export function renderToDOM(vnode) {
  if (!vnode) return document.createComment('empty');

  if (vnode.type === TEXT_ELEMENT) {
    return document.createTextNode(vnode.props.nodeValue);
  }

  if (typeof vnode.type === 'function') {
    return renderToDOM(vnode.type(vnode.props));
  }

  const el = document.createElement(vnode.type);
  const { children = [], nodeValue, key, ...rest } = vnode.props || {};

  Object.entries(rest).forEach(([name, value]) => {
    if (name.startsWith('on') && typeof value === 'function') {
      let vid = el.dataset.vid;
      if (!vid) {
        vid = String(vidCounterRef.value++);
        el.dataset.vid = vid;
        handlerMap.set(vid, { handlers: {} });
      }
      handlerMap.get(vid).handlers[name.slice(2).toLowerCase()] = value;
    } else if (name === 'className') {
      el.setAttribute('class', value);
    } else if (name === 'htmlFor') {
      el.setAttribute('for', value);
    } else if (name === 'key') {
      // skip
    } else if (value === true) {
      el.setAttribute(name, '');
    } else if (value !== false && value != null) {
      el.setAttribute(name, String(value));
    }
  });

  children.forEach((c) => {
    const node = renderToDOM(c);
    if (node) el.appendChild(node);
  });

  return el;
}