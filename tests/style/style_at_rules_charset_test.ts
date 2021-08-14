import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";

Deno.test("exium can parse @charset", () => {
  const content = `@charset 'utf-8';`;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const charset = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetAtRuleCharset
    );
    if (!charset) {
      throw new Error(
        `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleCharset} context`,
      );
    }
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleCharset} context`,
    );
  }
});
