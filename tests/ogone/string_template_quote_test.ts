import { Exium } from "./../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium supports template quotes", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = "` test support `";
  const contexts = lexer.readSync(content, { type: "lexer" });
  if (contexts && contexts.length) {
    const [doubleQuote] = contexts;
    assertEquals(doubleQuote.type, ContextTypes.StringTemplateQuote);
    assertEquals(doubleQuote.source, content);
    const position = doubleQuote.getPosition(content);
    assertEquals(position, { line: 0, column: 0, start: 0, end: 16 });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringTemplateQuote} context`,
    );
  }
});

Deno.test("exium should not use escaped template quotes to close quotes", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = "` test support \\` should display the whole string`";
  const contexts = lexer.readSync(content, { type: "lexer" });
  if (contexts && contexts.length) {
    const [doubleQuote] = contexts;
    assertEquals(doubleQuote.type, ContextTypes.StringTemplateQuote);
    assertEquals(doubleQuote.source, content);
    const position = doubleQuote.getPosition(content);
    assertEquals(position, { line: 0, column: 0, start: 0, end: 50 });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringTemplateQuote} context`,
    );
  }
});

Deno.test("exium should use the onError function, when the StringTemplateQuote is not finished", () => {
  let result = false;
  const lexer = new Exium(() => {
    // true because the quote isn't closed
    result = true;
  });
  const content = "`";
  const contexts = lexer.readSync(content, { type: "lexer" });
  if (contexts && contexts.length) {
    assertEquals(result, true);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringTemplateQuote} context`,
    );
  }
});

Deno.test("exium should use the onError function, when the StringTemplateQuoteEval is not finished", () => {
  let result = false;
  const lexer = new Exium(() => {
    // true because the quote isn't closed
    result = true;
  });
  const content = "`${";
  const contexts = lexer.readSync(content, { type: "lexer" });
  if (contexts && contexts.length) {
    assertEquals(result, true);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringTemplateQuote} context`,
    );
  }
});

Deno.test("exium supports template concatenation inside template quotes", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = "`${supported}`";
  const contexts = lexer.readSync(content, { type: "lexer" });
  if (contexts && contexts.length) {
    const [templateEval, templateQuote] = contexts;
    assertEquals(true, templateQuote.children.includes(templateEval));
    assertEquals(templateQuote.type, ContextTypes.StringTemplateQuote);
    assertEquals(templateEval.type, ContextTypes.StringTemplateQuoteEval);
    assertEquals(templateEval.source, content.slice(1, -1));
    const position = templateEval.getPosition(content);
    assertEquals(position, { line: 0, column: 1, start: 1, end: 13 });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringTemplateQuote} context`,
    );
  }
});

Deno.test("exium supports recursive template concatenation", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = "`${supported `test ${name}`}`";
  const contexts = lexer.readSync(content, { type: "lexer" });
  if (contexts && contexts.length) {
    const [
      ,
      templateQuoteEval,
      templateQuote,
      templateQuoteEvalOnTop,
      templateQuoteOnTop,
    ] = contexts;
    assertEquals(true, templateQuote.children.includes(templateQuoteEval));
    assertEquals(
      true,
      templateQuoteOnTop.children.includes(templateQuoteEvalOnTop),
    );
    assertEquals(templateQuoteEval.source, "${name}");
    assertEquals(templateQuoteEvalOnTop.source, "${supported `test ${name}`}");

    assertEquals(templateQuote.source, "`test ${name}`");
    assertEquals(templateQuoteOnTop.source, content);

    assertEquals(templateQuoteOnTop.getPosition(content), {
      start: 0,
      end: 29,
      line: 0,
      column: 0,
    });
    assertEquals(templateQuoteEvalOnTop.getPosition(content), {
      start: 1,
      end: 28,
      line: 0,
      column: 1,
    });
    assertEquals(templateQuote.getPosition(content), {
      start: 13,
      end: 27,
      line: 0,
      column: 13,
    });
    assertEquals(templateQuoteEval.getPosition(content), {
      start: 19,
      end: 26,
      line: 0,
      column: 19,
    });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringTemplateQuote} context`,
    );
  }
});
