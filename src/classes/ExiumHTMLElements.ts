import { ExiumBase } from "./ExiumBase.ts";
import { ContextReader, ContextReaderOptions } from "../types/main.d.ts";
import { ExiumContext } from "./ExiumContext.ts";
import { ContextTypes } from "../enums/context-types.ts";
import { Reason } from "../enums/error-reason.ts";

/**
 * all ContextReaders to read HTMLElements.
 */
export class ExiumHTMLElements extends ExiumBase {
  constructor(...args: ConstructorParameters<typeof ExiumBase>) {
    super(...args);
  }
  /**
   * reads the textnodes that should match (style)> ... </(style)
   */
  protected get isEndOfStylesheet(): boolean {
    const { nextPart } = this;
    return this.isStartingNode() &&
      nextPart.startsWith("</style") ||
      this.isEOF ||
      /\s*(\<\/style)/i.test(nextPart);
  }
  /**
   * returns if the current character is starting a new element
   */
  isStartingNode(): boolean {
    return [
      "<",
    ].includes(this.char) &&
      (this.node_CTX(this.checkOnlyOptions) ||
        this.html_comment_CTX(this.checkOnlyOptions));
  }
  /**
   * reads the textnodes that should match (node)> ... <(node)
   */
  textnode_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char, prev, lastContext } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
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
        !this.import_statements_CTX(this.checkOnlyOptions) &&
        !this.node_CTX(this.checkOnlyOptions) &&
        !this.comment_CTX(this.checkOnlyOptions);
      if (!isValid || !this.nodeContextStarted) return false;
      if (opts?.checkOnly) return true;
      const result = true;
      const children: ExiumContext[] = [];
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_template_quote_eval_CTX,
      ];
      while (!this.isEOF) {
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.isStartingNode()) {
          break;
        }
        this.shift(1);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.TextNode, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      Object.assign(context.data, {
        parentNode: this.openTags[this.openTags.length - 1],
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * should output all the html in the document
   * any sequence starting with a < and that is followed by a character is a node
   */
  node_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char, next, nextPart } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (
        char !== "<" ||
        char === "<" && [" ", "<", "!"].includes(next!) ||
        next && /([^a-zA-Z0-9\[\/])/i.test(next)
      ) {
        return false;
      }
      this.debuggPosition('NODE CTX START');
      if (opts?.checkOnly) return true;
      this.shift(1);
      const result = true;
      let isClosed = false;
      let isAutoClosing = false;
      let isNamed = false;
      let isProto = false;
      let isTemplate = false;
      let isStyle = false;
      const isNodeClosing = nextPart.startsWith("</");
      const subcontextEvaluatedOnce: ContextReader[] = [
        this.identifier_CTX,
      ];
      const allSubContexts: ContextReader[] = isNodeClosing
        ? [
          this.line_break_CTX,
          this.space_CTX,
          this.multiple_spaces_CTX,
        ]
        : [
          this.line_break_CTX,
          this.space_CTX,
          this.multiple_spaces_CTX,
          this.flag_spread_CTX,
          // this.attribute_boolean_CTX,
          this.attributes_CTX,
          this.flag_CTX,
        ];
      const children: ExiumContext[] = [];
      const related: ExiumContext[] = [];
      /**
       * start rendering the nodes
       */
      while (!this.isEOF) {
        this.debuggPosition('NODE CTX');
        this.debugg({ isNodeClosing, isNamed })
        this.isValidChar(
          opts?.unexpected || [
            // shouldn't start a new node
            this.node_CTX,
            this.html_comment_CTX,
          ],
        );
        if (!isNamed) {
          subcontextEvaluatedOnce.forEach((reader) => {
            const recognized = reader.apply(this, []);
            if (recognized) {
              const context = this.lastContext;
              related.push(context);
              isNamed = context.type === ContextTypes.Identifier;
              isProto = isNamed && context.source === "proto";
              isTemplate = isNamed && context.source === "template";
              isStyle = isNamed && context.source === "style";
            }
          });
        }
        this.saveContextsTo(allSubContexts, children);
        /**
         * for any closing tag
         * should ensure that after the tagname
         * there's nothing else than spaces, line breaks, or >
         */
        if (isNodeClosing
          && isNamed
          && !([" ", ">", "\n"].includes(this.char))) {
          const token = source.slice(x, this.cursor.x);
          const context = new ExiumContext(ContextTypes.Unexpected, token, {
            start: x,
            end: this.cursor.x,
            line,
            column,
          });
          this.onError(Reason.UnexpectedToken, this.cursor, context);
        }
        if (this.char === "<") {
          break;
        } else if (this.char === ">") {
          this.shift(1);
          isClosed = true;
          isAutoClosing = this.previousPart.endsWith("/>");
          break;
        }
        this.shift(1);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        isNodeClosing ? ContextTypes.NodeClosing : ContextTypes.Node,
        token,
        {
          start: x,
          end: this.cursor.x,
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
        parentNode: this.openTags[this.openTags.length - 1],
      });
      this.currentContexts.push(context);
      // start resolving open and closing tags
      if (!isAutoClosing) {
        if (
          isClosed &&
          !isNodeClosing
        ) {
          this.openTags.push(context);
        } else if (
          isClosed &&
          isNodeClosing
        ) {
          const openTag = this.openTags
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
            this.onError(
              Reason.HTMLClosingTagWithoutOpening,
              this.cursor,
              context,
            );
          } else {
            const index = this.openTags.indexOf(openTag);
            this.openTags.splice(index, 1);
            // save the closing tag
            openTag.related.push(context);
            openTag.data.closed = true;
          }
        }
      }
      if (!isClosed) {
        this.onError(Reason.HTMLTagNotFinish, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reads comments
   */
  html_comment_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
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
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.html_comment_CTX,
          ],
        );
        if (
          this.char === ">" && this.prev === "-" &&
          source[this.cursor.x - 2] === "-"
        ) {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.HTMLComment, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.HTMLCommentOpen, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reads the flags after the tag name
   */
  flag_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
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
        this.curly_brackets_CTX,
        this.argument_CTX,
        this.braces_CTX,
      ];
      const exitChars = [" ", ">", "\n", "/"];
      const argumentChar = ':';
      while (!this.isEOF) {
        if (!isNamed) {
          isNamed = Boolean(
            this.identifier_CTX({
              data: {
                allowedIdentifierChars: ['-'],
              }
            }) &&
            related.push(this.lastContext),
          );
        }
        // the name of the flag is retrieved
        // there's no Equal Token found
        // isStructure isn't set
        if (this.char === "=") {
          isStructure = false;
          usingStructure = false;
        }
        this.saveContextsTo(allSubContexts, children, {
          data: {
            argument_CTX_starts_with: argumentChar
          }
        });
        if (isNamed && usingStructure && !isStructure) {
          isStructure = Boolean(children.find((context) => context.type === ContextTypes.Braces));
        }
        if (exitChars.includes(this.char)) {
          isClosed = true;
          break;
        }
        if (this.char !== argumentChar) {
          this.shift(1);
        }
        this.isValidChar(opts?.unexpected);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(isStructure ?
        ContextTypes.FlagStruct :
        ContextTypes.Flag,
        token,
      {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      Object.assign(context.data, {
        isStructure,
      })
      context.children.push(...children);
      context.related.push(...related);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.OgoneFlagNotFinish, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  flag_spread_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (char !== "{" || !/^\{(\s*)(\.){3}/i.test(this.nextPart)) return false;
      if (opts?.checkOnly) return true;
      this.shift(1);
      const result = true;
      let isClosed = false;
      const children: ExiumContext[] = [];
      const readers: ContextReader[] = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.array_CTX,
        this.curly_brackets_CTX,
      ];
      while (!this.isEOF) {
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(readers, children);
        if (["}"].includes(this.char)) {
          this.shift(1);
          isClosed = true;
          break;
        }
        this.shift(1);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.FlagSpread, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.OgoneSpreadFlagNotClosed, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reads the flags after the tag name
   */
  attributes_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (char &&
        !(/[a-zA-Z0-9\$\_]/i.test(char))
      ) {
        return false;
      }
      this.debuggPosition('ATTRIBUTES CTX START');
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      let isNamed = false;
      let isBoolean = true;
      let isProp = false;
      const children: ExiumContext[] = [];
      const related: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
        this.string_template_quote_CTX,
        this.curly_brackets_CTX,
        this.attribute_unquoted_CTX,
      ];
      if (!isNamed) {
        isNamed = Boolean(
          this.identifier_CTX() &&
          related.push(this.lastContext),
        );
      }
      const exitChars = [" ", ">", "\n", "/"];
      while (!this.isEOF) {
        this.debuggPosition('ATTRIBUTES CTX');
        this.isValidChar(opts?.unexpected);
        if (isBoolean) {
          isBoolean = this.char !== '=';
        }
        this.saveContextsTo(allSubContexts, children);
        if (!isProp && !isBoolean) {
          isProp = Boolean(children.find((context) => context.type === ContextTypes.CurlyBrackets))
        }
        if (exitChars.includes(this.char)) {
          isClosed = true;
          break;
        }
        this.shift(1);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        isBoolean ?
          ContextTypes.AttributeBoolean :
          isProp ?
            ContextTypes.AttributeProperty :
            ContextTypes.Attribute,
        token,
        {
          start: x,
          end: this.cursor.x,
          line,
          column,
        }
      );
      context.children.push(...children);
      context.related.push(...related);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.HTMLAttributeNotClosed, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  attribute_unquoted_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { prev } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (prev !== "=") return false;
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      const children: ExiumContext[] = [];
      const exitChars = [" ", ">", "\n", "/"];
      while (!this.isEOF) {
        this.isValidChar(
          opts?.unexpected || [
            this.array_CTX,
            this.braces_CTX,
            this.curly_brackets_CTX,
          ],
        );
        if (exitChars.includes(this.char)) {
          isClosed = true;
          break;
        }
        this.shift(1);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.AttributeValueUnquoted,
        token,
        {
          start: x,
          end: this.cursor.x,
          line,
          column,
        },
      );
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(
          Reason.HTMLAttributeValueUnquotedNotClosed,
          this.cursor,
          context,
        );
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * support for Deeper Language specififation
   * this context allows to define a component with the following pattern:
   * component <ComponentName>
   *   ...
   * </ComponentName>
   */
  component_CTX(opts?: ContextReaderOptions): boolean | null {
    try {
      const isValid = this.identifier_CTX(this.checkOnlyOptions);
      if (!isValid) return false;
      // save the identifier
      const recognized = this.identifier_CTX();
      if (!recognized) return false;
      const { lastContext } = this;
      if (!this.supportedComponentTypes.includes(lastContext.source)) return false;
      if (opts?.checkOnly) return true;
      const { line, column, x } = this.cursor;
      const { source } = this;
      lastContext.type = ContextTypes.ComponentTypeStatement;
      let isNodeDefined = false;
      const allSubContexts: ContextReader[] = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.textnode_CTX,
        this.node_CTX,
        this.node_CTX,
      ];
      const children: ExiumContext[] = [];
      while(!this.isEOF) {
        this.saveContextsTo(allSubContexts, children);
        const node = children.find((context) =>
          // node with a closing tag
          (context.type === ContextTypes.Node
            && context.related.find((child) => child.type === ContextTypes.NodeClosing)
            && !context.data.parentNode
            && !context.data.isAutoClosing)
          // or an auto closing tag
        || (context.type === ContextTypes.Node
            && context.data.isAutoClosing
            && !context.data.parentNode));
        if (node) {
          isNodeDefined = true;
          break;
        }
        this.shift(1);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.ComponentDeclaration, token, {
        line,
        column,
        start: x,
        end: this.cursor.x,
      });
      context.children.push(...children);
      // declare type
      Object.assign(context.data, {
        type: lastContext.source,
      })
      if (!isNodeDefined) {
        this.onError(Reason.ComponentDeclarationNodeMissing, this.cursor, context);
      }
      return true;
    } catch (err) {
      throw err;
    }
  }
}
