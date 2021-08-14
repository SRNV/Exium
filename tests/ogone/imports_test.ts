import { ContextTypes, Exium } from "./../../mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

const importsTypes = [ContextTypes.ImportStatement, ContextTypes.ImportAmbient];
Deno.test("exium supports import ambient statement", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `import'my_stuff.js';`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  const isNotValid = !(contexts && contexts.length);
  const ambient = contexts.find((context) =>
    context.type === ContextTypes.ImportAmbient
  );
  assert(ambient);
  if (isNotValid) {
    throw new Error("Exium - Failed to retrieve Node Context");
  }
});

Deno.test("exium supports all import statements", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `
    import * as some from 'aaaa';
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
  const contexts = lexer.readSync(content, { type: "ogone" });
  const isNotValid = !(contexts && contexts.length);
  const imports = contexts.filter((context) =>
    importsTypes.includes(context.type)
  );
  assert(imports.length);
  assertEquals(imports.length, 10);
  const [
    globalImport,
    defaultImport,
    simpleListImport,
    oneAliasListImport,
    doubleElementlistImport,
  ] = imports;
  assert(globalImport);
  assert(defaultImport);
  assert(simpleListImport);
  assert(oneAliasListImport);
  assert(doubleElementlistImport);
  const path = globalImport.getImportPath();
  assertEquals(path, "aaaa");
  const globalToken = globalImport.children.find((context) =>
    context.type === ContextTypes.ImportAllAlias
  );
  const fromStatement = globalImport.related.find((context) =>
    context.type === ContextTypes.ImportStatementFrom
  );
  assert(fromStatement);
  assert(globalToken);
  assertEquals(globalToken.source, "* as some");
  const defaultPath = defaultImport.getImportPath();
  assertEquals(defaultPath, "name-module");
  const defaultName = defaultImport.children.find((context) =>
    context.type === ContextTypes.Identifier
  );
  assert(defaultName);
  assertEquals(defaultName.source, "exportParDefaut");
  if (isNotValid) {
    throw new Error("Exium - Failed to retrieve Node Context");
  }
});
