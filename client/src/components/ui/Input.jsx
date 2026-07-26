const Input = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 ${
          error
            ? 'border-red-400 dark:border-red-600'
            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
