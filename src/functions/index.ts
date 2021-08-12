import type { Exium } from '../../mod.ts';
import {
  ContextReader,
  ContextReaderOptions,
  CursorDescriber,
  ExiumParseOptions,
} from "../types/main.d.ts";
import { ExiumContext } from "../classes/ExiumContext.ts";
import { ContextTypes } from "../enums/context-types.ts";
import { Reason } from "../enums/error-reason.ts";

const importRegExp = /^import\b/i;
const importComponentRegExp = /^import\s+component\b/i;
const asRegExp = /^\s+as/i;

/**
 * should validate if the character is accepted inside the current context
 * if it's not the ogone lexer will use the error function passed into the constructor
 */
export function isValidChar(exium: Exium, unexpected?: ContextReader[]) {
  if (!unexpected) return;
  for (const reader of unexpected) {
    const isUnexpected = reader(exium, exium.checkOnlyOptions);
    if (isUnexpected) {
      exium.onError(Reason.UnexpectedToken, exium.cursor, getLastContext(exium));
    }
  }
}

/**
 * find through the first argument the children context
 * will push the contexts to the second argument
 */
export function saveContextsTo(
  exium: Exium,
  /**
   * the contexts to check
   */
  fromContexts: ContextReader[],
  /**
   * the array used to save the children contexts
   */
  to: ExiumContext[],
  opts?: ContextReaderOptions,
) {
  let endingCTX = false;
  exium.treePosition++;
  for (const reader of fromContexts) {
    exium.debugg(
      `${"\t".repeat(exium.treePosition)}%c[${exium.char}]`,
      "color:yellow",
    );
    const recognized = reader(exium, opts || {});
    if (recognized === null) {
      to.push(getLastContext(exium));
      fromContexts.splice(0);
      endingCTX = true;
      break;
    }
    if (recognized) {
      exium.debugg(
        `\n\t\t\t%cusing reader: ${reader.name} was sucessful\n`,
        "color:gray",
      );
      to.push(getLastContext(exium));
    }
  }
  exium.treePosition--;
  if (endingCTX) return;
}
/**
 * same as saveContextsTo but if no context is found,
 * the function onError iscalled
 */
export function saveStrictContextsTo(
  exium: Exium,
  /**
   * the contexts to check
   */
  fromContexts: ContextReader[],
  /**
   * the array used to save the children contexts
   */
  to: ExiumContext[],
  opts?: ContextReaderOptions,
) {
  const { length } = to;
  let endingCTX = false;
  exium.treePosition++;
  for (const reader of fromContexts) {
    exium.debugg(
      `${"\t".repeat(exium.treePosition)}%c[${exium.char}]`,
      "color:yellow",
    );
    const recognized = reader(exium, opts || {});
    if (recognized === null) {
      to.push(getLastContext(exium));
      fromContexts.splice(0);
      endingCTX = true;
      break;
    }
    if (recognized) {
      exium.debugg(
        `\n\t\t\t%cusing reader: ${reader.name} was sucessful\n`,
        "color:gray",
      );
      to.push(getLastContext(exium));
    }
  }
  exium.treePosition--;
  if (endingCTX) return;
  // no changes
  if (to.length === length && !isEOF(exium)) {
    exium.onError(Reason.UnexpectedToken, exium.cursor, getUnexpected(exium));
  }
}
/**
 * move the cursor and the column,
 * exium method is used during parsing step
 */
export function shift(exium: Exium, movement = 1) {
  exium.cursor.x += +movement;
  exium.cursor.column += +movement;
  exium.debugg(
    `%c\t\t${movement} ${exium.prev} ${">".repeat(movement > 0 ? movement : 0)
    } ${exium.char}`,
    "color:gray",
  );
}
export function shiftUntilEndOf(exium: Exium, text: string): boolean {
  if (!exium.nextPart.startsWith(text)) return false;
  let result = "";
  while (result !== text) {
    result += exium.char;
    shift(exium, 1);
  }
  return true;
}
export function saveToken(exium: Exium, token: string, type: ContextTypes): ExiumContext | undefined {
  const { x, line, column } = exium.cursor;
  const hasShifted = shiftUntilEndOf(exium, token);
  if (hasShifted) {
    const context = new ExiumContext(type, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
    exium.currentContexts.push(context);
    return context;
  }
}
/**
 * @param text text that the next part of the source should start with
 * @param shiftToTheEnd move the cursor to the end of the text, will only sift if the the next part is starting with the text
 * @returns true if the next part of the source is starting with the first argument
 */
export function isFollowedBy(exium: Exium, text: string, shiftToTheEnd?: boolean): boolean {
  const { nextPart } = exium;
  const result = nextPart.startsWith(text);
  if (shiftToTheEnd && result) {
    shiftUntilEndOf(exium, text);
  }
  return result;
}
/**
 * checks if the context.source is included into the support list
 */
export function checkSupport(
  exium: Exium,
  context: ExiumContext,
  supportList: string[],
  strict?: boolean,
) {
  const result = supportList.includes(context.source);
  if (strict && !result) {
    exium.onError(Reason.Unsupported, exium.cursor, context);
    return result;
  }
  return result;
}
/**
 * should return the previously defined context
 */
export function getUnexpected(exium: Exium): ExiumContext {
  return new ExiumContext(
    ContextTypes.Unexpected,
    exium.source.slice(exium.cursor.x),
    {
      start: exium.cursor.x,
      line: exium.cursor.line,
      column: exium.cursor.column,
      end: exium.cursor.x + 1,
    },
  );
}
export function getLastContext(exium: Exium): ExiumContext {
  const last = exium.currentContexts[exium.currentContexts.length - 1] ||
    getUnexpected(exium);
  return last;
}
/**
 * returns if the lexer has finished to read
 */
export function isEOF(exium: Exium): boolean {
  const { char } = exium;
  return Boolean(!char || exium.source.length === exium.cursor.x);
}
/**
 * read the top level of the current document
 * @param readers array of context readers which will shift the cursor of the lexer
 */
export function topCTX(exium: Exium, readers: ContextReader[]): boolean {
  try {
    return Boolean(
      readers.find((reader) => reader(exium)),
    );
  } catch (err) {
    throw err;
  }
}
/**
 * will parse any comment blocks starting with /* and ending with * /
 */
export function comment_block_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char, next } = exium;
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (char !== "/" || char === "/" && next !== "*") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const allSubContexts: ContextReader[] = [
      exium.line_break_CTX,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (exium.char === "/" && exium.prev === "*") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.CommentBlock, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.CommentBlockOpen, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * will parse any comment blocks starting with /* and ending with * /
 */
export function comment_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char, next } = exium;
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (char !== "/" || char === "/" && next !== "/") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      if (exium.char === "\n") {
        exium.cursor.x++;
        exium.cursor.line++;
        exium.cursor.column = 0;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.Comment, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * reads the all strings starting with a '
 */
export function string_single_quote_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char, prev } = exium;
    const { source } = exium;
    const { x, column, line } = exium.cursor;
    if (char !== "'" || char === "'" && prev === "\\") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(
        exium,
        opts?.unexpected || [
          exium.line_break_CTX,
        ],
      );
      if (exium.char === "'" && exium.prev !== "\\") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.StringSingleQuote, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.StringSingleQuoteOpen, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * reads the all strings starting with a "
 */
export function string_double_quote_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char, prev } = exium;
    const { source } = exium;
    const { x, column, line } = exium.cursor;
    if (char !== '"' || char === '"' && prev === "\\") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(
        exium,
        opts?.unexpected || [
          exium.line_break_CTX,
        ],
      );
      if (exium.char === '"' && exium.prev !== "\\") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.StringDoubleQuote, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.StringDoubleQuoteOpen, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * reads the all strings starting with a `
 */
export function string_template_quote_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char, prev } = exium;
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (char !== "`" || char === "`" && prev === "\\") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const allSubContexts = [
      line_break_CTX,
      string_template_quote_eval_CTX,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (exium.char === "`" && exium.prev !== "\\") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StringTemplateQuote,
      token,
      {
        start: x,
        end: exium.cursor.x,
        line,
        column,
      },
    );
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.StringTemplateQuoteOpen, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
/**
* checks inside a string_template_quote_context if there's an evaluation
*/
export function string_template_quote_eval_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char, prev, next } = exium;
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (
      char !== "$" || char === "$" && prev === "\\" ||
      char === "$" && next !== "{"
    ) {
      return false;
    }
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const allSubContexts = [
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      string_template_quote_CTX,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (exium.char === "}" && exium.prev !== "\\") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StringTemplateQuoteEval,
      token,
      {
        start: x,
        end: exium.cursor.x,
        line,
        column,
      },
    );
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(
        Reason.StringTemplateQuoteEvaluationOpen,
        exium.cursor,
        context,
      );
    }
    return result;
  } catch (err) {
    throw err;
  }
}
  /**
   * reads if the cursor's character is a space
   * @returns true if the current character and the next characters are spaces
   */
  export function multiple_spaces_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
    exium.debuggPosition("\n\n\t\tMULTISPACE START");
    try {
      const { char, next, source } = exium;
      if (char !== " " || next !== " ") return false;
      const { x, column, line } = exium.cursor;
      let result = false;
      while (exium.char === " ") {
        shift(exium, 1);
        isValidChar(exium, opts?.unexpected);
      }
      result = x !== exium.cursor.x;
      if (result) {
        const token = source.slice(x, exium.cursor.x);
        exium.currentContexts.push(
          new ExiumContext(ContextTypes.MultipleSpaces, token, {
            start: x,
            end: exium.cursor.x,
            line,
            column,
          }),
        );
      }
      exium.debuggPosition("\n\n\t\tMULTISPACE END");
      return result;
    } catch (err) {
      throw err;
    }
  }