import { useEffect, useState } from 'react';
import { subscribe } from '../utils/toast';

const AUTO_DISMISS_MS = 5000;

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribe((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, AUTO_DISMISS_MS);
    });
    return unsubscribe;
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 3000, marginTop: '10px' }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast show align-items-center text-white border-0 mb-2 ${
            t.type === 'error' ? 'bg-danger' : 'bg-success'
          }`}
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body d-flex align-items-center gap-2">
              <i className={`bi ${t.type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`}></i>
              {t.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => dismiss(t.id)}
            ></button>
          </div>
        </div>
      ))}
    </div>
  );
}