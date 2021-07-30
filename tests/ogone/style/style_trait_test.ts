import { Exium } from "../../../mod.ts";
import { ContextTypes } from "../../../src/enums/context-types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

/**
 * traits in css
 * assert that a list of properties are respected
 * by the end user
 */
Deno.test("exium stylesheet supports type rule assignment", () => {
  const content = /*css*/`
    @<myTrait>  div {
      color: red;
    }`;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, {
    type: "stylesheet",
  });
  if (contexts && contexts.length) {
    const atRule = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetAtRule
    );
    const typeRule = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetTypeAssignment
    );
    if (!atRule) {
      throw new Error(
        `Exium - Failed to retrieve ${ContextTypes.StyleSheetTypeAssignment} context`,
      );
    }
    if (!typeRule) {
      throw new Error(
        `Exium - Failed to retrieve ${ContextTypes.StyleSheetTypeAssignment} context`,
      );
    }
    assertEquals(typeRule.source, "<myTrait>");
    assertEquals(typeRule.position, { start: 6, end: 15, line: 1, column: 5 });
    assert(atRule.data.isTyped);
    assert(
      atRule.related.find((ctx) =>
        ctx.type === ContextTypes.StyleSheetPropertyList
      ),
    );
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetTypeAssignment} context`,
    );
  }
});

Deno.test("exium stylesheet supports type rule assignment (stylesheet)", () => {
  const content = /*css*/`
<Test>
  <template>
    <style>
      @<myTrait>  div {
        color: red;
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
  const contexts = lexer.readSync(content, {
    type: "ogone",
  });
  if (contexts && contexts.length) {
    const atRule = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetAtRule
    );
    const typeRule = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetTypeAssignment
    );
    if (!atRule) {
      throw new Error(
        `Exium - Failed to retrieve ${ContextTypes.StyleSheetTypeAssignment} context`,
      );
    }
    if (!typeRule) {
      throw new Error(
        `Exium - Failed to retrieve ${ContextTypes.StyleSheetTypeAssignment} context`,
      );
    }
    assertEquals(typeRule.source, "<myTrait>");
    assertEquals(typeRule.position, {
      end: 49,
      line: 4,
      start: 40,
      column: 7
    });
    assert(atRule.data.isTyped);
    assert(
      atRule.related.find((ctx) =>
        ctx.type === ContextTypes.StyleSheetPropertyList
      ),
    );
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetTypeAssignment} context`,
    );
  }
});
