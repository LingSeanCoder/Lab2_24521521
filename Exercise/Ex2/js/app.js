// js/app.js

import { useState, renderApp } from './reactive-engine.js';
import { createElement } from './mini-react/index.js';

function TaskApp() {
  const [tasks, setTasks] = useState(['Review PR', 'Verify AST']);
  const [filter, setFilter] = useState('ALL');

  const addTask = () =>
    setTasks([...tasks, `Task ${Date.now()}`]);

  const visibleTasks = tasks;

  return createElement('main', { className: 'app-container' },
    createElement('header', null,
      createElement('h2', null, `Tasks (${tasks.length})`)
    ),
    createElement('section', { className: 'filters', role: 'group', 'aria-label': 'Task filters' },
      createElement('button', { type: 'button', onClick: () => setFilter('ALL'),    'data-filter': 'ALL'    }, 'All'),
      createElement('button', { type: 'button', onClick: () => setFilter('ACTIVE'), 'data-filter': 'ACTIVE' }, 'Active'),
      createElement('button', { type: 'button', onClick: () => setFilter('DONE'),   'data-filter': 'DONE'   }, 'Done')
    ),
    createElement('button', { type: 'button', className: 'add-task', onClick: addTask, 'aria-label': 'Add a new task' }, 'Add Task'),
    createElement('ul', { className: 'task-list', role: 'list' },
      ...visibleTasks.map((t, i) => createElement('li', { key: `task-${i}-${t}` }, t))
    )
  );
}

const root = document.getElementById('app');
renderApp(TaskApp, root);

// DEVIATION FROM SLIDE: added type="button" and aria-labels for a11y.
// Filter logic simplified since task model has no status field yet.