import { ExiumDocument } from "./../../../../src/classes/ExiumDocument.ts";
import {
  assert,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

const content = Deno.readTextFileSync(
  new URL('./fixtures/LargeComponent.deeper', import.meta.url)
);
Deno.test("exium - deeper-document can expose the component's template", () => {
  try {
    const document = new ExiumDocument({
      url: new URL(import.meta.url),
      onError: (reason, _cursor, context) => {
        throw new Error(
          `${reason} ${context.position.line}:${context.position.column}`,
        );
      },
      source: content,
      options: { type: "deeper" },
    });
    assert(document);
  } catch (err) {
    throw err;
  }
});