import { Exium, ExiumDocument } from "../../../mod.ts";
import { ContextTypes } from "../../../src/enums/context-types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test('exium - document supports getStyleSheetInternalTraitDeclarationByName', () => {
  const content = `
  export component <St>
    <style>
      @trait myTrait =
        div,ul > li { color: red; };
      @<myTrait,> div {
        color: red;
      }
    </style>
  </St>`;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    source: content,
    onError: (reason, _cursor, context) => {
      const position = context.getPosition(content);
      throw new Error(
        `${reason} ${position.line}:${position.column}`,
      );
    },
    options: { type: 'bio', debugg: true },
  });
  const elements = document.contexts.filter((context) => context.type === ContextTypes.StyleSheetSelectorHTMLElement);
  assert(elements);
  assertEquals(elements.map((el) => el.source), ['div', 'ul', 'li', 'div']);
  assertEquals(elements.length, 4);
});