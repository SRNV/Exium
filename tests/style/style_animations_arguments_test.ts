import { ExiumDocument } from "./../../src/classes/ExiumDocument.ts";
import { assert, assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium - support for animations arguments", () => {
  const stylesheet = /*css*/ `
    .slide-out-right {
      right::anim(
        time: 1s;
        mode: forwards;
        direction: normal;
        count: 1;
        from: 0px;
        to: -1000%;
      );
    }`;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    onError: (reason, _cursor, context) => {
      const position = context.getPosition(stylesheet);
      throw new Error(
        `${reason} ${position.line}:${position.column}`,
      );
    },
    source: stylesheet,
    options: {
      type: "stylesheet",
    },
  });
  try {
    const rules = document.getStylesheetRulesByProperty("right");
    assert(rules.length);
    assert(rules[0]);
    const [ rule ] = rules;
    assert(rule);
    const { cssProperties } = rule;
    assert(cssProperties?.length);
    const [ right ] = cssProperties
    assertEquals(right.name, 'right');
  } catch (err) {
    throw err;
  }
});
