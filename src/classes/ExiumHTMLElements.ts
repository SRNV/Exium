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
      const { char, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (
        char !== "<" ||
        char === "<" && [" ", "<", "!"].includes(next!) ||
        next && /([^a-zA-Z0-9\[\/])/i.test(next)
      ) {
        return false;
      }
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      let isAutoClosing = false;
      let isNamed = false;
      let isProto = false;
      let isTemplate = false;
      let isStyle = false;
      const isNodeClosing = this.nextPart.startsWith("</");
      const subcontextEvaluatedOnce: ContextReader[] = [
        this.node_name_CTX,
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
          this.attribute_boolean_CTX,
          this.attributes_CTX,
          this.flag_CTX,
        ];
      const children: ExiumContext[] = [];
      const related: ExiumContext[] = [];
      /**
       * start rendering the nodes
       */
      while (!this.isEOF) {
        /**
         * for any closing tag
         * should ensure that after the tagname
         * there's nothing else than spaces, line breaks, or >
         */
        if (isNodeClosing && isNamed) {
          if (!([" ", ">", "\n"].includes(this.char))) {
            const token = source.slice(x, this.cursor.x);
            const context = new ExiumContext(ContextTypes.Unexpected, token, {
              start: x,
              end: this.cursor.x,
              line,
              column,
            });
            this.onError(Reason.UnexpectedToken, this.cursor, context);
          }
        }
        this.shift(1);
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
              isNamed = context.type === ContextTypes.NodeName;
              isProto = isNamed && context.source === "proto";
              isTemplate = isNamed && context.source === "template";
              isStyle = isNamed && context.source === "style";
            }
          });
        }
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "<") {
          break;
        } else if (this.char === ">") {
          this.shift(1);
          isClosed = true;
          isAutoClosing = this.previousPart.endsWith("/>");
          break;
        }
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
                related.type === ContextTypes.NodeName
              );
              const targetName = context.related.find((related) =>
                related.type === ContextTypes.NodeName
              );
              return name &&
                targetName &&
                !nodeContext.data.closed &&
                name.type === ContextTypes.NodeName &&
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
   * reads the tagname right after the <
   */
  node_name_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if ([" ", "[", "!", "-", "\n", "/"].includes(char)) return false;
      if (opts?.checkOnly) return true;
      const result = true;
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (
          [
            " ",
            "/",
            "<",
            "\n",
            ">",
          ].includes(this.char)
        ) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.NodeName, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reads the tagname right after the <
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
   * should read all ambient import statements
   */
  import_ambient_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (!/^import\s*(["'])(.*?)(\1)/i.test(this.nextPart)) return false;
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      const related: ExiumContext[] = [];
      /**
       * expected next contexts
       */
      const nextContexts: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
        this.semicolon_CTX,
      ];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (this.char === " " || ['"', "'"].includes(this.char)) {
          break;
        }
      }
      nextContexts.forEach((reader: ContextReader, i: number, arr) => {
        const recognized = reader.apply(this, []);
        if (recognized) {
          related.push(this.lastContext);
          delete arr[i];
        }
      });
      isClosed = Boolean(
        related.find((context) =>
          [
            ContextTypes.StringDoubleQuote,
            ContextTypes.StringSingleQuote,
          ].includes(context.type)
        ) &&
          related.find((context) =>
            [
              ContextTypes.SemiColon,
            ].includes(context.type)
          ),
      );
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.ImportAmbient, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });

      context.related.push(...related);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.ImportAmbientStringMissing, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * should read all import statements
   */
  // TODO create contexts for the tokens between import and from
  import_statements_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const sequence = char +
        next +
        source[x + 2] +
        source[x + 3] +
        source[x + 4] +
        source[x + 5] +
        source[x + 6];
      if (
        char !== "i" ||
        sequence !== "import "
      ) {
        return false;
      }
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      const related: ExiumContext[] = [];
      const otherImportStatements: ContextReader[] = [
        this.import_ambient_CTX,
      ];
      /**
       * expected next contexts
       */
      const nextContexts: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
        this.semicolon_CTX,
      ];
      otherImportStatements.forEach((reader) => reader.apply(this, []));
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        const sequenceEnd = this.char +
          this.next +
          source[this.cursor.x + 2] +
          source[this.cursor.x + 3];
        if (sequenceEnd === "from") {
          this.cursor.x += +4;
          this.cursor.column += +4;
          break;
        }
      }
      nextContexts.forEach((reader: ContextReader, i: number, arr) => {
        const recognized = reader.apply(this, []);
        if (recognized) {
          related.push(this.lastContext);
          delete arr[i];
        }
      });
      isClosed = Boolean(
        related.find((context) =>
          [
            ContextTypes.StringSingleQuote,
            ContextTypes.StringDoubleQuote,
          ].includes(context.type)
        ) &&
          related.find((context) =>
            [
              ContextTypes.SemiColon,
            ].includes(context.type)
          ),
      );
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.ImportStatement, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.related.push(...related);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.ImportStatementNotFinish, this.cursor, context);
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
      const children: ExiumContext[] = [];
      const related: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.curly_braces_CTX,
        this.braces_CTX,
      ];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (!isNamed) {
          isNamed = Boolean(
            this.flag_name_CTX() &&
              related.push(this.lastContext),
          );
        }
        this.saveContextsTo(allSubContexts, children);
        if ([" ", ">", "\n"].includes(this.char)) {
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.Flag, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
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
  flag_name_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (char === "-") return false;
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.array_CTX,
            this.braces_CTX,
            this.curly_braces_CTX,
          ],
        );
        if ([" ", ">", "=", "\n"].includes(this.char)) {
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);

      const context = new ExiumContext(ContextTypes.FlagName, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
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
      const result = true;
      let isClosed = false;
      const children: ExiumContext[] = [];
      const readers: ContextReader[] = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.array_CTX,
        this.curly_braces_CTX,
      ];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(readers, children);
        if (["}"].includes(this.char)) {
          this.shift(1);
          isClosed = true;
          break;
        }
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
      const { char, prev } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (
        prev &&
          prev !== " " ||
        char &&
          !(/[a-zA-Z0-9\$\_]/i.test(char))
      ) {
        return false;
      }
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      let isNamed = false;
      const children: ExiumContext[] = [];
      const related: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
        this.string_template_quote_CTX,
        this.braces_CTX,
        this.attribute_unquoted_CTX,
      ];
      if (!isNamed) {
        isNamed = Boolean(
          this.attribute_name_CTX() &&
            related.push(this.lastContext),
        );
      }
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if ([" ", ">", "\n"].includes(this.char)) {
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.Attribute, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
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
  attribute_boolean_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (char === "-" || !/^([^\s=\<\>\/]+?)(\s|\n|\>)/i.test(this.nextPart)) {
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
            this.array_CTX,
            this.braces_CTX,
            this.curly_braces_CTX,
          ],
        );
        if ([" ", "/", ">", "<", "\n"].includes(this.next!)) {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.AttributeBoolean, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(
          Reason.HTMLBooleanAttributeNotClosed,
          this.cursor,
          context,
        );
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  attribute_name_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (char === "-") return false;
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.array_CTX,
            this.braces_CTX,
            this.curly_braces_CTX,
          ],
        );
        if ([" ", "/", ">", "=", "\n"].includes(this.char)) {
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.AttributeName, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.HTMLAttributeNameNotClosed, this.cursor, context);
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
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.array_CTX,
            this.braces_CTX,
            this.curly_braces_CTX,
          ],
        );
        if ([" ", ">", "\n"].includes(this.char)) {
          isClosed = true;
          break;
        }
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
}
