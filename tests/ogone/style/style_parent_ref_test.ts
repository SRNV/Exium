import { Exium } from "../../../mod.ts";
import { ContextTypes } from "../../../src/enums/context-types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium - supports StyleSheetSelectorParentRef (& token)", () => {
  const elements = [
    "ul",
    "li",
    "&",
    "p",
  ];
  const content = /*css*/ `
  ${elements} {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  try {
    const contexts = lexer.readSync(content, { type: "stylesheet" });
    const parentRef = contexts.find((context) => context.type === ContextTypes.StyleSheetParentRef);
    assert(parentRef);
    assertEquals(parentRef.source, '&');
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - no parent Ref parsed", () => {
  const elements = [
    "ul",
    "li",
    "&&",
    ".&",
    "#&",
    "-&",
    "p",
  ];
  const content = /*css*/ `
  ${elements} {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  try {
    const contexts = lexer.readSync(content, { type: "stylesheet" });
    const parentRef = contexts.find((context) => context.type === ContextTypes.StyleSheetParentRef);
    assert(!parentRef);
  } catch (err) {
    throw err;
  }
});