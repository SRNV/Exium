import { ExiumProtocol } from "./ExiumProtocol.ts";
import {
  ContextReader,
  ContextReaderOptions,
  CursorDescriber,
  OgooneLexerParseOptions,
} from "../types/main.d.ts";
import { ExiumContext } from "./ExiumContext.ts";
import { ContextTypes } from "../enums/context-types.ts";
import { Reason } from "../enums/error-reason.ts";
import { SupportedStyleSheetCharset } from "../supports.ts";

/**
 * all ContextReaders to read stylesheets
 */
export class ExiumStyleSheet extends ExiumProtocol {
  constructor(...args: ConstructorParameters<typeof ExiumProtocol>) {
    super(...args);
  }
  stylesheet_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const lastIsAStyleNode = this.currentContexts.find((context) =>
        context.type === ContextTypes.Node &&
        context.related.find((node) =>
          node.type === ContextTypes.NodeName &&
          node.source === "style"
        ) &&
        !context.related.find((node) => node.type === ContextTypes.NodeClosing)
      );
      const isValid = !!lastIsAStyleNode || this.isParsingStylesheet;
      if (!isValid) return false;
      if (opts?.checkOnly) return !this.isEndOfStylesheet();
      let result = true;
      const children: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.comment_block_CTX,
        this.comment_CTX,
        // at-rules specs
        // last should be the default at rule
        this.stylesheet_charset_at_rule_CTX,
        this.stylesheet_const_at_rule_CTX,
        this.stylesheet_export_at_rule_CTX,
        this.stylesheet_default_at_rule_CTX,
        this.stylesheet_selector_list_CTX,
        // TODO implement property list
        this.curly_braces_CTX,
      ];
      this.saveContextsTo(allSubContexts, children);
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveStrictContextsTo(allSubContexts, children);
        if (this.isEndOfStylesheet()) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.StyleSheet, token, {
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
   * reader for the at-rule @charset
   * @charset should be followed by a string (double or single);
   */
  stylesheet_charset_at_rule_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const sequence = [
        char, // c
        next, // h
        source[x + 2], // a
        source[x + 3], // r
        source[x + 4], // s
        source[x + 5], // e
        source[x + 6], // t
      ].join("");
      const isValid = Boolean(
        prev === "@" &&
          sequence === "charset",
      );
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
      ];
      // retrieve the atrule name
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === ";") {
          break;
        }
      }
      // check if the at rule is ending correctly
      const isClosedBySemicolon = this.semicolon_CTX();
      isClosed = Boolean(
        isClosedBySemicolon && children.length && children.find((context) =>
          [
            ContextTypes.StringSingleQuote,
            ContextTypes.StringDoubleQuote,
          ].includes(context.type)
        ),
      );
      // create and finish the current context
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetAtRuleCharset,
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
          this.onError(
            Reason.StyleSheetAtRuleCharsetInvalid,
            this.cursor,
            context,
          );
        }
      } else {
        this.onError(
          Reason.StyleSheetAtRuleCharsetStringIsMissing,
          this.cursor,
          context,
        );
      }
      if (!isClosed) {
        this.onError(
          Reason.StyleSheetAtRuleCharsetNotFinish,
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
   * reader for the at-rule @export
   * should retrieve all the exportable token
   */
  stylesheet_export_at_rule_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const sequence = [
        char, // e
        next, // x
        source[x + 2], // p
        source[x + 3], // o
        source[x + 4], // r
        source[x + 5], // t
        source[x + 6], // space
      ].join("");
      const isValid = Boolean(
        prev === "@" &&
          sequence === "export ",
      );
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_const_at_rule_CTX,
      ];
      // shift until end of export
      const shifted = this.shiftUntilEndOf("export");
      if (!shifted) return false;
      // retrieve the atrule name
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveStrictContextsTo(allSubContexts, children, {
          data: {
            isExportStatement: true,
          },
        });
        if (this.char === ";" || this.prev === ";") {
          break;
        }
      }
      // create and finish the current context
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetAtRuleExport,
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
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * reader for the at-rule @const
   * the rule should follow this pattern
   * @const <name> : <type> = <value>;
   *
   * where name type and value are required
   */
  stylesheet_const_at_rule_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const sequence = [
        char, // c
        next, // o
        source[x + 2], // n
        source[x + 3], // s
        source[x + 4], // t
        source[x + 5], // space
      ].join("");
      const isValid = Boolean(
        (prev === "@" || opts?.data?.isExportStatement) &&
          sequence === "const ",
      );
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isNamed = false;
      const children: ExiumContext[] = [];
      const related: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
      ];
      const describers: ContextReader[] = [
        this.stylesheet_const_at_rule_name_CTX,
        this.stylesheet_type_assignment_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_const_at_rule_equal_CTX,
      ];
      //  shift cursor until the end of the const
      const shifted = this.shiftUntilEndOf("const");
      if (!shifted) return false;
      // retrieve the atrule name
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (!isNamed) {
          // retrieve name
          this.saveContextsTo(describers, related, {
            data: {
              // force type assignment
              force_type_assignment_context: true,
            },
          });
          isNamed = Boolean(
            related.find((context) =>
              context.type === ContextTypes.StyleSheetAtRuleConstName
            ),
          );
        } else {
          this.saveContextsTo(allSubContexts, children);
        }
        if (this.char === ";") {
          break;
        }
      }
      // create and finish the current context
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetAtRuleConst,
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
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_const_at_rule_name_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { nextPart } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = /^[a-zA-Z]/i.test(nextPart);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      // retrieve the atrule name
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (/[^a-zA-Z0-9_]/i.test(this.char)) {
          break;
        }
      }
      // create and finish the current context
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetAtRuleConstName,
        token,
        {
          start: x,
          end: this.cursor.x,
          line,
          column,
        },
      );
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_const_at_rule_equal_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = char === "=" && next !== "=";
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      const subs: ContextReader[] = [];
      // retrieve the atrule name
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(subs, children);
        if (this.semicolon_CTX() || this.next === ";") {
          break;
        }
      }
      // create and finish the current context
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetAtRuleConstEqual,
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
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_default_at_rule_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = Boolean(
        prev === "@" &&
          char !== " ",
      );
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isTyped = false;
      let isClosed = false;
      const children: ExiumContext[] = [];
      const describers: ContextReader[] = [
        this.stylesheet_at_rule_name_CTX,
        this.stylesheet_type_assignment_CTX,
      ];
      const allSubContexts: ContextReader[] = [];
      const related: ExiumContext[] = [];
      this.saveContextsTo(describers, related);
      isTyped = !!related.find((context) =>
        context.type === ContextTypes.StyleSheetTypeAssignment
      );
      // retrieve the atrule name
      const atRuleName = related.find((context) =>
        context.type === ContextTypes.StyleSheetAtRuleName
      );
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (
          this.char === "{" ||
          this.char === ";" ||
          this.isEndOfStylesheet()
        ) {
          break;
        }
      }
      /**
       * the at rule should be followed by curly bras
       */
      const subCurlyBracesContexts: ContextReader[] = [];
      isClosed = this.curly_braces_CTX({
        contexts: subCurlyBracesContexts,
      });
      if (isClosed) {
        const { lastContext } = this;
        lastContext.type = ContextTypes.StyleSheetCurlyBraces;
        children.push(lastContext);
      }
      // create and finish the current context
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.StyleSheetAtRule, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      context.related.push(...related);
      context.data.isTyped = isTyped;
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(
          Reason.StyleSheetAtRuleCurlyBracesAreMissing,
          this.cursor,
          context,
        );
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_type_assignment_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = char === "<" &&
        (prev === "@" || opts?.data?.force_type_assignment_context);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = (opts?.contexts || [
        // TODO implement the context stylesheet_type_list
        // this.stylesheet_type_list_CTX,
      ]);
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.stylesheet_type_assignment_CTX,
            this.stylesheet_default_at_rule_CTX,
          ],
        );
        this.saveContextsTo(allSubContexts, children);
        if (this.char === ">") {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetTypeAssignment,
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
          Reason.StyleSheetTypeAssignmentNotFinish,
          this.cursor,
          context,
        );
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_at_rule_name_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = ![" ", "@", "<"].includes(char);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = (opts?.contexts || []);
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === " ") {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetAtRuleName,
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
      return result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * The CSS selector list (,) selects all the matching nodes.
   */
  stylesheet_selector_list_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext, nextPart } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = ![",", "@"].includes(char) &&
        nextPart.match(/^([^;\{]+?)(\{)/mi);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const supportedSelectors: ContextReader[] = [
        this.stylesheet_selector_element_CTX,
        this.stylesheet_selector_class_CTX,
      ];
      const children: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = (opts?.contexts || [
        this.multiple_spaces_CTX,
        this.space_CTX,
        ...supportedSelectors,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
        this.coma_CTX,
        this.line_break_CTX,
      ]);
      this.saveStrictContextsTo([
        ...supportedSelectors,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
        this.coma_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
      ], children);
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveStrictContextsTo(allSubContexts, children);
        if (this.char === "{" || this.isEndOfStylesheet()) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetSelectorList,
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
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_selector_element_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = !["#", ".", "[", " ", "@", "{"].includes(char);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (
          ["#", ".", "[", ",", " ", "{"].includes(this.char) ||
          this.isEndOfStylesheet()
        ) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetSelectorHTMLElement,
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
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_selector_class_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = char === ".";
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (
          ["#", "[", ",", " ", "{"].includes(this.char) ||
          this.isEndOfStylesheet()
        ) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetSelectorClass,
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
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_selector_id_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = char === "#" && !this.isEndOfStylesheet();
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (
          [".", "[", ",", " "].includes(this.char) || this.isEndOfStylesheet()
        ) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetSelectorId,
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
      return result;
    } catch (err) {
      throw err;
    }
  }
}
