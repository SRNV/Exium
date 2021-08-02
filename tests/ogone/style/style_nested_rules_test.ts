import { ExiumDocument } from "./../../../src/classes/ExiumDocument.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("exium - support for nested rules in stylesheet", () => {
  const content = `
    div {
      background: blue;
      p {
        background: red;
      }
      color: purple;
    }
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
      type: "stylesheet",
    },
  });
  try {
    const rulesDiv = document.getStylesheetRulesByTagName("div");
    const rulesP = document.getStylesheetRulesByTagName("p");
    assert(rulesDiv.length);
    assert(rulesP.length);
    const [rule1WithDiv] = rulesDiv;
    const [rule1WithP] = rulesP;
    const divBackgroundContext = rule1WithDiv.getPropertyContexts("background");
    const pBackgroundContext = rule1WithP.getPropertyContexts("background");
    assert(divBackgroundContext);
    assert(pBackgroundContext);
    assert(document.getStylesheetRulesByProperty("color", "purple").length);
    assert(document.getStylesheetRulesByProperty("background", "red").length);
    assert(document.getStylesheetRulesByProperty("background", "blue").length);
    divBackgroundContext.forEach((prop) =>
      assertEquals((prop.value as string).trim(), "blue")
    );
  } catch (err) {
    throw err;
  }
});

Deno.test("exium - support for nested rules in stylesheet", () => {
  const stylesheet = `    iframe {
    height: 100%;
    width: 100%;
    background: white;
    border: 0;
    padding-top: 22px;
  }
  .container {
    background: #ffffff;
    border-right: 1px solid #e8e8e8;
    height: fit-content;
    z-index: 300;
    position: relative;
    padding-bottom: 30px;
    padding-top: 30px;
    position: absolute;
    top: 0px;
  }
  .slide-in-right {
    animation-name: slide-in-right;
    animation-duration: 1s;
    animation-iteration-count: 1;
    animation-direction: normal;
    animation-fill-mode: forwards;
    @keyframes slide-in-right {
      right: -1000% | 0px;
    }
  }
  .slide-out-right {
    @keyframes slide-out-right {
      animation-duration: 1s;
      animation-iteration-count: 1;
      animation-direction: normal;
      animation-fill-mode: forwards;
      position: relative;
      right: 0px | -1000%;
    }
  }`;
  const document = new ExiumDocument({
    url: new URL(import.meta.url),
    onError: (reason, _cursor, context) => {
      throw new Error(
        `${reason} ${context.position.line}:${context.position.column}`,
      );
    },
    source: stylesheet,
    options: {
      type: "stylesheet",
    },
  });
  try {
    assert(document.getStylesheetRulesByClassName("slide-out-right").length);
    assert(document.getStylesheetRulesByClassName("slide-in-right").length);
    assert(document.getStylesheetRulesByClassName("container").length);
  } catch (err) {
    throw err;
  }
});
