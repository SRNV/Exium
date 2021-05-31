import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium supports spread feature", () => {
  const content = `
  <template>
    <style>
      div {
        ...rule;
      }
    </style>
  </template>
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const spread = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetRuleSpread
    );
    const spreadName = spread &&
      spread.related.find((context) =>
        context.type === ContextTypes.Identifier
      );
    assert(!!spread);
    assertEquals(spread.source, "...rule;");
    assertEquals(spread.position, { start: 46, end: 54, line: 4, column: 8 });
    if (!spreadName) {
      throw new Error("Failed to retrieve spread identifier");
    }
    assertEquals(spreadName.source, "rule");
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoElement} context`,
    );
  }
});

Deno.test("exium supports spread feature (stylesheet)", () => {
  const content = `
  div {
    ...rule;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const spread = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetRuleSpread
    );
    assert(!!spread);
    assertEquals(spread.source, "...rule;");
    assertEquals(spread.position, { start: 13, end: 21, line: 2, column: 4 });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoElement} context`,
    );
  }
});

Deno.test("exium supports multiple spreads", () => {
  const items = [
    'rule',
    'another',
    'something',
    'last',
  ];
  const content = `
  div {
    ${items.map((prop) => `...${prop};`).join('')}
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    console.warn(context, _cursor, content)
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const spreads = contexts.filter((context) =>
      context.type === ContextTypes.StyleSheetRuleSpread
    );
    const spreadsName = contexts.filter((context) =>
      context.type === ContextTypes.Identifier
    );
    spreads.forEach((spread, i) => {
      const name = spreadsName[i];
      assert(name.source === items[i]);
      assert(spread.related.includes(name));
      assert(name.position.start === spread.position.start + 3);
    });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoElement} context`,
    );
  }
});

Deno.test("exium will use onError function if the spread is not followed by a semicolon", () => {
  const content = `
  div {
    ...rule
  }
  `;
  let result = false;
  new Exium(() => {
    result = true;
  })
    .readSync(content, { type: "stylesheet" });
  assert(result);
});
