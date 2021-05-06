import { Exium } from "./../mod.ts";
import { ContextTypes } from "../src/enums/context-types.ts";
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);

Deno.test("exium supports single quotes", () => {
  const lexer = new Exium((reason, cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = "' single quotes are supported '";
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    const [singleQuote] = contexts;
    assertEquals(singleQuote.type, ContextTypes.StringSingleQuote);
    assertEquals(singleQuote.source, content);
    assertEquals(singleQuote.position.start, 0);
    assertEquals(singleQuote.position.line, 0);
    assertEquals(singleQuote.position.column, 0);
    assertEquals(singleQuote.position.end, 31);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringSingleQuote} context`,
    );
  }
});

Deno.test("exium should not use escaped quotes to close quotes", () => {
  const lexer = new Exium((reason, cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content =
    "' single quotes are supported \\' is escaped but still open'";
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    const [singleQuote] = contexts;
    assertEquals(singleQuote.type, ContextTypes.StringSingleQuote);
    assertEquals(singleQuote.source, content);
    assertEquals(singleQuote.position.start, 0);
    assertEquals(singleQuote.position.line, 0);
    assertEquals(singleQuote.position.column, 0);
    assertEquals(singleQuote.position.end, 59);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringSingleQuote} context`,
    );
  }
});

Deno.test("exium should use the onError function", () => {
  let result = false;
  const lexer = new Exium((reason, cursor, context) => {
    // true because there's a line break between the quotes
    result = true;
  });
  const content = `'
  '`;
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    assertEquals(result, true);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringSingleQuote} context`,
    );
  }
});

Deno.test("exium should use the onError function, when the StringSingleQuote is not finished", () => {
  let result = false;
  const lexer = new Exium((reason, cursor, context) => {
    // true because the quote isn't closed
    result = true;
  });
  const content = `'`;
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    assertEquals(result, true);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringSingleQuote} context`,
    );
  }
});
