import { ExiumDocument } from './../../src/classes/ExiumDocument.ts';
import {
  assert,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium - document can expose the component's template", () => {
  const textnode = "$\{this.basic}";
  const content = `<template><div>${textnode}</div></template>`;
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
    assert(document.template);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element", () => {
  const textnode = "$\{this.basic}";
  const content = `<template><div>${textnode}</div></template>`;
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
    const [div] = document.getElementsByTagName('div');
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve a sub-component", () => {
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    source: `
    import component AsyncComponent from './AsyncComponent.o3';
    <template>
      <AsyncComponent />
    </template>
  `,
    onError: (reason, _cursor, context) => {
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
  });
  try {
    const components = document.getComponentsByTagName('AsyncComponent');
    assert(components.elements.length === 1);
    assert(components.imports.length === 1);
    const url = document.getURLFromImport(components.imports[0]);
    assert(url);
  } catch (err) {
    throw err;
  }
});
