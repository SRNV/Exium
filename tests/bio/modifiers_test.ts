import { Exium } from "./../../mod.ts";
import { assert } from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";

Deno.test("exium supports attribute modifiers (auto closing tag)", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `component <C @private name=World />`;
  const contexts = lexer.readSync(content, { type: "bio" });
  const privateModifier = contexts.find((context) =>
    context.type === ContextTypes.AttributeModifier
  );
  assert(privateModifier);
  assert(privateModifier.name === "private");
  assert(privateModifier.source === "@private name=World");
});

Deno.test("exium supports attribute modifiers", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `component <C @private name=World> </C>`;
  const contexts = lexer.readSync(content, { type: "bio" });
  const privateModifier = contexts.find((context) =>
    context.type === ContextTypes.AttributeModifier
  );
  assert(privateModifier);
  assert(privateModifier.name === "private");
  assert(privateModifier.source === "@private name=World");
});

Deno.test("exium supports attribute modifiers on AttributeBoolean", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `component <C @private isSupported> </C>`;
  const contexts = lexer.readSync(content, { type: "bio" });
  const privateModifier = contexts.find((context) =>
    context.type === ContextTypes.AttributeModifier
  );
  assert(privateModifier);
  assert(privateModifier.name === "private");
  assert(privateModifier.source === "@private isSupported");
});

Deno.test("exium supports attribute modifiers on AttributeProperty", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `component <C @private isSupported={true}> </C>`;
  const contexts = lexer.readSync(content, { type: "bio" });
  const privateModifier = contexts.find((context) =>
    context.type === ContextTypes.AttributeModifier
  );
  assert(privateModifier);
  assert(privateModifier.name === "private");
  assert(privateModifier.source === "@private isSupported={true}");
});

Deno.test("exium supports attribute modifiers with types", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `component <C @private[ boolean[] ] isSupported={true}> </C>`;
  const contexts = lexer.readSync(content, { type: "bio" });
  const privateModifier = contexts.find((context) =>
    context.type === ContextTypes.AttributeModifier
  );
  assert(privateModifier);
  assert(privateModifier.name === "private");
  assert(privateModifier.source === "@private[ boolean[] ] isSupported={true}");
  const modifierType = privateModifier.related.find((context) =>
    context.type === ContextTypes.AttributeModifierType
  );
  assert(modifierType);
  assert(modifierType.source === "[ boolean[] ]");
});

Deno.test("exium supports attribute modifiers with arguments", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content =
    `component <C @store:StoreMenu[ boolean[] ] isSupported={true}> </C>`;
  const contexts = lexer.readSync(content, { type: "bio" });
  const privateModifier = contexts.find((context) =>
    context.type === ContextTypes.AttributeModifier
  );
  assert(privateModifier);
  assert(privateModifier.name === "store");
  assert(
    privateModifier.source ===
      "@store:StoreMenu[ boolean[] ] isSupported={true}",
  );
  const modifierType = privateModifier.related.find((context) =>
    context.type === ContextTypes.AttributeModifierType
  );
  assert(modifierType);
  assert(modifierType.source === "[ boolean[] ]");
  const argument = privateModifier.children.find((context) =>
    context.type === ContextTypes.Argument
  );
  assert(argument);
  assert(argument.name === "StoreMenu");
});

Deno.test("exium - throws if the modifiers is not associated with an attribute", () => {
  let isSucess = true;
  const lexer = new Exium((_reason, _cursor, _context) => {
    isSucess = false;
  });
  const content = `component <C @private/>`;
  lexer.readSync(content, { type: "bio" });
  assert(!isSucess);
});

Deno.test("exium - throws if their is a sequence of modifiers", () => {
  let isFailing = false;
  const lexer = new Exium((_reason, _cursor, _context) => {
    isFailing = true;
  });
  const content = `component <C @private @public/>`;
  lexer.readSync(content, { type: "bio" });
  assert(isFailing);
});

Deno.test("exium - is waiting for a character to make it a modifier", () => {
  let isFailing = false;
  const lexer = new Exium((_reason, _cursor, _context) => {
    isFailing = true;
  });
  const content = `component <C @ attr/>`;
  lexer.readSync(content, { type: "bio" });
  assert(!isFailing);
});

Deno.test("exium supports bio language with complex example (spec: component.0.0.0.2021-4.7)", () => {
  const lexer = new Exium((reason, _cursor, context) => {
    const position = context.getPosition(content);
    throw new Error(
      `${reason} ${position.line}:${position.column}`,
    );
  });
  const content = `
  export component <C
    value={0}
    interval={undefined}
    @void createInterval={() => (this.interval = setInterval(() => this.value++, 100))}
    @void removeInterval={() => clearInterval(this.interval)}>

    count: $\{this.value}
    <script>
      case 'destroy': this.removeInterval(); break;
      default: this.createInterval(); break;
    </script>
  </C>
  `;
  lexer.readSync(content, { type: "bio" });
});
