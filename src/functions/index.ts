import type { Exium, Exium } from '../../mod.ts';
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
      line_break_CTX,
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
          line_break_CTX,
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
          line_break_CTX,
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
export function identifier_asterix_CTX(exium: Exium, opts?: ContextReaderOptions): boolean | null {
  exium.debuggPosition("ASTERIX CTX START");
  const { line, column, x } = exium.cursor;
  const { char, source } = exium;
  const isValid = char === '*';
  if (!isValid) return false;
  if (opts?.checkOnly) return true;
  shift(exium, 1);
  const related: ExiumContext[] = [];
  saveStrictContextsTo(exium, [
    multiple_spaces_CTX,
    space_CTX,
    identifier_alias_CTX,
  ], related);
  const isGlobalAlias = related.find((context) => context.type === ContextTypes.IdentifierAsStatement);
  const token = source.slice(x, exium.cursor.x);
  const context = new ExiumContext(isGlobalAlias ? ContextTypes.ImportAllAlias : ContextTypes.Asterix, token, {
    line,
    column,
    start: x,
    end: exium.cursor.x,
  });
  exium.currentContexts.push(context);
  exium.debuggPosition("ASTERIX CTX END");
  return true;
}
export function identifier_CTX(exium: Exium, opts?: ContextReaderOptions) {
  exium.debuggPosition("Identifier CTX START");
  const { line, column, x } = exium.cursor;
  if (
    !exium.isCharIdentifier &&
    (!opts?.data?.allowDigit && !exium.isCharDigit)
  ) {
    return false;
  }
  if (opts?.checkOnly) return true;
  const allowAliases = opts?.data?.identifier_allow_alias;
  const allowedIdentifierChars = [
    ...(opts?.data?.allowedIdentifierChars as string[] || []),
  ];
  shift(exium, 1);
  let isAliased = false;
  const related: ExiumContext[] = [];
  while (!isEOF(exium)) {
    const { nextPart } = exium;
    if (!isAliased && allowAliases && asRegExp.test(nextPart)) {
      saveContextsTo(exium, [
        multiple_spaces_CTX,
        space_CTX,
        identifier_alias_CTX,
      ], related);
      const recognized = related.find((context) => context.type === ContextTypes.IdentifierAsStatement)
      if (recognized) {
        related.push(recognized);
        isAliased = true;
      }
    }
    if (
      (exium.isCharPuntuation || exium.isCharSpacing) &&
      !allowedIdentifierChars.includes(exium.char)
    ) {
      break;
    }
    shift(exium, 1);
  }
  const token = exium.source.slice(x, exium.cursor.x);
  const context = new ExiumContext(ContextTypes.Identifier, token, {
    start: x,
    end: exium.cursor.x,
    line,
    column,
  });
  exium.currentContexts.push(
    context,
  );
  context.related.push(...related);
  return true;
}
export function identifier_list_CTX(exium: Exium, opts?: ContextReaderOptions): boolean | null {
  exium.debuggPosition("Identifier LIST CTX Start");
  const { char, source } = exium;
  const isValid = char === "{";
  if (!isValid) return false;
  if (opts?.checkOnly) return true;
  const { line, column, x } = exium.cursor;
  shift(exium, 1);
  const readers: ContextReader[] = [
    line_break_CTX,
    space_CTX,
    multiple_spaces_CTX,
  ];
  const children: ExiumContext[] = [];
  let isComaNeeded = false;
  let isUnexpected = false;
  while (!isEOF(exium)) {
    saveContextsTo(exium, readers, children);
    if (
      (!isComaNeeded) && identifier_CTX(exium, exium.checkOnlyOptions) &&
      exium.char !== ","
    ) {
      const identified = identifier_CTX(exium, opts);
      if (identified) {
        const lastContext = getLastContext(exium);
        children.push(lastContext);
        isComaNeeded = true;
      }
    }
    if (isComaNeeded && exium.char === ",") {
      const identifiedComa = coma_CTX(exium);
      if (identifiedComa) {
        const lastContext = getLastContext(exium);
        children.push(lastContext);
        isComaNeeded = false;
      }
    }
    if (!(exium.char === "}" || exium.isCharSpacing)) {
      isUnexpected = true;
    }
    if (isUnexpected) {
      exium.onError(Reason.UnexpectedToken, exium.cursor, getUnexpected(exium));
    }
    if (exium.char === "}") {
      shift(exium, 1);
      break;
    }
    isValidChar(exium, opts?.unexpected);
    shift(exium, 1);
  }
  const token = source.slice(x, exium.cursor.x);
  const context = new ExiumContext(ContextTypes.IdentifierList, token, {
    start: x,
    end: exium.cursor.x,
    line,
    column,
  });
  exium.currentContexts.push(context);
  context.children.push(...children);
  return true;
}
export function identifier_alias_CTX(exium: Exium, opts?: ContextReaderOptions): boolean | null {
  const { x, line, column } = exium.cursor;
  const { source } = exium;
  // check if it's a as stmt
  const identified = identifier_CTX(exium);
  const children: ExiumContext[] = [];
  let isValid = false;
  if (identified) {
    const lastContext = getLastContext(exium);
    isValid = lastContext.source === 'as';
    if (isValid) lastContext.type = ContextTypes.AsStatement;
  }
  if (!isValid) return false;
  if (opts?.checkOnly) return true;
  let isIdentified = false;
  const allsubs: ContextReader[] = [
    multiple_spaces_CTX,
    space_CTX,
    identifier_CTX,
  ];
  while (!isEOF(exium)) {
    saveStrictContextsTo(exium, allsubs, children);
    isIdentified = !!children.find((context) => context.type === ContextTypes.Identifier);
    if (isIdentified) {
      break;
    }
    shift(exium, 1);
  }
  const token = source.slice(x, exium.cursor.x);
  const context = new ExiumContext(ContextTypes.IdentifierAsStatement, token, {
    start: x,
    end: exium.cursor.x,
    line,
    column,
  });
  exium.currentContexts.push(context);
  context.children.push(...children);
  if (!isIdentified) {
    exium.onError(Reason.AsStatementMissingIdentifier, exium.cursor, context);
  }
  return true;
}
export function space_CTX(exium: Exium, opts?: ContextReaderOptions): boolean | null {
  exium.debuggPosition("\n\n\t\tSPACE START");
  const result = exium.char === " " && exium.next !== exium.char;
  if (result) {
    exium.currentContexts.push(
      new ExiumContext(ContextTypes.Space, exium.char, {
        start: exium.cursor.x,
        end: exium.cursor.x + 1,
        line: exium.cursor.line,
        column: exium.cursor.column,
      }),
    );
    shift(exium, 1);
  }
  exium.debuggPosition("\n\n\t\tSPACE START");
  return result;
}
export function semicolon_CTX(exium: Exium, opts?: ContextReaderOptions): boolean | null {
  exium.debuggPosition("\n\n\t\tSEMICOLON START");
  const result = exium.char === ";";
  if (result) {
    exium.currentContexts.push(
      new ExiumContext(ContextTypes.SemiColon, exium.char, {
        start: exium.cursor.x,
        end: exium.cursor.x + 1,
        line: exium.cursor.line,
        column: exium.cursor.column,
      }),
    );
    shift(exium, 1);
  }
  exium.debuggPosition("\n\n\t\tSEMICOLON END");
  return result;
}
export function point_CTX(exium: Exium, opts?: ContextReaderOptions): boolean | null {
  exium.debuggPosition("\n\n\t\tPOINT START");
  const result = exium.char === ".";
  if (result) {
    exium.currentContexts.push(
      new ExiumContext(ContextTypes.Point, exium.char, {
        start: exium.cursor.x,
        end: exium.cursor.x + 1,
        line: exium.cursor.line,
        column: exium.cursor.column,
      }),
    );
    shift(exium, 1);
  }
  exium.debuggPosition("\n\n\t\tPOINT END");
  return result;
}
export function coma_CTX(exium: Exium, opts?: ContextReaderOptions): boolean | null {
  exium.debuggPosition("\n\n\t\tCOMA START");
  const result = exium.char === ",";
  if (result) {
    exium.currentContexts.push(
      new ExiumContext(ContextTypes.Coma, exium.char, {
        start: exium.cursor.x,
        end: exium.cursor.x + 1,
        line: exium.cursor.line,
        column: exium.cursor.column,
      }),
    );
    shift(exium, 1);
  }
  exium.debuggPosition("\n\n\t\tCOMA END");
  return result;
}
export function double_point_CTX(exium: Exium, opts?: ContextReaderOptions): boolean | null {
  exium.debuggPosition("\n\n\t\tDOUBLE POINT START");
  const result = exium.char === ":";
  if (result) {
    exium.currentContexts.push(
      new ExiumContext(ContextTypes.DoublePoint, exium.char, {
        start: exium.cursor.x,
        end: exium.cursor.x + 1,
        line: exium.cursor.line,
        column: exium.cursor.column,
      }),
    );
    shift(exium, 1);
  }
  exium.debuggPosition("\n\n\t\tDOUBLE POINT END");
  return result;
}
export function line_break_CTX(exium: Exium, opts?: ContextReaderOptions): boolean | null {
  exium.debuggPosition("\n\n\t\tLINEBREAK START");
  const { x, line, column } = exium.cursor;
  const isChariot = exium.char === "\r" && exium.next === "\n";
  const result = exium.char === "\n" || isChariot;
  if (result) {
    if (isChariot) shift(exium, 2);
    else shift(exium, 1);
    exium.currentContexts.push(
      new ExiumContext(ContextTypes.LineBreak, exium.char, {
        start: x,
        end: exium.cursor.x,
        line: line,
        column: column,
      }),
    );
    exium.cursor.column = 0;
    exium.cursor.line++;
  }
  exium.debuggPosition("\n\n\t\tLINEBREAK END");
  return result;
}
/**
 * should match with ( ... ) and is recursive
 */
export function braces_CTX(exium: Exium, opts?: ContextReaderOptions): boolean | null {
  try {
    exium.debuggPosition("BRACES_CTX START");
    const { char } = exium;
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (char !== "(") return false;
    if (opts?.checkOnly) return true;
    shift(exium, 1);
    const result = true;
    let isClosed = false;
    const allSubContexts = [
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      braces_CTX,
      ...(opts?.data?.braces_contexts as [] || []),
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      exium.debuggPosition("BRACES_CTX");
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (exium.char === ")") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.Braces, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.BracesOpen, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * should match with {...} and is recursive
 */
export function curly_brackets_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char } = exium;
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (char !== "{") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const allSubContexts = opts?.contexts || [
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      curly_brackets_CTX,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (exium.char === "}") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.CurlyBrackets, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.CurlyBracketsOpen, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * should match with [...] and is recursive
 */
export function array_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char } = exium;
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (char !== "[") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const allSubContexts = [
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      array_CTX,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (exium.char === "]") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.Array, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.ArrayOpen, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * should match with (...) and is recursive
 */
export function parenthese_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char } = exium;
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (char !== "(") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const allSubContexts = (opts?.contexts || [
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      array_CTX,
      parenthese_CTX,
    ]);
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (exium.char === ")") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.Parenthese, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.ParentheseOpen, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}