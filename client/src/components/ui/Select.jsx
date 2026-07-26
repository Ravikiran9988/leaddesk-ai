const Select = ({
  label,
  error,
  options,
  placeholder = 'Select an option',
  className = '',
  id,
  ...props
}) => {
  const selectId = id || props.name;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer dark:bg-slate-900 dark:text-white ${
          error
            ? 'border-red-400 dark:border-red-600'
            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
        }`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option} className="dark:bg-slate-900 dark:text-white">
            {option}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default Select;
