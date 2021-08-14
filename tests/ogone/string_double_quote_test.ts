import { Exium } from "./../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium supports single quotes", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = "' single quotes are supported '";
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const [singleQuote] = contexts;
    assertEquals(singleQuote.type, ContextTypes.StringSingleQuote);
    assertEquals(singleQuote.source, content);
    /*
    assertEquals(singleQuote.position.start, 0);
    assertEquals(singleQuote.position.line, 0);
    assertEquals(singleQuote.position.column, 0);
    assertEquals(singleQuote.position.end, 31);
    */
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringSingleQuote} context`,
    );
  }
});

Deno.test("exium should not use escaped quotes to close quotes", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content =
    "' single quotes are supported \\' is escaped but still open'";
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const [singleQuote] = contexts;
    assertEquals(singleQuote.type, ContextTypes.StringSingleQuote);
    /*
    assertEquals(singleQuote.source, content);
    assertEquals(singleQuote.position.start, 0);
    assertEquals(singleQuote.position.line, 0);
    assertEquals(singleQuote.position.column, 0);
    assertEquals(singleQuote.position.end, 59);
    */
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringSingleQuote} context`,
    );
  }
});

Deno.test("exium should use the onError function", () => {
  let result = false;
  const lexer = new Exium((_reason, _cursor, _context) => {
    // true because there's a line break between the quotes
    result = true;
  });
  const content = `'
  '`;
  const contexts = lexer.readSync(content, { type: "ogone" });
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
  const lexer = new Exium((_reason, _cursor, _context) => {
    // true because the quote isn't closed
    result = true;
  });
  const content = `'`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    assertEquals(result, true);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StringSingleQuote} context`,
    );
  }
});
