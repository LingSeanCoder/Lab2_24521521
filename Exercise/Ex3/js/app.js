// js/app.js

import { createElement } from './render.js';
import { useState, renderApp } from './reactive-engine.js';
import { ViewState, transition, canTransition } from './state-machine.js';

async function fetchFeed() {
  await new Promise((r) => setTimeout(r, 900));
  if (Math.random() < 0.25) throw new Error('Network timeout');
  return ['Item A', 'Item B', 'Item C', 'Item D'];
}

function Skeleton() {
  return createElement(
    'ul',
    { className: 'skeleton', 'aria-hidden': 'true', 'aria-busy': 'true' },
    ...[0, 1, 2, 3].map((i) =>
      createElement('li', { key: `sk-${i}`, className: 'skeleton__row' })
    )
  );
}

function DataList(items) {
  return createElement(
    'ul',
    { className: 'task-list', role: 'list' },
    ...items.map((text, i) => createElement('li', { key: `item-${i}` }, text))
  );
}

function ErrorBox(errorMessage, onRetry) {
  return createElement(
    'section',
    {
      className: 'error-box',
      role: 'alert',
      'aria-live': 'assertive',
    },
    createElement('p', { className: 'error-box__msg' }, `Error: ${errorMessage}`),
    createElement(
      'button',
      {
        type: 'button',
        className: 'retry-btn',
        onClick: onRetry,
      },
      'Retry Connection'
    )
  );
}

// Module-scope request counter — active race guard.
// Only the fetch whose id equals the latest issued id may commit state.
let latestRequestId = 0;

function DataFeed() {
  const [state, setState] = useState(ViewState.IDLE());

  const loadData = async () => {
    const myId = ++latestRequestId;
    setState(transition(state.status, 'LOADING'));
    try {
      const items = await fetchFeed();
      if (myId !== latestRequestId) return; // stale response, drop
      setState((prev) => transition('LOADING', 'SUCCESS', items));
    } catch (err) {
      if (myId !== latestRequestId) return; // stale response, drop
      setState((prev) => transition('LOADING', 'ERROR', err.message));
    }
  };

  const body = (() => {
    switch (state.status) {
      case 'IDLE':
        return createElement(
          'button',
          {
            type: 'button',
            className: 'load-btn',
            onClick: loadData,
          },
          'Load Data'
        );
      case 'LOADING':
        return Skeleton();
      case 'SUCCESS':
        return DataList(state.data);
      case 'ERROR':
        return ErrorBox(state.error, loadData);
      default:
        return null;
    }
  })();

  return createElement(
    'main',
    { className: 'app-container' },
    createElement(
      'header',
      null,
      createElement('h1', null, 'Resilient Data Feed'),
      createElement('p', { className: 'subtitle' }, `Status: ${state.status}`)
    ),
    body,
    state.status === 'SUCCESS'
      ? createElement(
          'button',
          {
            type: 'button',
            className: 'reload-btn',
            onClick: loadData,
          },
          'Reload'
        )
      : null
  );
}

const root = document.getElementById('app');
renderApp(DataFeed, root);

// DEVIATION FROM SLIDE:
// (1) vanilla JS thay vì TS generics — slide dùng ViewState<T>.
// (2) active race guard via module-scope requestId counter (slide relies
//     only on UI unmount, which doesn't cover programmatic double-trigger).