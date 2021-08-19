import { Exium, ExiumDocument } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";

/**
 * traits in css
 * assert that a list of properties are respected
 * by the end user
 */
// TODO
 Deno.test("exium stylesheet supports type rule creation", () => {
  const content = `
    @trait myTrait = div,
      ul > li {
        color: red | blue | green;
    }
    @<myTrait,> div {
      color: red;
    }
    `;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  }) ;
  const contexts = lexer.readSync(content, {
    type: "stylesheet",
  });
  try {
    const typeAssignment = contexts.find((context) => context.type === ContextTypes.StyleSheetTypeAssignment);
    assert(typeAssignment);
    assertEquals(typeAssignment.source, '<myTrait,>');
    const [identifier, coma] = typeAssignment.children;
    assert(identifier);
    assert(coma);
    assertEquals(identifier.source, 'myTrait');
  } catch(err) {
    throw err;
  }
});

Deno.test('exium - document supports getStyleSheetTraitDeclarationByName', () => {
  const content = `
  @trait myTrait = div,
    ul > li {
      color: red | blue | green;
  }
  @<myTrait,> div {
    color: red;
  }
  `;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    source: content,
    onError: (reason, _cursor, context) => {
      const position = context.getPosition(content);
      throw new Error(
        `${reason} ${position.line}:${position.column}`,
      );
    },
    options: { type: 'stylesheet' },
  });
  const trait = document.getStyleSheetTraitDeclarationByName('myTrait');
  assert(trait);
  assertEquals(trait.type, ContextTypes.StyleSheetTraitDeclaration);
  assertEquals(trait.source, `@trait myTrait = div,
  ul > li {
    color: red | blue | green;
}`);
});
/**
 * traits in css
 * assert that a list of properties are respected
 * by the end user
 */
Deno.test("exium stylesheet supports type rule assignment", () => {
  const content = /*css*/ `
    @<myTrait>  div {
      color: red;
    }`;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
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
    assertEquals(typeRule.getPosition(content), {
      start: 6,
      end: 15,
      line: 1,
      column: 5,
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

Deno.test("exium stylesheet supports type rule assignment (stylesheet)", () => {
  const content = `
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
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
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
    assertEquals(typeRule.getPosition(content), {
      end: 49,
      line: 4,
      start: 40,
      column: 7,
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
