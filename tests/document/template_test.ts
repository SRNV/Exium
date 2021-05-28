import { ExiumDocument } from './../../src/classes/ExiumDocument.ts';
import {
  assert,
  assertEquals,
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

Deno.test("exium - document can retrieve an element with getElementsByClassName (quoted)", () => {
  const content = `<template><div class="myClass anotherClass"></div></template>`;
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
    const [div] = document.getElementsByClassName('myClass');
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element with getElementsByClassName (unquoted)", () => {
  const content = `<template><div class=myClass></div></template>`;
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
    const [div] = document.getElementsByClassName('myClass');
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element with getElementById (quoted)", () => {
  const content = `<template><div id="myId"></div></template>`;
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
    const div = document.getElementById('myId');
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element with getElementById (unquoted)", () => {
  const content = `<template><div id=myId></div></template>`;
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
    const div = document.getElementById('myId');
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element with getElementsByFlag", () => {
  const content = `<template><div --for={id of this.ids}></div></template>`;
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
    const [div] = document.getElementsByFlag('for');
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element with getElementsByFlag (:argument)", () => {
  const content = `<template><div --then:argument></div></template>`;
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
    const [div] = document.getElementsByFlag('then');
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can describe a sub-component", () => {
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
    const components = document.getComponentByName('AsyncComponent');
    if (!components) {
      throw new Error('failed to retrieve the component AsyncComponent');
    }
    assert(components.elements.length === 1);
    assert(components.imports.length === 1);
    const url = document.getURLFromImport(components.imports[0]);
    assert(url);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document should return null when a component is not imported", () => {
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    source: `
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
    assertEquals(document.getComponentByName('AsyncComponent'), null);
  } catch (err) {
    throw err;
  }
});
