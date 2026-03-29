import React from "react";

export interface SampleButtonProps {
  /** The button label text */
  label: string;
  /** Visual variant */
  variant?: "primary" | "secondary";
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
}

/**
 * A sample button for testing the React parser.
 */
export const SampleButton: React.FC<SampleButtonProps> = ({
  label,
  variant = "primary",
  disabled = false,
  onClick,
}) => {
  return (
    <button disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
};

SampleButton.displayName = "SampleButton";
