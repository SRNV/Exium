import { ContextTypes } from "../../../src/enums/context-types.ts";
import { Exium } from "./../../../mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium - bio language supports styleheet for components", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `
component<A>
  <style>
    div {}
  </style>
</A>
  `;
  const contexts = lexer.readSync(content, { type: "bio" });
  assert(contexts);
  const stylesheet = contexts.find((context) => context.type === ContextTypes.StyleSheet);
  assert(stylesheet)
  assertEquals(stylesheet.source.trim(), 'div {}');
});