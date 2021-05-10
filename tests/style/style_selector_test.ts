import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium can retrieve selectors", () => {
  const elements = [
    "div",
    "ul",
    "li",
    "p",
  ];
  const content = `
  ${elements} {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const elementsCTX = contexts.filter((context) =>
      context.type === ContextTypes.StyleSheetSelectorHTMLElement
    );
    assertEquals(elements.length, elementsCTX.length);
    elements.forEach((source) => {
      const element = contexts.find((context) =>
        context.type === ContextTypes.StyleSheetSelectorHTMLElement &&
        context.source == source
      );
      if (!element) {
        throw new Error(`failed to retrieve the element ${source}`);
      }
    });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetAtRuleCharset} context`,
    );
  }
});

Deno.test("exium can retrieve classes", () => {
  const content = `
  .COMPLEX,.v{}.container.b .c {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, {
    type: "stylesheet",
  });
  if (contexts && contexts.length) {
    const containerClass = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorClass &&
      context.source === ".container"
    );
    if (!containerClass) {
      throw new Error("Failed to retrieve the class .container");
    }
    const classComplex = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorClass &&
      context.source === ".COMPLEX"
    );
    const v = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorClass &&
      context.source === ".v"
    );
    const c = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorClass &&
      context.source === ".c"
    );
    const b = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorClass &&
      context.source === ".b"
    );
    assert(!!classComplex);
    assert(!!c);
    assert(!!b);
    assert(!!v);
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorClass} context`,
    );
  }
});

Deno.test("exium can retrieve ids", () => {
  const content = `
  #test,.v {}#anId#myOtherID {
    color: blue;
  }
  #op,
  #stillGood {}
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const id = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorId &&
      context.source === "#anId"
    );
    const test = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorId &&
      context.source === "#test"
    );
    const otherID = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorId &&
      context.source === "#myOtherID"
    );
    const op = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorId &&
      context.source === "#op"
    );
    const stillGood = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorId &&
      context.source === "#stillGood"
    );
    if (!id) {
      throw new Error("Failed to retrieve the id anId");
    }
    if (!test) {
      throw new Error("Failed to retrieve the id test");
    }
    if (!otherID) {
      throw new Error("Failed to retrieve the id myOtherID");
    }
    if (!op) {
      throw new Error("Failed to retrieve the id op");
    }
    if (!stillGood) {
      throw new Error("Failed to retrieve the id stillGood");
    }
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorId} context`,
    );
  }
});

Deno.test("exium can retrieve attribute", () => {
  const content = `
  [attribute] {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const attr = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttribute &&
      context.source === "[attribute]"
    );
    if (!attr) {
      throw new Error("Failed to retrieve the attr attribute");
    }
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorId} context`,
    );
  }
});

Deno.test("exium can retrieve multiple attributes", () => {
  const attrs = [
    "[   a  ]",
    "[b]",
    "[   c\n]",
    "[ \n  d  ]",
    "[ e]",
    "[ f  ]",
  ];
  const content = `
  ${attrs.map((attr) => `${attr}`)} {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const contextsAttrs = contexts.filter((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttribute
    );
    assertEquals(contextsAttrs.length, attrs.length);
    attrs.forEach((source) => {
      const attr = contexts.find((context) =>
        context.type === ContextTypes.StyleSheetSelectorAttribute &&
        context.source == source
      );
      if (!attr) {
        throw new Error(`failed to retrieve the attribute ${source}`);
      }
    });
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorId} context`,
    );
  }
});

Deno.test("exium can retrieve attribute with value 1", () => {
  const content = `
  [attribute=value] {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const attribute = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttribute
    );
    const attributeName = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttributeName
    );
    const attributeValue = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttributeValue
    );
    if (!attribute) {
      throw new Error("Failed to retrieve the attribute");
    }
    if (!attributeName) {
      throw new Error("Failed to retrieve the attribute name");
    }
    if (!attributeValue) {
      throw new Error("Failed to retrieve the attribute value");
    }
    assertEquals(attributeValue.source, "value");
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorId} context`,
    );
  }
});

Deno.test("exium can retrieve attribute with value 2", () => {
  const content = `
  [attribute*=value] {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const attribute = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttribute
    );
    const attributeName = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttributeName
    );
    const attributeValue = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttributeValue
    );
    if (!attribute) {
      throw new Error("Failed to retrieve the attribute");
    }
    if (!attributeName) {
      throw new Error("Failed to retrieve the attribute name");
    }
    if (!attributeValue) {
      throw new Error("Failed to retrieve the attribute value");
    }
    assertEquals(attributeValue.source, "value");
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorId} context`,
    );
  }
});

Deno.test("exium can retrieve attribute with value 3", () => {
  const content = `
  [attribute^=value] {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const attribute = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttribute
    );
    const attributeName = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttributeName
    );
    const attributeValue = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttributeValue
    );
    if (!attribute) {
      throw new Error("Failed to retrieve the attribute");
    }
    if (!attributeName) {
      throw new Error("Failed to retrieve the attribute name");
    }
    if (!attributeValue) {
      throw new Error("Failed to retrieve the attribute value");
    }
    assertEquals(attributeValue.source, "value");
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorId} context`,
    );
  }
});

Deno.test("exium can retrieve attribute with value 4", () => {
  const content = `
  [attribute|=value] {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const attribute = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttribute
    );
    const attributeName = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttributeName
    );
    const attributeValue = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttributeValue
    );
    if (!attribute) {
      throw new Error("Failed to retrieve the attribute");
    }
    if (!attributeName) {
      throw new Error("Failed to retrieve the attribute name");
    }
    if (!attributeValue) {
      throw new Error("Failed to retrieve the attribute value");
    }
    assertEquals(attributeValue.source, "value");
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorId} context`,
    );
  }
});

Deno.test("exium can retrieve attribute with value 5", () => {
  const content = `
  [attribute$=value] {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const attribute = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttribute
    );
    const attributeName = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttributeName
    );
    const attributeValue = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttributeValue
    );
    if (!attribute) {
      throw new Error("Failed to retrieve the attribute");
    }
    if (!attributeName) {
      throw new Error("Failed to retrieve the attribute name");
    }
    if (!attributeValue) {
      throw new Error("Failed to retrieve the attribute value");
    }
    assertEquals(attributeValue.source, "value");
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorId} context`,
    );
  }
});

Deno.test("exium can retrieve attribute with value 6", () => {
  const content = `
  [attribute="value"] {
    color: blue;
  }
  `;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(
      `${reason} ${context.position.line}:${context.position.column}`,
    );
  });
  const contexts = lexer.readSync(content, { type: "stylesheet" });
  if (contexts && contexts.length) {
    const attribute = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttribute
    );
    const attributeName = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttributeName
    );
    const attributeValue = contexts.find((context) =>
      context.type === ContextTypes.StyleSheetSelectorAttributeValue
    );
    if (!attribute) {
      throw new Error("Failed to retrieve the attribute");
    }
    if (!attributeName) {
      throw new Error("Failed to retrieve the attribute name");
    }
    if (!attributeValue) {
      throw new Error("Failed to retrieve the attribute value");
    }
    assertEquals(attributeValue.source, '"value"');
  } else {
    throw new Error(
      `Exium - Failed to retrieve ${ContextTypes.StyleSheetSelectorId} context`,
    );
  }
});
