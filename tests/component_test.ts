import { Exium } from "./../mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { component1 } from "./utils/componentFile.ts";

const url = new URL(import.meta.url);
/*
// TODO
Deno.test("ogone-lexer can parse a basic component", () => {
  const style = `
@charset 'utf-8';
`;
  const protocol = `
  declare:
    public basic: string = 'this is a basic component';
`;
  const lexer = new Exium((reason, cursor, context) => {
    console.warn(context);
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = `
import component A from './b.o3';

<template>
  <style>${style}</style>
  <div> $\{this.basic} </div>
</template>
<proto>${protocol}</proto>
  `;
  const contexts = lexer.readSync(content, { type: "component", debugg: true });
  if (contexts && contexts.length) {
    try {
      // TODO
      console.warn(contexts);
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Node Context");
  }
});
*/

Deno.test("ogone-lexer large component is parsed < 100ms", () => {
  const perf = performance.now();
  const lexer = new Exium((reason, cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = component1;
  const contexts = lexer.readSync(content, { type: "component" });
  const parseTime = performance.now() - perf;
  if (contexts && contexts.length) {
    try {
      assert(parseTime < 100);
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Node Context");
  }
});
