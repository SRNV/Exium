import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
/*
import { SupportedStyleSheetProperties } from "../../src/supports.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
*/

Deno.test("exium supports spread feature", () => {
  const content = `
  div {
    ...rule;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    console.warn(context);
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    // noop
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoElement} context`,
    );
  }
});
