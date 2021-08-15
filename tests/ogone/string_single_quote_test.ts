import { Exium } from "./../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium supports double quotes", () => {
  const lexer = new Exium((_reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${_reason} ${position.line}:${position.column}`,
    );
  });
  const content = `" single quotes are supported "`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const [doubleQuote] = contexts;
    assertEquals(doubleQuote.type, ContextTypes.StringDoubleQuote);
    const position = doubleQuote.getPosition(content);
    assertEquals(position, { line: 0, column: 0, start: 0, end: 31 });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringDoubleQuote} context`,
    );
  }
});

Deno.test("exium should not use escaped quotes to close quotes", () => {
  const lexer = new Exium((_reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${_reason} ${position.line}:${position.column}`,
    );
  });
  const content =
    `" single quotes are supported \\" is escaped but still open"`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const [doubleQuote] = contexts;
    assertEquals(doubleQuote.type, ContextTypes.StringDoubleQuote);
    assertEquals(doubleQuote.source, content);
    const position = doubleQuote.getPosition(content);
    assertEquals(position, { line: 0, column: 0, start: 0, end: 59 });
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
  const contexts = lexer.readSync(content, { type: "ogone" });
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
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    assertEquals(result, true);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringDoubleQuote} context`,
    );
  }
});
