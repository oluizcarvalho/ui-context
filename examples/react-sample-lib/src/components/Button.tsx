import React from "react";

export interface ButtonProps {
  /** The text content of the button */
  label: string;
  /** Visual style variant */
  variant?: "primary" | "secondary" | "danger";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * A versatile button component for user interactions.
 * Supports multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <Button label="Click me" variant="primary" onClick={() => alert('clicked')} />
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

Button.displayName = "Button";
