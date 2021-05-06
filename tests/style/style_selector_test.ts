import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test("exium can retrieve selectors", () => {
  const content = `
  div ,
  ul,
  li {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    // TODO
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleCharset} context`,
    );
  }
});

Deno.test("exium can retrieve classes", () => {
  const content = `
  .COMPLEX,.v{}
  .container.b .c {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const containerClass = contexts.find((context) => context.type === ContextTypes.StyleSheetSelectorClass
      && context.source === 'container');
    if (!containerClass) {
      throw new Error('Failed to retrieve the class .container');
    }
    const classComplex = contexts.find((context) => context.type === ContextTypes.StyleSheetSelectorClass
      && context.source === 'COMPLEX');
    const v = contexts.find((context) => context.type === ContextTypes.StyleSheetSelectorClass
      && context.source === 'v');
    const c = contexts.find((context) => context.type === ContextTypes.StyleSheetSelectorClass
      && context.source === 'c');
    assert(!!classComplex);
    assert(!!c);
    assert(!!v);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorClass} context`,
    );
  }
});

Deno.test("exium can retrieve ids", () => {
  const content = `
  .container#anId {
    color: blue;
  }
  #myOtherID,#test {
    color: red;
  }
  #op,
  #stillGood,
  #test {}
  `;
  const lexer = new Exium((reason, cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const id = contexts.find((context) => context.type === ContextTypes.StyleSheetSelectorId
      && context.source === 'anId');
    if (!id) {
      throw new Error('Failed to retrieve the id anId');
    }
    const otherID = contexts.find((context) => context.type === ContextTypes.StyleSheetSelectorId
    && context.source === 'myOtherID');
  if (!otherID) {
    throw new Error('Failed to retrieve the id myOtherID');
  }
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorId} context`,
    );
  }
});
