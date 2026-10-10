// Simple pub/sub so the axios interceptor (outside React) can push
// server error messages to a toast container (inside React).
let listeners = [];
let idCounter = 0;

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function showToast(message, type = 'error') {
  const toast = { id: ++idCounter, message, type };
  listeners.forEach((fn) => fn(toast));
}