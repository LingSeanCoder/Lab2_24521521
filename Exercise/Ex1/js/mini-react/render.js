// js/mini-react/render.js

import { TEXT_ELEMENT } from './element.js';

/**
 * Recursively render a VNode tree into a real DOM node.
 * @param {object|null|undefined} vnode
 * @returns {Node}
 */
export const renderToDOM = (vnode) => {
  if (vnode === null || vnode === undefined || vnode === false) {
    return document.createComment('empty');
  }

  if (vnode.type === TEXT_ELEMENT) {
    return document.createTextNode(vnode.props.nodeValue);
  }

  if (typeof vnode.type === 'function') {
    const result = vnode.type(vnode.props);
    return renderToDOM(result);
  }

  const el = document.createElement(vnode.type);
  const { children = [], nodeValue, ...rest } = vnode.props || {};

  Object.entries(rest).forEach(([key, value]) => {
    if (key === 'key') return;

    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'className') {
      el.setAttribute('class', value);
    } else if (key === 'htmlFor') {
      el.setAttribute('for', value);
    } else if (value === true) {
      el.setAttribute(key, '');
    } else if (value !== false && value != null) {
      el.setAttribute(key, String(value));
    }
  });

  children.forEach((child) => {
    const childNode = renderToDOM(child);
    if (childNode) el.appendChild(childNode);
  });

  return el;
};