import { describe, it, expect } from "vitest";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { ReactParser } from "../react-parser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("ReactParser", () => {
  const parser = new ReactParser();
  const fixturesDir = path.join(__dirname, "fixtures");

  it("should have the correct name and extensions", () => {
    expect(parser.name).toBe("react");
    expect(parser.supportedExtensions).toContain(".tsx");
    expect(parser.supportedExtensions).toContain(".jsx");
  });

  it("should parse React components from fixture files", async () => {
    const components = await parser.parse({
      sourcePath: fixturesDir,
      include: ["**/*.tsx"],
    });

    expect(components.length).toBeGreaterThan(0);

    const button = components.find((c) => c.name === "SampleButton");
    expect(button).toBeDefined();
    expect(button!.framework).toBe("react");
    expect(button!.description).toContain("sample button");
  });

  it("should extract props correctly", async () => {
    const components = await parser.parse({
      sourcePath: fixturesDir,
      include: ["**/*.tsx"],
    });

    const button = components.find((c) => c.name === "SampleButton");
    expect(button).toBeDefined();

    const labelProp = button!.props.find((p) => p.name === "label");
    expect(labelProp).toBeDefined();
    expect(labelProp!.required).toBe(true);
    expect(labelProp!.description).toContain("label text");

    const variantProp = button!.props.find((p) => p.name === "variant");
    expect(variantProp).toBeDefined();
    expect(variantProp!.required).toBe(false);
  });

  it("should detect event handler props", async () => {
    const components = await parser.parse({
      sourcePath: fixturesDir,
      include: ["**/*.tsx"],
    });

    const button = components.find((c) => c.name === "SampleButton");
    expect(button).toBeDefined();

    // onClick should be classified as event or prop depending on heuristic
    const hasOnClick =
      button!.events.some((e) => e.name === "onClick") ||
      button!.props.some((p) => p.name === "onClick");
    expect(hasOnClick).toBe(true);
  });
});
