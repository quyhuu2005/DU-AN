import { useState, useCallback } from 'react';
import { ToastContainer } from '../components/base/Toast';

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

let _counter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((type: ToastItem['type'], message: string, duration = 3000) => {
    const id = String(++_counter);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const success = (msg: string) => push('success', msg);
  const error   = (msg: string) => push('error', msg);
  const warning = (msg: string) => push('warning', msg);

  const Toasts = () => <ToastContainer toasts={toasts} />;

  return { success, error, warning, Toasts };
}
