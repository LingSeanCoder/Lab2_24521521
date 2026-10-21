import { createDataGrid } from './components/DataGrid.js';

document.addEventListener('DOMContentLoaded', () => {
  const appRoot = document.getElementById('app-root');
  createDataGrid(appRoot);
});