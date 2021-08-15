import { Exium } from "./../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium supports spaces", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(" ");
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(" ", { type: "ogone" });
  if (contexts && contexts.length) {
    const [space] = contexts;
    assertEquals(space.type, ContextTypes.Space);
    const position = space.getPosition(" ");
    assertEquals(position, { line: 0, column: 0, start: 0, end: 1 });
  } else {
    throw new Error("Exium - Failed to retrieve Space context");
  }
});

Deno.test("exium supports multiple spaces", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition("  ");
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync("  ", { type: "ogone" });
  if (contexts && contexts.length) {
    const [space] = contexts;
    assertEquals(space.type, ContextTypes.MultipleSpaces);
    const position = space.getPosition("  ");
    assertEquals(position, { line: 0, column: 0, start: 0, end: 2 });
  } else {
    throw new Error("Exium - Failed to retrieve MultipleSpaces context");
  }
});

Deno.test("exium supports line break", () => {
  const content = `
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content,
    { type: "ogone" },
  );
  if (contexts && contexts.length) {
    const [lineBreak] = contexts;
    assertEquals(lineBreak.type, ContextTypes.LineBreak);
    const position = lineBreak.getPosition(content);
    assertEquals(position, { line: 0, column: 0, start: 0, end: 1 });
  } else {
    throw new Error("Exium - Failed to retrieve MultipleSpaces context");
  }
});
