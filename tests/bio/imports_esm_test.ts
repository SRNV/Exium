import { ContextTypes } from "../../src/enums/context-types.ts";
import { Exium } from "./../../mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium supports ImportComponentStatement with global aliases", () => {
  const content = `import * as THREE from 'three';`;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  try {
    const contexts = lexer.readSync(content, { type: "bio" });
    const impStmt = contexts.find((context) =>
      context.type === ContextTypes.ImportStatement
    );
    assert(impStmt);
    const allalias = impStmt.children.find((context) =>
      context.type === ContextTypes.ImportAllAlias
    );
    assert(allalias);
    assertEquals(allalias.source, "* as THREE");
  } catch (err) {
    throw err;
  }
});

/*
Deno.test("", () => {
    const lexer = new Exium((reason, _cursor, context) => {
      const position = context.getPosition(content);
      throw new Error(
        `${reason} ${position.line}:${position.column}`,
      );
    });
    const content = `import { Mesh, MeshBasicMaterial } from 'three';`;
    const contexts = lexer.readSync(content, { type: "bio" });
    try {

    } catch(err) {
      throw err;
    }
  });
  Deno.test("", () => {
    const lexer = new Exium((reason, _cursor, context) => {
      const position = context.getPosition(content);
      throw new Error(
        `${reason} ${position.line}:${position.column}`,
      );
    });
    const content = `import M, { some } from 'mqi';`;
    const contexts = lexer.readSync(content, { type: "bio" });
    try {

    } catch(err) {
      throw err;
    }
  });
  Deno.test("", () => {
    const lexer = new Exium((reason, _cursor, context) => {
      const position = context.getPosition(content);
      throw new Error(
        `${reason} ${position.line}:${position.column}`,
      );
    });
    const content = `import { some }, B from 'qib';`;
    const contexts = lexer.readSync(content, { type: "bio" });
    try {

    } catch(err) {
      throw err;
    }
  });
  Deno.test("", () => {
    const lexer = new Exium((reason, _cursor, context) => {
      const position = context.getPosition(content);
      throw new Error(
        `${reason} ${position.line}:${position.column}`,
      );
    });
    const content = `import { some as aliasOfSome, some2 }, B from 'qib';`;
    const contexts = lexer.readSync(content, { type: "bio" });
    try {

    } catch(err) {
      throw err;
    }
  });
*/
