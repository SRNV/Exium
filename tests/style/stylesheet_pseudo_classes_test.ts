import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { SupportedStyleSheetPseudoClasses } from "../../src/supports.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium can retrieve selectors with pseudo classes", () => {
  const content = `
  <Test>
  <template>
    <style>
      div:hover {
        color: blue;
      }
    </style>
  </template>
  </Test>
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const hover = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorPseudoClass
    );
    if (!hover) {
      throw new Error("failed to retrieve the hover pseudo class");
    }
    assertEquals(hover.source, ":hover");
    assertEquals(hover.position, { start: 44, end: 50, line: 4, column: 9 });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoClass} context`,
    );
  }
});

Deno.test("exium can retrieve the not pseudo class", () => {
  const content = `
  <Test>
    <template>
      <style>
        div:not(.class) {
          color: blue;
        }
      </style>
    </template>
  </Test>
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const not = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorPseudoClass
    );
    if (!not) {
      throw new Error("failed to retrieve the not pseudo class");
    }
    assertEquals(not.source, ":not");
    assertEquals(not.position, {
      column: 11,
      end: 54,
      line: 4,
      start: 50,
    });
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
      column: 15,
      end: 62,
      line: 4,
      start: 54,
    });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoClass} context`,
    );
  }
});

Deno.test("exium supports all standard pseudo classes", () => {
  const content = `
  <Test>
  <template>
    <style>
      ${
    SupportedStyleSheetPseudoClasses.map((pseudoClass) => `:${pseudoClass}`)
  } {
        color: blue;
      }
    </style>
  </template>
  </Test>
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
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

Deno.test("exium supports all standard pseudo classes (stylesheet)", () => {
  const content = /*css*/ `
  ${SupportedStyleSheetPseudoClasses.map((pseudoClass) => `:${pseudoClass}`)} {
        color: blue;
      }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
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
