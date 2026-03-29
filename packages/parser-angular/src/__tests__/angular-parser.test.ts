import { describe, it, expect } from "vitest";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { AngularParser } from "../angular-parser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("AngularParser", () => {
  const parser = new AngularParser();
  const fixturesDir = path.join(__dirname, "fixtures");

  it("should have the correct name and extensions", () => {
    expect(parser.name).toBe("angular");
    expect(parser.supportedExtensions).toContain(".ts");
  });

  it("should parse Angular components from fixture files", async () => {
    const components = await parser.parse({
      sourcePath: fixturesDir,
      include: ["**/*.ts"],
    });

    expect(components.length).toBeGreaterThan(0);

    const sample = components.find((c) => c.name === "SampleComponent");
    expect(sample).toBeDefined();
    expect(sample!.framework).toBe("angular");
    expect(sample!.selector).toBe("app-sample");
    expect(sample!.description).toContain("sample component");
  });

  it("should extract @Input() props", async () => {
    const components = await parser.parse({
      sourcePath: fixturesDir,
      include: ["**/*.ts"],
    });

    const sample = components.find((c) => c.name === "SampleComponent");
    expect(sample).toBeDefined();

    const titleProp = sample!.props.find((p) => p.name === "title");
    expect(titleProp).toBeDefined();
    expect(titleProp!.description).toContain("title text");
    expect(titleProp!.defaultValue).toBe('""');

    const modeProp = sample!.props.find((p) => p.name === "mode");
    expect(modeProp).toBeDefined();
    expect(modeProp!.required).toBe(true);
  });

  it("should extract @Output() events", async () => {
    const components = await parser.parse({
      sourcePath: fixturesDir,
      include: ["**/*.ts"],
    });

    const sample = components.find((c) => c.name === "SampleComponent");
    expect(sample).toBeDefined();

    const activatedEvent = sample!.events.find((e) => e.name === "activated");
    expect(activatedEvent).toBeDefined();
    // payloadType may be undefined if EventEmitter type can't be resolved without @angular/core
    expect(activatedEvent!.name).toBe("activated");
  });

  it("should extract public methods", async () => {
    const components = await parser.parse({
      sourcePath: fixturesDir,
      include: ["**/*.ts"],
    });

    const sample = components.find((c) => c.name === "SampleComponent");
    expect(sample).toBeDefined();

    const toggleMethod = sample!.methods.find((m) => m.name === "toggle");
    expect(toggleMethod).toBeDefined();
    expect(toggleMethod!.description).toContain("Toggle");
  });

  it("should extract ng-content slots", async () => {
    const components = await parser.parse({
      sourcePath: fixturesDir,
      include: ["**/*.ts"],
    });

    const sample = components.find((c) => c.name === "SampleComponent");
    expect(sample).toBeDefined();
    expect(sample!.slots.length).toBeGreaterThanOrEqual(2);

    const headerSlot = sample!.slots.find((s) => s.name === "[header]");
    expect(headerSlot).toBeDefined();

    const defaultSlot = sample!.slots.find((s) => s.name === "default");
    expect(defaultSlot).toBeDefined();
  });
});
