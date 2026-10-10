// js/state-machine.js

export const ViewState = Object.freeze({
  IDLE: () => Object.freeze({ status: 'IDLE' }),
  LOADING: () => Object.freeze({ status: 'LOADING' }),
  SUCCESS: (data) => Object.freeze({ status: 'SUCCESS', data }),
  ERROR: (error) => Object.freeze({ status: 'ERROR', error: String(error) }),
});

const TRANSITIONS = {
  IDLE: ['LOADING'],
  LOADING: ['SUCCESS', 'ERROR'],
  SUCCESS: ['LOADING'],
  ERROR: ['LOADING'],
};

export function canTransition(from, to) {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function transition(from, to, payload) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid transition: ${from} -> ${to}`);
  }
  return ViewState[to](payload);
}