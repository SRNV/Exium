import { Exium } from "./../mod.ts";
import { ContextTypes } from "../src/enums/context-types.ts";
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";



Deno.test("exium supports spaces", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(" ", { type: "component" });
  if (contexts && contexts.length) {
    const [space] = contexts;
    assertEquals(space.type, ContextTypes.Space);
    assertEquals(space.position.line, 0);
    assertEquals(space.position.column, 0);
    assertEquals(space.position.start, 0);
    assertEquals(space.position.end, 1);
  } else {
    throw new Error("Exium - Failed to retrieve Space context");
  }
});

Deno.test("exium supports multiple spaces", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync("  ", { type: "component" });
  if (contexts && contexts.length) {
    const [space] = contexts;
    assertEquals(space.type, ContextTypes.MultipleSpaces);
    assertEquals(space.position.line, 0);
    assertEquals(space.position.column, 0);
    assertEquals(space.position.start, 0);
    assertEquals(space.position.end, 2);
  } else {
    throw new Error("Exium - Failed to retrieve MultipleSpaces context");
  }
});

Deno.test("exium supports line break", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(
    `
  `,
    { type: "component" },
  );
  if (contexts && contexts.length) {
    const [lineBreak] = contexts;
    assertEquals(lineBreak.type, ContextTypes.LineBreak);
    assertEquals(lineBreak.position.line, 0);
    assertEquals(lineBreak.position.column, 0);
    assertEquals(lineBreak.position.start, 0);
    assertEquals(lineBreak.position.end, 1);
  } else {
    throw new Error("Exium - Failed to retrieve MultipleSpaces context");
  }
});
