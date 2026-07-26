const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary:
      'gradient-bg text-white hover:opacity-90 focus:ring-indigo-500 shadow-lg shadow-indigo-500/25',
    secondary:
      'bg-white text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-50 focus:ring-indigo-500 dark:bg-slate-800 dark:text-indigo-400 dark:border-indigo-900/60 dark:hover:bg-slate-700',
    outline:
      'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
