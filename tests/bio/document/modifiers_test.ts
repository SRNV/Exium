import { ExiumDocument } from "./../../../src/classes/ExiumDocument.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";
import { ContextTypes } from "../../../src/enums/context-types.ts";

const content = `
import component { Counter } from './Counter.bio';
import component { Route404 } from './404.bio';

export router <Router
  @void doDefaultThings={() => {...}}
  @void doThingsBeforeEnter={() => {...}}
  @void[some] doThings={() => {...}}
  @config base=./ >

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
    const position = context.getPosition(content);
    console.warn(_cursor, context);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  },
  source: content,
  options: { type: "bio" },
});
Deno.test("exium - context can retrieve modifiers by using getAttributeModifiersByName", () => {
  try {
    const [component] = document.components;
    assert(component);
    const { template } = component;
    assert(template);
    const voidModifiers = component.getAttributeModifiersByName('void');
    assert(voidModifiers);
    assert(voidModifiers.length);
    assertEquals(voidModifiers.length, 3);
    voidModifiers.forEach((context) => assert(context.children.find((child) => child.type === ContextTypes.AttributeProperty)))
  } catch (err) {
    throw err;
  }
});