import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { SupportedStyleSheetProperties } from "../../src/supports.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium can retrieve properties", () => {
  const propertiesList = SupportedStyleSheetProperties.map((
    property,
  ) => [property, "inherit"]);
  const content = `
<Test>
  <template>
    <style>
      div::selection {
        ${
    propertiesList
      .map(([name, value]) => `${name}:${value}`)
      .join(";\n")
  }
      }
    </style>
  </template>
</Test>
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const list = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetPropertyList
    );
    assert(!!list);
    if (list) {
      const properties = list.children.filter((context) =>
        context.type === ContextTypes.StyleSheetProperty
      );
      assert(properties.length);
      assertEquals(properties.length, propertiesList.length);
      properties.forEach((property) => {
        const propName = property.related.find((context) =>
          context.type === ContextTypes.Identifier
        );
        const propValue = property.related.find((context) =>
          context.type === ContextTypes.StyleSheetPropertyValue
        );
        assert(
          propName && propertiesList.find(([name]) => name === propName.source),
        );
        assert(
          propValue &&
            propertiesList.find(([, value]) =>
              value === propValue.source.trim()
            ),
        );
      });
    }
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoElement} context`,
    );
  }
});

Deno.test("exium can retrieve properties (stylesheet)", () => {
  const propertiesList = SupportedStyleSheetProperties.map((
    property,
  ) => [property, "inherit"]);
  const content = `
  div::selection {
    ${
    propertiesList
      .map(([name, value]) => `${name}:${value}`)
      .join(";\n")
  }
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const list = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetPropertyList
    );
    assert(!!list);
    if (list) {
      const properties = list.children.filter((context) =>
        context.type === ContextTypes.StyleSheetProperty
      );
      assert(properties.length);
      assertEquals(properties.length, propertiesList.length);
      properties.forEach((property) => {
        const propName = property.related.find((context) =>
          context.type === ContextTypes.Identifier
        );
        const propValue = property.related.find((context) =>
          context.type === ContextTypes.StyleSheetPropertyValue
        );
        assert(
          propName && propertiesList.find(([name]) => name === propName.source),
        );
        assert(
          propValue &&
            propertiesList.find(([, value]) =>
              value === propValue.source.trim()
            ),
        );
      });
    }
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoElement} context`,
    );
  }
});
