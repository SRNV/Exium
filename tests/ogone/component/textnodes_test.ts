import { ContextTypes } from "../../../src/enums/context-types.ts";
import { Exium } from "./../../../mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium can parse textnodes with template eval ctx inside a component's template", () => {
  const textnode = "$\{this.basic}";
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content =
    `<Component><template><div>${textnode}</div></template></Component>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const textnodeCTX = contexts.find((context) =>
        context.type === ContextTypes.TextNode
      );
      if (!textnodeCTX) {
        throw new Error("Failed to retrieve the textnode");
      }
      const templateEvalCTX = contexts.find((context) =>
        context.type === ContextTypes.StringTemplateQuoteEval
      );
      if (!templateEvalCTX) {
        throw new Error("Failed to retrieve the textnode");
      }
      assert(textnodeCTX.children.includes(templateEvalCTX));
      assertEquals(templateEvalCTX.source, textnode);
      assertEquals(templateEvalCTX.getPosition(content), {
        start: 26,
        end: 39,
        line: 0,
        column: 26,
      });
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Node Context");
  }
});
