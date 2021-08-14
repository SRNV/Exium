import { Exium } from "./../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium supports comments", () => {
  const lexer = new Exium((_reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${_reason} ${position.line}:${position.column}`,
    );
  });
  const content = "//";
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const [comment] = contexts;
    assertEquals(comment.type, ContextTypes.Comment);
    const position = comment.getPosition(content);
    assertEquals(position, { line: 0, column: 0, start: 0, end: content.length });
  } else {
    throw new Error("Exium - Failed to retrieve Comment context");
  }
});

Deno.test("exium supports multiple comments", () => {
  const lexer = new Exium((_reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${_reason} ${position.line}:${position.column}`,
    );
  });
  const content = `
  // 1
  // 2
  // 3
  `;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const [, , comment, , comment2, , comment3] = contexts;
    assertEquals(comment.type, ContextTypes.Comment);
    assertEquals(comment2.type, ContextTypes.Comment);
    assertEquals(comment3.type, ContextTypes.Comment);

    assertEquals(comment.source, "// 1\n");
    assertEquals(comment2.source, "// 2\n");
    assertEquals(comment3.source, "// 3\n");
  } else {
    throw new Error("Exium - Failed to retrieve MultipleComments context");
  }
});

Deno.test("exium supports comment blocks", () => {
  const lexer = new Exium((_reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${_reason} ${position.line}:${position.column}`,
    );
  });
  const content = `/** supported! */`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const [commentBlock] = contexts;
    assertEquals(commentBlock.type, ContextTypes.CommentBlock);
    assertEquals(commentBlock.source, content.trim());
  } else {
    throw new Error("Exium - Failed to retrieve MultipleComments context");
  }
});

Deno.test("exium supports comment blocks with multi lines", () => {
  const lexer = new Exium((_reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${_reason} ${position.line}:${position.column}`,
    );
  });
  const content = `
/**
 * we will use this lexer in different engine
 * it shouldn't import anything
 * to make it isomorphic with Node and Deno
 */
  `;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const commentBlock = contexts.find((comment) =>
      comment.type === ContextTypes.CommentBlock
    );
    if (!commentBlock) {
      throw new Error("Failed to retrieve the comment block");
    }
    assertEquals(commentBlock.source, content.trim());
    assertEquals(commentBlock.getPosition(content), {
      start: 1,
      end: 130,
      line: 1,
      column: 0,
    });
  } else {
    throw new Error("Exium - Failed to retrieve MultipleComments context");
  }
});
Deno.test("exium should use the onError function when a html comment isnt finished", () => {
  let result = false;
  const lexer = new Exium((_reason, _cursor) => {
    result = true;
  });
  const content = `<!--`;
  lexer.readSync(content, { type: "ogone" });
  if (!result) {
    throw new Error("Exium - Failed to retrieve Space context");
  }
});

Deno.test("exium not a comment", () => {
  let result = false;
  const lexer = new Exium((_reason, _cursor) => {
    result = true;
  });
  const content = `<! --`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (!result || contexts.length) {
    throw new Error("Exium - Failed to retrieve Space context");
  }
});

Deno.test("exium not a comment 2", () => {
  let result = false;
  const lexer = new Exium((_reason, _cursor) => {
    result = true;
  });
  const content = `<!- -`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (!result || contexts.length) {
    throw new Error("Exium - Failed to retrieve Space context");
  }
});

Deno.test("exium supports html comments", () => {
  const lexer = new Exium((_reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${_reason} ${position.line}:${position.column}`,
    );
  });
  const content = `<!-- -->`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const [comment] = contexts;
    assertEquals(comment.type, ContextTypes.HTMLComment);
    assertEquals(comment.getPosition(content), { start: 0, end: 8, line: 0, column: 0 });
    assertEquals(comment.source, content);
  } else {
    throw new Error("Exium - Failed to retrieve Space context");
  }
});

Deno.test("exium - only one html comment", () => {
  const lexer = new Exium((_reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${_reason} ${position.line}:${position.column}`,
    );
  });
  const content = `<!-- 'nothing else' "// " -->`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length && contexts.length === 1) {
    const [comment] = contexts;
    assertEquals(comment.type, ContextTypes.HTMLComment);
    assertEquals(comment.getPosition(content), { start: 0, end: 29, line: 0, column: 0 });
    assertEquals(comment.source, content);
  } else {
    throw new Error("Exium - Failed to retrieve Space context");
  }
});
Deno.test("exium supports compact html comments", () => {
  const lexer = new Exium((_reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${_reason} ${position.line}:${position.column}`,
    );
  });
  const content = `<!---->`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length && contexts.length === 1) {
    const [comment] = contexts;
    assertEquals(comment.type, ContextTypes.HTMLComment);
    assertEquals(comment.getPosition(content), { start: 0, end: 7, line: 0, column: 0 });
    assertEquals(comment.source, content);
  } else {
    throw new Error("Exium - Failed to retrieve Space context");
  }
});
Deno.test("exium supports multiple comments", () => {
  const lexer = new Exium((_reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${_reason} ${position.line}:${position.column}`,
    );
  });
  const content = `<!---->
<!---->
<!--
    with line breaks
-->`;
  const contexts = lexer.readSync(content, { type: "ogone" });
  if (contexts && contexts.length) {
    const [comment, , comment2, , comment3] = contexts;
    assertEquals(comment.type, ContextTypes.HTMLComment);
    assertEquals(comment2.type, ContextTypes.HTMLComment);
    assertEquals(comment3.type, ContextTypes.HTMLComment);
  } else {
    throw new Error("Exium - Failed to retrieve Space context");
  }
});
