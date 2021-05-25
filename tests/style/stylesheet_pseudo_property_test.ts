import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { SupportedStyleSheetPseudoClasses } from "../../src/supports.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium can retrieve pseudo properties", () => {
  const content = /*css*/`
    div:hover {
      color::media(
        default: blue;
        10px: red;
      );
    }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const parentheses = contexts.find((context) => context.type === ContextTypes.StyleSheetPseudoPropertyParentheses);
    // can find pseudo property parentheses
    assert(!!parentheses);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoClass} context`,
    );
  }
});