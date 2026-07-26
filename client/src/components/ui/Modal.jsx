const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${sizes[size]} rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in-up dark:border-slate-800 dark:bg-slate-900`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {title && (
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h3 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
