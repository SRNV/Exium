import { Exium } from './../mod.ts';
import { ContextTypes } from '../src/enums/context-types.ts';
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

const url = new URL(import.meta.url);
Deno.test('ogone-lexer supports import ambient statement', () => {
  const lexer = new Exium((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `import'my_stuff.js';`;
  const contexts = lexer.readSync(content,  { type: 'component' });
  if (contexts && contexts.length) {
  } else {
    throw new Error('Exium - Failed to retrieve Node Context');
  }
});

Deno.test('ogone-lexer supports all import statements', () => {
  const lexer = new Exium((reason, cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const content = `
    import * as name from "name-module";
    import exportParDefaut from "name-module";
    import { export } from "name-module";
    import { export as alias } from "name-module";
    import { export1 , export2 } from "name-module";
    import { export1 , export2 as alias2 , optional } from "name-module";
    import exportParDefaut, { export, optional } from "name-module";
    import exportParDefaut, * as name from "name-module";
    import "name-module";
    import {
      foo,
      bar
    } from "name-module/chemin/vers/fichier-non-exporte";
  `;
  const contexts = lexer.readSync(content,  { type: 'component' });
  if (contexts && contexts.length) {
  } else {
    throw new Error('Exium - Failed to retrieve Node Context');
  }
});
