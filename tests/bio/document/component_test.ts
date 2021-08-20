import { ExiumDocument } from "./../../../src/classes/ExiumDocument.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium - bio-document can expose the component's template", () => {
  const content = `
import component { Counter } from './Counter.bio';
import component { Route404 } from './404.bio';

export router <Router>
</Router> export app <App />
export component <C />
  `;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    onError: (reason, _cursor, context) => {
      const position = context.getPosition(content);
      throw new Error(
        `${reason} ${position.line}:${position.column}`,
      );
    },
    source: content,
    options: { type: "bio" },
  });
  try {
    const [router, app, component] = document.components;
    assert(router);
    assert(app);
    assert(component);
    assertEquals(router.getBioComponentType(), 'router');
    assertEquals(app.getBioComponentType(), 'app');
    assertEquals(component.getBioComponentType(), 'component');
  } catch (err) {
    throw err;
  }
});