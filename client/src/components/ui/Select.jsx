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
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none cursor-pointer ${
          error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300'
        }`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
