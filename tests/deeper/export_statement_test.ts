import { ContextTypes } from "../../src/enums/context-types.ts";
import { Exium } from "./../../mod.ts";
import { assert } from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium supports export statements with component", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = `
export component <C>
  <template> aa </template>
  <script></script>
</C>
  `;
  const contexts = lexer.readSync(content, { type: "deeper" });
  assert(contexts.length);
  const exportStatement = contexts.find(context => context.type === ContextTypes.ExportStatement);
  assert(exportStatement);
  const component = exportStatement.children.find((context) => context.type === ContextTypes.ComponentDeclaration);
  assert(component);
});

Deno.test("exium throws if their is an unsupported exported type of component", () => {
    let isSucess = true;
    const lexer = new Exium((_reason, _cursor, _context) => {
      isSucess = false;
    });
    const content = `export foo <A></A>`;
    lexer.readSync(content, { type: "deeper" });
    assert(!isSucess);
  });
