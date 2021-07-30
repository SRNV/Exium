import { ContextTypes } from "../../src/enums/context-types.ts";
import { Exium } from "./../../mod.ts";
import { assert } from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium supports ImportComponentStatement with a list of identifier", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = `import component {
    A,
    B } from './A.deeper';`;
  const contexts = lexer.readSync(content, { type: "deeper" });
  const identifiers = contexts.find((context) => context.type === ContextTypes.IdentifierList);
  assert(identifiers);
  const ComponentA = identifiers.children.find((context) => context.source === 'A' && context.type === ContextTypes.Identifier);
  assert(ComponentA);
  const ComponentB = identifiers.children.find((context) => context.source === 'B' && context.type === ContextTypes.Identifier);
  assert(ComponentB);
});

Deno.test("exium throws on malformed ImportComponentStatement when the identifier_list_ctx starts with coma", () => {
  let isSucess = true;
  const lexer = new Exium((_reason, _cursor, _context) => {
    isSucess = false;
  });
  const content = `import component { , A, B } from './A.deeper';`;
  lexer.readSync(content, { type: "deeper" });
  assert(!isSucess);
});

Deno.test("exium throws on malformed ImportComponentStatement when theirs a suite of coma", () => {
  let isSucess = true;
  const lexer = new Exium((_reason, _cursor, _context) => {
    isSucess = false;
  });
  const content = `import component { A,, B } from './A.deeper';`;
  lexer.readSync(content, { type: "deeper" });
  assert(!isSucess);
});
Deno.test("exium supports imports with unique identifier", () => {
  let isSucess = true;
  const lexer = new Exium((_reason, _cursor, _context) => {
    isSucess = false;
  });
  const content = `import component { V } from './A.deeper';`;
  lexer.readSync(content, { type: "deeper" });
  assert(isSucess);
});

Deno.test("exium supports imports with default identifier", () => {
  let isSucess = true;
  const lexer = new Exium((_reason, _cursor, _context) => {
    isSucess = false;
  });
  const content = `import component V from './A.deeper';`;
  lexer.readSync(content, { type: "deeper" });
  assert(isSucess);
});