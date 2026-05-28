import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  id, 
  icon: Icon,
  className = '', 
  inputClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-main)] mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          ref={ref}
          className={`
            block w-full rounded-md border text-base focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow
            ${Icon ? 'pl-10' : 'pl-3'}
            ${error 
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500 placeholder-red-300' 
              : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] placeholder-gray-400'
            }
            py-2 ${inputClassName}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
