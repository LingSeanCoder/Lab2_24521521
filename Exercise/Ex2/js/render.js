// --- FILE 1: js/render.js ---

export const TEXT_ELEMENT = 'TEXT_ELEMENT';

export const handlerMap = new Map();
export const vidCounterRef = { value: 0 };

export function createElement(type, config, ...children) {
  const props = { ...(config || {}), children: [] };
  delete props.key;
  children.flat(Infinity).forEach(child => {
    if (child === null || child === undefined || child === false) return;
    props.children.push(typeof child === 'object' ? child : createTextElement(child));
  });
  if (config?.key !== undefined) props.key = config.key;
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
      // DELEGATION HOOK: register vid instead of addEventListener
      const vid = String(vidCounterRef.value++);
      el.dataset.vid = vid;
      handlerMap.set(vid, { type: name.slice(2).toLowerCase(), fn: value });
    } else if (name === 'className') {
      el.setAttribute('class', value);
    } else if (name === 'htmlFor') {
      el.setAttribute('for', value);
    } else if (value === true) {
      el.setAttribute(name, '');
    } else if (value !== false && value != null && name !== 'key') {
      el.setAttribute(name, String(value));
    }
  });
  children.forEach(c => {
    const node = renderToDOM(c);
    if (node) el.appendChild(node);
  });
  return el;
}