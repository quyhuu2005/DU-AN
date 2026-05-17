interface Props {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ children, onClose, title, size = 'md' }: Props) {
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box w-full ${widths[size]}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="flex items-center justify-between mb-5">
          <h2 id="modal-title" className="modal-title mb-0">{title}</h2>
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
