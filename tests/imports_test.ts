import { Exium } from "./../mod.ts";

Deno.test("exium supports import ambient statement", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = `import'my_stuff.js';`;
  const contexts = lexer.readSync(content, { type: "component" });
  const isNotValid = !(contexts && contexts.length);
  if (isNotValid) {
    throw new Error("Exium - Failed to retrieve Node Context");
  }
});

Deno.test("exium supports all import statements", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
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
  const contexts = lexer.readSync(content, { type: "component" });
  const isNotValid = !(contexts && contexts.length);
  if (isNotValid) {
    throw new Error("Exium - Failed to retrieve Node Context");
  }
});
