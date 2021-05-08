import { ContextTypes } from "../../src/enums/context-types.ts";
import { Exium } from "./../../mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { component1 } from "./../utils/componentFile.ts";



Deno.test("exium can parse a basic component", () => {
  const styleSource = `
@charset 'utf-8';
`;
  const protocol = `
  declare:
    public basic: string = 'this is a basic component';
`;
  const lexer = new Exium((reason, _cursor, context) => {
    console.warn(context);
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = `
import component A from './b.o3';

<template>
  <style>${styleSource}</style>
  <div> $\{this.basic} </div>
</template>
<proto>${protocol}</proto>
  `;
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    try {
      const importStatement = contexts.find((context) =>
        context.type === ContextTypes.ImportStatement
      );
      if (!importStatement) {
        throw new Error("Failed to retrieve import statement");
      }
      const template = contexts.find((context) =>
        context.type === ContextTypes.Node &&
        context.related.find((related) => related.source === "template") &&
        !context.data.isNodeClosing
      );
      if (!template) {
        throw new Error("Failed to retrieve the template element");
      }
      const style = contexts.find((context) =>
        context.type === ContextTypes.Node &&
        context.related.find((related) => related.source === "style") &&
        !context.data.isNodeClosing
      );
      if (!style) {
        throw new Error("Failed to retrieve the style element");
      }
      const stylesheet = contexts.find((context) =>
        context.type === ContextTypes.StyleSheet
      );
      if (!stylesheet) {
        throw new Error("Failed to retrieve the stylesheet");
      }
      const proto = contexts.find((context) =>
        context.type === ContextTypes.Node &&
        context.related.find((related) => related.source === "proto") &&
        !context.data.isNodeClosing
      );
      if (!proto) {
        throw new Error("Failed to retrieve the proto element");
      }
      const protocolCTX = contexts.find((context) =>
        context.type === ContextTypes.Protocol
      );
      if (!protocolCTX) {
        throw new Error("Failed to retrieve the protocol context");
      }
      assertEquals(proto.position, {
        start: 125,
        end: 132,
        line: 9,
        column: 0,
      });
      assertEquals(template.position, {
        start: 36,
        end: 46,
        line: 3,
        column: 0,
      });
      assertEquals(style.position, { start: 49, end: 56, line: 4, column: 2 });
      assertEquals(protocolCTX.position, {
        start: 135,
        end: 200,
        line: 10,
        column: 2,
      });
      assertEquals(protocolCTX.source.trim(), protocol.trim());
      assertEquals(stylesheet.source.trim(), styleSource.trim());
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Node Context");
  }
});

Deno.test("exium large component is parsed < 100ms", () => {
  const perf = performance.now();
  const lexer = new Exium((reason, _cursor, context) => {
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
