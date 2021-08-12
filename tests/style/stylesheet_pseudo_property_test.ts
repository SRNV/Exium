import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium can retrieve pseudo properties", () => {
  const content = /*css*/ `
    div:hover {
      color::media(
        default: blue;
        10px: red;
        200px: green;
      );
    }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const pseudo = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetPseudoProperty
    );
    // can find pseudo property
    assert(pseudo);
    assertEquals(pseudo.name, "media");
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoClass} context`,
    );
  }
});

Deno.test("exium can retrieve pseudo properties (ogone)", () => {
  const content = /*css*/ `
<Test>
<template>
  <style>
    div:hover {
      color::media(
        default: blue;
        10px: red;
        200px: green;
      );
    }
  </style>
</template>
</Test>
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const pseudo = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetPseudoProperty
    );
    // can find pseudo property
    assert(pseudo);
    assertEquals(pseudo.name, "media");
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoClass} context`,
    );
  }
});

Deno.test("exium can retrieve pseudo properties (media-min-width)", () => {
  const content = /*css*/ `
<Test>
  <template>
    <style>
      div:hover {
        color::media-min-width(
          default: blue;
          10px: red;
          200px: green;
        );
      }
    </style>
  </template>
</Test>
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const pseudo = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetPseudoProperty
    );
    // can find pseudo property
    assert(pseudo);
    assertEquals(pseudo.name, "media-min-width");
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoClass} context`,
    );
  }
});

Deno.test("exium can retrieve pseudo properties (keyframes)", () => {
  const content = /*css*/ `
<Test>
<template>
  <style>
    div:hover {
      color::anim(
        0%: red;
        50% :green;
        100%: green;
      );
      background::anim(
        from: red;
        to: blue;
      );
    }
    @keyframes n {
      0% { color: red; }
      50% { color: green; }
      100% { color: green; }
    }
  </style>
</template>
</Test>
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const pseudo = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetPseudoProperty
    );
    // can find pseudo property
    assert(pseudo);
    assertEquals(pseudo.name, "anim");
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorPseudoClass} context`,
    );
  }
});
