import { Exium } from '../../mod.ts';
import { ContextTypes } from '../../src/enums/context-types.ts';
import { assertEquals, assert } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);
/**
 * traits in css
 * assert that a list of properties are respected
 * by the end user
 */
Deno.test('ogone-lexer stylesheet supports type rule assignment', () => {
  const content = `
    @<myTrait>  div {
      color: red;
    }`;
  const lexer = new Exium((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.readSync(content, { type: 'stylesheet' });
  if (contexts && contexts.length) {
    const atRule = contexts.find((context) => context.type === ContextTypes.StyleSheetAtRule);
    const typeRule = contexts.find((context) => context.type === ContextTypes.StyleSheetTypeAssignment);
    if (!atRule) {
      throw new Error(`Exium - Failed to retrieve ${ContextTypes.StyleSheetTypeAssignment} context`);
    }
    if (!typeRule) {
      throw new Error(`Exium - Failed to retrieve ${ContextTypes.StyleSheetTypeAssignment} context`);
    }
    assert(atRule.data.isTyped);
    assert(atRule.children.find((ctx) => ctx.type === ContextTypes.StyleSheetCurlyBraces));
  } else {
    throw new Error(`Exium - Failed to retrieve ${ContextTypes.StyleSheetTypeAssignment} context`);
  }
});
