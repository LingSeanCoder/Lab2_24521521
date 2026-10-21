// js/components/DataGrid.js
import { createElement, renderToDOM } from '../vdom.js';
import { mockUsers } from '../mock-data.js';

const PAGE_SIZE = 10;

const COLUMNS = Object.freeze([
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'lastLogin', label: 'Last Login' }
]);

const COL_COUNT = COLUMNS.length;

export function createDataGrid(container) {
  const state = {
    data: mockUsers,
    sortedColumn: null,
    sortDirection: 'asc',
    filterQuery: '',
    currentPage: 1,
    activeCell: { row: 0, col: 0 },
    selectedRow: null
  };

  let focusSelector = null;

  function getFilteredData() {
    const q = state.filterQuery.trim().toLowerCase();
    if (!q) return state.data;
    return state.data.filter(
      (user) =>
        user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
    );
  }

  function getSortedData() {
    const filtered = getFilteredData();
    if (!state.sortedColumn) return filtered;
    const col = state.sortedColumn;
    const dir = state.sortDirection === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = String(a[col]).toLowerCase();
      const bv = String(b[col]).toLowerCase();
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  function getTotalPages() {
    return Math.max(1, Math.ceil(getSortedData().length / PAGE_SIZE));
  }

  function getPaginatedData() {
    const sorted = getSortedData();
    const start = (state.currentPage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }

  function clampActiveCell() {
    const pageRows = getPaginatedData().length;
    if (pageRows === 0) {
      state.activeCell = { row: 0, col: 0 };
      return;
    }
    const row = Math.max(0, Math.min(state.activeCell.row, pageRows - 1));
    const col = Math.max(0, Math.min(state.activeCell.col, COL_COUNT - 1));
    state.activeCell = { row, col };
  }

  function handleSort(columnKey) {
    if (state.sortedColumn === columnKey) {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortedColumn = columnKey;
      state.sortDirection = 'asc';
    }
    const colIdx = COLUMNS.findIndex((c) => c.key === columnKey);
    state.currentPage = 1;
    state.activeCell = { row: 0, col: colIdx >= 0 ? colIdx : 0 };
    focusSelector = 'table[role="grid"] button[data-sort-key="' + columnKey + '"]';
    render();
  }

  function handleFilterInput(e) {
    state.filterQuery = e.target.value;
    state.currentPage = 1;
    clampActiveCell();
    focusSelector = '#filter-input';
    render();
  }

  function handleReset() {
    state.filterQuery = '';
    state.currentPage = 1;
    state.sortedColumn = null;
    state.sortDirection = 'asc';
    state.activeCell = { row: 0, col: 0 };
    state.selectedRow = null;
    focusSelector = '#filter-input';
    render();
  }

  function handlePrevPage() {
    if (state.currentPage <= 1) return;
    state.currentPage -= 1;
    state.activeCell = { row: 0, col: state.activeCell.col };
    focusSelector = `td[data-row="0"][data-col="${state.activeCell.col}"]`;
    render();
  }

  function handleNextPage() {
    if (state.currentPage >= getTotalPages()) return;
    state.currentPage += 1;
    state.activeCell = { row: 0, col: state.activeCell.col };
    focusSelector = `td[data-row="0"][data-col="${state.activeCell.col}"]`;
    render();
  }

  function handleCellKeyDown(e) {
    const row = parseInt(this.dataset.row, 10);
    const col = parseInt(this.dataset.col, 10);
    const pageRows = getPaginatedData().length;

    let nextRow = row;
    let nextCol = col;
    let handled = false;

    switch (e.key) {
      case 'ArrowUp':
        nextRow = Math.max(0, row - 1);
        handled = true;
        break;
      case 'ArrowDown':
        nextRow = Math.min(pageRows - 1, row + 1);
        handled = true;
        break;
      case 'ArrowLeft':
        nextCol = Math.max(0, col - 1);
        handled = true;
        break;
      case 'ArrowRight':
        nextCol = Math.min(COL_COUNT - 1, col + 1);
        handled = true;
        break;
      case 'Enter': {
        e.preventDefault();
        const user = getPaginatedData()[row];
        if (user) {
          state.selectedRow = state.selectedRow === user.id ? null : user.id;
          focusSelector = `td[data-row="${row}"][data-col="${col}"]`;
          render();
        }
        return;
      }
      default:
        return;
    }

    if (handled) {
      e.preventDefault();
      state.activeCell = { row: nextRow, col: nextCol };
      focusSelector = `td[data-row="${nextRow}"][data-col="${nextCol}"]`;
      render();
    }
  }

  function buildHeaderRow() {
    return createElement(
      'tr',
      { role: 'row' },
      ...COLUMNS.map((col) => {
        const isSorted = state.sortedColumn === col.key;
        const ariaSort = isSorted
          ? state.sortDirection === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none';
        const indicator = isSorted
          ? state.sortDirection === 'asc'
            ? ' \u25B2'
            : ' \u25BC'
          : '';
        return createElement(
          'th',
          {
            role: 'columnheader',
            scope: 'col',
            'aria-sort': ariaSort
          },
          createElement(
            'button',
            {
              type: 'button',
              className: 'sort-btn',
              dataset: { sortKey: col.key },
              onClick: () => handleSort(col.key)
            },
            col.label + indicator
          )
        );
      })
    );
  }

  function buildBodyRows() {
    const pageData = getPaginatedData();
    const absoluteOffset = (state.currentPage - 1) * PAGE_SIZE;

    if (pageData.length === 0) {
      return [
        createElement(
          'tr',
          { role: 'row' },
          createElement(
            'td',
            {
              role: 'gridcell',
              colspan: COL_COUNT,
              className: 'empty-cell'
            },
            'No records found'
          )
        )
      ];
    }

    return pageData.map((user, rowIdx) => {
      const isRowSelected = state.selectedRow === user.id;
      return createElement(
        'tr',
        {
          role: 'row',
          'aria-selected': isRowSelected ? 'true' : 'false',
          'aria-rowindex': absoluteOffset + rowIdx + 1
        },
        ...COLUMNS.map((col, colIdx) => {
          const isActive =
            state.activeCell.row === rowIdx && state.activeCell.col === colIdx;
          return createElement(
            'td',
            {
              role: 'gridcell',
              tabIndex: isActive ? 0 : -1,
              dataset: { row: rowIdx, col: colIdx },
              onKeyDown: handleCellKeyDown,
              'aria-colindex': colIdx + 1
            },
            String(user[col.key])
          );
        })
      );
    });
  }

  function buildPagination() {
    const totalPages = getTotalPages();
    const isFirst = state.currentPage <= 1;
    const isLast = state.currentPage >= totalPages;

    return createElement(
      'div',
      { className: 'pagination', role: 'navigation', 'aria-label': 'Pagination' },
      createElement(
        'button',
        {
          type: 'button',
          id: 'prev-page-btn',
          onClick: handlePrevPage,
          disabled: isFirst,
          'aria-label': 'Previous page'
        },
        '\u2190 Prev'
      ),
      createElement(
        'span',
        { className: 'page-info', 'aria-live': 'polite' },
        `Page ${state.currentPage} of ${totalPages}`
      ),
      createElement(
        'button',
        {
          type: 'button',
          id: 'next-page-btn',
          onClick: handleNextPage,
          disabled: isLast,
          'aria-label': 'Next page'
        },
        'Next \u2192'
      )
    );
  }

  function buildTree() {
    const totalFiltered = getFilteredData().length;

    return createElement(
      'div',
      { className: 'data-grid-wrapper' },
      createElement(
        'div',
        { role: 'toolbar', 'aria-label': 'Table controls', className: 'grid-toolbar' },
        createElement('input', {
          type: 'search',
          id: 'filter-input',
          placeholder: 'Filter by name or email...',
          'aria-label': 'Filter records by name or email',
          value: state.filterQuery,
          onInput: handleFilterInput
        }),
        createElement(
          'button',
          {
            type: 'button',
            id: 'reset-btn',
            onClick: handleReset
          },
          'Reset'
        )
      ),
      createElement(
        'table',
        {
          role: 'grid',
          'aria-label': 'Enterprise Data Grid',
          'aria-rowcount': totalFiltered,
          'aria-colcount': COL_COUNT
        },
        createElement('thead', { role: 'presentation' }, buildHeaderRow()),
        createElement('tbody', { role: 'presentation' }, ...buildBodyRows())
      ),
      buildPagination()
    );
  }

  function render() {
    const tree = buildTree();
    renderToDOM(tree, container);

    if (focusSelector) {
      const el = container.querySelector(focusSelector);
      if (el) {
        el.focus();
        if (el instanceof HTMLInputElement) {
          const len = el.value.length;
          try {
            el.setSelectionRange(len, len);
          } catch (err) {
            /* noop */
          }
        }
      }
      focusSelector = null;
    }
  }

  render();

  return {
    render,
    getState: () => state
  };
}