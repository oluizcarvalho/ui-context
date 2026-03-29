import { describe, it, expect } from "vitest";
import type { LibraryMetadata } from "@ui-context/core";
import { createMcpServer } from "../server.js";

const sampleMetadata: LibraryMetadata = {
  name: "test-lib",
  framework: "react",
  components: [
    {
      name: "Button",
      description: "A button component",
      category: "Form",
      props: [
        { name: "label", type: "string", required: true, description: "Button text" },
        { name: "variant", type: "'primary' | 'secondary'", required: false, defaultValue: "'primary'", description: "Visual variant" },
        { name: "disabled", type: "boolean", required: false, defaultValue: "false", description: "Disabled state" },
      ],
      events: [
        { name: "onClick", payloadType: "(event: MouseEvent) => void", description: "Click handler" },
      ],
      methods: [],
      slots: [],
      examples: [
        { title: "Basic", code: '<Button label="Click" />', language: "tsx" },
      ],
      framework: "react",
    },
    {
      name: "Card",
      description: "A container card component",
      category: "Layout",
      props: [
        { name: "title", type: "string", required: true, description: "Card title" },
        { name: "bordered", type: "boolean", required: false, defaultValue: "false", description: "Show border" },
      ],
      events: [],
      methods: [],
      slots: [],
      examples: [],
      framework: "react",
    },
  ],
  tokens: [
    { name: "--primary-color", value: "#007bff", category: "color" },
    { name: "--spacing-md", value: "16px", category: "spacing" },
  ],
};

describe("createMcpServer", () => {
  it("should create an MCP server instance", () => {
    const server = createMcpServer(sampleMetadata);
    expect(server).toBeDefined();
  });
});
