export function Input({ label, type = 'text', error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input type={type} className={`input-field ${error ? 'border-red-500' : ''}`} {...props} />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}
