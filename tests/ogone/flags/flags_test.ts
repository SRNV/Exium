import { Exium } from "./../../../mod.ts";
import { ContextTypes } from "../../../src/enums/context-types.ts";
import { SupportedFlags } from "../../../src/supports.ts";
import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

Deno.test("exium can retrieve node flags", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `<proto
    ${SupportedFlags.join("\n    ")}
    not-a-flag
    ></proto>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const { length } = SupportedFlags;
      const { length: parsedFlagsLength } = contexts.filter((context) =>
        context.type === ContextTypes.Flag
      );
      assertEquals(length, parsedFlagsLength);
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Flag Context");
  }
});

Deno.test("exium flag name is accessible through related", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const source = "then:flag:name";
  const content = `<proto --${source}></proto>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const flag = contexts.find((context) =>
        context.type === ContextTypes.Flag
      );
      if (!flag) {
        throw new Error(`Failed to retrieve flags value`);
      }
      const [flagName] = flag.related;
      assertEquals(flagName.type, ContextTypes.Identifier);
      assertEquals(flagName.source, "then");
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Flag Context");
  }
});

Deno.test("exium can retrieve flags value", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `<proto --if={true}></proto>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const flag = contexts.find((context) =>
        context.type === ContextTypes.Flag
      );
      if (!flag) {
        throw new Error(`Failed to retrieve flags value`);
      }
      const target = {
        type: ContextTypes.Flag,
        source: "--if={true}",
        position: { start: 7, end: 18, line: 0, column: 7 },
        children: [
          {
            type: "CurlyBrackets",
            source: "{true}",
          },
        ],
        related: [
          {
            type: "FlagName",
            source: "if",
          },
        ],
      };
      assertEquals(target.position, flag.getPosition(content));
      assertEquals(target.source, flag.source);
      assertEquals(target.type, flag.type);
      assertEquals(flag.name, "if");
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Flag Context");
  }
});

Deno.test("exium can retrieve spread value", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `<proto { ...this.spread }></proto>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const flag = contexts.find((context) =>
        context.type === ContextTypes.FlagSpread
      );
      if (!flag) {
        throw new Error(`Failed to retrieve spread value`);
      }
      assertEquals(flag.getPosition(content), {
        start: 7,
        end: 25,
        line: 0,
        column: 7,
      });
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Flag Context");
  }
});

Deno.test("exium can retrieve spread value on a auto-closing tag", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `<proto { ...this.spread }/>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const flag = contexts.find((context) =>
        context.type === ContextTypes.FlagSpread
      );
      if (!flag) {
        throw new Error(`Failed to retrieve spread value`);
      }
      assertEquals(flag.getPosition(content), {
        start: 7,
        end: 25,
        line: 0,
        column: 7,
      });
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Flag Context");
  }
});

Deno.test("exium can retrieve spread value without spaces", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `<proto {...this.spread}/>`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    try {
      const flag = contexts.find((context) =>
        context.type === ContextTypes.FlagSpread
      );
      if (!flag) {
        throw new Error(`Failed to retrieve spread value`);
      }
      assertEquals(flag.getPosition(content), {
        start: 7,
        end: 23,
        line: 0,
        column: 7,
      });
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Exium - Failed to retrieve Flag Context");
  }
});
