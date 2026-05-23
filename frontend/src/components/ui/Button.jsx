
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  isLoading = false,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white focus:ring-[var(--color-primary)]',
    secondary: 'bg-[var(--color-secondary)] hover:bg-[#dbeafe] text-[var(--color-primary)] focus:ring-[var(--color-primary)]',
    outline: 'border border-[var(--color-border)] hover:bg-gray-50 text-[var(--color-text-main)] focus:ring-[var(--color-primary)]',
    danger: 'bg-[var(--color-danger)] hover:bg-[#dc2626] text-white focus:ring-[var(--color-danger)]',
    ghost: 'hover:bg-gray-100 text-[var(--color-text-main)] focus:ring-gray-200'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-md',
    lg: 'px-6 py-3 text-lg rounded-lg'
  };

  const classes = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <button className={classes} disabled={isLoading} {...props}>
      {isLoading && (
        <span
          aria-hidden="true"
          className="-ml-1 mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
};

export default Button;
