import { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ 
  label, 
  error, 
  id, 
  icon: Icon,
  showPasswordToggle = false,
  passwordVisible = false,
  onTogglePasswordVisibility,
  className = '', 
  inputClassName = '',
  ...props 
}, ref) => {
  const hasPasswordToggle = showPasswordToggle && props.type === 'password';
  const inputType = hasPasswordToggle && passwordVisible ? 'text' : props.type;
  const ToggleIcon = passwordVisible ? EyeOff : Eye;

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
            block min-h-11 w-full rounded-md border text-base focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow
            ${Icon ? 'pl-10' : 'pl-3'}
            ${hasPasswordToggle ? 'pr-10' : 'pr-3'}
            ${error 
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500 placeholder-red-300' 
              : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] placeholder-gray-400'
            }
            py-2.5 ${inputClassName}
          `}
          {...props}
          type={inputType}
        />
        {hasPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex min-h-11 w-11 items-center justify-center text-gray-400 transition-colors hover:text-gray-700 focus:outline-none"
            aria-label={passwordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <ToggleIcon size={18} />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
