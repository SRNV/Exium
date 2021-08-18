import { ExiumDocument } from "./../../../../src/classes/ExiumDocument.ts";
import { assert, assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

const content = Deno.readTextFileSync(
  new URL("./fixtures/LargeComponent.bio", import.meta.url),
);
Deno.test("exium - handle large component", () => {
  try {
    let perf = performance.now();
    const document = new ExiumDocument({
      url: new URL(import.meta.url),
      onError: (reason, _cursor, context) => {
        console.log(reason, _cursor, context);
        const position = context.getPosition(content);
        throw new Error(
          `${reason} ${position.line}:${position.column}`,
        );
      },
      source: content,
      options: { type: "bio" },
    });
    assert(document);
    const { components } = document;
    assertEquals(components.length, 360);
    perf = performance.now() - perf;
    assert(perf < 300);
  } catch (err) {
    throw err;
  }
});
