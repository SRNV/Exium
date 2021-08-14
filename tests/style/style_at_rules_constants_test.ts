import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

/**
 * being able to type a variable
 * with the statements
 * @const
 *  and
 * @export const
 * we should be able to expose primitive types
 */
Deno.test("exium stylesheet supports @const statement, and it can retrieve the name of the const and its type", () => {
  const constName = "myColor";
  const content = ` @const myColor<hex>= #001000;
  div {
    color: $myColor;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const err = new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`,
    );
    const errName = new Error(
      `Exium - Failed to retrieve ${ContextTypes.Identifier} context`,
    );
    const constant = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetAtRuleConst
    );
    if (!constant) {
      throw err;
    }
    const constantName = constant.related.find((context) =>
      context.type === ContextTypes.Identifier
    );
    if (!constantName) {
      throw errName;
    }
    assertEquals(constantName.source, constName);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`,
    );
  }
});

Deno.test("exium stylesheet supports @const statement, and it can retrieve the name of the const and its type 2 (in component)", () => {
  const constName = "myColor";
  const content = `
<Styling>
  <template>
    <style>
      @const myColor<hex>= #001000;
      div {
        color: $myColor;
      }
    </style>
  </template>
</Styling>`;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const err = new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`,
    );
    const errName = new Error(
      `Exium - Failed to retrieve ${ContextTypes.Identifier} context`,
    );
    const constant = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetAtRuleConst
    );
    if (!constant) {
      throw err;
    }
    const constantName = constant.related.find((context) =>
      context.type === ContextTypes.Identifier
    );
    if (!constantName) {
      throw errName;
    }
    assertEquals(constantName.source, constName);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`,
    );
  }
});

Deno.test("exium stylesheet supports @export statement", () => {
  const content = `@export const myVar<hex> = #000000;`;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const constant = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetAtRuleConst
    );
    if (!constant) {
      throw new Error(
        `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`,
      );
    }
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`,
    );
  }
});
Deno.test("exium stylesheet supports @const statement and supports rule assignment", () => {
  const constName = "myColor";
  const content = ` @const ${constName}<rule> = {
    color: red;
  };`;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const err = new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`,
    );
    const errName = new Error(
      `Exium - Failed to retrieve ${ContextTypes.Identifier} context`,
    );
    const constant = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetAtRuleConst
    );
    if (!constant) {
      throw err;
    }
    const constantName = constant.related.find((context) =>
      context.type === ContextTypes.Identifier
    );
    if (!constantName) {
      throw errName;
    }
    const constantTypeAssignment = constant.related.find((context) =>
      context.type === ContextTypes.StyleSheetTypeAssignment
    );
    if (!constantTypeAssignment) {
      throw err;
    }
    const constantStyleSheetPropertyList = constant.related.find((context) =>
      context.type === ContextTypes.StyleSheetPropertyList
    );
    if (!constantStyleSheetPropertyList) {
      throw err;
    }
    assertEquals(constantName.source, constName);
    assertEquals(constantTypeAssignment.source, "<rule>");
    assertEquals(constantTypeAssignment.getPosition(content), {
      start: 15,
      end: 21,
      line: 0,
      column: 15,
    });
    assertEquals(
      constantStyleSheetPropertyList.source,
      "{\n    color: red;\n  }",
    );
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`,
    );
  }
});
