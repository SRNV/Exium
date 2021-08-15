import type { Exium } from "../../mod.ts";
import { ContextReader, ContextReaderOptions } from "../types/main.d.ts";
import { ExiumContext } from "../classes/ExiumContext.ts";
import { ContextTypes } from "../enums/context-types.ts";
import { Reason } from "../enums/error-reason.ts";
import { SupportedStyleSheetCharset } from "../supports.ts";

export const importRegExp = /^import\b/i;
export const importComponentRegExp = /^import\s+component\b/i;
export const asRegExp = /^\s+as/i;
export const supportedComponentTypes = [
  "component",
  "app",
  "async",
  "router",
  "store",
  "controller",
  "gl",
];
/**
 * all regular at rules
 * that aren't followed by curly braces
 */
export const regularAtRulesNames: string[] = [
  "charset",
  "import",
  "namespace",
];
export const checkOnlyOptions: ContextReaderOptions = {
  checkOnly: true,
};
export function getChar(exium: Exium): string {
  return exium.source[exium.cursor.x];
}
/**
 * the character code of the current character
 */
export function getCharCode(exium: Exium): number {
  return getChar(exium)?.charCodeAt(0);
}
/**
 * the current character is a punctuation
 */
export function isCharPuntuation(exium: Exium): boolean {
  const code = getCharCode(exium);
  return code >= 123 &&
      code <= 124 ||
    code >= 91 &&
      code <= 96 ||
    code >= 58 &&
      code <= 64 ||
    code >= 32 &&
      code <= 47;
}
/**
 * the current character is a number
 */
export function isCharDigit(exium: Exium): boolean {
  if (isCharSpacing(exium)) return false;
  const code = getCharCode(exium);
  return code >= 48 && code <= 57;
}
/**
 * the current character is alphabetic
 */
export function isCharIdentifier(exium: Exium): boolean {
  if (isCharSpacing(exium)) return false;
  const code = getCharCode(exium);
  return code >= 65 &&
      code <= 90 ||
    code === 36 ||
    code === 95 ||
    code >= 97 &&
      code <= 122;
}
/**
 * if the current character is \n \t \r \s
 */
export function isCharSpacing(exium: Exium): boolean {
  const code = getCharCode(exium);
  return code === 9 ||
    code === 10 ||
    code === 13 ||
    code === 32;
}
/**
* the previous character
*/
export function getPrev(exium: Exium): string | undefined {
  return exium.source[exium.cursor.x - 1];
}
/**
 * the following part
 * from the cursor index until the end of the document
 */

export function getNextPart(exium: Exium): string {
  return exium.source.slice(exium.cursor.x);
}
/**
 * the following part
 * from the cursor index until the end of the document
 */
export function getPreviousPart(exium: Exium): string {
  return exium.source.slice(0, exium.cursor.x);
}
/**
* the next character
*/
export function getNext(exium: Exium): string | undefined {
  return exium.source[exium.cursor.x + 1];
}
/**
 * returns true if the parse method is configured has stylesheet
 */
export function isParsingStylesheet(exium: Exium): boolean {
  return Boolean(
    exium.parseOptions && exium.parseOptions.type === "stylesheet",
  );
}
// returns if a node context has been declared
export function getNodeContextStarted(exium: Exium): boolean {
  return Boolean(
    exium.currentContexts.find((context) =>
      [ContextTypes.Node].includes(context.type)
    ),
  );
}
export function debugg(exium: Exium, ...args: unknown[]): void {
  if (exium.parseOptions?.debugg) {
    console.log(...args);
  }
}
export function debuggPosition(exium: Exium, name: string): void {
  if (exium.parseOptions?.debugg) {
    debugg(exium, `${exium.cursor.x} - %c${name.trim()}`, "color:orange", {
      prev: getPrev(exium),
      char: getChar(exium),
      next: getNext(exium),
    });
  }
}

// contexts
/**
 * support export statement for bio language
 */
export function readExportComponentStatementsCtx(exium: Exium): boolean | null {
  try {
    const isValid = readIdentifierCtx(exium, checkOnlyOptions);
    if (!isValid) return false;
    const recognized = readIdentifierCtx(exium);
    if (!recognized) return false;
    const lastContext = getLastContext(exium);
    const { x, } = exium.cursor;
    if (lastContext.source !== "export") {
      shift(exium, -lastContext.source.length);
      return false;
    }
    let isClosed = false;
    const allSubs: ContextReader[] = [
      readMultiSpacesCtx,
      readSpaceCtx,
      readComponentCtx,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      saveStrictContextsTo(exium, allSubs, children);
      const foundComponent = children.find((context) =>
        context.type === ContextTypes.ComponentDeclaration
      );
      if (foundComponent) {
        isClosed = true;
        // important to differentiate between the local and exported components
        foundComponent.data.isExported = true;
        break;
      }
      if (isCharSpacing(exium)) {
        break;
      }
    }
    const context = new ExiumContext(
      ContextTypes.ExportStatement,
      lastContext.source,
      x,
    );
    context.related.push(lastContext);
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.UnexpectedToken, exium.cursor, getUnexpected(exium));
    }
    return true;
  } catch (err) {
    throw err;
  }
}
/**
 * support for bio Language specififation
 * exium context allows to define a component with the following pattern:
 * component <ComponentName>
 *   ...
 * </ComponentName>
 */
export function readComponentCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean | null {
  try {
    const { x } = exium.cursor;
    const isValid = readIdentifierCtx(exium, checkOnlyOptions);
    if (!isValid) return false;
    // save the identifier
    const recognized = readIdentifierCtx(exium);
    if (!recognized) return false;
    const lastContext = getLastContext(exium);
    if (!supportedComponentTypes.includes(lastContext.source)) {
      return false;
    }
    if (opts?.checkOnly) return true;
    const { source } = exium;
    lastContext.type = ContextTypes.ComponentTypeStatement;
    let isNodeDefined = false;
    const allSubContexts: ContextReader[] = [
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readTextnodeCtx,
      readNodeCtx,
      readNodeCtx,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      saveContextsTo(exium, allSubContexts, children);
      const node = children.find((context) =>
        // node with a closing tag
        (context.type === ContextTypes.Node &&
          context.related.find((child) =>
            child.type === ContextTypes.NodeClosing
          ) &&
          !context.data.parentNode &&
          !context.data.isAutoClosing) ||
        // or an auto closing tag
        (context.type === ContextTypes.Node &&
          context.data.isAutoClosing &&
          !context.data.parentNode)
      );
      if (node) {
        isNodeDefined = true;
        break;
      }
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.ComponentDeclaration,
      token,
      x,
    );
    context.children.push(...children);
    // declare type
    Object.assign(context.data, {
      type: lastContext.source,
    });
    exium.currentContexts.push(context);
    if (!isNodeDefined) {
      exium.onError(
        Reason.ComponentDeclarationNodeMissing,
        exium.cursor,
        context,
      );
    }
    return true;
  } catch (err) {
    throw err;
  }
}
/**
  * support for bio's attribute modifiers
  */
export function readAttributesModifiersCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean | null {
  try {
    const char = getChar(exium);
    const { x, } = exium.cursor;
    const isValid = char === "@";
    if (!isValid) return false;
    if (opts?.checkOnly) return true;
    shift(exium, 1);
    if (!readIdentifierCtx(exium, checkOnlyOptions)) {
      shift(exium, -1);
      return false;
    }
    const { source, cursor } = exium;
    const attributes = [
      ContextTypes.Attribute,
      ContextTypes.AttributeBoolean,
      ContextTypes.AttributeProperty,
    ];
    const exitChars = [" ", ">", "\n", "/", "@"];
    let isIdentified = false;
    let isCompleted = false;
    const related: ExiumContext[] = [];
    const children: ExiumContext[] = [];
    const definitions: ContextReader[] = [
      readIdentifierCtx,
      readArgumentCtx,
      readArrayCtx,
    ];
    const allSubContexts: ContextReader[] = [
      readMultiSpacesCtx,
      readSpaceCtx,
      readLineBreakCtx,
      readAttributesCtx,
    ];
    while (!isEOF(exium)) {
      if (!isIdentified) {
        saveStrictContextsTo(exium, definitions, related);
        isIdentified = getLastContext(exium).type === ContextTypes.Identifier;
        // get the type part of the modifier: pattern = @modifier[type] attribute
        const array = isIdentified &&
          related.find((context) => context.type === ContextTypes.Array);
        if (array) {
          array.type = ContextTypes.AttributeModifierType;
        }
        // retrieve also the arguments
        // and save to children
        const argument = isIdentified &&
          related.find((context) => context.type === ContextTypes.Argument);
        if (argument) {
          children.push(argument);
        }
      } else {
        saveContextsTo(exium, allSubContexts, children);
        const attribute = children.find((context) =>
          attributes.includes(context.type)
        );
        if (attribute) {
          isCompleted = true;
          break;
        }
        if (exitChars.includes(getChar(exium)) || isCharSpacing(exium)) {
          break;
        }
      }
      isValidChar(exium, opts?.unexpected);
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.AttributeModifier, token, x);
    context.related.push(...related);
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isCompleted) {
      exium.onError(Reason.ModifierNotFinished, cursor, context);
    }
    return true;
  } catch (err) {
    throw err;
  }
}
export function readAttributeUnquotedCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const prev = getPrev(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    if (prev !== "=") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const children: ExiumContext[] = [];
    const exitChars = [" ", ">", "\n", "/"];
    while (!isEOF(exium)) {
      isValidChar(
        exium,
        opts?.unexpected || [
          readArrayCtx,
          readBracesCtx,
          readCurlyBracketsCtx,
        ],
      );
      if (exitChars.includes(getChar(exium))) {
        isClosed = true;
        break;
      }
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.AttributeValueUnquoted,
      token,
      x,
    );
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(
        Reason.HTMLAttributeValueUnquotedNotClosed,
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
 * reads the flags after the tag name
 */
export function readAttributesCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    if (
      char &&
      !(/[a-zA-Z0-9\$\_]/i.test(char))
    ) {
      return false;
    }
    debuggPosition(exium, "ATTRIBUTES CTX START");
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    let isNamed = false;
    let isBoolean = true;
    let isProp = false;
    const children: ExiumContext[] = [];
    const related: ExiumContext[] = [];
    const allSubContexts: ContextReader[] = [
      readStringDoubleQuoteCtx,
      readStringSingleQuoteCtx,
      readStringTemplateQuoteCtx,
      readCurlyBracketsCtx,
      readAttributeUnquotedCtx,
    ];
    if (!isNamed) {
      isNamed = Boolean(
        readIdentifierCtx(exium) &&
          related.push(getLastContext(exium)),
      );
    }
    const exitChars = [" ", ">", "\n", "/"];
    while (!isEOF(exium)) {
      debuggPosition(exium, "ATTRIBUTES CTX");
      isValidChar(exium, opts?.unexpected);
      if (isBoolean) {
        isBoolean = getChar(exium) !== "=";
      }
      saveContextsTo(exium, allSubContexts, children);
      if (!isProp && !isBoolean) {
        isProp = Boolean(
          children.find((context) =>
            context.type === ContextTypes.CurlyBrackets
          ),
        );
      }
      if (exitChars.includes(getChar(exium))) {
        isClosed = true;
        break;
      }
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      isBoolean
        ? ContextTypes.AttributeBoolean
        : isProp
        ? ContextTypes.AttributeProperty
        : ContextTypes.Attribute,
      token,
      x,
    );
    context.children.push(...children);
    context.related.push(...related);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.HTMLAttributeNotClosed, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}

export function readFlagSpreadCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    if (char !== "{" || !/^\{(\s*)(\.){3}/i.test(getNextPart(exium))) {
      return false;
    }
    if (opts?.checkOnly) return true;
    shift(exium, 1);
    const result = true;
    let isClosed = false;
    const children: ExiumContext[] = [];
    const readers: ContextReader[] = [
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readArrayCtx,
      readCurlyBracketsCtx,
    ];
    while (!isEOF(exium)) {
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, readers, children);
      if (["}"].includes(getChar(exium))) {
        shift(exium, 1);
        isClosed = true;
        break;
      }
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.FlagSpread, token, x);
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.OgoneSpreadFlagNotClosed, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * reads the flags after the tag name
 */
export function readFlagCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const next = getNext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    if (char !== "-" || next !== "-") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    let isNamed = false;
    let usingStructure = true;
    let isStructure = false;
    const children: ExiumContext[] = [];
    const related: ExiumContext[] = [];
    const allSubContexts: ContextReader[] = [
      readCurlyBracketsCtx,
      readArgumentCtx,
      readBracesCtx,
    ];
    const exitChars = [" ", ">", "\n", "/"];
    const argumentChar = ":";
    while (!isEOF(exium)) {
      if (!isNamed) {
        isNamed = Boolean(
          readIdentifierCtx(exium, {
            data: {
              allowedIdentifierChars: ["-"],
            },
          }) &&
            related.push(getLastContext(exium)),
        );
      }
      // the name of the flag is retrieved
      // there's no Equal Token found
      // isStructure isn't set
      if (getChar(exium) === "=") {
        isStructure = false;
        usingStructure = false;
      }
      saveContextsTo(exium, allSubContexts, children, {
        data: {
          readArgumentCtx_starts_with: argumentChar,
        },
      });
      if (isNamed && usingStructure && !isStructure) {
        isStructure = Boolean(
          children.find((context) => context.type === ContextTypes.Braces),
        );
      }
      if (exitChars.includes(getChar(exium))) {
        isClosed = true;
        break;
      }
      if (getChar(exium) !== argumentChar) {
        shift(exium, 1);
      }
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      isStructure ? ContextTypes.FlagStruct : ContextTypes.Flag,
      token,
      x,
    );
    Object.assign(context.data, {
      isStructure,
    });
    context.children.push(...children);
    context.related.push(...related);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.OgoneFlagNotFinish, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * reads comments
 */
export function readHTMLCommentCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const next = getNext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const sequence = [char, next, source[x + 2], source[x + 3]];
    if (
      char !== "<" ||
      sequence.join("") !== "<!--"
    ) {
      return false;
    }
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(
        exium,
        opts?.unexpected || [
          readHTMLCommentCtx,
        ],
      );
      if (
        getChar(exium) === ">" && getPrev(exium) === "-" &&
        source[exium.cursor.x - 2] === "-"
      ) {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.HTMLComment, token, x);
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.HTMLCommentOpen, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * should output all the html in the document
 * any sequence starting with a < and that is followed by a character is a node
 */
export function readNodeCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const nextPart = getNextPart(exium);
    const next = getNext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    if (
      char !== "<" ||
      char === "<" && [" ", "<", "!"].includes(next!) ||
      next && /([^a-zA-Z0-9\[\/])/i.test(next)
    ) {
      return false;
    }
    debuggPosition(exium, "NODE CTX START");
    if (opts?.checkOnly) return true;
    shift(exium, 1);
    const result = true;
    let isClosed = false;
    let isAutoClosing = false;
    let isNamed = false;
    let isProto = false;
    let isTemplate = false;
    let isStyle = false;
    const isNodeClosing = nextPart.startsWith("</");
    const subcontextEvaluatedOnce: ContextReader[] = [
      readIdentifierCtx,
    ];
    const allSubContexts: ContextReader[] = isNodeClosing
      ? [
        readLineBreakCtx,
        readSpaceCtx,
        readMultiSpacesCtx,
      ]
      : [
        readLineBreakCtx,
        readSpaceCtx,
        readMultiSpacesCtx,
        readFlagSpreadCtx,
        readAttributesCtx,
        readAttributesModifiersCtx,
        readFlagCtx,
      ];
    const children: ExiumContext[] = [];
    const related: ExiumContext[] = [];
    /**
     * start rendering the nodes
     */
    while (!isEOF(exium)) {
      debuggPosition(exium, "NODE CTX");
      isValidChar(
        exium,
        opts?.unexpected || [
          // shouldn't start a new node
          readNodeCtx,
          readHTMLCommentCtx,
        ],
      );
      if (!isNamed) {
        subcontextEvaluatedOnce.forEach((reader) => {
          const recognized = reader(exium);
          if (recognized) {
            const context = getLastContext(exium);
            related.push(context);
            isNamed = context.type === ContextTypes.Identifier;
            isProto = isNamed && context.source === "proto";
            isTemplate = isNamed && context.source === "template";
            isStyle = isNamed && context.source === "style";
          }
        });
      }
      saveContextsTo(exium, allSubContexts, children);
      /**
       * for any closing tag
       * should ensure that after the tagname
       * there's nothing else than spaces, line breaks, or >
       */
      if (
        isNodeClosing &&
        isNamed &&
        !([" ", ">", "\n"].includes(getChar(exium)))
      ) {
        const token = source.slice(x, exium.cursor.x);
        const context = new ExiumContext(ContextTypes.Unexpected, token, x);
        exium.onError(Reason.UnexpectedToken, exium.cursor, context);
      }
      if (getChar(exium) === "<") {
        break;
      } else if (getChar(exium) === ">") {
        shift(exium, 1);
        isClosed = true;
        isAutoClosing = getPreviousPart(exium).endsWith("/>");
        break;
      }
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      isNodeClosing ? ContextTypes.NodeClosing : ContextTypes.Node,
      token,
      x,
    );
    context.children.push(...children);
    context.related.push(...related);
    Object.assign(context.data, {
      isTemplate,
      isProto,
      isStyle,
      isAutoClosing,
      isNodeClosing,
      parentNode: exium.openTags[exium.openTags.length - 1],
    });
    exium.currentContexts.push(context);
    // start resolving open and closing tags
    if (!isAutoClosing) {
      if (
        isClosed &&
        !isNodeClosing
      ) {
        exium.openTags.push(context);
      } else if (
        isClosed &&
        isNodeClosing
      ) {
        const openTag = exium.openTags
          .slice()
          .reverse()
          .find((nodeContext) => {
            const name = nodeContext.related.find((related) =>
              related.type === ContextTypes.Identifier
            );
            const targetName = context.related.find((related) =>
              related.type === ContextTypes.Identifier
            );
            return name &&
              targetName &&
              !nodeContext.data.closed &&
              name.type === ContextTypes.Identifier &&
              name.source === targetName.source;
          });
        if (!openTag) {
          exium.onError(
            Reason.HTMLClosingTagWithoutOpening,
            exium.cursor,
            context,
          );
        } else {
          const index = exium.openTags.indexOf(openTag);
          exium.openTags.splice(index, 1);
          // save the closing tag
          openTag.related.push(context);
          openTag.data.closed = true;
        }
      }
    }
    if (!isClosed) {
      exium.onError(Reason.HTMLTagNotFinish, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * reads the textnodes that should match (node)> ... <(node)
 */
export function readTextnodeCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const prev = getPrev(exium);
    const lastContext = getLastContext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const lastIsANode = Boolean(
      lastContext &&
        [
          ContextTypes.Node,
          ContextTypes.NodeClosing,
          ContextTypes.HTMLComment,
        ].includes(lastContext.type),
    );
    const isValid = prev && [">"].includes(prev) && lastIsANode ||
      char !== "<" &&
        !readImportStatementsCtx(exium, checkOnlyOptions) &&
        !readNodeCtx(exium, checkOnlyOptions) &&
        !readCommentCtx(exium, checkOnlyOptions);
    if (!isValid || !getNodeContextStarted(exium)) return false;
    if (opts?.checkOnly) return true;
    const styleNode = exium.openTags[exium.openTags.length -1];
    const isStyleNode = styleNode && styleNode.name === 'style';
    if (isStyleNode) return readStyleSheetCtx(exium, opts);
    const result = true;
    const children: ExiumContext[] = [];
    const allSubContexts = [
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readStringTemplateQuoteEvalCtx,
    ];
    while (!isEOF(exium)) {
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (isStartingNode(exium)) {
        break;
      }
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.TextNode, token, x);
    Object.assign(context.data, {
      parentNode: exium.openTags[exium.openTags.length - 1],
    });
    context.children.push(...children);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * returns if the current character is starting a new element
 */
export function isStartingNode(exium: Exium): boolean {
  return [
    "<",
  ].includes(getChar(exium)) &&
    (readNodeCtx(exium, checkOnlyOptions) ||
      readHTMLCommentCtx(exium, checkOnlyOptions));
}

/**
 * reads the textnodes that should match (style)> ... </(style)
 */
export function isEndOfStylesheet(exium: Exium): boolean {
  const nextPart = getNextPart(exium);
  return isStartingNode(exium) &&
      nextPart.startsWith("</style") ||
    isEOF(exium) ||
    /\s*(\<\/style)/i.test(nextPart);
}

/**
 * should validate if the character is accepted inside the current context
 * if it's not the ogone lexer will use the error function passed into the constructor
 */
export function isValidChar(exium: Exium, unexpected?: ContextReader[]) {
  if (!unexpected) return;
  for (const reader of unexpected) {
    const isUnexpected = reader(exium, checkOnlyOptions);
    if (isUnexpected) {
      exium.onError(
        Reason.UnexpectedToken,
        exium.cursor,
        getLastContext(exium),
      );
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
    debugg(
      exium,
      `${"\t".repeat(exium.treePosition)}%c[${getChar(exium)}]`,
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
      debugg(
        exium,
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
    debugg(
      exium,
      `${"\t".repeat(exium.treePosition)}%c[${getChar(exium)}]`,
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
      debugg(
        exium,
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
  debugg(
    exium,
    `%c\t\t${movement} ${getPrev(exium)} ${
      ">".repeat(movement > 0 ? movement : 0)
    } ${getChar(exium)}`,
    "color:gray",
  );
}
export function shiftUntilEndOf(exium: Exium, text: string): boolean {
  if (!getNextPart(exium).startsWith(text)) return false;
  let result = "";
  while (result !== text) {
    result += getChar(exium);
    shift(exium, 1);
  }
  return true;
}
export function saveToken(
  exium: Exium,
  token: string,
  type: ContextTypes,
): ExiumContext | undefined {
  const { x, } = exium.cursor;
  const hasShifted = shiftUntilEndOf(exium, token);
  if (hasShifted) {
    const context = new ExiumContext(type, token, x);
    exium.currentContexts.push(context);
    return context;
  }
}
/**
 * @param text text that the next part of the source should start with
 * @param shiftToTheEnd move the cursor to the end of the text, will only sift if the the next part is starting with the text
 * @returns true if the next part of the source is starting with the first argument
 */
export function isFollowedBy(
  exium: Exium,
  text: string,
  shiftToTheEnd?: boolean,
): boolean {
  const nextPart = getNextPart(exium);
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
    exium.cursor.x,
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
  const char = getChar(exium);
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
export function readCommentBlockCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const next = getNext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    if (char !== "/" || char === "/" && next !== "*") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const allSubContexts: ContextReader[] = [
      readLineBreakCtx,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (getChar(exium) === "/" && getPrev(exium) === "*") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.CommentBlock, token, x);
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
export function readCommentCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const next = getNext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    if (char !== "/" || char === "/" && next !== "/") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      if (getChar(exium) === "\n") {
        exium.cursor.x++;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.Comment, token, x);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * reads the all strings starting with a '
 */
export function readStringSingleQuoteCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const prev = getPrev(exium);
    const { source } = exium;
    const { x, } = exium.cursor;
    if (char !== "'" || char === "'" && prev === "\\") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(
        exium,
        opts?.unexpected || [
          readLineBreakCtx,
        ],
      );
      if (getChar(exium) === "'" && getPrev(exium) !== "\\") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.StringSingleQuote, token, x);
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
export function readStringDoubleQuoteCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const prev = getPrev(exium);
    const { source } = exium;
    const { x, } = exium.cursor;
    if (char !== '"' || char === '"' && prev === "\\") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(
        exium,
        opts?.unexpected || [
          readLineBreakCtx,
        ],
      );
      if (getChar(exium) === '"' && getPrev(exium) !== "\\") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.StringDoubleQuote, token, x);
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
export function readStringTemplateQuoteCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const prev = getPrev(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    if (char !== "`" || char === "`" && prev === "\\") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const allSubContexts = [
      readLineBreakCtx,
      readStringTemplateQuoteEvalCtx,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (getChar(exium) === "`" && getPrev(exium) !== "\\") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StringTemplateQuote,
      token,
      x,
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
export function readStringTemplateQuoteEvalCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const prev = getPrev(exium);
    const next = getNext(exium);
    const { x, } = exium.cursor;
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
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readStringTemplateQuoteCtx,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (getChar(exium) === "}" && getPrev(exium) !== "\\") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StringTemplateQuoteEval,
      token,
      x,
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
export function readMultiSpacesCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\n\n\t\tMULTISPACE START");
  try {
    const char = getChar(exium);
    const next = getNext(exium);
    const { source } = exium;
    if (char !== " " || next !== " ") return false;
    const { x, } = exium.cursor;
    let result = false;
    while (getChar(exium) === " ") {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
    }
    result = x !== exium.cursor.x;
    if (result) {
      const token = source.slice(x, exium.cursor.x);
      exium.currentContexts.push(
        new ExiumContext(ContextTypes.MultipleSpaces, token, x),
      );
    }
    debuggPosition(exium, "\n\n\t\tMULTISPACE END");
    return result;
  } catch (err) {
    throw err;
  }
}
export function readIdentifierAsterixCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean | null {
  debuggPosition(exium, "ASTERIX CTX START");
  const { x } = exium.cursor;
  const char = getChar(exium);
  const { source } = exium;
  const isValid = char === "*";
  if (!isValid) return false;
  if (opts?.checkOnly) return true;
  shift(exium, 1);
  const related: ExiumContext[] = [];
  saveStrictContextsTo(exium, [
    readMultiSpacesCtx,
    readSpaceCtx,
    readIdentifierAliasCtx,
  ], related);
  const isGlobalAlias = related.find((context) =>
    context.type === ContextTypes.IdentifierAsStatement
  );
  const token = source.slice(x, exium.cursor.x);
  const context = new ExiumContext(
    isGlobalAlias ? ContextTypes.ImportAllAlias : ContextTypes.Asterix,
    token,
    x,
  );
  exium.currentContexts.push(context);
  debuggPosition(exium, "ASTERIX CTX END");
  return true;
}
export function readIdentifierCtx(exium: Exium, opts?: ContextReaderOptions) {
  debuggPosition(exium, "Identifier CTX START");
  const { x } = exium.cursor;
  if (
    !isCharIdentifier(exium) &&
    (!opts?.data?.allowDigit && !isCharDigit(exium))
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
    const nextPart = getNextPart(exium);
    if (!isAliased && allowAliases && asRegExp.test(nextPart)) {
      saveContextsTo(exium, [
        readMultiSpacesCtx,
        readSpaceCtx,
        readIdentifierAliasCtx,
      ], related);
      const recognized = related.find((context) =>
        context.type === ContextTypes.IdentifierAsStatement
      );
      if (recognized) {
        related.push(recognized);
        isAliased = true;
      }
    }
    if (
      (isCharPuntuation(exium) || isCharSpacing(exium)) &&
      !allowedIdentifierChars.includes(getChar(exium))
    ) {
      break;
    }
    shift(exium, 1);
  }
  const token = exium.source.slice(x, exium.cursor.x);
  const context = new ExiumContext(ContextTypes.Identifier, token, x);
  exium.currentContexts.push(
    context,
  );
  context.related.push(...related);
  return true;
}
export function readIdentifierListCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean | null {
  debuggPosition(exium, "Identifier LIST CTX Start");
  const char = getChar(exium);
  const { source } = exium;
  const isValid = char === "{";
  if (!isValid) return false;
  if (opts?.checkOnly) return true;
  const { x } = exium.cursor;
  shift(exium, 1);
  const readers: ContextReader[] = [
    readLineBreakCtx,
    readSpaceCtx,
    readMultiSpacesCtx,
  ];
  const children: ExiumContext[] = [];
  let isComaNeeded = false;
  let isUnexpected = false;
  while (!isEOF(exium)) {
    saveContextsTo(exium, readers, children);
    if (
      (!isComaNeeded) && readIdentifierCtx(exium, checkOnlyOptions) &&
      getChar(exium) !== ","
    ) {
      const identified = readIdentifierCtx(exium, opts);
      if (identified) {
        const lastContext = getLastContext(exium);
        children.push(lastContext);
        isComaNeeded = true;
      }
    }
    if (isComaNeeded && getChar(exium) === ",") {
      const identifiedComa = readComaCtx(exium);
      if (identifiedComa) {
        const lastContext = getLastContext(exium);
        children.push(lastContext);
        isComaNeeded = false;
      }
    }
    if (!(getChar(exium) === "}" || isCharSpacing(exium))) {
      isUnexpected = true;
    }
    if (isUnexpected) {
      exium.onError(Reason.UnexpectedToken, exium.cursor, getUnexpected(exium));
    }
    if (getChar(exium) === "}") {
      shift(exium, 1);
      break;
    }
    isValidChar(exium, opts?.unexpected);
    shift(exium, 1);
  }
  const token = source.slice(x, exium.cursor.x);
  const context = new ExiumContext(ContextTypes.IdentifierList, token, x);
  exium.currentContexts.push(context);
  context.children.push(...children);
  return true;
}
export function readIdentifierAliasCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean | null {
  const { x, } = exium.cursor;
  const { source } = exium;
  // check if it's a as stmt
  const identified = readIdentifierCtx(exium);
  const children: ExiumContext[] = [];
  let isValid = false;
  if (identified) {
    const lastContext = getLastContext(exium);
    isValid = lastContext.source === "as";
    if (isValid) lastContext.type = ContextTypes.AsStatement;
  }
  if (!isValid) return false;
  if (opts?.checkOnly) return true;
  let isIdentified = false;
  const allsubs: ContextReader[] = [
    readMultiSpacesCtx,
    readSpaceCtx,
    readIdentifierCtx,
  ];
  while (!isEOF(exium)) {
    saveStrictContextsTo(exium, allsubs, children);
    isIdentified = !!children.find((context) =>
      context.type === ContextTypes.Identifier
    );
    if (isIdentified) {
      break;
    }
    shift(exium, 1);
  }
  const token = source.slice(x, exium.cursor.x);
  const context = new ExiumContext(ContextTypes.IdentifierAsStatement, token, x);
  exium.currentContexts.push(context);
  context.children.push(...children);
  if (!isIdentified) {
    exium.onError(Reason.AsStatementMissingIdentifier, exium.cursor, context);
  }
  return true;
}
export function readSpaceCtx(
  exium: Exium,
): boolean | null {
  debuggPosition(exium, "\n\n\t\tSPACE START");
  const result = getChar(exium) === " " && getNext(exium) !== getChar(exium);
  if (result) {
    exium.currentContexts.push(
      new ExiumContext(ContextTypes.Space, getChar(exium), exium.cursor.x),
    );
    shift(exium, 1);
  }
  debuggPosition(exium, "\n\n\t\tSPACE START");
  return result;
}
export function readSemiColonCtx(
  exium: Exium,
): boolean | null {
  debuggPosition(exium, "\n\n\t\tSEMICOLON START");
  const result = getChar(exium) === ";";
  if (result) {
    exium.currentContexts.push(
      new ExiumContext(ContextTypes.SemiColon, getChar(exium), exium.cursor.x),
    );
    shift(exium, 1);
  }
  debuggPosition(exium, "\n\n\t\tSEMICOLON END");
  return result;
}
export function readPointCtx(
  exium: Exium,
): boolean | null {
  debuggPosition(exium, "\n\n\t\tPOINT START");
  const result = getChar(exium) === ".";
  if (result) {
    exium.currentContexts.push(
      new ExiumContext(ContextTypes.Point, getChar(exium), exium.cursor.x),
    );
    shift(exium, 1);
  }
  debuggPosition(exium, "\n\n\t\tPOINT END");
  return result;
}
export function readComaCtx(
  exium: Exium,
): boolean | null {
  debuggPosition(exium, "\n\n\t\tCOMA START");
  const result = getChar(exium) === ",";
  if (result) {
    exium.currentContexts.push(
      new ExiumContext(ContextTypes.Coma, getChar(exium), exium.cursor.x),
    );
    shift(exium, 1);
  }
  debuggPosition(exium, "\n\n\t\tCOMA END");
  return result;
}
export function readDoublePointCtx(
  exium: Exium,
): boolean | null {
  debuggPosition(exium, "\n\n\t\tDOUBLE POINT START");
  const result = getChar(exium) === ":";
  if (result) {
    exium.currentContexts.push(
      new ExiumContext(ContextTypes.DoublePoint, getChar(exium), exium.cursor.x),
    );
    shift(exium, 1);
  }
  debuggPosition(exium, "\n\n\t\tDOUBLE POINT END");
  return result;
}
export function readLineBreakCtx(
  exium: Exium,
): boolean | null {
  debuggPosition(exium, "\n\n\t\tLINEBREAK START");
  const { x, } = exium.cursor;
  const isChariot = getChar(exium) === "\r" && getNext(exium) === "\n";
  const result = getChar(exium) === "\n" || isChariot;
  if (result) {
    if (isChariot) shift(exium, 2);
    else shift(exium, 1);
    exium.currentContexts.push(
      new ExiumContext(ContextTypes.LineBreak, getChar(exium), x),
    );
  }
  debuggPosition(exium, "\n\n\t\tLINEBREAK END");
  return result;
}
/**
 * should match with ( ... ) and is recursive
 */
export function readBracesCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean | null {
  try {
    debuggPosition(exium, "readBracesCtx START");
    const char = getChar(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    if (char !== "(") return false;
    if (opts?.checkOnly) return true;
    shift(exium, 1);
    const result = true;
    let isClosed = false;
    const allSubContexts = [
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readBracesCtx,
      ...(opts?.data?.braces_contexts as [] || []),
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      debuggPosition(exium, "readBracesCtx");
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (getChar(exium) === ")") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.Braces, token, x);
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
export function readCurlyBracketsCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    if (char !== "{") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const allSubContexts = opts?.contexts || [
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readCurlyBracketsCtx,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (getChar(exium) === "}") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.CurlyBrackets, token, x);
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
export function readArrayCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    if (char !== "[") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const allSubContexts = [
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readArrayCtx,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (getChar(exium) === "]") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.Array, token, x);
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
export function readParentheseCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    if (char !== "(") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const allSubContexts = (opts?.contexts || [
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readArrayCtx,
      readParentheseCtx,
    ]);
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (getChar(exium) === ")") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.Parenthese, token, x);
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
/**
 * @returns true if the readArgumentCtx is valid for the current char
 * @usage
 * ```
 * exium.readArgumentCtx({
 *   data: {
 *     readArgumentCtx_starts_with: '&'
 *   }
 * }); // boolean
 * ```
 */
export function readArgumentCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const {
      source,
    } = exium;
    const {
      x,
    } = exium.cursor;
    const startingChar =
      opts && opts.data?.readArgumentCtx_starts_with as string || ":";
    const isValid = char === startingChar;
    if (!isValid) return false;
    shiftUntilEndOf(exium, startingChar);
    const related: ExiumContext[] = [];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      isValidChar(exium, opts && opts?.unexpected);
      Boolean(
        readIdentifierCtx(exium, {
          data: {
            allowedIdentifierChars: ["-"],
          },
        }) &&
          related.push(getLastContext(exium)),
      );
      if (isCharPuntuation(exium)) break;
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.Argument, token, x);
    context.related.push(...related);
    context.children.push(...children);
    exium.currentContexts.push(context);
    return true;
  } catch (err) {
    throw err;
  }
}
/**
* should read all import statements
*/
// TODO create contexts for the tokens between import and from
export function readImportStatementsCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const nextPart = getNextPart(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid = importRegExp.test(nextPart);
    const isComponent = importComponentRegExp.test(nextPart);
    if (!isValid) {
      return false;
    }
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    let fromStatement = null;
    const related: ExiumContext[] = [];
    const children: ExiumContext[] = [];
    // shift after the import statement
    shiftUntilEndOf(exium, "import");
    if (isComponent) {
      saveStrictContextsTo(
        exium,
        [
          readMultiSpacesCtx,
          readSpaceCtx,
        ],
        children,
      );
      saveToken(
        exium,
        "component",
        ContextTypes.ImportComponentStatement,
      );
    }
    while (!isEOF(exium)) {
      saveStrictContextsTo(
        exium,
        [
          readMultiSpacesCtx,
          readSpaceCtx,
          readIdentifierAsterixCtx,
          readIdentifierListCtx,
          readIdentifierCtx,
          readMultiSpacesCtx,
          readComaCtx,
          readSpaceCtx,
        ],
        children,
        isComponent ? undefined : {
          data: {
            identifier_allow_alias: true,
          },
        },
      );
      fromStatement = saveToken(
        exium,
        "from",
        ContextTypes.ImportStatementFrom,
      );
      if (fromStatement) {
        break;
      }
      isValidChar(exium, opts?.unexpected);
    }
    /**
     * expected next contexts
     */
    const nextContexts: ContextReader[] = [
      readMultiSpacesCtx,
      readSpaceCtx,
      readStringDoubleQuoteCtx,
      readStringSingleQuoteCtx,
      readSemiColonCtx,
    ];
    nextContexts.forEach((reader: ContextReader, i: number, arr) => {
      const recognized = reader(exium);
      if (recognized) {
        related.push(getLastContext(exium));
        delete arr[i];
      }
    });
    const str = related.find((context) =>
      [
        ContextTypes.StringSingleQuote,
        ContextTypes.StringDoubleQuote,
      ].includes(context.type)
    );
    isClosed = Boolean(
      fromStatement &&
        str &&
        related.find((context) =>
          [
            ContextTypes.SemiColon,
          ].includes(context.type)
        ),
    );
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.ImportStatement, token, x);
    Object.assign(context.data, {
      isComponent,
      path: str,
    });
    if (fromStatement) {
      context.related.push(fromStatement);
    }
    context.related.push(...related);
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.ImportStatementNotFinish, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
export function readExportStatementCtx(exium: Exium): boolean | null {
  try {
    const isValid = readIdentifierCtx(exium, checkOnlyOptions);
    if (!isValid) return false;
    const recognized = readIdentifierCtx(exium);
    if (!recognized) return false;
    const lastContext = getLastContext(exium);
    const { x, } = exium.cursor;
    if (lastContext.source !== "export") {
      shift(exium, -lastContext.source.length);
      return false;
    }
    const context = new ExiumContext(
      ContextTypes.ExportStatement,
      lastContext.source,
      x,
    );
    context.related.push(lastContext);
    exium.currentContexts.push(context);
    return true;
  } catch (err) {
    throw err;
  }
}
/**
* should read all ambient import statements
*/
export function readImportAmbientCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const { x, } = exium.cursor;
    const { source } = exium;
    if (!/^import\s*(["'])(.*?)(\1)/i.test(getNextPart(exium))) return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const related: ExiumContext[] = [];
    /**
     * expected next contexts
     */
    const nextContexts: ContextReader[] = [
      readMultiSpacesCtx,
      readSpaceCtx,
      readStringDoubleQuoteCtx,
      readStringSingleQuoteCtx,
      readSemiColonCtx,
    ];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      if (getChar(exium) === " " || ['"', "'"].includes(getChar(exium))) {
        break;
      }
    }
    nextContexts.forEach((reader: ContextReader, i: number, arr) => {
      const recognized = reader(exium);
      if (recognized) {
        related.push(getLastContext(exium));
        delete arr[i];
      }
    });
    const str = related.find((context) =>
      [
        ContextTypes.StringDoubleQuote,
        ContextTypes.StringSingleQuote,
      ].includes(context.type)
    );
    isClosed = Boolean(
      str &&
        related.find((context) =>
          [
            ContextTypes.SemiColon,
          ].includes(context.type)
        ),
    );
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.ImportAmbient, token, x);
    Object.assign(context.data, {
      path: str,
    });
    context.related.push(...related);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.ImportAmbientStringMissing, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
/**
   * reads the textnode that should match (protocol)> ... </(protocol)
   */
export function readProtocolCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const { x, } = exium.cursor;
    const { source } = exium;
    const lastIsAStyleNode = exium.currentContexts.find((context) =>
      context.type === ContextTypes.Node &&
      context.related.find((node) =>
        node.type === ContextTypes.Identifier &&
        node.source === "proto"
      ) &&
      !context.related.find((node) => node.type === ContextTypes.NodeClosing)
    );
    const isValid = !!lastIsAStyleNode;
    if (!isValid) return false;
    if (opts?.checkOnly) return true;
    const result = true;
    const children: ExiumContext[] = [];
    const allSubContexts = [
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
    ];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (isStartingNode(exium) && getNextPart(exium).startsWith("</proto")) {
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.Protocol, token, x);
    context.children.push(...children);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
export function isEndOfStylesheetProperty(exium: Exium): boolean {
  const char = getChar(exium);
  const { isInPseudoProperty: p } = exium;
  return p &&
      char === ")" ||
    !p &&
      char === "}";
}
export function readStyleSheetCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "STYLESHEET START  ==================>");
  try {
    const { x, } = exium.cursor;
    const { source } = exium;
    const lastIsAStyleNode = exium.currentContexts.find((context) =>
      context.type === ContextTypes.Node &&
      context.related.find((node) =>
        node.type === ContextTypes.Identifier &&
        node.source === "style"
      ) &&
      !context.related.find((node) => node.type === ContextTypes.NodeClosing)
    );
    const isValid = !!lastIsAStyleNode || isParsingStylesheet(exium);
    if (!isValid) return isValid;
    if (opts?.checkOnly) return !isEndOfStylesheet(exium);
    const result = true;
    const children: ExiumContext[] = [];
    const allSubContexts: ContextReader[] = [
      readStylesheetEndCtx,
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readCommentBlockCtx,
      readCommentCtx,
      readSemiColonCtx,
      // at-rules specs
      // last should be the default at rule
      readStyleSheetCharsetAtRuleCtx,
      readStyleSheetConstAtRuleCtx,
      readStyleSheetExportAtRuleCtx,
      readStyleSheetDefaultAtRuleCtx,
      readStyleSheetPropertyListCtx,

      readStyleSheetSelectorListCtx,
      // TODO implement property list
      readStyleSheetPropertyListCtx,
    ];
    saveContextsTo(exium, allSubContexts, children);
    while (!isEOF(exium)) {
      saveStrictContextsTo(exium, allSubContexts, children);
      isValidChar(exium, opts?.unexpected);
      if (isEndOfStylesheet(exium)) {
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.StyleSheet, token, x);
    context.children.push(...children);
    exium.currentContexts.push(context);
    debuggPosition(exium, "STYLESHEET END");
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * reader for the at-rule @charset
 * @charset should be followed by a string (double or single);
 */
export function readStyleSheetCharsetAtRuleCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "readStyleSheetCharsetAtRuleCtx");
  try {
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid = Boolean(isFollowedBy(exium, "@charset", true));
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const children: ExiumContext[] = [];
    const allSubContexts: ContextReader[] = [
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readStringDoubleQuoteCtx,
      readStringSingleQuoteCtx,
      readSemiColonCtx,
    ];
    // retrieve the atrule name
    while (!isEOF(exium)) {
      saveContextsTo(exium, allSubContexts, children);
      if (
        children.find((context) => context.type === ContextTypes.SemiColon)
      ) {
        break;
      }
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
    }
    // check if the at rule is ending correctly
    isClosed = Boolean(
      children.length && children.find((context) =>
        [
          ContextTypes.StringSingleQuote,
          ContextTypes.StringDoubleQuote,
        ].includes(context.type)
      ),
    );
    // create and finish the current context
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetAtRuleCharset,
      token,
      x,
    );
    context.children.push(...children);
    exium.currentContexts.push(context);
    // now check if everything is good with the charset
    const str = children.find((context) =>
      [
        ContextTypes.StringSingleQuote,
        ContextTypes.StringDoubleQuote,
      ].includes(context.type)
    );
    if (str) {
      let isValidCharset = false;
      const strCharset = str.source.slice(1, -1);
      SupportedStyleSheetCharset.forEach((charset) => {
        if (charset.toLowerCase() === strCharset || charset === strCharset) {
          isValidCharset = true;
        }
      });
      if (!isValidCharset) {
        exium.onError(
          Reason.StyleSheetAtRuleCharsetInvalid,
          exium.cursor,
          context,
        );
      }
    } else {
      exium.onError(
        Reason.StyleSheetAtRuleCharsetStringIsMissing,
        exium.cursor,
        context,
      );
    }
    if (!isClosed) {
      exium.onError(
        Reason.StyleSheetAtRuleCharsetNotFinish,
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
* reader for the at-rule @export
* should retrieve all the exportable token
*/
export function readStyleSheetExportAtRuleCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid = Boolean(isFollowedBy(exium, "@export", true));
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    const children: ExiumContext[] = [];
    const allSubContexts: ContextReader[] = [
      readMultiSpacesCtx,
      readSpaceCtx,
      readStyleSheetConstAtRuleCtx,
      readStylesheetEndCtx,
    ];
    // retrieve the atrule name
    while (!isEOF(exium)) {
      saveStrictContextsTo(exium, allSubContexts, children, {
        data: {
          isExportStatement: true,
        },
      });
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      if (getChar(exium) === ";" || getPrev(exium) === ";") {
        break;
      }
    }
    // create and finish the current context
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetAtRuleExport,
      token,
      x,
    );
    context.children.push(...children);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * reader for the at-rule @const
 * the rule should follow exium pattern
 * @const <name> : <type> = <value>;
 *
 * where name type and value are required
 */
export function readStyleSheetConstAtRuleCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "readStyleSheetConstAtRuleCtx");
  try {
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid = Boolean(
      isFollowedBy(exium, "@const", true) || opts?.data?.isExportStatement,
    );
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    getNextPart(exium).startsWith("const ") && shiftUntilEndOf(exium, "const");
    const result = true;
    let isNamed = false;
    const children: ExiumContext[] = [];
    const related: ExiumContext[] = [];
    const allSubContexts: ContextReader[] = [
      readMultiSpacesCtx,
      readSpaceCtx,
      readSemiColonCtx,
      readLineBreakCtx,
      readStylesheetEndCtx,
    ];
    const describers: ContextReader[] = [
      readStylesheetEndCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readIdentifierCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readStyleSheetTypeAssignementCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readStyleSheetConstAtRuleEqualCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readStyleSheetHexTypeCtx, // #000000
      readStyleSheetSelectorListCtx,
      readStyleSheetPropertyListCtx,
    ];
    // retrieve the atrule name
    while (!isEOF(exium)) {
      if (!isNamed) {
        // retrieve name
        saveContextsTo(exium, describers, related, {
          data: {
            // force type assignment
            force_type_assignment_context: true,
            // force property list
            force_property_list_context: true,
          },
        });
        isNamed = Boolean(
          related.find((context) => context.type === ContextTypes.Identifier) &&
            related.find((context) =>
              context.type === ContextTypes.StyleSheetAtRuleConstEqual
            ) &&
            related.find((context) =>
              context.type === ContextTypes.StyleSheetTypeAssignment
            ),
        );
      } else {
        saveContextsTo(exium, allSubContexts, children);
      }
      if (getChar(exium) === ";") {
        break;
      }
      isValidChar(exium, opts?.unexpected);
    }
    // create and finish the current context
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetAtRuleConst,
      token,
      x,
    );
    context.children.push(...children);
    context.related.push(...related);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetHexTypeCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean | null {
  debuggPosition(exium, "STYLESHEET HEX TYPE START");
  const char = getChar(exium);
  const { source } = exium;
  const { x, } = exium.cursor;
  if (char !== "#") return false;
  if (opts?.checkOnly) return true;
  while (!isEOF(exium)) {
    debuggPosition(exium, "STYLESHEET HEX TYPE");
    if ([" ", ";", "\n"].includes(getChar(exium)) || exium.cursor.x - x >= 8) {
      break;
    }
    shift(exium, 1);
  }
  const token = source.slice(x, exium.cursor.x);
  const context = new ExiumContext(ContextTypes.StyleSheetHexType, token, x);
  exium.currentContexts.push(context);
  return true;
}
export function readStyleSheetConstAtRuleEqualCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "STYLESHEET CONST AT RULE EQUAL START");
  try {
    const char = getChar(exium);
    const next = getNext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid: boolean = char === "=" && next !== "=";
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    debuggPosition(exium, "STYLESHEET CONST AT RULE EQUAL");
    shift(exium, 1);
    // create and finish the current context
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetAtRuleConstEqual,
      token,
      x,
    );
    exium.currentContexts.push(context);
    return true;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetDefaultAtRuleCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\nDEFAULT AT RULE");
  try {
    const char = getChar(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid = Boolean(char === "@");
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    shift(exium, 1);
    const result = true;
    let isTyped = false;
    const children: ExiumContext[] = [];
    const describers: ContextReader[] = [
      readStyleSheetTypeAssignementCtx,
      readIdentifierCtx,
    ];
    const allSubContexts: ContextReader[] = [
      readMultiSpacesCtx,
      readSpaceCtx,
      readLineBreakCtx,
      readStyleSheetSelectorListCtx,
    ];
    const related: ExiumContext[] = [];
    saveContextsTo(exium, describers, related);
    isTyped = !!related.find((context) =>
      context.type === ContextTypes.StyleSheetTypeAssignment
    );
    while (!isEOF(exium)) {
      saveContextsTo(exium, allSubContexts, children);
      if (
        getChar(exium) === "{" ||
        getChar(exium) === ";" ||
        isEndOfStylesheet(exium)
      ) {
        break;
      }
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
    }
    // create and finish the current context
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.StyleSheetAtRule, token, x);
    context.children.push(...children);
    context.related.push(...related);
    context.data.isTyped = isTyped;
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetTypeAssignementCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\nCONST TYPE");
  try {
    const char = getChar(exium);
    const prev = getPrev(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid = Boolean(
      (prev === "@" && char === "<") ||
        (opts?.data?.force_type_assignment_context),
    );
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const children: ExiumContext[] = [];
    const allSubContexts: ContextReader[] = (opts?.contexts || [
      // TODO implement the context stylesheet_type_list
      // exium.stylesheet_type_list_CTX,
    ]);
    while (!isEOF(exium)) {
      saveContextsTo(exium, allSubContexts, children);
      if (getChar(exium) === ">") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
      shift(exium, 1);
      isValidChar(
        exium,
        opts?.unexpected || [
          readStyleSheetTypeAssignementCtx,
          readStyleSheetDefaultAtRuleCtx,
        ],
      );
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetTypeAssignment,
      token,
      x,
    );
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(
        Reason.StyleSheetTypeAssignmentNotFinish,
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
 * The CSS selector list (,) selects all the matching nodes.
 */
export function readStyleSheetSelectorListCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean | null {
  debuggPosition(exium, "SELECTOR LIST");
  try {
    const char = getChar(exium);
    const nextPart = getNextPart(exium);
    const next = getNext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid = ![",", "@", " ", "\n", "}", "{"].includes(char) &&
      /^([^;\{\}]*?)(\{)/gi.test(nextPart);
    if (
      !isValid ||
      (char === next && char === ".")
    ) {
      return false;
    }
    if (opts?.checkOnly) return true;
    const result = true;
    const supportedSelectors: ContextReader[] = [
      readStylesheetEndCtx,
      readSelectorCombinatorCtx,
      readStyleSheetSelectorAttributeCtx,
      readStyleSheetSelectorPseudoElementCtx,
      readStyleSheetSelectorPseudoClassCtx,
      readStyleSheetSelectorIdCtx,
      readStyleSheetSelectorClassCtx,
      readStyleSheetParentRefCtx, // TODO
      // should be the last one because it accepts everything
      readStyleSheetSelectorElementCtx,
    ];
    const comaCTX: ContextReader[] = [
      readMultiSpacesCtx,
      readSpaceCtx,
      readLineBreakCtx,
      readComaCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readLineBreakCtx,
    ];
    const allSubContexts: ContextReader[] = (opts?.contexts || [
      readMultiSpacesCtx,
      readSpaceCtx,
      ...supportedSelectors,
      ...comaCTX,
    ]);
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      saveStrictContextsTo(exium, allSubContexts, children);
      if (["{", "}"].includes(getChar(exium)) || isEndOfStylesheet(exium)) {
        break;
      }
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetSelectorList,
      token,
      x,
    );
    context.children.push(...children);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetParentRefCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const next = getNext(exium);
    const char = getChar(exium);
    const prev = getPrev(exium);
    const {
      cursor,
      source,
    } = exium;
    const { x, } = cursor;
    const isValid = char === "&" && next !== "&" && prev !== "&";
    if (!isValid) return false;
    if (opts?.checkOnly) return true;
    shift(exium, 1);
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetParentRef,
      token,
      x,
    );
    exium.currentContexts.push(context);
    return true;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetSelectorElementCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const unsupportedChars = ["#", ".", "[", " ", "@", "{", "\n", ",", "}"];
    const isValid = !unsupportedChars.includes(char);
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      debuggPosition(exium, "\nSELECTOR ELEMENT");
      if (
        ["#", ".", "[", ",", " ", "{", ":"].includes(getChar(exium))
      ) {
        break;
      }
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetSelectorHTMLElement,
      token,
      x,
    );
    context.children.push(...children);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetSelectorClassCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\nSELECTOR CLASS");
  try {
    const char = getChar(exium);
    const prev = getPrev(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const previousIsClassStart = prev === "." && char !== ".";
    const isValid: boolean = (char === "." || previousIsClassStart);
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      debuggPosition(exium, "\nSELECTOR CLASS");
      if (
        ["#", "[", ",", " ", "{", ":"].includes(getChar(exium))
      ) {
        break;
      }
      shift(exium, 1);
      if (
        ["."].includes(getChar(exium))
      ) {
        break;
      }
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    if (!token.length) return false;
    const context = new ExiumContext(
      ContextTypes.StyleSheetSelectorClass,
      token,
      x,
    );
    context.children.push(...children);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetSelectorPseudoClassCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const next = getNext(exium);
    const prev = getPrev(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid: boolean = (char === ":" || prev === ":") && next !== ":";
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    const children: ExiumContext[] = [];
    const allSubs: ContextReader[] = [
      readMultiSpacesCtx,
      readSpaceCtx,
      readLineBreakCtx,
      readParentheseCtx,
    ];
    while (!isEOF(exium)) {
      debuggPosition(exium, "\nSELECTOR PSEUDO CLASS");
      shift(exium, 1);
      if (
        [".", "[", ",", " ", "\n", "#", ":", "("].includes(getChar(exium))
      ) {
        break;
      }
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetSelectorPseudoClass,
      token,
      x,
    );
    // save trailing parenthese
    saveContextsTo(exium, allSubs, children);
    context.children.push(...children);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetSelectorPseudoElementCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const next = getNext(exium);
    const prev = getPrev(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid: boolean =
      (char === ":" && next === ":" || prev === ":" && char === ":");
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    shiftUntilEndOf(exium, "::");
    const result = true;
    const children: ExiumContext[] = [];
    const allSubs: ContextReader[] = [
      readMultiSpacesCtx,
      readSpaceCtx,
      readLineBreakCtx,
      readParentheseCtx,
    ];
    while (!isEOF(exium)) {
      debuggPosition(exium, "\nSELECTOR PSEUDO ELEMENT");
      shift(exium, 1);
      if (
        [".", "[", ",", " ", "\n", "#", ":", "("].includes(getChar(exium))
      ) {
        break;
      }
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetSelectorPseudoElement,
      token,
      x,
    );
    // save trailing parenthese
    saveContextsTo(exium, allSubs, children);
    context.children.push(...children);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetSelectorIdCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  try {
    const char = getChar(exium);
    const prev = getPrev(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid: boolean = (char === "#" || prev === "#");
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      debuggPosition(exium, "\nSELECTOR ID");
      shift(exium, 1);
      if (
        [".", "[", ",", " ", "\n", "#", ":"].includes(getChar(exium))
      ) {
        break;
      }
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetSelectorId,
      token,
      x,
    );
    context.children.push(...children);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetSelectorAttributeCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\nSELECTOR ATTRIBUTE");
  try {
    const char = getChar(exium);
    const prev = getPrev(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid: boolean = (char === "[" || prev === "[" && char !== "]");
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    let isNamed = false;
    const children: ExiumContext[] = [];
    const related: ExiumContext[] = [];
    const allSubContexts: ContextReader[] = (opts?.contexts || [
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
    ]);
    const propertyOpts = {
      data: {
        allowedIdentifierChars: ["-", "_"],
      },
    };
    const describers: ContextReader[] = [
      readIdentifierCtx,
      readStyleSheetSelectorAttributeEqualCtx,
      readStyleSheetSelectorAttributeValueCtx,
    ];
    while (!isEOF(exium)) {
      debuggPosition(exium, "\nSELECTOR ATTRIBUTE");
      if (!isNamed) {
        saveContextsTo(exium, describers, related, propertyOpts);
        isNamed = !!related.find((context) =>
          context.type === ContextTypes.Identifier
        );
      }
      saveContextsTo(exium, allSubContexts, children);
      shift(exium, 1);
      if (["]"].includes(getPrev(exium)!)) {
        isClosed = true;
        break;
      }
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetSelectorAttribute,
      token,
      x,
    );
    context.children.push(...children);
    context.related.push(...related);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.StyleSheetAttributeNotClosed, exium.cursor, context);
    }
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetSelectorAttributeEqualCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\nSELECTOR ATTRIBUTE EQUAL START");
  try {
    const char = getChar(exium);
    const next = getNext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const supported = ["^", "$", "|", "*", "~"];
    const isValid: boolean = supported.includes(char) && next === "=" ||
      char === "=";
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    while (!isEOF(exium)) {
      debuggPosition(exium, "\nSELECTOR ATTRIBUTE EQUAL");
      if (getChar(exium) === "=") {
        shift(exium, 1);
        break;
      }
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetSelectorAttributeEqual,
      token,
      x,
    );
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
export function readSelectorCombinatorCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\nSELECTOR COMBINATOR START");
  try {
    const char = getChar(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const supported = ["+", ">", "~", "*"];
    const isValid: boolean = supported.includes(char);
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    shift(exium, 1);
    const contexts: { [k: string]: ContextTypes } = {
      "~": ContextTypes.StyleSheetSelectorCombinatorGeneralSibling,
      "*": ContextTypes.StyleSheetSelectorCombinatorAll,
      "+": ContextTypes.StyleSheetSelectorCombinatorAdjacentSibling,
      ">": ContextTypes.StyleSheetSelectorCombinatorChildSelector,
    };
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      contexts[token],
      token,
      x,
    );
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetSelectorAttributeValueCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\nSELECTOR ATTRIBUTE EQUAL START");
  try {
    const lastContext = getLastContext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid: boolean =
      lastContext.type === ContextTypes.StyleSheetSelectorAttributeEqual;
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    while (!isEOF(exium)) {
      debuggPosition(exium, "\nSELECTOR ATTRIBUTE EQUAL");
      if (getChar(exium) === "]") {
        break;
      }
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetSelectorAttributeValue,
      token,
      x,
    );
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
/**
 * should match with {...} and is recursive
 */
export function readStyleSheetPropertyListCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\nSTYLESHEET PROPERTY LIST START");
  try {
    const char = getChar(exium);
    const lastContext = getLastContext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const forced = !!opts?.data?.force_property_list_context;
    const isValid: boolean =
      lastContext.type === ContextTypes.StyleSheetSelectorList ||
      lastContext.type === ContextTypes.StyleSheetAtRule ||
      forced && char === "{";
    if ((char !== "{" || !isValid) || ["}"].includes(char)) return false;
    if (opts?.checkOnly) return true;
    shiftUntilEndOf(exium, "{");
    const result = true;
    let isClosed = false;
    const allSubContexts = opts?.contexts || [
      readMultiSpacesCtx,
      readSpaceCtx,
      readLineBreakCtx,
      readStylesheetEndCtx,
      readStyleSheetSpreadCtx,
      readStyleSheetDefaultAtRuleCtx,
      // nested rules
      readStyleSheetSelectorListCtx,
      readStyleSheetPropertyListCtx,
      readStylesheetPropertyCtx,
    ];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      debuggPosition(exium, "\nSTYLESHEET PROPERTY LIST");
      if (getChar(exium) === "}") {
        shift(exium, 1);
        isClosed = true;
        break;
      }
      saveStrictContextsTo(exium, allSubContexts, children);
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetPropertyList,
      token,
      x,
    );
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(Reason.StyleSheetPropertyListOpen, exium.cursor, context);
    }
    if (!forced) lastContext.related.push(context);
    debuggPosition(exium, "\nSTYLESHEET PROPERTY END");
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetSpreadCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\nSTYLESHEET RULE SPREAD START");
  try {
    const char = getChar(exium);
    const next = getNext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid = [
      char,
      next,
      source[x + 2],
    ].join("") === "...";
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    shiftUntilEndOf(exium, "...");
    const result = true;
    const related: ExiumContext[] = [];
    const subs: ContextReader[] = [
      readIdentifierCtx,
      readSemiColonCtx,
    ];
    const unexpected = opts?.unexpected || [
      readMultiSpacesCtx,
      readSpaceCtx,
      readLineBreakCtx,
    ];
    let isNamed = false;
    while (!isEOF(exium)) {
      debuggPosition(exium, "\nSTYLESHEET RULE SPREAD");
      saveStrictContextsTo(exium, subs, related);
      isNamed = !!related.find((context) =>
        context.type === ContextTypes.Identifier
      );
      if (
        related.find((context) => context.type === ContextTypes.SemiColon)
      ) {
        if (!isNamed) {
          exium.onError(
            Reason.StyleSheetRuleSpreadNameMissing,
            exium.cursor,
            getUnexpected(exium),
          );
        }
        break;
      }
      isValidChar(exium, unexpected);
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetRuleSpread,
      token,
      x,
    );
    context.related.push(...related);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}

export function readStylesheetPropertyCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\nSELECTOR PROPERTY START");
  try {
    const char = getChar(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const unsupported = [":", "@", " ", ";", "}", "\n", ".", "(", ")"];
    const isValid = !unsupported.includes(char);
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    const related: ExiumContext[] = [];
    const children: ExiumContext[] = [];
    const describers: ContextReader[] = [
      readIdentifierCtx,
      readDoublePointCtx,
      readStyleSheetPseudoPropertyCtx,
      readStylesheetPropertyValueCtx,
    ];
    const propertyOpts = {
      data: {
        allowedIdentifierChars: ["-", "_", "%"],
        allowDigit: true,
      },
    };
    const subs: ContextReader[] = [
      readSemiColonCtx,
    ];
    let isNamed = false;
    while (!isEOF(exium)) {
      debuggPosition(exium, "\nSELECTOR PROPERTY");
      if (!isNamed) {
        saveStrictContextsTo(exium, describers, related, propertyOpts);
        isNamed = Boolean(
          related.find((context) => context.type === ContextTypes.Identifier) &&
            related.find((context) =>
              context.type === ContextTypes.DoublePoint
            ) &&
            related.find((context) =>
              context.type === ContextTypes.StyleSheetPropertyValue
            ),
        );
      }
      saveContextsTo(exium, subs, children);
      if (
        children.find((context) => context.type === ContextTypes.SemiColon) ||
        ["}"].includes(getChar(exium)) ||
        isEndOfStylesheetProperty(exium)
      ) {
        break;
      }
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetProperty,
      token,
      x,
    );
    context.related.push(...related);
    context.children.push(...children);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStyleSheetPseudoPropertyCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\nSELECTOR PSEUDO PROPERTY START");
  try {
    const char = getChar(exium);
    const lastContext = getLastContext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid: boolean = !exium.isInPseudoProperty && (
      char === ":" &&
      lastContext.type === ContextTypes.DoublePoint
    );
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    exium.isInPseudoProperty = true;
    const result = true;
    let isClosed = false;
    const children: ExiumContext[] = [];
    const related: ExiumContext[] = [];
    const exitChars = [";", "\n", "}", ")"];
    const subs: ContextReader[] = [
      readBracesCtx,
    ];
    const describers: ContextReader[] = [
      readIdentifierCtx,
    ];
    const unexpected = opts?.unexpected || [
      readMultiSpacesCtx,
      readSpaceCtx,
      readLineBreakCtx,
    ];
    shiftUntilEndOf(exium, ":");
    saveStrictContextsTo(exium, describers, related, {
      data: {
        allowedIdentifierChars: ["-"],
      },
    });
    while (!isEOF(exium)) {
      isValidChar(exium, unexpected);
      debuggPosition(exium, "\nSELECTOR PSEUDO PROPERTY");
      saveStrictContextsTo(exium, subs, children, {
        data: {
          braces_contexts: [
            readStylesheetPropertyCtx,
          ],
        },
      });
      if (exitChars.includes(getChar(exium))) {
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetPseudoProperty,
      token,
      x,
    );
    context.children.push(...children);
    context.related.push(...related);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(
        Reason.StyleSheetRulePropertyValueNotClosed,
        exium.cursor,
        context,
      );
    }
    exium.isInPseudoProperty = false;
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStylesheetPropertyValueCtx(
  exium: Exium,
  opts?: ContextReaderOptions,
): boolean {
  debuggPosition(exium, "\nSELECTOR PROPERTY VALUE START");
  try {
    const char = getChar(exium);
    const lastContext = getLastContext(exium);
    const { x, } = exium.cursor;
    const { source } = exium;
    const isValid: boolean = lastContext.type === ContextTypes.DoublePoint &&
      char !== ":";
    if (!isValid) return isValid;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const exitChars = [";", "\n", "}"];
    const children: ExiumContext[] = [];
    const subs: ContextReader[] = [
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readStringDoubleQuoteCtx,
      readStringSingleQuoteCtx,
      readBracesCtx,
    ];
    while (!isEOF(exium)) {
      debuggPosition(exium, "\nSELECTOR PROPERTY VALUE");
      saveContextsTo(exium, subs, children, {
        data: {
          readArgumentCtx_starts_with: "|",
        },
        contexts: subs,
      });
      if (
        exitChars.includes(getChar(exium)) ||
        isEndOfStylesheetProperty(exium)
      ) {
        isClosed = true;
        break;
      }
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetPropertyValue,
      token,
      x,
    );
    context.children.push(...children);
    exium.currentContexts.push(context);
    if (!isClosed) {
      exium.onError(
        Reason.StyleSheetRulePropertyValueNotClosed,
        exium.cursor,
        context,
      );
    }
    return result;
  } catch (err) {
    throw err;
  }
}
export function readStylesheetEndCtx(exium: Exium): boolean | null {
  const nextPart = getNextPart(exium);
  const { source } = exium;
  const { x, } = exium.cursor;
  const reg = /^([\s\n]*?)(\<\/style)/i;
  const isValid: boolean = reg.test(nextPart);
  if (!isValid) return isValid;
  debuggPosition(exium, "\nSTYLESHEET END <==================");
  const match = nextPart.match(reg);
  if (match) {
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.StyleSheetEnd,
      token,
      x,
    );
    exium.currentContexts.push(context);
    return null;
  }
  return false;
}
