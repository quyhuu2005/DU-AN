interface ToastProps {
  type: 'success' | 'error' | 'warning';
  message: string;
}

// Simple Toast — hiển thị ở góc trên phải
export function Toast({ type, message }: ToastProps) {
  const styles = {
    success: { bg: 'var(--color-success-bg)', color: 'var(--color-success)',  icon: 'check_circle' },
    error:   { bg: 'var(--color-danger-bg)',  color: 'var(--color-danger)',   icon: 'error' },
    warning: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)',  icon: 'warning' },
  }[type];

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
      style={{ background: styles.bg, color: styles.color, minWidth: 260 }}
      role="alert"
    >
      <span className="material-symbols-outlined text-xl">{styles.icon}</span>
      <span>{message}</span>
    </div>
  );
}

// ── Toast container (fixed top-right) ──
interface ToastContainerProps {
  toasts: Array<{ id: string } & ToastProps>;
}
export function ToastContainer({ toasts }: ToastContainerProps) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} type={t.type} message={t.message} />
      ))}
    </div>
  );
}
