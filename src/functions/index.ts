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
import { SupportedStyleSheetCharset } from "../supports.ts";

const importRegExp = /^import\b/i;
const importComponentRegExp = /^import\s+component\b/i;
const asRegExp = /^\s+as/i;

/**
 * support export statement for bio language
 */
export function export_component_statements_CTX(exium: Exium): boolean | null {
  try {
    const isValid = identifier_CTX(exium, exium.checkOnlyOptions);
    if (!isValid) return false;
    const recognized = identifier_CTX(exium, );
    if (!recognized) return false;
    const lastContext = getLastContext(exium);
    const { x, line, column } = exium.cursor;
    if (lastContext.source !== "export") {
      shift(exium, -lastContext.source.length);
      return false;
    }
    let isClosed = false;
    const allSubs: ContextReader[] = [
      multiple_spaces_CTX,
      space_CTX,
      component_CTX,
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
      if (exium.isCharSpacing) {
        break;
      }
    }
    const context = new ExiumContext(
      ContextTypes.ExportStatement,
      lastContext.source,
      {
        line,
        column,
        start: x,
        end: exium.cursor.x,
      },
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
export function component_CTX(exium: Exium, opts?: ContextReaderOptions): boolean | null {
  try {
    const { line, column, x } = exium.cursor;
    const isValid = identifier_CTX(exium, exium.checkOnlyOptions);
    if (!isValid) return false;
    // save the identifier
    const recognized = identifier_CTX(exium, );
    if (!recognized) return false;
    const lastContext = getLastContext(exium);
    if (!exium.supportedComponentTypes.includes(lastContext.source)) {
      return false;
    }
    if (opts?.checkOnly) return true;
    const { source } = exium;
    lastContext.type = ContextTypes.ComponentTypeStatement;
    let isNodeDefined = false;
    const allSubContexts: ContextReader[] = [
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      textnode_CTX,
      node_CTX,
      node_CTX,
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
      {
        line,
        column,
        start: x,
        end: exium.cursor.x,
      },
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
export function attributes_modifiers_CTX(exium: Exium, opts?: ContextReaderOptions): boolean | null {
  try {
    const { char } = exium;
    const { x, line, column } = exium.cursor;
    const isValid = char === "@";
    if (!isValid) return false;
    if (opts?.checkOnly) return true;
    shift(exium, 1);
    if (!identifier_CTX(exium, exium.checkOnlyOptions)) {
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
      identifier_CTX,
      argument_CTX,
      array_CTX,
    ];
    const allSubContexts: ContextReader[] = [
      multiple_spaces_CTX,
      space_CTX,
      line_break_CTX,
      attributes_CTX,
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
        if (exitChars.includes(exium.char) || exium.isCharSpacing) {
          break;
        }
      }
      isValidChar(exium, opts?.unexpected);
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.AttributeModifier, token, {
      line,
      column,
      start: x,
      end: exium.cursor.x,
    });
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
export function attribute_unquoted_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { prev } = exium;
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (prev !== "=") return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const children: ExiumContext[] = [];
    const exitChars = [" ", ">", "\n", "/"];
    while (!isEOF(exium)) {
      isValidChar(exium,
        opts?.unexpected || [
          array_CTX,
          braces_CTX,
          curly_brackets_CTX,
        ],
      );
      if (exitChars.includes(exium.char)) {
        isClosed = true;
        break;
      }
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      ContextTypes.AttributeValueUnquoted,
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
export function attributes_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char } = exium;
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (
      char &&
      !(/[a-zA-Z0-9\$\_]/i.test(char))
    ) {
      return false;
    }
    exium.debuggPosition("ATTRIBUTES CTX START");
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    let isNamed = false;
    let isBoolean = true;
    let isProp = false;
    const children: ExiumContext[] = [];
    const related: ExiumContext[] = [];
    const allSubContexts: ContextReader[] = [
      string_double_quote_CTX,
      string_single_quote_CTX,
      string_template_quote_CTX,
      curly_brackets_CTX,
      attribute_unquoted_CTX,
    ];
    if (!isNamed) {
      isNamed = Boolean(
        identifier_CTX(exium, ) &&
        related.push(getLastContext(exium)),
      );
    }
    const exitChars = [" ", ">", "\n", "/"];
    while (!isEOF(exium)) {
      exium.debuggPosition("ATTRIBUTES CTX");
      isValidChar(exium, opts?.unexpected);
      if (isBoolean) {
        isBoolean = exium.char !== "=";
      }
      saveContextsTo(exium, allSubContexts, children);
      if (!isProp && !isBoolean) {
        isProp = Boolean(
          children.find((context) =>
            context.type === ContextTypes.CurlyBrackets
          ),
        );
      }
      if (exitChars.includes(exium.char)) {
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
      {
        start: x,
        end: exium.cursor.x,
        line,
        column,
      },
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

export function flag_spread_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char } = exium;
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (char !== "{" || !/^\{(\s*)(\.){3}/i.test(exium.nextPart)) return false;
    if (opts?.checkOnly) return true;
    shift(exium, 1);
    const result = true;
    let isClosed = false;
    const children: ExiumContext[] = [];
    const readers: ContextReader[] = [
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      array_CTX,
      curly_brackets_CTX,
    ];
    while (!isEOF(exium)) {
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, readers, children);
      if (["}"].includes(exium.char)) {
        shift(exium, 1);
        isClosed = true;
        break;
      }
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.FlagSpread, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
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
export function flag_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char, next } = exium;
    const { x, line, column } = exium.cursor;
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
      curly_brackets_CTX,
      argument_CTX,
      braces_CTX,
    ];
    const exitChars = [" ", ">", "\n", "/"];
    const argumentChar = ":";
    while (!isEOF(exium)) {
      if (!isNamed) {
        isNamed = Boolean(
          identifier_CTX(exium, {
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
      if (exium.char === "=") {
        isStructure = false;
        usingStructure = false;
      }
      saveContextsTo(exium, allSubContexts, children, {
        data: {
          argument_CTX_starts_with: argumentChar,
        },
      });
      if (isNamed && usingStructure && !isStructure) {
        isStructure = Boolean(
          children.find((context) => context.type === ContextTypes.Braces),
        );
      }
      if (exitChars.includes(exium.char)) {
        isClosed = true;
        break;
      }
      if (exium.char !== argumentChar) {
        shift(exium, 1);
      }
      isValidChar(exium, opts?.unexpected);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      isStructure ? ContextTypes.FlagStruct : ContextTypes.Flag,
      token,
      {
        start: x,
        end: exium.cursor.x,
        line,
        column,
      },
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
export function html_comment_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char, next } = exium;
    const { x, line, column } = exium.cursor;
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
      isValidChar(exium,
        opts?.unexpected || [
          html_comment_CTX,
        ],
      );
      if (
        exium.char === ">" && exium.prev === "-" &&
        source[exium.cursor.x - 2] === "-"
      ) {
        shift(exium, 1);
        isClosed = true;
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.HTMLComment, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
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
export function node_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char, next, nextPart } = exium;
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (
      char !== "<" ||
      char === "<" && [" ", "<", "!"].includes(next!) ||
      next && /([^a-zA-Z0-9\[\/])/i.test(next)
    ) {
      return false;
    }
    exium.debuggPosition("NODE CTX START");
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
      identifier_CTX,
    ];
    const allSubContexts: ContextReader[] = isNodeClosing
      ? [
        line_break_CTX,
        space_CTX,
        multiple_spaces_CTX,
      ]
      : [
        line_break_CTX,
        space_CTX,
        multiple_spaces_CTX,
        flag_spread_CTX,
        attributes_CTX,
        attributes_modifiers_CTX,
        flag_CTX,
      ];
    const children: ExiumContext[] = [];
    const related: ExiumContext[] = [];
    /**
     * start rendering the nodes
     */
    while (!isEOF(exium)) {
      exium.debuggPosition("NODE CTX");
      isValidChar(exium,
        opts?.unexpected || [
          // shouldn't start a new node
          node_CTX,
          html_comment_CTX,
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
        !([" ", ">", "\n"].includes(exium.char))
      ) {
        const token = source.slice(x, exium.cursor.x);
        const context = new ExiumContext(ContextTypes.Unexpected, token, {
          start: x,
          end: exium.cursor.x,
          line,
          column,
        });
        exium.onError(Reason.UnexpectedToken, exium.cursor, context);
      }
      if (exium.char === "<") {
        break;
      } else if (exium.char === ">") {
        shift(exium, 1);
        isClosed = true;
        isAutoClosing = exium.previousPart.endsWith("/>");
        break;
      }
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(
      isNodeClosing ? ContextTypes.NodeClosing : ContextTypes.Node,
      token,
      {
        start: x,
        end: exium.cursor.x,
        line,
        column,
      },
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
export function textnode_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { char, prev } = exium;
    const lastContext = getLastContext(exium);
    const { x, line, column } = exium.cursor;
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
      !import_statements_CTX(exium, exium.checkOnlyOptions) &&
      !node_CTX(exium, exium.checkOnlyOptions) &&
      !comment_CTX(exium, exium.checkOnlyOptions);
    if (!isValid || !exium.nodeContextStarted) return false;
    if (opts?.checkOnly) return true;
    const result = true;
    const children: ExiumContext[] = [];
    const allSubContexts = [
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      string_template_quote_eval_CTX,
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
    const context = new ExiumContext(ContextTypes.TextNode, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
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
  ].includes(exium.char) &&
    (node_CTX(exium, exium.checkOnlyOptions) ||
      html_comment_CTX(exium, exium.checkOnlyOptions));
}

/**
 * reads the textnodes that should match (style)> ... </(style)
 */
export function isEndOfStylesheet(exium: Exium): boolean {
  const { nextPart } = exium;
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
/**
 * @returns true if the argument_CTx is valid for the current char
 * @usage
 * ```
 * exium.argument_CTX({
 *   data: {
 *     argument_CTX_starts_with: '&'
 *   }
 * }); // boolean
 * ```
 */
export function argument_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const {
      char,
      source,
    } = exium;
    const {
      line,
      column,
      x,
    } = exium.cursor;
    const startingChar =
      opts && opts.data?.argument_CTX_starts_with as string || ":";
    const isValid = char === startingChar;
    if (!isValid) return false;
    shiftUntilEndOf(exium, startingChar);
    const related: ExiumContext[] = [];
    const children: ExiumContext[] = [];
    while (!isEOF(exium)) {
      isValidChar(exium, opts && opts?.unexpected);
      Boolean(
        identifier_CTX(exium, {
          data: {
            allowedIdentifierChars: ["-"],
          },
        }) &&
        related.push(getLastContext(exium)),
      );
      if (exium.isCharPuntuation) break;
      shift(exium, 1);
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.Argument, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
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
export function import_statements_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { nextPart } = exium;
    const { x, line, column } = exium.cursor;
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
    shiftUntilEndOf(exium, 'import');
    if (isComponent) {
      saveStrictContextsTo(
        exium,
        [
          multiple_spaces_CTX,
          space_CTX,
        ], children);
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
          multiple_spaces_CTX,
          space_CTX,
          identifier_asterix_CTX,
          identifier_list_CTX,
          identifier_CTX,
          multiple_spaces_CTX,
          coma_CTX,
          space_CTX,
        ], children, isComponent ? undefined : {
          data: {
            identifier_allow_alias: true,
          }
        });
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
      multiple_spaces_CTX,
      space_CTX,
      string_double_quote_CTX,
      string_single_quote_CTX,
      semicolon_CTX,
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
    const context = new ExiumContext(ContextTypes.ImportStatement, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
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
export function export_statements_CTX(exium: Exium): boolean | null {
  try {
    const isValid = identifier_CTX(exium, exium.checkOnlyOptions);
    if (!isValid) return false;
    const recognized = identifier_CTX(exium,);
    if (!recognized) return false;
    const lastContext = getLastContext(exium);
    const { x, line, column } = exium.cursor;
    if (lastContext.source !== "export") {
      shift(exium, -lastContext.source.length);
      return false;
    }
    const context = new ExiumContext(
      ContextTypes.ExportStatement,
      lastContext.source,
      {
        line,
        column,
        start: x,
        end: exium.cursor.x,
      },
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
export function import_ambient_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { x, line, column } = exium.cursor;
    const { source } = exium;
    if (!/^import\s*(["'])(.*?)(\1)/i.test(exium.nextPart)) return false;
    if (opts?.checkOnly) return true;
    const result = true;
    let isClosed = false;
    const related: ExiumContext[] = [];
    /**
     * expected next contexts
     */
    const nextContexts: ContextReader[] = [
      multiple_spaces_CTX,
      space_CTX,
      string_double_quote_CTX,
      string_single_quote_CTX,
      semicolon_CTX,
    ];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      if (exium.char === " " || ['"', "'"].includes(exium.char)) {
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
    const context = new ExiumContext(ContextTypes.ImportAmbient, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
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
 export function protocol_CTX(exium: Exium, opts?: ContextReaderOptions): boolean {
  try {
    const { x, line, column } = exium.cursor;
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
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
    ];
    while (!isEOF(exium)) {
      shift(exium, 1);
      isValidChar(exium, opts?.unexpected);
      saveContextsTo(exium, allSubContexts, children);
      if (isStartingNode(exium) && exium.nextPart.startsWith("</proto")) {
        break;
      }
    }
    const token = source.slice(x, exium.cursor.x);
    const context = new ExiumContext(ContextTypes.Protocol, token, {
      start: x,
      end: exium.cursor.x,
      line,
      column,
    });
    context.children.push(...children);
    exium.currentContexts.push(context);
    return result;
  } catch (err) {
    throw err;
  }
}