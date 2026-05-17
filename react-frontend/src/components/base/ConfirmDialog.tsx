interface Props {
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  message,
  description,
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading,
}: Props) {
  const iconColor = variant === 'danger' ? 'text-red-500' : 'text-yellow-500';
  const confirmCls = variant === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box w-full max-w-sm text-center" role="alertdialog">
        <div className={`material-symbols-outlined text-5xl ${iconColor} mb-3`}>
          {variant === 'danger' ? 'warning' : 'info'}
        </div>
        <h3 className="text-base font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{message}</h3>
        {description && (
          <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
        )}
        <div className="flex gap-3 justify-center mt-5">
          <button className="btn-ghost flex-1" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button className={`${confirmCls} flex-1`} onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
