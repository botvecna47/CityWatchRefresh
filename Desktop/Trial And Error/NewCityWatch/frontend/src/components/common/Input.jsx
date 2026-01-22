import { forwardRef } from 'react';
import './Input.css';

export const Input = forwardRef(({
  label,
  error,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className="input-field"
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({
  label,
  error,
  placeholder,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className="input-field input-textarea"
        {...props}
      />
      {maxLength && (
        <span className="input-counter">
          {props.value?.length || 0}/{maxLength}
        </span>
      )}
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select...',
  disabled = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <select
        ref={ref}
        disabled={disabled}
        className="input-field input-select"
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
