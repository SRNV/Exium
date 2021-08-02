import { ExiumDocument } from "./../../../src/classes/ExiumDocument.ts";
import { assert } from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium - deeper-document can expose the component's template", () => {
  const content = `
import component { Counter } from './Counter.deeper';
import component { Route404 } from './404.deeper';

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
      console.warn(context);
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
    source: content,
    options: { type: "deeper" },
  });
  try {
    const [component] = document.components;
    assert(component);
    const { template } = component;
    assert(template);
    const imports = document.getExternalComponentImports("Counter");
    assert(imports.length);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - deeper-document can expose the component's script code", () => {
  const code = `
  case 'beforeEnter:counter': this.doThingsBeforeEnter(); break;
  case 'load:counter': this.doThings(); break;
  default: this.doDefaultThings();`;
  const content = `
import component { Counter } from './Counter.deeper';
import component { Route404 } from './404.deeper';

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
      console.warn(context);
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
    source: content,
    options: { type: "deeper" },
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
