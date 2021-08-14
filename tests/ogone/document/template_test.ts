import { ExiumDocument } from "./../../../src/classes/ExiumDocument.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium - document can expose the component's template", () => {
  const textnode = "$\{this.basic}";
  const content =
    `<Component><template><div>${textnode}</div></template></Component>`;
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
    const { template } = component;
    assert(template);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element", () => {
  const textnode = "$\{this.basic}";
  const content =
    `<Component><template><div>${textnode}</div></template></Component>`;
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
    const [div] = document.getElementsByTagName("div");
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element with getElementsByClassName (quoted)", () => {
  const content =
    `<Component><template><div class="myClass anotherClass"></div></template></Component>`;
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
    const [div] = document.getElementsByClassName("myClass");
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element with getElementsByClassName (unquoted)", () => {
  const content =
    `<Component><template><div class=myClass></div></template></Component>`;
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
    const [div] = document.getElementsByClassName("myClass");
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element with getElementById (quoted)", () => {
  const content =
    `<Component><template><div id="myId"></div></template></Component>`;
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
    const div = document.getElementById("myId");
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element with getElementById (unquoted)", () => {
  const content =
    `<Component><template><div id=myId></div></template></Component>`;
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
    const div = document.getElementById("myId");
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element with getElementsByFlag", () => {
  const content =
    `<Component><template><div --for={id of this.ids}></div></template></Component>`;
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
    const [div] = document.getElementsByFlag("for");
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve an element with getElementsByFlag (:argument)", () => {
  const content =
    `<Component><template><div --then:argument></div></template></Component>`;
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
    const [div] = document.getElementsByFlag("then");
    assert(div);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document can retrieve arguments on flag", () => {
  const content =
    `<Component><template><div --then:argument:name></div></template></Component>`;
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
    const [div] = document.getElementsByFlag("then");
    assert(div);
    const thenFlag = div.getFlagContext("then");
    assert(thenFlag);
    assert(thenFlag.getArguments().length === 2);
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - document should return null when a component is not imported", () => {
  const content = `
  <Component>
    <template>
      <AsyncComponent />
    </template>
  </Component>
`;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    source: content,
    onError: (reason, _cursor, context) => {
      const position = context.getPosition(content);
      throw new Error(
        `${reason} ${position.line}:${position.column}`,
      );
    },
  });
  try {
    assertEquals(document.getExternalComponentByName("AsyncComponent"), null);
  } catch (err) {
    throw err;
  }
});
