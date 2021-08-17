import { Exium } from "./../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium supports textnodes", () => {
  const content =
    "import a from 'v';<div>here a textnode</div><!--not a textnode --> here another one";
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const textnodes = contexts.filter((context) =>
      context.type === ContextTypes.TextNode
    );
    const [text1, text2] = textnodes;
    assertEquals(text1.source, "here a textnode");
    assertEquals(text2.source, "here another one");
    assertEquals(text1.getPosition(content), {
      start: 23,
      end: 38,
      line: 0,
      column: 23,
    });
    assertEquals(text2.getPosition(content), {
      start: 67,
      end: 83,
      line: 0,
      column: 67,
    });
    assertEquals(textnodes.length, 2);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.TextNode} context`,
    );
  }
});

Deno.test("exium supports textnodes with template", () => {
  const source = "here a textnode ${template} ";
  const content = `import a from 'v';<div>${source}</div>`;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const textnodes = contexts.filter((context) =>
      context.type === ContextTypes.TextNode
    );
    const [text1] = textnodes;
    const template = text1.children.find((context) =>
      context.type === ContextTypes.StringTemplateQuoteEval
    );
    if (!template) {
      throw new Error("failed to retrieve the template inside the textnode");
    }
    assertEquals(text1.source, source);
    assertEquals(template.source, "${template}");
    assertEquals(template.getPosition(content), {
      start: 39,
      end: 50,
      line: 0,
      column: 39,
    });
    assertEquals(text1.getPosition(content), {
      start: 23,
      end: 51,
      line: 0,
      column: 23,
    });
    assertEquals(textnodes.length, 1);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.TextNode} context`,
    );
  }
});

Deno.test("exium should use onError function when an unsupported textnode is parsed", () => {
  // malformed import statement
  const content = "impot a from 'v';";
  let result = false;
  new Exium((_reason, _cursor, context) => {
    result = context.type === ContextTypes.Unexpected &&
      context.source === content;
    assertEquals(context.getPosition(content), {
      start: 0,
      line: 0,
      column: 0,
      end: 17,
    });
  })
    .readSync(content, { type: "ogone" });
  if (!result) {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.TextNode} context`,
    );
  }
});

Deno.test("exium supports textnodes using < but not starting a new node", () => {
  const source = "is a correct textnode <<<<";
  const content = `<div> ${source}</div>`;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const textnodes = contexts.filter((context) =>
      context.type === ContextTypes.TextNode
    );
    const [text1] = textnodes;
    assertEquals(text1.source, source);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.TextNode} context`,
    );
  }
});
