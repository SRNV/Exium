import { ExiumDocument } from './../../src/classes/ExiumDocument.ts';
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium - support for animations arguments", () => {
  const stylesheet = `
    .slide-out-right {
      right: 0px | -1000%;
      @keyframes slide-out-right {
        animation-duration: 1s;
        animation-iteration-count: 1;
        animation-direction: normal;
        animation-fill-mode: forwards;
        position: relative;
        right: 0px | -1000%;
      }
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
    console.warn(document.getStylesheetRulesByProperty('right'));
    assert(document.getStylesheetRulesByProperty('right', '0px').length);
  } catch (err) {
    throw err;
  }
});
