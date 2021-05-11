import { Exium } from "./../mod.ts";
import { ContextTypes } from "../src/enums/context-types.ts";
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium supports double quotes", () => {
  const lexer = new Exium((_reason, _cursor, context) => {
    throw new Error(
      `${_reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = `" single quotes are supported "`;
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    const [doubleQuote] = contexts;
    assertEquals(doubleQuote.type, ContextTypes.StringDoubleQuote);
    assertEquals(doubleQuote.source, content);
    assertEquals(doubleQuote.position.start, 0);
    assertEquals(doubleQuote.position.line, 0);
    assertEquals(doubleQuote.position.column, 0);
    assertEquals(doubleQuote.position.end, 31);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringDoubleQuote} context`,
    );
  }
});

Deno.test("exium should not use escaped quotes to close quotes", () => {
  const lexer = new Exium((_reason, _cursor, context) => {
    throw new Error(
      `${_reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content =
    `" single quotes are supported \\" is escaped but still open"`;
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    const [doubleQuote] = contexts;
    assertEquals(doubleQuote.type, ContextTypes.StringDoubleQuote);
    assertEquals(doubleQuote.source, content);
    assertEquals(doubleQuote.position.start, 0);
    assertEquals(doubleQuote.position.line, 0);
    assertEquals(doubleQuote.position.column, 0);
    assertEquals(doubleQuote.position.end, 59);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringDoubleQuote} context`,
    );
  }
});

Deno.test("exium should use the onError function when theres a line break into a StringDoubleQuote", () => {
  let result = false;
  const lexer = new Exium(() => {
    // true because there's a line break between the quotes
    result = true;
  });
  const content = `"
  "`;
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    assertEquals(result, true);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringDoubleQuote} context`,
    );
  }
});
Deno.test("exium should use the onError function, when the StringDoubleQuote is not finished", () => {
  let result = false;
  const lexer = new Exium(() => {
    // true because the quote isn't closed
    result = true;
  });
  const content = `"`;
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    assertEquals(result, true);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringDoubleQuote} context`,
    );
  }
});
