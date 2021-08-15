import { ExiumDocument } from "./../../../src/classes/ExiumDocument.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium - document can retrieve the component type", () => {
  const content = `
  import component M from '../M.o3';
  <Component>
    <template>
      M
    </template>
    <proto type="app" />
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
    const [component] = document.components;
    assert(component);
    const { proto } = component;
    assert(proto);
    assertEquals(document.getType(), "app");
  } catch (err) {
    throw err;
  }
});
Deno.test("exium - document can retrieve the component type (unquoted)", () => {
  const content = `
  import component M from '../M.o3';

  <Component>
    <template>
      M
    </template>
    <proto type=app/>
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
    const [component] = document.components;
    assert(component);
    const { proto } = component;
    assert(proto);
    assertEquals(document.getType(), "app");
  } catch (err) {
    throw err;
  }
});
Deno.test("exium - document can expose the component's proto", () => {
  const textnode = "$\{this.basic}";
  const content = `
  <Component>
    <template>
      <div>${textnode}</div>
    </template>
    <proto></proto>
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
    const [component] = document.components;
    assert(component);
    const { proto } = component;
    assert(proto);
  } catch (err) {
    throw err;
  }
});
