const Textarea = ({
  label,
  error,
  className = '',
  id,
  rows = 4,
  ...props
}) => {
  const textareaId = id || props.name;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none ${
          error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300'
        }`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Textarea;
