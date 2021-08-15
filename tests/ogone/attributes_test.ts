import { Exium } from "./../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium can parse attribute unquoted", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const source = "a=value";
  const content = `<div ${source}></div>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const attribute = contexts.find((context) =>
        context.type === ContextTypes.Attribute
      );
      assert(attribute);
      const attributeName = attribute.related.find((context) =>
        context.type === ContextTypes.Identifier
      );
      const attributeUnquoted = contexts.find((context) =>
        context.type === ContextTypes.AttributeValueUnquoted
      );
      if (
        attribute &&
        attributeName &&
        attributeUnquoted
      ) {
        const target = {
          type: ContextTypes.Attribute,
          source,
          position: { start: 5, end: 12, line: 0, column: 5 },
        };
        const unquotedPosition = { start: 7, end: 12, line: 0, column: 7 };
        const attributeNamePosition = { start: 5, end: 6, line: 0, column: 5 };
        assertEquals(target.type, attribute.type);
        assertEquals(target.source, attribute.source);
        assertEquals(target.position, attribute.getPosition(content));
        assertEquals(attribute.children[0].source, "value");
        assertEquals(attribute.related[0].source, "a");
        assertEquals(attributeName.getPosition(content), attributeNamePosition);
        assertEquals(attributeUnquoted.getPosition(content), unquotedPosition);
      } else {
        throw new Error("Exium - test failed");
      }
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - test failed");
  }
});

Deno.test("exium can parse boolean attributes and a space after", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const source = "hidden";
  const content = `<div ${source} ></div>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const attribute = contexts.find((context) =>
        context.type === ContextTypes.AttributeBoolean
      );
      if (attribute) {
        const target = {
          type: ContextTypes.AttributeBoolean,
          source,
          position: { start: 5, end: 11, line: 0, column: 5 },
        };
        assertEquals(target.type, attribute.type);
        assertEquals(target.source, attribute.source);
        assertEquals(target.position, attribute.getPosition(content));
        assertEquals(attribute.source, source);
      } else {
        throw new Error("Exium - test failed");
      }
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - test failed");
  }
});

Deno.test("exium can parse multiple boolean attributes", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const sources = ["hidden", "named", "href", "src-p"];
  const content = `<div ${sources.join("\n  ")} ></div>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const targets = [
        {
          source: "hidden",
          position: { start: 5, end: 11, line: 0, column: 5 },
        },
        {
          source: "named",
          position: { start: 14, end: 19, line: 1, column: 2 },
        },
        {
          source: "href",
          position: { start: 22, end: 26, line: 2, column: 2 },
        },
        {
          source: "src-p",
          position: { start: 29, end: 34, line: 3, column: 2 },
        },
      ];
      const div = contexts.find((context) =>
        context.type === ContextTypes.Node &&
        context.related[0].source === "div"
      );
      const attributes = contexts.filter((context) =>
        context.type === ContextTypes.AttributeBoolean
      );
      if (attributes && attributes.length && div) {
        attributes.forEach((attribute, i: number) => {
          assertEquals(div.children.includes(attribute), true);
          assertEquals(attribute.source, sources[i]);
          assertEquals(attribute.getPosition(content), targets[i].position);
        });
      } else {
        console.error("attributes", attributes);
        throw new Error("Exium - test failed");
      }
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - test failed");
  }
});

Deno.test("exium can parse boolean attributes and without space after", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const source = "hidden";
  const content = `<div ${source}></div>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const attribute = contexts.find((context) =>
        context.type === ContextTypes.AttributeBoolean
      );
      if (attribute) {
        const target = {
          type: ContextTypes.AttributeBoolean,
          source,
          position: { start: 5, end: 11, line: 0, column: 5 },
        };
        assertEquals(target.type, attribute.type);
        assertEquals(target.source, attribute.source);
        assertEquals(target.position, attribute.getPosition(content));
        assertEquals(attribute.source, source);
      } else {
        console.error("attribute", attribute);
        throw new Error("Exium - test failed");
      }
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - test failed");
  }
});
