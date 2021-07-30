import { ExiumDocument } from './../../../src/classes/ExiumDocument.ts';
import {
  assert,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium - support for animations arguments", () => {
  const stylesheet = /*css*/`
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
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
    source: stylesheet,
    options: {
      type: 'stylesheet',
    }
  });
  try {
    assert(document.getStylesheetRulesByProperty('right').length);
  } catch (err) {
    throw err;
  }
});
