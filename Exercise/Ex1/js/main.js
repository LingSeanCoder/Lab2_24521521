// js/main.js

import { createElement, renderToDOM } from './mini-react/index.js';

const vApp = createElement(
  'main',
  { id: 'root-view', role: 'main' },
  createElement(
    'header',
    { className: 'hero' },
    createElement('h1', null, 'Mini React Engine'),
    createElement('p', null, '<img onerror=alert(1)> Safe Text')
  ),
  createElement('button', { onClick: () => console.log('Ping') }, 'Click')
);

const root = document.getElementById('app');
root.replaceChildren(renderToDOM(vApp));

console.assert(root.querySelector('button') !== null, 'Mount Failed');
console.assert(
  root.querySelector('h1').textContent === 'Mini React Engine',
  'H1 Failed'
);

const img = root.querySelector('img');
console.assert(img === null, 'XSS Failed: img injected as element');
console.assert(
  root.textContent.includes('<img'),
  'XSS Failed: text not literal'
);