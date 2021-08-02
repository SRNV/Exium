// import { ContextTypes } from "../../src/enums/context-types.ts";
import { Exium } from "./../../mod.ts";
import { assert } from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium supports the ComponentTypeStatement", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = `
component <A></A>
component <A />

app <B></B>
app <B />

async <C></C>
async <C />

router <D></D>
router <D />

store <F></F>
store <F />

controller <G></G>
controller <G />

gl <H></H>
gl <H />
  `;
  const contexts = lexer.readSync(content, { type: "deeper" });
  assert(contexts);
});

Deno.test("exium throws if their is an unsupported type of component", () => {
  let isSucess = true;
  const lexer = new Exium((_reason, _cursor, _context) => {
    isSucess = false;
  });
  const content = `
foo <A>
</A>
foo <A />

bar <B />
  `;
  lexer.readSync(content, { type: "deeper" });
  assert(!isSucess);
});

Deno.test("exium supports template definition in a deeper component", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = `
component <C>
  <template> aa </template>
  <script></script>
</C>
  `;
  const contexts = lexer.readSync(content, { type: "deeper" });
  assert(contexts.length);
});
