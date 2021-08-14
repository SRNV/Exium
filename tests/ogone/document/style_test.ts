import { ExiumDocument } from "./../../../src/classes/ExiumDocument.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium - document can expose the component's styles", () => {
  const textnode = "$\{this.basic}";
  const content = `<template>
    <style></style>
    <style></style>
    <style></style>
    <style></style>
    <div>${textnode}</div></template><proto></proto>`;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    onError: (reason, _cursor, context) => {
      const position = context.getPosition(content);
      throw new Error(
        `${reason} ${position.line}:${position.column}`,
      );
    },
    source: content,
  });
  try {
    assertEquals(document.styles.length, 4);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can select rules with component (div, .className, #id, attribute) and properties", () => {
  const content = /*css*/ `
<Component>
  <template>
    <style>
      div {
        color: red;
      }
      #id {
        color: blue;
      }
      .className,#id {
        color: purple;
      }
      [attr="name"] {
        color:green;
      }
      [attr] {
        color: brown;
      }
      p {
        background::media(default: red );
      }
    </style>
    <div>
      document can select rules
    </div>
  </template>
  <proto type=app />
</Component>
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
  });
  try {
    assert(document.styles.length);
    assert(document.stylesheets.length);
    const [component] = document.components;
    assert(component);
    assert(component.getStylesheetRulesByTagName("div").length === 1);
    assert(component.getStylesheetRulesByClassName("className").length === 1);
    assert(component.getStylesheetRulesById("id").length === 2);
    assert(component.getStylesheetRulesByAttribute("attr").length === 2);
    assert(component.getStylesheetRulesByProperty("color").length === 5);
    assert(
      component.getStylesheetRulesByProperty("color", "brown").length === 1,
    );
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can get stylesheet constants", () => {
  const content = `
<Component>
  <template>
    <style>
      @export const prop<hex> = #090909;
      [attr] {
        color: brown;
      }
    </style>
    <div>
      document can get stylesheet constants
    </div>
  </template>
  <proto type=app>
  </proto>
</Component>
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
  });
  try {
    assert(document.styles.length);
    assert(document.stylesheets.length);
    const [component] = document.components;
    assert(component);
    assert(component.getStylesheetConstants().length === 1);
    assert(component.getStylesheetExportedConstants().length === 1);
    assert(component.getStylesheetConstant("prop"));
    assert(component.getStylesheetExportedConstant("prop"));
    // TODO get constant with type
    // TODO get constant's type
  } catch (err) {
    throw err;
  }
});
