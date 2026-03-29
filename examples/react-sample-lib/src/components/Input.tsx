import React from "react";

export interface InputProps {
  /** Input field label */
  label: string;
  /** Current value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Input type */
  type?: "text" | "email" | "password" | "number" | "tel";
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Help text displayed below the input */
  helpText?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * A form input component with label, validation, and help text support.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   required
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */
export const Input: React.FC<InputProps> = ({
  label,
  value,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  error,
  helpText,
  onChange,
  onBlur,
}) => {
  return (
    <div className={`input-group ${error ? "input-error" : ""}`}>
      <label>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
      />
      {error && <span className="error-message">{error}</span>}
      {helpText && !error && <span className="help-text">{helpText}</span>}
    </div>
  );
};

Input.displayName = "Input";
