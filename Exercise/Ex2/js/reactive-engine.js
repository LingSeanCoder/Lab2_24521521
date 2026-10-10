// js/reactive-engine.js

export const stateStore = {
  hooks: [],           // [{ value }]
  cursor: 0,
  rootContainer: null,
  rootComponent: null,
  scheduled: false,
  handlers: new Map(), // vid -> { type, fn }
  vidCounter: 0,
};

export function resetCursor() {
  stateStore.cursor = 0;
}

// DEVIATION FROM SLIDE: File này chỉ khai báo container + resetCursor theo
// contract, không chứa useState/renderToDOM/delegation như slide trang 18,
// và không thực hiện increment cursor sai thứ tự như code mẫu slide.