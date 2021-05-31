import { ExiumDocument } from './../../src/classes/ExiumDocument.ts';
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
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
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

Deno.test("exium - document can select rules (div, .className, #id, attribute) and properties", () => {
  const content = `
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
    </style>
    <div>
      document can select rules
    </div>
  </template>
  <proto type=app>
  </proto>`;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    onError: (reason, _cursor, context) => {
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
    source: content,
  });
  try {
    assert(document.styles.length);
    assert(document.stylesheets.length);
    assert(document.getStylesheetRulesByTagName('div').length === 1);
    assert(document.getStylesheetRulesByClassName('className').length === 1);
    assert(document.getStylesheetRulesById('id').length === 2);
    assert(document.getStylesheetRulesByAttribute('attr').length === 2);
    assert(document.getStylesheetRulesByProperty('color').length === 5);
    assert(document.getStylesheetRulesByProperty('color', 'brown').length === 1);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can get stylesheet constants", () => {
  const content = `
  <template>
    <style>
      @export const prop<hex> = #090909;
      [attr] {
        color: brown;
      }
    </style>
    <div>
      document can select rules
    </div>
  </template>
  <proto type=app>
  </proto>`;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    onError: (reason, _cursor, context) => {
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
    source: content,
  });
  try {
    assert(document.styles.length);
    assert(document.stylesheets.length);
    assert(document.getStylesheetConstants().length === 1);
    assert(document.getStylesheetExportedConstants().length === 1);
    assert(document.getStylesheetConstant('prop'));
    assert(document.getStylesheetExportedConstant('prop'));
    // TODO get constant with type
    // TODO get constant's type
  } catch (err) {
    throw err;
  }
});