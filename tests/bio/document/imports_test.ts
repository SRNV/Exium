import { ExiumDocument } from "./../../../src/classes/ExiumDocument.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { ContextTypes } from "../../../src/enums/context-types.ts";

Deno.test("exium - bio-document can expose the component's template", () => {
  const content = `
import component { Counter } from './Counter.bio';
import component { Route404 } from './404.bio';

export router <Router
    @void doDefaultThings={() => {...}}
    @void doThingsBeforeEnter={() => {...}}
    @void doThings={() => {...}}>

    <template>
      <Counter
        path=/count
        name=counter
        title="Basic Counter" />
      <Route404 path=* />
    </template>
    <script>
      case 'beforeEnter:counter': this.doThingsBeforeEnter(); break;
      case 'load:counter': this.doThings(); break;
      default: this.doDefaultThings();
    </script>
</Router>
  `;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    onError: (reason, _cursor, context) => {
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
    source: content,
    options: { type: "bio" },
  });
  try {
    const [component] = document.components;
    assert(component);
    const { template } = component;
    assert(template);
    const imports = document.getImportsOfExternalComponentByTagName("Counter");
    assert(imports.length);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - bio-document can expose the component's script code", () => {
  const code = `
  case 'beforeEnter:counter': this.doThingsBeforeEnter(); break;
  case 'load:counter': this.doThings(); break;
  default: this.doDefaultThings();`;
  const content = `
import component { Counter } from './Counter.bio';
import component { Route404 } from './404.bio';

export router <Router
    @void doDefaultThings={() => {...}}
    @void doThingsBeforeEnter={() => {...}}
    @void doThings={() => {...}}>

    <template>
      <Counter
        path=/count
        name=counter
        title="Basic Counter" />
      <Route404 path=* />
    </template>
    <script>${code}</script>
</Router>
  `;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    onError: (reason, _cursor, context) => {
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
    source: content,
    options: { type: "bio" },
  });
  try {
    const [script] = document.getElementsByTagName("script");
    assert(script);
    const scriptCode = script.getNodeInnerTextWithInternalDocument();
    assert(scriptCode);
    assert(code === scriptCode);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - bio-document can split local, external and exported components with different methods", () => {
  const localComponents: string[][] = [
    ["router", "Router"],
    ["component", "BasicComponent"],
    ["async", "AsyncComponent"],
    ["store", "StoreComponent"],
    ["app", "App"],
    ["controller", "ControllerComponent"],
  ];
  const exportedLocalComponents: string[][] = [
    ["router", "RouterExported"],
    ["component", "BasicComponent2"],
    ["app", "AppExported"],
    ["controller", "ControllerComponentExported"],
  ];
  const content = `
import component { Counter } from './Counter.bio';
import component { Route404 } from './404.bio';

${
    exportedLocalComponents.map(([type, name]) => `export ${type} <${name} />`)
      .join("\n")
  }
${localComponents.map(([type, name]) => `${type} <${name} />`).join("\n")}
  `;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    onError: (reason, _cursor, context) => {
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
    source: content,
    options: { type: "bio" },
  });
  try {
    const components = document.getLocalComponents();
    const exportedComponents = document.getExportedComponents();
    const importedComponents = document.getIdentifiersOfExternalComponents();
    assert(importedComponents.length === 2);
    assert(exportedComponents.length === exportedLocalComponents.length);
    exportedComponents.forEach((component, i) => {
      assertEquals(component.data.type, exportedLocalComponents[i][0]);
      assertEquals(component.name, exportedLocalComponents[i][1]);
    });
    assert(components.length === localComponents.length);
    components.forEach((component, i) => {
      assertEquals(component.data.type, localComponents[i][0]);
      assertEquals(component.name, localComponents[i][1]);
    });
  } catch (err) {
    throw err;
  }
});
Deno.test("exium - use getImportPath to get the path to the dependency", () => {
  const content = `import component { Dep } from './Dep.bio';`;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    onError: (reason, _cursor, context) => {
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
    source: content,
    options: { type: "bio" },
  });
  try {
    const context = document.contexts.find((context) =>
      context.type === ContextTypes.ImportStatement
    );
    assert(context);
    const path = context.getImportPath();
    assert(path);
    assert(path === "./Dep.bio");
  } catch (err) {
    throw err;
  }
});
