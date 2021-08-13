import { ContextTypes } from "../../../src/enums/context-types.ts";
import { Exium } from "./../../../mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { component1 } from "./../utils/componentFile.ts";

Deno.test("exium can parse a basic component", () => {
  const styleSource = `
@charset 'utf-8';
`;
  const protocol = `
  declare:
    public basic: string = 'this is a basic component';
`;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = `
import component A from './b.o3';

<Component>
  <template>
    <style>${styleSource}</style>
    <div> $\{this.basic} </div>
  </template>
  <proto>${protocol}</proto>
</Component>
  `;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const importStatement = contexts.find((context) =>
        context.type === ContextTypes.ImportStatement
      );
      assert(importStatement);
      const template = contexts.find((context) =>
        context.type === ContextTypes.Node &&
        context.related.find((related) => related.source === "template") &&
        !context.data.isNodeClosing
      );
      assert(template);
      const style = contexts.find((context) =>
        context.type === ContextTypes.Node &&
        context.related.find((related) => related.source === "style") &&
        !context.data.isNodeClosing
      );
      assert(style);
      const stylesheet = contexts.find((context) =>
        context.type === ContextTypes.StyleSheet
      );
      assert(stylesheet);
      const proto = contexts.find((context) =>
        context.type === ContextTypes.Node &&
        context.related.find((related) => related.source === "proto") &&
        !context.data.isNodeClosing
      );
      assert(proto);
      const protocolCTX = contexts.find((context) =>
        context.type === ContextTypes.Protocol
      );
      if (!protocolCTX) {
        throw new Error("Failed to retrieve the protocol context");
      }
      assertEquals(proto.position, {
        column: 2,
        end: 154,
        line: 10,
        start: 147,
      });
      assertEquals(template.position, {
        column: 2,
        end: 60,
        line: 4,
        start: 50,
      });
      assertEquals(style.position, {
        column: 4,
        end: 72,
        line: 5,
        start: 65,
      });
      assertEquals(protocolCTX.position, {
        column: 2,
        end: 222,
        line: 11,
        start: 157,
      });
      assertEquals(protocolCTX.source.trim(), protocol.trim());
      assertEquals(stylesheet.source.trim(), styleSource.trim());
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Node Context");
  }
});

Deno.test("exium large component is parsed < 100ms", () => {
  const perf = performance.now();
  const lexer = new Exium((reason, _cursor, context) => {
    console.warn(context, _cursor);
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = component1;
  const contexts = lexer.readSync(content, { type: "ogone" });
  const parseTime = performance.now() - perf;
  if (contexts && contexts.length) {
    try {
      assert(parseTime < 100);
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Node Context");
  }
});

Deno.test("exium supports props to component", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = `
  import component A from './A.o3';

  <Component>
    <template><A prop={ 0}/></template>
  </Component>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const property = contexts.find((context) =>
        context.type === ContextTypes.AttributeProperty &&
        !context.source.endsWith("/")
      );
      assert(property);
      assertEquals(property.source, "prop={ 0}");
      const [name] = property.related;
      assert(name);
      assertEquals(name.source, "prop");
      assertEquals(name.position, {
        column: 17,
        end: 73,
        line: 4,
        start: 69,
      });
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Node Context");
  }
});

Deno.test("exium supports functions into props", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const content = `
  import component A from './A.o3';
  <Component>
    <template><A prop={() => 0}/></template>
  </Component>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const property = contexts.find((context) =>
        context.type === ContextTypes.AttributeProperty &&
        !context.source.endsWith("/")
      );
      assert(property);
      assertEquals(property.source, "prop={() => 0}");
      const [name] = property.related;
      assert(name);
      assertEquals(name.source, "prop");
      assertEquals(name.position, {
        column: 17,
        end: 72,
        line: 3,
        start: 68,
      });
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Node Context");
  }
});
