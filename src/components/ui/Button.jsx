export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    outline: 'px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700',
    ghost: 'px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors font-medium text-gray-600'
  };

  return (
    <button className={`${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`} {...props}>
      {children}
    </button>
  );
}
