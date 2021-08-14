import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { SupportedStyleSheetPseudoElements } from "../../src/supports.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium can retrieve selectors with pseudo elements", () => {
  const content = `
  <Test>
  <template>
    <style>
      div::selection {
        color: blue;
      }
    </style>
  </template>
  </Test>
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const hover = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorPseudoElement
    );
    if (!hover) {
      throw new Error("failed to retrieve the hover pseudo class");
    }
    assertEquals(hover.source, "::selection");
    assertEquals(hover.getPosition(content), {
      end: 55,
      line: 4,
      start: 44,
      column: 9,
    });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoElement} context`,
    );
  }
});

Deno.test("exium supports all standard pseudo classes", () => {
  const content = `
  <Test>
    <template>
      <style>
        ${
    SupportedStyleSheetPseudoElements.map((pseudoElement) =>
      `\n::${pseudoElement}`
    )
  } {
          color: blue;
        }
      </style>
    </template>
  </Test>
    `;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const pseudoElements = contexts.filter((context) =>
      context.type === ContextTypes.StyleSheetSelectorPseudoElement
    );
    assertEquals(
      pseudoElements.length,
      SupportedStyleSheetPseudoElements.length,
    );
    pseudoElements.forEach((pseudoElement) => {
      const { source } = pseudoElement;
      assert(source.startsWith("::"));
      assert(SupportedStyleSheetPseudoElements.includes(source.slice(2)));
    });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoElement} context`,
    );
  }
});

Deno.test("exium supports all standard pseudo classes (stylesheet)", () => {
  const content = `
  ${
    SupportedStyleSheetPseudoElements.map((pseudoElement) =>
      `\n::${pseudoElement}`
    )
  } {
          color: blue;
        }`;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const pseudoElements = contexts.filter((context) =>
      context.type === ContextTypes.StyleSheetSelectorPseudoElement
    );
    assertEquals(
      pseudoElements.length,
      SupportedStyleSheetPseudoElements.length,
    );
    pseudoElements.forEach((pseudoElement) => {
      const { source } = pseudoElement;
      assert(source.startsWith("::"));
      assert(SupportedStyleSheetPseudoElements.includes(source.slice(2)));
    });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoElement} context`,
    );
  }
});
