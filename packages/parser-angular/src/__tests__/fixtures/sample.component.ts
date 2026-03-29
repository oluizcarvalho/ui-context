import { Component, Input, Output, EventEmitter } from "@angular/core";

/**
 * A sample component for testing the Angular parser.
 */
@Component({
  selector: "app-sample",
  template: `
    <div class="sample">
      <ng-content select="[header]"></ng-content>
      <span>{{ title }}</span>
      <ng-content></ng-content>
    </div>
  `,
})
export class SampleComponent {
  /** The title text */
  @Input() title: string = "";

  /** Whether the component is active */
  @Input() active: boolean = false;

  /** The display mode */
  @Input() mode!: "compact" | "expanded";

  /** Emitted when the component is activated */
  @Output() activated = new EventEmitter<boolean>();

  /** Toggle the active state */
  toggle(): void {
    this.active = !this.active;
    this.activated.emit(this.active);
  }
}
