import { Component, Input, Output, EventEmitter } from "@angular/core";

export interface DialogOptions {
  width?: string;
  height?: string;
  modal?: boolean;
}

/**
 * A modal dialog component for displaying overlay content.
 * Supports header, content, and footer slots.
 */
@Component({
  selector: "ui-dialog",
  template: `
    <div class="dialog-overlay" *ngIf="visible" (click)="onOverlayClick()">
      <div class="dialog" [style.width]="width">
        <div class="dialog-header">
          <ng-content select="[dialog-header]"></ng-content>
          <h3>{{ title }}</h3>
          <button class="close-btn" (click)="close()">×</button>
        </div>
        <div class="dialog-content">
          <ng-content></ng-content>
        </div>
        <div class="dialog-footer">
          <ng-content select="[dialog-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class DialogComponent {
  /** Dialog title displayed in the header */
  @Input() title: string = "";

  /** Whether the dialog is visible */
  @Input() visible: boolean = false;

  /** Width of the dialog */
  @Input() width: string = "500px";

  /** Whether clicking the overlay closes the dialog */
  @Input() closeOnOverlay: boolean = true;

  /** Whether the dialog is modal (blocks interaction with the page) */
  @Input() modal: boolean = true;

  /** Emitted when the dialog visibility changes */
  @Output() visibleChange = new EventEmitter<boolean>();

  /** Emitted when the dialog is closed */
  @Output() closed = new EventEmitter<void>();

  /** Open the dialog programmatically */
  open(options?: DialogOptions): void {
    if (options?.width) this.width = options.width;
    if (options?.modal !== undefined) this.modal = options.modal;
    this.visible = true;
    this.visibleChange.emit(true);
  }

  /** Close the dialog programmatically */
  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.closed.emit();
  }

  private onOverlayClick(): void {
    if (this.closeOnOverlay) {
      this.close();
    }
  }
}
