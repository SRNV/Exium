import { ExiumDocument } from './../../src/classes/ExiumDocument.ts';
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium - document can retrieve the component type", () => {
  const content = `
  import component M from '../M.o3';
  <template>
    M
  </template>
  <proto type="app" />
  `;
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
    assert(document.proto);
    assertEquals(document.getType(), 'app');
  } catch (err) {
    throw err;
  }
});
Deno.test("exium - document can retrieve the component type (unquoted)", () => {
  const content = `
  import component M from '../M.o3';
  <template>
    M
  </template>
  <proto type=app/>
  `;
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
    assert(document.proto);
    assertEquals(document.getType(), 'app');
  } catch (err) {
    throw err;
  }
});
Deno.test("exium - document can expose the component's proto", () => {
  const textnode = "$\{this.basic}";
  const content = `<template><div>${textnode}</div></template><proto></proto>`;
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
    assert(document.proto);
  } catch (err) {
    throw err;
  }
});