
/**
 * specifications in css
 * provide a way for teams to limit features on styles
 */

/*
import { Exium } from "../../mod.ts";
import { ContextTypes } from "../../src/enums/context-types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
Deno.test('exium stylesheet supports specs statement', () => {
  const content = `
  @specify {
    colors {
      red;
      purple;
      mediumslategreen;
    }
    units {
      px;
      em;
      vw;
      vh;
      %;
    }
    displays {
      grid;
    }
    fonts {
      DINOT;
    }
    z-indexes {
      10;
      20;
      30;
    }
  }`;
  const lexer = new Exium((reason, _cursor, context) => {
    throw new Error(`${reason} ${context.position.line}:${context.position.column}`);
  });
  const contexts = lexer.readSync(content, { type: 'stylesheet' });
  if (contexts && contexts.length) {
  } else {
    throw new Error(`Exium - Failed to retrieve ${ContextTypes.StyleSheetTypeAssignment} context`);
  }
});
*/
