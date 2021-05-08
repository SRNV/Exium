import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { SupportedStyleSheetPseudoClasses } from "../../src/supports.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium support combinators", () => {
  const content = `
  <template>
    <style>
    [attribute=""],
    [attribute2],
    [attribute3] element,
    element.class#id,
    element#id,
    .class + #id,
    element element2,
    element[attribute],
    element:hover,
    element2:not(.class), *,
    * > p + div,
    div ~ ul {

    }
    </style>
  </template>
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    // *
    const all = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorCombinatorAll
    );
    if (!all) {
      throw new Error("Failed to retrieve * combinator");
    }
    assertEquals(all.source, "*");

    // >
    const childSelector = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorCombinatorChildSelector
    );
    if (!childSelector) {
      throw new Error("Failed to retrieve > combinator");
    }
    assertEquals(childSelector.source, ">");

    // +
    const adjacent = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorCombinatorAdjacentSibling
    );
    if (!adjacent) {
      throw new Error("Failed to retrieve + combinator");
    }
    assertEquals(adjacent.source, "+");

    // ~
    const general = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorCombinatorGeneralSibling
    );
    if (!general) {
      throw new Error("Failed to retrieve + combinator");
    }
    assertEquals(general.source, "~");
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoClass} context`,
    );
  }
});
