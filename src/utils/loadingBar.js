// Minimal pub/sub so both axios interceptors (outside React) and the
// LoadingBar component (inside React) can share loading state.
let listeners = [];
let activeRequests = 0;

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

function notify(state) {
  listeners.forEach((fn) => fn(state));
}

export function startLoading() {
  activeRequests += 1;
  notify('loading');
}

export function stopLoading() {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) notify('done');
}