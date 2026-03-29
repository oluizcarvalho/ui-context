import React from "react";

export interface CardProps {
  /** Card title displayed in the header */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Card content */
  children: React.ReactNode;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether the card is hoverable */
  hoverable?: boolean;
  /** Optional footer content */
  footer?: React.ReactNode;
}

/**
 * A container component for grouping related content.
 * Supports header, body, and footer sections.
 *
 * @example
 * ```tsx
 * <Card title="My Card" subtitle="A subtitle" bordered>
 *   <p>Card content here</p>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  bordered = false,
  hoverable = false,
  footer,
}) => {
  return (
    <div className={`card ${bordered ? "card-bordered" : ""} ${hoverable ? "card-hoverable" : ""}`}>
      <div className="card-header">
        <h3>{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

Card.displayName = "Card";
