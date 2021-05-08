import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { SupportedStyleSheetPseudoClasses } from "../../src/supports.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium can retrieve selectors with pseudo classes", () => {
  const content = `
  <template>
    <style>
      div:hover {
        color: blue;
      }
    </style>
  </template>
  `;
  const lexer = new Exium((reason, cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    const hover = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorPseudoClass
    );
    if (!hover) {
      throw new Error("failed to retrieve the hover pseudo class");
    }
    assertEquals(hover.source, ":hover");
    assertEquals(hover.position, { start: 35, end: 41, line: 3, column: 9 });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoClass} context`,
    );
  }
});

Deno.test("exium can retrieve the not pseudo class", () => {
  const content = `
  <template>
    <style>
      div:not(.class) {
        color: blue;
      }
    </style>
  </template>
  `;
  const lexer = new Exium((reason, cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    const not = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorPseudoClass
    );
    if (!not) {
      throw new Error("failed to retrieve the not pseudo class");
    }
    assertEquals(not.source, ":not");
    assertEquals(not.position, { start: 35, end: 39, line: 3, column: 9 });
    // find the parenthese following the pseudo class
    const parenthese = not.children.find((context) =>
      context.type === ContextTypes.Parenthese
    );
    if (!parenthese) {
      throw new Error(
        "failed to retrieve the parenthese of the :not pseudo class",
      );
    }
    assertEquals(parenthese.source, "(.class)");
    assertEquals(parenthese.position, {
      start: 39,
      end: 47,
      line: 3,
      column: 13,
    });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoClass} context`,
    );
  }
});

Deno.test("exium supports all standard pseudo classes", () => {
  const content = `
  <template>
    <style>
      ${
    SupportedStyleSheetPseudoClasses.map((pseudoClass) => `:${pseudoClass}`)
  } {
        color: blue;
      }
    </style>
  </template>
  `;
  const lexer = new Exium((reason, cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    const pseudoClasses = contexts.filter((context) =>
      context.type === ContextTypes.StyleSheetSelectorPseudoClass
    );
    assertEquals(pseudoClasses.length, SupportedStyleSheetPseudoClasses.length);
    pseudoClasses.forEach((pseudoClass) => {
      const { source } = pseudoClass;
      assert(source.startsWith(":"));
      assert(SupportedStyleSheetPseudoClasses.includes(source.slice(1)));
    });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoClass} context`,
    );
  }
});
