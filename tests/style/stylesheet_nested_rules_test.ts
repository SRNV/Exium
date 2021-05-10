/*
import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { SupportedStyleSheetProperties } from "../../src/supports.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
Deno.test("exium can retrieve properties", () => {
  const content = `
  <template>
    <style>
      div::selection {
        color: red;
        div {
          color: blue;
        }
      }
    </style>
  </template>
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    console.warn(context);
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    const list = contexts.filter((context) =>
      context.type === ContextTypes.StyleSheetPropertyList
    );
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoElement} context`,
    );
  }
});

*/