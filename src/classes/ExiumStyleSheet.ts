import { ExiumProtocol } from "./ExiumProtocol.ts";
import { ContextReader, ContextReaderOptions } from "../types/main.d.ts";
import { ExiumContext } from "./ExiumContext.ts";
import { ContextTypes } from "../enums/context-types.ts";
import { Reason } from "../enums/error-reason.ts";
import { SupportedStyleSheetCharset } from "../supports.ts";

/**
 * all ContextReaders to read stylesheets
 */
export class ExiumStyleSheet extends ExiumProtocol {
  allowPseudoProperties = true;
  isInPseudoProperty = false;
  get isEndOfStylesheetProperty(): boolean {
    const { char, isInPseudoProperty: p } = this;
    return p &&
        char === ")" ||
      !p &&
        char === "}";
  }
  constructor(...args: ConstructorParameters<typeof ExiumProtocol>) {
    super(...args);
  }
  stylesheet_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition("STYLESHEET START  ==================>");
    try {
      const { x, line, column } = this.cursor;
      const { source } = this;
      const lastIsAStyleNode = this.currentContexts.find((context) =>
        context.type === ContextTypes.Node &&
        context.related.find((node) =>
          node.type === ContextTypes.Identifier &&
          node.source === "style"
        ) &&
        !context.related.find((node) => node.type === ContextTypes.NodeClosing)
      );
      const isValid = !!lastIsAStyleNode || this.isParsingStylesheet;
      if (!isValid) return isValid;
      if (opts?.checkOnly) return !this.isEndOfStylesheet;
      const result = true;
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
        this.stylesheet_property_list_CTX,

        this.stylesheet_selector_list_CTX,
        // TODO implement property list
        this.stylesheet_property_list_CTX,
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
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid = Boolean(this.isFollowedBy("@charset", true));
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      const result = true;
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
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid = Boolean(this.isFollowedBy("@export", true));
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      const result = true;
      const children: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_const_at_rule_CTX,
        this.stylesheet_end_CTX,
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
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid = Boolean(
        this.isFollowedBy("@const", true) || opts?.data?.isExportStatement,
      );
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      this.nextPart.startsWith("const ") && this.shiftUntilEndOf("const");
      const result = true;
      let isNamed = false;
      const children: ExiumContext[] = [];
      const related: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.semicolon_CTX,
        this.line_break_CTX,
        this.stylesheet_end_CTX,
      ];
      const describers: ContextReader[] = [
        this.stylesheet_end_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.identifier_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_type_assignment_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_const_at_rule_equal_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_hex_type_CTX, // #000000
        this.stylesheet_selector_list_CTX,
        this.stylesheet_property_list_CTX,
      ];
      // retrieve the atrule name
      while (!this.isEOF) {
        if (!isNamed) {
          // retrieve name
          this.saveContextsTo(describers, related, {
            data: {
              // force type assignment
              force_type_assignment_context: true,
              // force property list
              force_property_list_context: true,
            },
          });
          isNamed = Boolean(
            related.find((context) =>
              context.type === ContextTypes.Identifier
            ) &&
              related.find((context) =>
                context.type === ContextTypes.StyleSheetAtRuleConstEqual
              ) &&
              related.find((context) =>
                context.type === ContextTypes.StyleSheetTypeAssignment
              ),
          );
        } else {
          this.saveContextsTo(allSubContexts, children);
        }
        if (this.char === ";") {
          break;
        }
        this.isValidChar(opts?.unexpected);
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
  stylesheet_hex_type_CTX(opts?: ContextReaderOptions): boolean | null {
    this.debuggPosition("STYLESHEET HEX TYPE START");
    const { char, source } = this;
    const { x, line, column } = this.cursor;
    if (char !== "#") return false;
    if (opts?.checkOnly) return true;
    while (!this.isEOF) {
      this.debuggPosition("STYLESHEET HEX TYPE");
      if ([" ", ";", "\n"].includes(this.char) || this.cursor.x - x >= 8) {
        break;
      }
      this.shift(1);
    }
    const token = source.slice(x, this.cursor.x);
    const context = new ExiumContext(ContextTypes.StyleSheetHexType, token, {
      start: x,
      line,
      column,
      end: this.cursor.x,
    });
    this.currentContexts.push(context);
    return true;
  }
  stylesheet_const_at_rule_equal_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition("STYLESHEET CONST AT RULE EQUAL START");
    try {
      const { char, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid: boolean = char === "=" && next !== "=";
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      this.debuggPosition("STYLESHEET CONST AT RULE EQUAL");
      this.shift(1);
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
      this.currentContexts.push(context);
      return true;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_default_at_rule_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition("\nDEFAULT AT RULE");
    try {
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid = Boolean(char === "@");
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      this.shift(1);
      const result = true;
      let isTyped = false;
      const children: ExiumContext[] = [];
      const describers: ContextReader[] = [
        this.stylesheet_type_assignment_CTX,
        this.identifier_CTX,
      ];
      const allSubContexts: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
        this.stylesheet_selector_list_CTX,
      ];
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
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_type_assignment_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition("\nCONST TYPE");
    try {
      const { char, prev } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
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
  /**
   * The CSS selector list (,) selects all the matching nodes.
   */
  stylesheet_selector_list_CTX(opts?: ContextReaderOptions): boolean | null {
    this.debuggPosition("SELECTOR LIST");
    try {
      const { char, nextPart, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
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
        this.stylesheet_end_CTX,
        this.stylesheet_selector_combinator_CTX,
        this.stylesheet_selector_attribute_CTX,
        this.stylesheet_selector_pseudo_element_CTX,
        this.stylesheet_selector_pseudo_class_CTX,
        this.stylesheet_selector_id_CTX,
        this.stylesheet_selector_class_CTX,
        this.stylesheet_parent_ref_CTX, // TODO
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
        if (["{", "}"].includes(this.char) || this.isEndOfStylesheet) {
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
  stylesheet_parent_ref_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const {
        char,
        next,
        prev,
        cursor,
        source
      } = this;
      const { x, line, column } = cursor;
      const isValid = char === '&' && next !== '&' && prev !== '&';
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      this.shift(1);
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetParentRef,
        token,
        {
          start: x,
          end: this.cursor.x,
          line,
          column,
        },
      );
      this.currentContexts.push(context);
      return true;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_selector_element_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const unsupportedChars = ["#", ".", "[", " ", "@", "{", "\n", ",", "}"];
      const isValid = !unsupportedChars.includes(char);
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      const result = true;
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.debuggPosition("\nSELECTOR ELEMENT");
        if (
          ["#", ".", "[", ",", " ", "{", ":"].includes(this.char)
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
      const { char, prev } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const previousIsClassStart = prev === "." && char !== ".";
      const isValid: boolean = (char === "." || previousIsClassStart);
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      const result = true;
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.debuggPosition("\nSELECTOR CLASS");
        if (
          ["#", "[", ",", " ", "{", ":"].includes(this.char)
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
      const { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid: boolean = (char === ":" || prev === ":") && next !== ":";
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      const result = true;
      const children: ExiumContext[] = [];
      const allSubs: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
        this.parenthese_CTX,
      ];
      while (!this.isEOF) {
        this.debuggPosition("\nSELECTOR PSEUDO CLASS");
        this.shift(1);
        if (
          [".", "[", ",", " ", "\n", "#", ":", "("].includes(this.char)
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
      const { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid: boolean =
        (char === ":" && next === ":" || prev === ":" && char === ":");
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      this.shiftUntilEndOf("::");
      const result = true;
      const children: ExiumContext[] = [];
      const allSubs: ContextReader[] = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
        this.parenthese_CTX,
      ];
      while (!this.isEOF) {
        this.debuggPosition("\nSELECTOR PSEUDO ELEMENT");
        this.shift(1);
        if (
          [".", "[", ",", " ", "\n", "#", ":", "("].includes(this.char)
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
      const { char, prev } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid: boolean = (char === "#" || prev === "#");
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      const result = true;
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.debuggPosition("\nSELECTOR ID");
        this.shift(1);
        if (
          [".", "[", ",", " ", "\n", "#", ":"].includes(this.char)
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
    this.debuggPosition("\nSELECTOR ATTRIBUTE");
    try {
      const { char, prev } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid: boolean = (char === "[" || prev === "[" && char !== "]");
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      let isNamed = false;
      const children: ExiumContext[] = [];
      const related: ExiumContext[] = [];
      const allSubContexts: ContextReader[] = (opts?.contexts || [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
      ]);
      const propertyOpts = {
        data: {
          allowedIdentifierChars: ["-", "_"],
        },
      };
      const describers: ContextReader[] = [
        this.identifier_CTX,
        this.stylesheet_selector_attribute_equal_CTX,
        this.stylesheet_selector_attribute_value_CTX,
      ];
      while (!this.isEOF) {
        this.debuggPosition("\nSELECTOR ATTRIBUTE");
        if (!isNamed) {
          this.saveContextsTo(describers, related, propertyOpts);
          isNamed = !!related.find((context) =>
            context.type === ContextTypes.Identifier
          );
        }
        this.saveContextsTo(allSubContexts, children);
        this.shift(1);
        if (["]"].includes(this.prev!)) {
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
  stylesheet_selector_attribute_equal_CTX(
    opts?: ContextReaderOptions,
  ): boolean {
    this.debuggPosition("\nSELECTOR ATTRIBUTE EQUAL START");
    try {
      const { char, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const supported = ["^", "$", "|", "*", "~"];
      const isValid: boolean = supported.includes(char) && next === "=" ||
        char === "=";
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      const result = true;
      while (!this.isEOF) {
        this.debuggPosition("\nSELECTOR ATTRIBUTE EQUAL");
        if (this.char === "=") {
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
    this.debuggPosition("\nSELECTOR COMBINATOR START");
    try {
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const supported = ["+", ">", "~", "*"];
      const isValid: boolean = supported.includes(char);
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      const result = true;
      this.shift(1);
      const contexts: { [k: string]: ContextTypes } = {
        "~": ContextTypes.StyleSheetSelectorCombinatorGeneralSibling,
        "*": ContextTypes.StyleSheetSelectorCombinatorAll,
        "+": ContextTypes.StyleSheetSelectorCombinatorAdjacentSibling,
        ">": ContextTypes.StyleSheetSelectorCombinatorChildSelector,
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
  stylesheet_selector_attribute_value_CTX(
    opts?: ContextReaderOptions,
  ): boolean {
    this.debuggPosition("\nSELECTOR ATTRIBUTE EQUAL START");
    try {
      const { lastContext } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid: boolean =
        lastContext.type === ContextTypes.StyleSheetSelectorAttributeEqual;
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      const result = true;
      while (!this.isEOF) {
        this.debuggPosition("\nSELECTOR ATTRIBUTE EQUAL");
        if (this.char === "]") {
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
  /**
   * should match with {...} and is recursive
   */
  stylesheet_property_list_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition("\nSTYLESHEET PROPERTY LIST START");
    try {
      const { char, lastContext } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const forced = !!opts?.data?.force_property_list_context;
      const isValid: boolean =
        lastContext.type === ContextTypes.StyleSheetSelectorList ||
        lastContext.type === ContextTypes.StyleSheetAtRule ||
        forced && char === "{";
      if ((char !== "{" || !isValid) || ["}"].includes(char)) return false;
      if (opts?.checkOnly) return true;
      this.shiftUntilEndOf("{");
      const result = true;
      let isClosed = false;
      const allSubContexts = opts?.contexts || [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
        this.stylesheet_end_CTX,
        this.stylesheet_spread_CTX,
        this.stylesheet_default_at_rule_CTX,
        // nested rules
        this.stylesheet_selector_list_CTX,
        this.stylesheet_property_list_CTX,
        this.stylesheet_property_CTX,
      ];
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.debuggPosition("\nSTYLESHEET PROPERTY LIST");
        if (this.char === "}") {
          this.shift(1);
          isClosed = true;
          break;
        }
        this.saveStrictContextsTo(allSubContexts, children);
        this.isValidChar(opts?.unexpected);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetPropertyList,
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
        this.onError(Reason.StyleSheetPropertyListOpen, this.cursor, context);
      }
      if (!forced) lastContext.related.push(context);
      this.debuggPosition("\nSTYLESHEET PROPERTY END");
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_spread_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition("\nSTYLESHEET RULE SPREAD START");
    try {
      const { char, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid = [
        char,
        next,
        source[x + 2],
      ].join("") === "...";
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      this.shiftUntilEndOf("...");
      const result = true;
      const related: ExiumContext[] = [];
      const subs: ContextReader[] = [
        this.identifier_CTX,
        this.semicolon_CTX,
      ];
      const unexpected = opts?.unexpected || [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
      ];
      let isNamed = false;
      while (!this.isEOF) {
        this.debuggPosition("\nSTYLESHEET RULE SPREAD");
        this.saveStrictContextsTo(subs, related);
        isNamed = !!related.find((context) =>
          context.type === ContextTypes.Identifier
        );
        if (
          related.find((context) => context.type === ContextTypes.SemiColon)
        ) {
          if (!isNamed) {
            this.onError(
              Reason.StyleSheetRuleSpreadNameMissing,
              this.cursor,
              this.unexpected,
            );
          }
          break;
        }
        this.isValidChar(unexpected);
        this.shift(1);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetRuleSpread,
        token,
        {
          start: x,
          end: this.cursor.x,
          line,
          column,
        },
      );
      context.related.push(...related);
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_property_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition("\nSELECTOR PROPERTY START");
    try {
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const unsupported = [":", "@", " ", ";", "}", "\n", ".", "(", ")"];
      const isValid = !unsupported.includes(char);
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      const result = true;
      const related: ExiumContext[] = [];
      const children: ExiumContext[] = [];
      const describers: ContextReader[] = [
        this.identifier_CTX,
        this.double_point_CTX,
        this.stylesheet_pseudo_property_CTX,
        this.stylesheet_property_value_CTX,
      ];
      const propertyOpts = {
        data: {
          allowedIdentifierChars: ["-", "_", "%"],
          allowDigit: true,
        },
      };
      const subs: ContextReader[] = [
        this.semicolon_CTX,
      ];
      let isNamed = false;
      while (!this.isEOF) {
        this.debuggPosition("\nSELECTOR PROPERTY");
        if (!isNamed) {
          this.saveStrictContextsTo(describers, related, propertyOpts);
          isNamed = Boolean(
            related.find((context) =>
              context.type === ContextTypes.Identifier
            ) &&
              related.find((context) =>
                context.type === ContextTypes.DoublePoint
              ) &&
              related.find((context) =>
                context.type === ContextTypes.StyleSheetPropertyValue
              ),
          );
        }
        this.saveContextsTo(subs, children);
        if (
          children.find((context) => context.type === ContextTypes.SemiColon) ||
          ["}"].includes(this.char) ||
          this.isEndOfStylesheetProperty
        ) {
          break;
        }
        this.isValidChar(opts?.unexpected);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetProperty,
        token,
        {
          start: x,
          end: this.cursor.x,
          line,
          column,
        },
      );
      context.related.push(...related);
      context.children.push(...children);
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_pseudo_property_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition("\nSELECTOR PSEUDO PROPERTY START");
    try {
      const { lastContext, char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid: boolean = !this.isInPseudoProperty && (
        char === ":" &&
        lastContext.type === ContextTypes.DoublePoint
      );
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      this.isInPseudoProperty = true;
      const result = true;
      let isClosed = false;
      const children: ExiumContext[] = [];
      const related: ExiumContext[] = [];
      const exitChars = [";", "\n", "}", ")"];
      const subs: ContextReader[] = [
        this.braces_CTX,
      ];
      const describers: ContextReader[] = [
        this.identifier_CTX,
      ];
      const unexpected = opts?.unexpected || [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
      ];
      this.shiftUntilEndOf(":");
      this.saveStrictContextsTo(describers, related, {
        data: {
          allowedIdentifierChars: ["-"],
        },
      });
      while (!this.isEOF) {
        this.isValidChar(unexpected);
        this.debuggPosition("\nSELECTOR PSEUDO PROPERTY");
        this.saveStrictContextsTo(subs, children, {
          data: {
            braces_contexts: [
              this.stylesheet_property_CTX,
            ],
          },
        });
        if (exitChars.includes(this.char)) {
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetPseudoProperty,
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
        this.onError(
          Reason.StyleSheetRulePropertyValueNotClosed,
          this.cursor,
          context,
        );
      }
      this.isInPseudoProperty = false;
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_property_value_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition("\nSELECTOR PROPERTY VALUE START");
    try {
      const { lastContext, char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      const isValid: boolean = lastContext.type === ContextTypes.DoublePoint &&
        char !== ":";
      if (!isValid) return isValid;
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      const exitChars = [";", "\n", "}"];
      const children: ExiumContext[] = [];
      const subs: ContextReader[] = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
        this.braces_CTX,
      ];
      while (!this.isEOF) {
        this.debuggPosition("\nSELECTOR PROPERTY VALUE");
        this.saveContextsTo(subs, children, {
          data: {
            argument_CTX_starts_with: "|",
          },
          contexts: subs,
        });
        if (
          exitChars.includes(this.char) ||
          this.isEndOfStylesheetProperty
        ) {
          isClosed = true;
          break;
        }
        this.shift(1);
        this.isValidChar(opts?.unexpected);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StyleSheetPropertyValue,
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
          Reason.StyleSheetRulePropertyValueNotClosed,
          this.cursor,
          context,
        );
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  stylesheet_end_CTX(): boolean | null {
    const { nextPart, source } = this;
    const { x, line, column } = this.cursor;
    const reg = /^([\s\n]*?)(\<\/style)/i;
    const isValid: boolean = reg.test(nextPart);
    if (!isValid) return isValid;
    this.debuggPosition("\nSTYLESHEET END <==================");
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
