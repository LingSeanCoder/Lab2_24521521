// js/mini-react/element.js

export const TEXT_ELEMENT = 'TEXT_ELEMENT';

/**
 * Create a text VNode.
 * @param {string|number} text
 * @returns {{ type: string, props: { nodeValue: string, children: [] } }}
 */
export const createTextElement = (text) => ({
  type: TEXT_ELEMENT,
  props: {
    nodeValue: String(text),
    children: [],
  },
});

/**
 * Create an element VNode.
 * @param {string} type
 * @param {object|null|undefined} config
 * @param {...any} children
 * @returns {{ type: string, props: object }}
 */
export const createElement = (type, config, ...children) => {
  const props = { ...config, children: [] };

  // Detach key from config if present
  if (config && config.key !== undefined) {
    delete props.key;
  }

  children.flat().forEach((child) => {
    const normalized =
      child === null || child === undefined || child === false
        ? null
        : typeof child === 'object'
          ? child
          : createTextElement(child);

    if (normalized) props.children.push(normalized);
  });

  // Re-attach key separately if it existed
  if (config && config.key !== undefined) {
    props.key = config.key;
  }

  return Object.freeze({ type, props });
};