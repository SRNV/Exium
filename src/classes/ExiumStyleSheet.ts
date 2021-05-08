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
    this.debuggPosition("STYLESHEET START");
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
      if (opts?.checkOnly) return !this.isEndOfStylesheet;
      let result = true;
      const children: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.stylesheet_end_CTX,
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.comment_block_CTX,
        this.comment_CTX,
        this.semicolon_CTX,
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
        this.saveStrictContextsTo(allSubContexts, children);
        this.isValidChar(opts?.unexpected);
        if (this.isEndOfStylesheet) {
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
      this.debuggPosition("STYLESHEET END");
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
    this.debuggPosition("stylesheet_charset_at_rule_CTX");
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = Boolean(this.isFollowedBy("@charset", true));
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
        this.semicolon_CTX,
      ];
      // retrieve the atrule name
      while (!this.isEOF) {
        this.saveContextsTo(allSubContexts, children);
        if (
          children.find((context) => context.type === ContextTypes.SemiColon)
        ) {
          break;
        }
        this.shift(1);
        this.isValidChar(opts?.unexpected);
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
      const isValid = Boolean(this.isFollowedBy("@export", true));
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_const_at_rule_CTX,
      ];
      // retrieve the atrule name
      while (!this.isEOF) {
        this.saveStrictContextsTo(allSubContexts, children, {
          data: {
            isExportStatement: true,
          },
        });
        this.shift(1);
        this.isValidChar(opts?.unexpected);
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
    this.debuggPosition("stylesheet_const_at_rule_CTX");
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = Boolean(
        this.isFollowedBy("@const", true) || opts?.data?.isExportStatement,
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
        this.semicolon_CTX,
      ];
      const describers: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_const_at_rule_name_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_type_assignment_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_const_at_rule_equal_CTX,
      ];
      // retrieve the atrule name
      while (!this.isEOF) {
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
        this.shift(1);
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
    this.debuggPosition("\nCONST NAME");
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
        this.saveContextsTo(subs, children);
        this.shift(1);
        this.isValidChar(opts?.unexpected);
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
    this.debuggPosition("\nDEFAULT AT RULE");
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = Boolean(char === "@");
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isTyped = false;
      let isClosed = false;
      const children: ExiumContext[] = [];
      const describers: ContextReader[] = [
        this.stylesheet_type_assignment_CTX,
        this.stylesheet_at_rule_name_CTX,
      ];
      const allSubContexts: ContextReader[] = [];
      const related: ExiumContext[] = [];
      this.saveContextsTo(describers, related);
      isTyped = !!related.find((context) =>
        context.type === ContextTypes.StyleSheetTypeAssignment
      );
      while (!this.isEOF) {
        this.saveContextsTo(allSubContexts, children);
        if (
          this.char === "{" ||
          this.char === ";" ||
          this.isEndOfStylesheet
        ) {
          break;
        }
        this.shift(1);
        this.isValidChar(opts?.unexpected);
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
    this.debuggPosition("\nCONST TYPE");
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = (char === "@" && next === "<") ||
        (opts?.data?.force_type_assignment_contextrce);
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
        this.saveContextsTo(allSubContexts, children);
        if (this.char === ">") {
          this.shift(1);
          isClosed = true;
          break;
        }
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.stylesheet_type_assignment_CTX,
            this.stylesheet_default_at_rule_CTX,
          ],
        );
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
      const isValid = ![" ", "<"].includes(char);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = (opts?.contexts || []);
      while (!this.isEOF) {
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        this.shift(1);
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
  stylesheet_selector_list_CTX(opts?: ContextReaderOptions): boolean | null {
    this.debuggPosition("SELECTOR LIST");
    try {
      let { char, prev, next, lastContext, nextPart } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = ![",", "@", " ", "\n"].includes(char) &&
        nextPart.match(/^([^;\{]+?)(\{)/mi);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const supportedSelectors: ContextReader[] = [
        this.stylesheet_end_CTX,
        this.stylesheet_selector_combinator_CTX,
        this.stylesheet_selector_attribute_CTX,
        this.stylesheet_selector_pseudo_element_CTX,
        this.stylesheet_selector_pseudo_class_CTX,
        this.stylesheet_selector_id_CTX,
        this.stylesheet_selector_class_CTX,
        // should be the last one because it accepts everything
        this.stylesheet_selector_element_CTX,
      ];
      const comaCTX: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
        this.coma_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
      ];
      const allSubContexts: ContextReader[] = (opts?.contexts || [
        this.multiple_spaces_CTX,
        this.space_CTX,
        ...supportedSelectors,
        ...comaCTX,
      ]);
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.saveStrictContextsTo(allSubContexts, children);
        if (this.char === "{" || this.isEndOfStylesheet) {
          break;
        }
        this.isValidChar(opts?.unexpected);
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
      const unsupportedChars = ["#", ".", "[", " ", "@", "{", "\n", ","];
      const isValid = !unsupportedChars.includes(char);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.debuggPosition('\nSELECTOR ELEMENT');
        if (
          ["#", ".", "[", ",", " ", "{", ':'].includes(this.char)
        ) {
          break;
        }
        this.shift(1);
        this.isValidChar(opts?.unexpected);
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
    this.debuggPosition("\nSELECTOR CLASS");
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const previousIsClassStart = prev === "." && char !== ".";
      const isValid = (char === "." || previousIsClassStart);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.debuggPosition('\nSELECTOR CLASS');
        if (
          ["#", "[", ",", " ", "{", ':'].includes(this.char)
        ) {
          break;
        }
        this.shift(1);
        if (
          ["."].includes(this.char)
        ) {
          break;
        }
        this.isValidChar(opts?.unexpected);
      }
      const token = source.slice(x, this.cursor.x);
      if (!token.length) return false;
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
  stylesheet_selector_pseudo_class_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = (char === ":" || prev === ":") && next !== ":";
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      const allSubs: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
        this.parenthese_CTX,
      ];
      while (!this.isEOF) {
        this.debuggPosition('\nSELECTOR PSEUDO CLASS');
        this.shift(1);
        if (
          [".", "[", ",", " ", "\n", "#", ':', '('].includes(this.char)
        ) {
          break;
        }
        this.isValidChar(opts?.unexpected);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetSelectorPseudoClass,
        token,
        {
          start: x,
          end: this.cursor.x,
          line,
          column,
        },
      );
      // save trailing parenthese
      this.saveContextsTo(allSubs, children);
      context.children.push(...children);
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_selector_pseudo_element_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = (char === ":" && next === ":" || prev === ":" && char === ":");
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      this.shiftUntilEndOf('::');
      let result = true;
      const children: ExiumContext[] = [];
      const allSubs: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
        this.parenthese_CTX,
      ];
      while (!this.isEOF) {
        this.debuggPosition('\nSELECTOR PSEUDO ELEMENT');
        this.shift(1);
        if (
          [".", "[", ",", " ", "\n", "#", ':', '('].includes(this.char)
        ) {
          break;
        }
        this.isValidChar(opts?.unexpected);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetSelectorPseudoElement,
        token,
        {
          start: x,
          end: this.cursor.x,
          line,
          column,
        },
      );
      // save trailing parenthese
      this.saveContextsTo(allSubs, children);
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
      const isValid = (char === "#" || prev === "#");
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.debuggPosition('\nSELECTOR ID');
        this.shift(1);
        if (
          [".", "[", ",", " ", "\n", "#", ':'].includes(this.char)
        ) {
          break;
        }
        this.isValidChar(opts?.unexpected);
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
  stylesheet_selector_attribute_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition('\nSELECTOR ATTRIBUTE');
    try {
      let { char, prev } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = (char === "[" || prev === "[" && char !== "]");
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      let isNamed = false;
      const children: ExiumContext[] = [];
      const related: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = (opts?.contexts || [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
      ]);
      const describers: ContextReader[] = [
        this.stylesheet_selector_attribute_name_CTX,
        this.stylesheet_selector_attribute_equal_CTX,
        this.stylesheet_selector_attribute_value_CTX,
      ];
      while (!this.isEOF) {
        this.debuggPosition('\nSELECTOR ATTRIBUTE');
        if (!isNamed) {
          this.saveContextsTo(describers, related);
          isNamed = !!related.find((context) => context.type === ContextTypes.StyleSheetSelectorAttributeName);
        } else { }
        this.saveContextsTo(allSubContexts, children);
        this.shift(1);
        if ([']'].includes(this.prev!)) {
          isClosed = true;
          break;
        }
        this.isValidChar(opts?.unexpected);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetSelectorAttribute,
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
      if (!isClosed) {
        this.onError(Reason.StyleSheetAttributeNotClosed, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_selector_attribute_name_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition('\nSELECTOR ATTRIBUTE NAME START');
    try {
      let { char, prev } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const unsupported = ['^', '$', '|', '=', '*', ' ', ']', '[', '\n'];
      const isValid = !unsupported.includes(char);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      while (!this.isEOF) {
        this.debuggPosition('\nSELECTOR ATTRIBUTE NAME');
        if (unsupported.includes(this.char)) {
          break;
        }
        this.shift(1);
        this.isValidChar(opts?.unexpected);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetSelectorAttributeName,
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
  stylesheet_selector_attribute_equal_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition('\nSELECTOR ATTRIBUTE EQUAL START');
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const supported = ['^', '$', '|', '*', '~'];
      const isValid = supported.includes(char) && next === '='
        || char === '=';
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      while (!this.isEOF) {
        this.debuggPosition('\nSELECTOR ATTRIBUTE EQUAL');
        if (this.char === '=') {
          this.shift(1);
          break;
        }
        this.shift(1);
        this.isValidChar(opts?.unexpected);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetSelectorAttributeEqual,
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
  stylesheet_selector_combinator_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition('\nSELECTOR COMBINATOR START');
    try {
      let { char } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const supported = ['+', '>', '~', '*'];
      const isValid = supported.includes(char);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      this.shift(1);
      const contexts: { [k: string]: ContextTypes } = {
        '~': ContextTypes.StyleSheetSelectorCombinatorGeneralSibling,
        '*': ContextTypes.StyleSheetSelectorCombinatorAll,
        '+': ContextTypes.StyleSheetSelectorCombinatorAdjacentSibling,
        '>': ContextTypes.StyleSheetSelectorCombinatorChildSelector,
      };
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        contexts[token],
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
  stylesheet_selector_attribute_value_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition('\nSELECTOR ATTRIBUTE EQUAL START');
    try {
      let { lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const isValid = lastContext.type === ContextTypes.StyleSheetSelectorAttributeEqual;
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      while (!this.isEOF) {
        this.debuggPosition('\nSELECTOR ATTRIBUTE EQUAL');
        if (this.char === ']') {
          break;
        }
        this.shift(1);
        this.isValidChar(opts?.unexpected);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetSelectorAttributeValue,
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
  stylesheet_end_CTX(opts?: ContextReaderOptions): boolean | null {
    const { prev, char, next, nextPart, source } = this;
    const { x, line, column } = this.cursor;
    const reg = /^([\s\n]*?)(\<\/style)/i;
    const isValid = reg.test(nextPart);
    if (!isValid) return false;
    this.debuggPosition('\nSTYLESHEET END ==================');
    const match = nextPart.match(reg);
    if (match) {
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetEnd,
        token,
        {
          start: x,
          end: this.cursor.x,
          line,
          column,
        },
      );
      this.currentContexts.push(context);
      return null;
    }
    return false;
  }
}
