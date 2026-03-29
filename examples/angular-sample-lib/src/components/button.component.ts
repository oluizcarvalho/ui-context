import { Component, Input, Output, EventEmitter } from "@angular/core";

/**
 * A versatile button component for user interactions.
 * Supports multiple variants and sizes.
 */
@Component({
  selector: "ui-button",
  template: `
    <button
      [class]="'btn btn-' + variant + ' btn-' + size"
      [disabled]="disabled"
      (click)="handleClick($event)"
    >
      <ng-content></ng-content>
      {{ label }}
    </button>
  `,
})
export class ButtonComponent {
  /** The text content of the button */
  @Input() label: string = "";

  /** Visual style variant */
  @Input() variant: "primary" | "secondary" | "danger" = "primary";

  /** Size of the button */
  @Input() size: "sm" | "md" | "lg" = "md";

  /** Whether the button is disabled */
  @Input() disabled: boolean = false;

  /** Emitted when the button is clicked */
  @Output() clicked = new EventEmitter<MouseEvent>();

  /** Programmatically trigger a click */
  focus(): void {
    // focus logic
  }

  private handleClick(event: MouseEvent): void {
    if (!this.disabled) {
      this.clicked.emit(event);
    }
  }
}
