import { Exium } from "./../../../mod.ts";
import { ContextTypes } from "../../../src/enums/context-types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { ExiumDocument } from "../../../src/classes/ExiumDocument.ts";

Deno.test("exium can retrieve node flags", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const structures = [
    ["for", "", "item of this.items"],
    ["click", "", `() => console.warn('yup')`],
    ["on", ":eventName", `this.eval(item)`],
    ["if", "", `item`],
    ["else-if", "", `item.id`],
  ];
  const content = `
<Component>
  <template>
    <div
  ${
    structures.map((struct) => `    --${struct[0]}${struct[1]}(${struct[2]})`)
      .join("\n")
  }
    >
    </div>
  </template>
</Component>
  `;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const retrievedStructures = contexts.filter((context) =>
        context.type === ContextTypes.FlagStruct
      );
      assert(retrievedStructures.length);
      structures.forEach((struct) => {
        const [name, , source] = struct;
        const flagStruct = retrievedStructures.find((context) => {
          return context.name === name;
        });
        assert(flagStruct);
        const braces = flagStruct.children.find((ctx) =>
          ctx.type === ContextTypes.Braces
        );
        assert(braces);
        assertEquals(source, braces.value);
      });
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Flag Context");
  }
});

Deno.test("exium document can retrieve flag value", () => {
  const clickSource = `() => console.warn('yup')`;
  const structures = [
    ["click", "", clickSource],
  ];
  const content = `
<Component>
  <template>
  <div
${
    structures.map((struct) => `    --${struct[0]}${struct[1]}(${struct[2]})`)
      .join("\n")
  }
  >
  </div>
</template>
</Component>
  `;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    onError: (reason, _cursor, context) => {
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
    source: content,
    options: {
      type: "ogone",
    },
  });
  if (document) {
    try {
      const [div] = document.getElementsByFlag("click");
      assert(div);
      const flagValue = document.getFlagValue(div, "click");
      assert(flagValue);
      assertEquals(clickSource, flagValue);
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Flag Context");
  }
});

Deno.test("exium document can retrieve flag value (using value)", () => {
  const clickSource = `() => console.warn('yup')`;
  const structures = [
    ["click", "", clickSource],
  ];
  const content = `
<Component>
  <template>
    <div
  ${
    structures.map((struct) => `    --${struct[0]}${struct[1]}(${struct[2]})`)
      .join("\n")
  }
    >
    </div>
  </template>
</Component>
  `;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    onError: (reason, _cursor, context) => {
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
    source: content,
    options: {
      type: "ogone",
    },
  });
  if (document) {
    try {
      const [div] = document.getElementsByFlag("click");
      assert(div);
      const flag = div.getFlagContext("click");
      assert(flag);
      const flagValue = flag.value;
      assert(flagValue);
      assertEquals(clickSource, flagValue);
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Flag Context");
  }
});
