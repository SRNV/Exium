import { ContextTypes } from "../../src/enums/context-types.ts";
import { Exium } from "./../../mod.ts";
import { assert } from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium supports ImportComponentStatement with a list of identifier", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `import component {
    A,
    B } from './A.bio';`;
  const contexts = lexer.readSync(content, { type: "bio" });
  const identifiers = contexts.find((context) =>
    context.type === ContextTypes.IdentifierList
  );
  assert(identifiers);
  assert(identifiers.source === "{\n    A,\n    B }");
  const ComponentA = identifiers.children.find((context) =>
    context.source === "A" && context.type === ContextTypes.Identifier
  );
  assert(ComponentA);
  const ComponentB = identifiers.children.find((context) =>
    context.source === "B" && context.type === ContextTypes.Identifier
  );
  assert(ComponentB);
});

Deno.test("exium throws on malformed ImportComponentStatement when the identifier_list_ctx starts with coma", () => {
  let isSucess = true;
  const lexer = new Exium((_reason, _cursor, _context) => {
    isSucess = false;
  });
  const content = `import component { , A, B } from './A.bio';`;
  lexer.readSync(content, { type: "bio" });
  assert(!isSucess);
});

Deno.test("exium throws on malformed ImportComponentStatement when theirs a suite of coma", () => {
  let isSucess = true;
  const lexer = new Exium((_reason, _cursor, _context) => {
    isSucess = false;
  });
  const content = `import component { A,, B } from './A.bio';`;
  lexer.readSync(content, { type: "bio" });
  assert(!isSucess);
});
Deno.test("exium supports imports with unique identifier", () => {
  let isSucess = true;
  const lexer = new Exium((_reason, _cursor, _context) => {
    isSucess = false;
  });
  const content = `import component { V } from './A.bio';`;
  lexer.readSync(content, { type: "bio" });
  assert(isSucess);
});

Deno.test("exium supports imports with default identifier", () => {
  let isSucess = true;
  const lexer = new Exium((_reason, _cursor, _context) => {
    isSucess = false;
  });
  const content = `import component V from './A.bio';`;
  lexer.readSync(content, { type: "bio" });
  assert(isSucess);
});
