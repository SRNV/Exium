import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium can retrieve nested css", () => {
  const content = `
<Deno>
  <template>
    <style>
    /** comments */
      @charset 'utf-8';
    </style>
  </template>
</Deno>`;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const stylesheet = contexts.find((context) =>
      context.type === ContextTypes.StyleSheet
    );
    if (!stylesheet) {
      throw new Error(
        `Exium - Failed to retrieve ${ContextTypes.StyleSheet} context`,
      );
    }
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheet} context`,
    );
  }
});

Deno.test("exium can parse at-rules", () => {
  const content = ` @media screen and (min-width: 100px) {} `;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const atrule = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetAtRule
    );
    if (!atrule) {
      throw new Error(
        `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`,
      );
    }
    const name = atrule.related.find((context) =>
      context.type === ContextTypes.Identifier &&
      context.source === "media"
    );
    if (!name) {
      throw new Error(`Exium - Failed to retrieve the name of the at rule`);
    }
    assertEquals(name.getPosition(content), {
      start: 2,
      end: 7,
      line: 0,
      column: 2,
    });
    assertEquals(atrule.getPosition(content), {
      start: 1,
      end: 38,
      line: 0,
      column: 1,
    });
    assert(
      atrule.related.find((ctx) =>
        ctx.type === ContextTypes.StyleSheetPropertyList
      ),
    );
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleConst} context`,
    );
  }
});
