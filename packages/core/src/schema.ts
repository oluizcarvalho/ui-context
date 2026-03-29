/**
 * Universal component metadata schema.
 * Framework-agnostic representation of a UI component.
 */
export interface ComponentMetadata {
  /** Component name, e.g. "Button", "DataTable" */
  name: string;
  /** Framework-specific selector, e.g. Angular "app-button" */
  selector?: string;
  /** Brief description of the component */
  description: string;
  /** Category grouping, e.g. "Form", "Layout", "Data" */
  category?: string;
  /** Component props/inputs */
  props: PropMetadata[];
  /** Component events/outputs */
  events: EventMetadata[];
  /** Public methods */
  methods: MethodMetadata[];
  /** Content slots (ng-content, children, named slots) */
  slots: SlotMetadata[];
  /** Usage examples */
  examples: ExampleMetadata[];
  /** Associated design tokens */
  designTokens?: DesignToken[];
  /** Source file path (relative) */
  sourceFile?: string;
  /** Framework identifier: "angular", "react", "vue", etc. */
  framework: string;
}

export interface PropMetadata {
  name: string;
  /** TypeScript type as string, e.g. "string", "boolean", "'primary' | 'secondary'" */
  type: string;
  required: boolean;
  /** Default value as string representation */
  defaultValue?: string;
  description: string;
}

export interface EventMetadata {
  name: string;
  /** Type of the event payload, e.g. "MouseEvent", "{ id: string }" */
  payloadType?: string;
  description: string;
}

export interface MethodMetadata {
  name: string;
  /** Full signature, e.g. "open(options?: DialogOptions): void" */
  signature: string;
  description: string;
}

export interface SlotMetadata {
  /** Slot name: "default", "header", "footer", etc. */
  name: string;
  description: string;
}

export interface ExampleMetadata {
  title: string;
  code: string;
  /** Language identifier: "tsx", "html", "angular" */
  language: string;
}

export interface DesignToken {
  name: string;
  value: string;
  /** Token category: "color", "spacing", "typography" */
  category: string;
}

/**
 * Top-level metadata for an entire component library.
 */
export interface LibraryMetadata {
  name: string;
  version?: string;
  framework: string;
  components: ComponentMetadata[];
  tokens?: DesignToken[];
}
