import { Exium } from "./../mod.ts";
import { ContextTypes } from "../src/enums/context-types.ts";

Deno.test("exium can retrieve nested protocol", () => {
  const content = `
  <proto>
    declare:
      public data: myType = 'something';
  </proto>`;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "component" });
  if (contexts && contexts.length) {
    const protocol = contexts.find((context) =>
      context.type === ContextTypes.Protocol
    );
    if (!protocol) {
      throw new Error(
        `Exium - Failed to retrieve ${ContextTypes.Protocol} context`,
      );
    }
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.Protocol} context`,
    );
  }
});
