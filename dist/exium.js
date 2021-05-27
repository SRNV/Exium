var Reason;
(function (Reason1) {
  Reason1[Reason1["UnexpectedToken"] = 1436] = "UnexpectedToken";
  Reason1[Reason1["HTMLTagNotClosed"] = 1443] = "HTMLTagNotClosed";
  Reason1[Reason1["CommentBlockOpen"] = 1519] = "CommentBlockOpen";
  Reason1[Reason1["StringSingleQuoteOpen"] = 1593] = "StringSingleQuoteOpen";
  Reason1[Reason1["StringDoubleQuoteOpen"] = 1633] = "StringDoubleQuoteOpen";
  Reason1[Reason1["StringTemplateQuoteOpen"] = 1678] =
    "StringTemplateQuoteOpen";
  Reason1[Reason1["StringTemplateQuoteEvaluationOpen"] = 1725] =
    "StringTemplateQuoteEvaluationOpen";
  Reason1[Reason1["BracesOpen"] = 1773] = "BracesOpen";
  Reason1[Reason1["CurlyBracesOpen"] = 1819] = "CurlyBracesOpen";
  Reason1[Reason1["ArrayOpen"] = 1866] = "ArrayOpen";
  Reason1[Reason1["HTMLClosingTagWithoutOpening"] = 2116] =
    "HTMLClosingTagWithoutOpening";
  Reason1[Reason1["HTMLTagNotFinish"] = 2128] = "HTMLTagNotFinish";
  Reason1[Reason1["HTMLCommentOpen"] = 2211] = "HTMLCommentOpen";
  Reason1[Reason1["ImportAmbientStringMissing"] = 2274] =
    "ImportAmbientStringMissing";
  Reason1[Reason1["ImportStatementNotFinish"] = 2354] =
    "ImportStatementNotFinish";
  Reason1[Reason1["OgoneFlagNotFinish"] = 2406] = "OgoneFlagNotFinish";
  Reason1[Reason1["OgoneSpreadFlagNotClosed"] = 2491] =
    "OgoneSpreadFlagNotClosed";
  Reason1[Reason1["HTMLAttributeNotClosed"] = 2549] = "HTMLAttributeNotClosed";
  Reason1[Reason1["HTMLBooleanAttributeNotClosed"] = 2590] =
    "HTMLBooleanAttributeNotClosed";
  Reason1[Reason1["HTMLAttributeNameNotClosed"] = 2630] =
    "HTMLAttributeNameNotClosed";
  Reason1[Reason1["HTMLAttributeValueUnquotedNotClosed"] = 2670] =
    "HTMLAttributeValueUnquotedNotClosed";
  Reason1[Reason1["StyleSheetAtRuleCharsetInvalid"] = 2887] =
    "StyleSheetAtRuleCharsetInvalid";
  Reason1[Reason1["StyleSheetAtRuleCharsetStringIsMissing"] = 2890] =
    "StyleSheetAtRuleCharsetStringIsMissing";
  Reason1[Reason1["StyleSheetAtRuleCharsetNotFinish"] = 2894] =
    "StyleSheetAtRuleCharsetNotFinish";
  Reason1[Reason1["StyleSheetAtRuleCurlyBracesAreMissing"] = 2960] =
    "StyleSheetAtRuleCurlyBracesAreMissing";
  Reason1[Reason1["StyleSheetTypeAssignmentNotFinish"] = 3004] =
    "StyleSheetTypeAssignmentNotFinish";
})(Reason || (Reason = {}));
class ExiumContext {
  type;
  source;
  position;
  children = [];
  related = [];
  data = {};
  constructor(type, source1, position) {
    this.type = type;
    this.source = source1;
    this.position = position;
  }
}
var ContextTypes;
(function (ContextTypes1) {
  ContextTypes1["Unexpected"] = "Unexpected";
  ContextTypes1["Space"] = "Space";
  ContextTypes1["SemiColon"] = "SemiColon";
  ContextTypes1["Coma"] = "Coma";
  ContextTypes1["MultipleSpaces"] = "MultipleSpaces";
  ContextTypes1["LineBreak"] = "LineBreak";
  ContextTypes1["StringSingleQuote"] = "StringSingleQuote";
  ContextTypes1["StringDoubleQuote"] = "StringDoubleQuote";
  ContextTypes1["StringTemplateQuote"] = "StringTemplateQuote";
  ContextTypes1["StringTemplateQuoteEval"] = "StringTemplateQuoteEval";
  ContextTypes1["Comment"] = "Comment";
  ContextTypes1["CommentBlock"] = "CommentBlock";
  ContextTypes1["Braces"] = "Braces";
  ContextTypes1["CurlyBraces"] = "CurlyBraces";
  ContextTypes1["Array"] = "Array";
  ContextTypes1["HTMLComment"] = "HTMLComment";
  ContextTypes1["ImportAmbient"] = "ImportAmbient";
  ContextTypes1["ImportStatement"] = "ImportStatement";
  ContextTypes1["InjectAmbient"] = "InjectAmbient";
  ContextTypes1["TextNode"] = "TextNode";
  ContextTypes1["Node"] = "Node";
  ContextTypes1["Identifier"] = "Identifier";
  ContextTypes1["NodeOpening"] = "NodeOpening";
  ContextTypes1["NodeOpeningEnd"] = "NodeOpeningEnd";
  ContextTypes1["NodeClosing"] = "NodeClosing";
  ContextTypes1["NodeClosingEnd"] = "NodeClosingEnd";
  ContextTypes1["Flag"] = "Flag";
  ContextTypes1["FlagName"] = "FlagName";
  ContextTypes1["FlagSpread"] = "FlagSpread";
  ContextTypes1["Attribute"] = "Attribute";
  ContextTypes1["AttributeName"] = "AttributeName";
  ContextTypes1["AttributeBoolean"] = "AttributeBoolean";
  ContextTypes1["AttributeValueQuoteSingle"] = "AttributeValueQuoteSingle";
  ContextTypes1["AttributeValueQuoteDouble"] = "AttributeValueQuoteDouble";
  ContextTypes1["AttributeValueQuoteTemplate"] = "AttributeValueQuoteTemplate";
  ContextTypes1["AttributeValueCurlyBraces"] = "AttributeValueCurlyBraces";
  ContextTypes1["AttributeValueUnquoted"] = "AttributeValueUnquoted";
  ContextTypes1["AttributeValueBraces"] = "AttributeValueBraces";
  ContextTypes1["AttributeValueArray"] = "AttributeValueArray";
  ContextTypes1["AttributeValueContent"] = "AttributeValueContent";
  ContextTypes1["AttributeValueStart"] = "AttributeValueStart";
  ContextTypes1["AttributeValueEnd"] = "AttributeValueEnd";
  ContextTypes1["Protocol"] = "Protocol";
  ContextTypes1["StyleSheet"] = "StyleSheet";
  ContextTypes1["StyleSheetRule"] = "StyleSheetRule";
  ContextTypes1["StyleSheetAtRule"] = "StyleSheetAtRule";
  ContextTypes1["StyleSheetAtRuleName"] = "StyleSheetAtRuleName";
  ContextTypes1["StyleSheetAtRuleCharset"] = "StyleSheetAtRuleCharset";
  ContextTypes1["StyleSheetTypeAssignment"] = "StyleSheetTypeAssignment";
  ContextTypes1["StyleSheetAtRuleConst"] = "StyleSheetAtRuleConst";
  ContextTypes1["StyleSheetAtRuleConstName"] = "StyleSheetAtRuleConstName";
  ContextTypes1["StyleSheetAtRuleConstType"] = "StyleSheetAtRuleConstType";
  ContextTypes1["StyleSheetAtRuleConstEqual"] = "StyleSheetAtRuleConstEqual";
  ContextTypes1["StyleSheetAtRuleConstValue"] = "StyleSheetAtRuleConstValue";
  ContextTypes1["StyleSheetAtRuleExport"] = "StyleSheetAtRuleExport";
  ContextTypes1["StyleSheetType"] = "StyleSheetType";
  ContextTypes1["StyleSheetCurlyBraces"] = "StyleSheetCurlyBraces";
  ContextTypes1["StyleSheetSelector"] = "StyleSheetSelector";
  ContextTypes1["StyleSheetSelectorList"] = "StyleSheetSelectorList";
  ContextTypes1["StyleSheetSelectorHTMLElement"] =
    "StyleSheetSelectorHTMLElement";
  ContextTypes1["StyleSheetSelectorClass"] = "StyleSheetSelectorClass";
  ContextTypes1["StyleSheetSelectorId"] = "StyleSheetSelectorId";
  ContextTypes1["StyleSheetSelectorAttribute"] = "StyleSheetSelectorAttribute";
  ContextTypes1["StyleSheetSelectorPseudoClass"] =
    "StyleSheetSelectorPseudoClass";
  ContextTypes1["StyleSheetSelectorPseudoElement"] =
    "StyleSheetSelectorPseudoElement";
})(ContextTypes || (ContextTypes = {}));
class ExiumBase {
  onError;
  checkOnlyOptions = {
    checkOnly: true,
  };
  get isParsingStylesheet() {
    return Boolean(
      this.parseOptions && this.parseOptions.type === "stylesheet",
    );
  }
  regularAtRulesNames = [
    "charset",
    "import",
    "namespace",
  ];
  static mapContexts = new Map();
  currentContexts = [];
  openTags = [];
  cursor = {
    x: 0,
    line: 0,
    column: 0,
  };
  source = "";
  get char() {
    return this.source[this.cursor.x];
  }
  get next() {
    return this.source[this.cursor.x + 1];
  }
  get prev() {
    return this.source[this.cursor.x - 1];
  }
  get nextPart() {
    return this.source.slice(this.cursor.x);
  }
  get previousPart() {
    return this.source.slice(0, this.cursor.x);
  }
  get unexpected() {
    return new ExiumContext(
      ContextTypes.Unexpected,
      this.source.slice(this.cursor.x),
      {
        start: this.cursor.x,
        line: this.cursor.line,
        column: this.cursor.column,
        end: this.cursor.x + 1,
      },
    );
  }
  get lastContext() {
    const last = this.currentContexts[this.currentContexts.length - 1] ||
      this.unexpected;
    return last;
  }
  get nodeContextStarted() {
    return Boolean(this.currentContexts.find((context) =>
      [
        ContextTypes.Node,
      ].includes(context.type)
    ));
  }
  parseOptions = null;
  get isEOF() {
    return Boolean(this.source.length === this.cursor.x);
  }
  constructor(onError) {
    this.onError = onError;
  }
  isValidChar(unexpected) {
    if (!unexpected) return;
    for (let reader of unexpected) {
      const isUnexpected = reader.apply(this, [
        this.checkOnlyOptions,
      ]);
      if (isUnexpected) {
        this.onError(Reason.UnexpectedToken, this.cursor, this.lastContext);
      }
    }
  }
  saveContextsTo(fromContexts, to, opts) {
    fromContexts.forEach((reader) => {
      const recognized = reader.apply(this, [
        opts || {},
      ]);
      if (recognized) {
        to.push(this.lastContext);
      }
    });
  }
  saveStrictContextsTo(fromContexts, to, opts) {
    const { length } = to;
    fromContexts.forEach((reader) => {
      const recognized = reader.apply(this, [
        opts || {},
      ]);
      if (recognized) {
        to.push(this.lastContext);
      }
    });
    if (to.length === length && !this.isEOF) {
      this.onError(Reason.UnexpectedToken, this.cursor, this.unexpected);
    }
  }
  shift(movement = 1) {
    this.cursor.x += +movement;
    this.cursor.column += +movement;
  }
  shiftUntilEndOf(text) {
    if (!this.nextPart.startsWith(text)) return false;
    let result = "";
    while (result !== text) {
      result += this.char;
      this.shift(1);
    }
    return true;
  }
  topCTX(readers) {
    try {
      return Boolean(readers.find((reader) => reader.apply(this, [])));
    } catch (err) {
      throw err;
    }
  }
  comment_block_CTX(opts) {
    try {
      let { char: __char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (__char !== "/" || __char === "/" && next !== "*") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
      ];
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "/" && this.prev === "*") {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.CommentBlock, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.CommentBlockOpen, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  comment_CTX(opts) {
    try {
      let { char: __char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (__char !== "/" || __char === "/" && next !== "/") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (this.char === "\n") {
          this.cursor.x++;
          this.cursor.line++;
          this.cursor.column = 0;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.Comment, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
  string_single_quote_CTX(opts) {
    try {
      let { char: __char, prev, next } = this;
      let { source: source2 } = this;
      const { x, column, line } = this.cursor;
      if (__char !== "'" || __char === "'" && prev === "\\") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.line_break_CTX,
          ],
        );
        if (this.char === "'" && this.prev !== "\\") {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.StringSingleQuote, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.StringSingleQuoteOpen, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  string_double_quote_CTX(opts) {
    try {
      let { char: __char, prev, next } = this;
      let { source: source2 } = this;
      const { x, column, line } = this.cursor;
      if (__char !== '"' || __char === '"' && prev === "\\") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.line_break_CTX,
          ],
        );
        if (this.char === '"' && this.prev !== "\\") {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.StringDoubleQuote, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.StringDoubleQuoteOpen, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  string_template_quote_CTX(opts) {
    try {
      let { char: __char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (__char !== "`" || __char === "`" && prev === "\\") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.string_template_quote_eval_CTX,
      ];
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "`" && this.prev !== "\\") {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StringTemplateQuote,
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
        this.onError(Reason.StringTemplateQuoteOpen, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  string_template_quote_eval_CTX(opts) {
    try {
      let { char: __char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (
        __char !== "$" || __char === "$" && prev === "\\" ||
        __char === "$" && next !== "{"
      ) {
        return false;
      }
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_template_quote_CTX,
      ];
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "}" && this.prev !== "\\") {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.StringTemplateQuoteEval,
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
          Reason.StringTemplateQuoteEvaluationOpen,
          this.cursor,
          context,
        );
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  multiple_spaces_CTX(opts) {
    try {
      const { char: __char, next, source: source2 } = this;
      if (__char !== " " || next !== " ") return false;
      const { x, column, line } = this.cursor;
      let result = false;
      while (this.char === " ") {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
      }
      result = x !== this.cursor.x;
      if (result) {
        const token = source2.slice(x, this.cursor.x);
        this.currentContexts.push(
          new ExiumContext(ContextTypes.MultipleSpaces, token, {
            start: x,
            end: this.cursor.x,
            line,
            column,
          }),
        );
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  space_CTX() {
    let result = this.char === " " && this.next !== this.char;
    if (result) {
      this.currentContexts.push(
        new ExiumContext(ContextTypes.Space, this.char, {
          start: this.cursor.x,
          end: this.cursor.x + 1,
          line: this.cursor.line,
          column: this.cursor.column,
        }),
      );
      this.cursor.x++;
      this.cursor.column++;
    }
    return result;
  }
  semicolon_CTX() {
    let result = this.char === ";";
    if (result) {
      this.currentContexts.push(
        new ExiumContext(ContextTypes.SemiColon, this.char, {
          start: this.cursor.x,
          end: this.cursor.x + 1,
          line: this.cursor.line,
          column: this.cursor.column,
        }),
      );
      this.cursor.x++;
      this.cursor.column++;
    }
    return result;
  }
  coma_CTX() {
    let result = this.char === ",";
    if (result) {
      this.currentContexts.push(
        new ExiumContext(ContextTypes.Coma, this.char, {
          start: this.cursor.x,
          end: this.cursor.x + 1,
          line: this.cursor.line,
          column: this.cursor.column,
        }),
      );
      this.cursor.x++;
      this.cursor.column++;
    }
    return result;
  }
  line_break_CTX() {
    let result = this.char === "\n";
    if (result) {
      this.currentContexts.push(
        new ExiumContext(ContextTypes.LineBreak, this.char, {
          start: this.cursor.x,
          end: this.cursor.x + 1,
          line: this.cursor.line,
          column: this.cursor.column,
        }),
      );
      this.cursor.column = 0;
      this.cursor.line++;
      this.cursor.x++;
    }
    return result;
  }
  braces_CTX(opts) {
    try {
      let { char: __char } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (__char !== "(") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.braces_CTX,
      ];
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === ")") {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.Braces, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.BracesOpen, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  curly_braces_CTX(opts) {
    try {
      let { char: __char } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (__char !== "{") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = opts?.contexts || [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.curly_braces_CTX,
      ];
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "}") {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.CurlyBraces, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.CurlyBracesOpen, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  array_CTX(opts) {
    try {
      let { char: __char } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (__char !== "[") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.array_CTX,
      ];
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "]") {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.Array, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.ArrayOpen, this.cursor, context);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
}
class ExiumHTMLElements extends ExiumBase {
  constructor(...args) {
    super(...args);
  }
  isEndOfStylesheet() {
    return this.isStartingNode() && this.nextPart.startsWith("</style");
  }
  isStartingNode() {
    return [
      "<",
    ].includes(this.char) &&
      (this.node_CTX(this.checkOnlyOptions) ||
        this.html_comment_CTX(this.checkOnlyOptions));
  }
  textnode_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const lastIsANode = Boolean(
        lastContext && [
          ContextTypes.Node,
          ContextTypes.NodeClosing,
          ContextTypes.HTMLComment,
        ].includes(lastContext.type),
      );
      const isValid = prev && [
            ">",
          ].includes(prev) &&
          lastIsANode ||
        __char !== "<" && !this.import_statements_CTX(this.checkOnlyOptions) &&
          !this.node_CTX(this.checkOnlyOptions) &&
          !this.comment_CTX(this.checkOnlyOptions);
      if (!isValid || !this.nodeContextStarted) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children = [];
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_template_quote_eval_CTX,
      ];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.isStartingNode()) {
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
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
  node_CTX(opts) {
    try {
      let { char: __char, prev, next, nextPart } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (
        __char !== "<" || __char === "<" && [
            " ",
            "<",
            "!",
          ].includes(next) ||
        next && /([^a-zA-Z0-9\[\/])/i.test(next)
      ) {
        return false;
      }
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      let isAutoClosing = false;
      let isNamed = false;
      let isProto = false;
      let isTemplate = false;
      let isStyle = false;
      let isNodeClosing = this.nextPart.startsWith("</");
      const subcontextEvaluatedOnce = [
        this.node_name_CTX,
      ];
      const allSubContexts = isNodeClosing
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
      const children = [];
      const related = [];
      while (!this.isEOF) {
        if (isNodeClosing && isNamed) {
          if (
            ![
              " ",
              ">",
              "\n",
            ].includes(this.char)
          ) {
            const token = source2.slice(x, this.cursor.x);
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
            this.node_CTX,
            this.html_comment_CTX,
          ],
        );
        if (!isNamed) {
          subcontextEvaluatedOnce.forEach((reader) => {
            const recognized = reader.apply(this, []);
            if (recognized) {
              let context = this.lastContext;
              related.push(context);
              isNamed = context.type === ContextTypes.Identifier;
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
      const token = source2.slice(x, this.cursor.x);
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
      });
      this.currentContexts.push(context);
      if (!isAutoClosing) {
        if (isClosed && !isNodeClosing) {
          this.openTags.push(context);
        } else if (isClosed && isNodeClosing) {
          const openTag = this.openTags.slice().reverse().find(
            (nodeContext) => {
              const name = nodeContext.related.find((related1) =>
                related1.type === ContextTypes.Identifier
              );
              const targetName = context.related.find((related1) =>
                related1.type === ContextTypes.Identifier
              );
              return name && targetName && !nodeContext.data.closed &&
                name.type === ContextTypes.Identifier &&
                name.source === targetName.source;
            },
          );
          if (!openTag) {
            this.onError(
              Reason.HTMLClosingTagWithoutOpening,
              this.cursor,
              context,
            );
          } else {
            const index = this.openTags.indexOf(openTag);
            const deleted = this.openTags.splice(index, 1);
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
  node_name_CTX(opts) {
    try {
      let { char: __char } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (
        [
          " ",
          "[",
          "!",
          "-",
          "\n",
          "/",
        ].includes(__char)
      ) {
        return false;
      }
      if (opts?.checkOnly) return true;
      let result = true;
      const children = [];
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
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.Identifier, token, {
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
  html_comment_CTX(opts) {
    try {
      let { char: __char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const sequence = [
        __char,
        next,
        source2[x + 2],
        source2[x + 3],
      ];
      if (__char !== "<" || sequence.join("") !== "<!--") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.html_comment_CTX,
          ],
        );
        if (
          this.char === ">" && this.prev === "-" &&
          source2[this.cursor.x - 2] === "-"
        ) {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
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
  import_ambient_CTX(opts) {
    try {
      let { char: __char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (!/^import\s*(["'])(.*?)(\1)/i.test(this.nextPart)) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const related = [];
      const nextContexts = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
        this.semicolon_CTX,
      ];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (
          this.char === " " || [
            '"',
            "'",
          ].includes(this.char)
        ) {
          break;
        }
      }
      nextContexts.forEach((reader, i, arr) => {
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
        ) && related.find((context) =>
          [
            ContextTypes.SemiColon,
          ].includes(context.type)
        ),
      );
      const token = source2.slice(x, this.cursor.x);
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
  import_statements_CTX(opts) {
    try {
      let { char: __char, next } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const sequence = __char + next + source2[x + 2] + source2[x + 3] +
        source2[x + 4] + source2[x + 5] + source2[x + 6];
      if (__char !== "i" || sequence !== "import ") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const related = [];
      const otherImportStatements = [
        this.import_ambient_CTX,
      ];
      const nextContexts = [
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
        const sequenceEnd = this.char + this.next + source2[this.cursor.x + 2] +
          source2[this.cursor.x + 3];
        if (sequenceEnd === "from") {
          this.cursor.x += +4;
          this.cursor.column += +4;
          break;
        }
      }
      nextContexts.forEach((reader, i, arr) => {
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
        ) && related.find((context) =>
          [
            ContextTypes.SemiColon,
          ].includes(context.type)
        ),
      );
      const token = source2.slice(x, this.cursor.x);
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
  flag_CTX(opts) {
    try {
      let { char: __char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (__char !== "-" || next !== "-") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      let isNamed = false;
      const children = [];
      const related = [];
      const allSubContexts = [
        this.curly_braces_CTX,
        this.braces_CTX,
      ];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (!isNamed) {
          isNamed = Boolean(
            this.flag_name_CTX() && related.push(this.lastContext),
          );
        }
        this.saveContextsTo(allSubContexts, children);
        if (
          [
            " ",
            "/",
            ">",
            "\n",
          ].includes(this.char)
        ) {
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
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
  flag_name_CTX(opts) {
    try {
      let { char: __char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (__char === "-") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.array_CTX,
            this.braces_CTX,
            this.curly_braces_CTX,
          ],
        );
        if (
          [
            " ",
            ">",
            "=",
            "\n",
          ].includes(this.char)
        ) {
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.Identifier, token, {
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
  flag_spread_CTX(opts) {
    try {
      let { char: __char, next } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (__char !== "{" || !/^\{(\s*)(\.){3}/i.test(this.nextPart)) {
        return false;
      }
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children = [];
      const readers = [
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
        if (
          [
            "}",
          ].includes(this.char)
        ) {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
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
  attributes_CTX(opts) {
    try {
      let { char: __char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (prev && prev !== " " || __char && !/[a-zA-Z0-9\$\_]/i.test(__char)) {
        return false;
      }
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      let isNamed = false;
      const children = [];
      const related = [];
      const allSubContexts = [
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
        this.string_template_quote_CTX,
        this.braces_CTX,
        this.attribute_unquoted_CTX,
      ];
      if (!isNamed) {
        isNamed = Boolean(
          this.attribute_name_CTX() && related.push(this.lastContext),
        );
      }
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (
          [
            " ",
            ">",
            "\n",
          ].includes(this.char)
        ) {
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
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
  attribute_boolean_CTX(opts) {
    try {
      let { char: __char } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (
        __char === "-" || !/^([^\s=\<\>\/]+?)(\s|\n|\>)/i.test(this.nextPart)
      ) {
        return false;
      }
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.array_CTX,
            this.braces_CTX,
            this.curly_braces_CTX,
          ],
        );
        if (
          [
            " ",
            "/",
            ">",
            "<",
            "\n",
          ].includes(this.next)
        ) {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
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
  attribute_name_CTX(opts) {
    try {
      let { char: __char } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (__char === "-") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.array_CTX,
            this.braces_CTX,
            this.curly_braces_CTX,
          ],
        );
        if (
          [
            " ",
            "/",
            ">",
            "=",
            "\n",
          ].includes(this.char)
        ) {
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.Identifier, token, {
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
  attribute_unquoted_CTX(opts) {
    try {
      let { char: __char, prev } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      if (prev !== "=") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(
          opts?.unexpected || [
            this.array_CTX,
            this.braces_CTX,
            this.curly_braces_CTX,
          ],
        );
        if (
          [
            " ",
            ">",
            "\n",
          ].includes(this.char)
        ) {
          isClosed = true;
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
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
class ExiumProtocol extends ExiumHTMLElements {
  constructor(...args1) {
    super(...args1);
  }
  protocol_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const lastIsAStyleNode = this.currentContexts.find((context) =>
        context.type === ContextTypes.Node && context.related.find((node) =>
          node.type === ContextTypes.Identifier && node.source === "proto"
        ) && !context.related.find((node) =>
          node.type === ContextTypes.NodeClosing
        )
      );
      const isValid = !!lastIsAStyleNode;
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children = [];
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
      ];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.isStartingNode() && this.nextPart.startsWith("</proto")) {
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.Protocol, token, {
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
}
const SupportedStyleSheetCharset = [
  "US-ASCII",
  "ISO_8859-1:1987",
  "ISO_8859-2:1987",
  "ISO_8859-3:1988",
  "ISO_8859-4:1988",
  "ISO_8859-5:1988",
  "ISO_8859-6:1987",
  "ISO_8859-7:1987",
  "ISO_8859-8:1988",
  "ISO_8859-9:1989",
  "ISO-8859-10",
  "ISO_6937-2-add",
  "JIS_X0201",
  "JIS_Encoding",
  "Shift_JIS",
  "Extended_UNIX_Code_Packed_Format_for_Japanese",
  "Extended_UNIX_Code_Fixed_Width_for_Japanese",
  "BS_4730",
  "SEN_850200_C",
  "IT",
  "ES",
  "DIN_66003",
  "NS_4551-1",
  "NF_Z_62-010",
  "ISO-10646-UTF-1",
  "ISO_646.basic:1983",
  "INVARIANT",
  "ISO_646.irv:1983",
  "NATS-SEFI",
  "NATS-SEFI-ADD",
  "NATS-DANO",
  "NATS-DANO-ADD",
  "SEN_850200_B",
  "KS_C_5601-1987",
  "ISO-2022-KR",
  "EUC-KR",
  "ISO-2022-JP",
  "ISO-2022-JP-2",
  "JIS_C6220-1969-jp",
  "JIS_C6220-1969-ro",
  "PT",
  "greek7-old",
  "latin-greek",
  "NF_Z_62-010_(1973)",
  "Latin-greek-1",
  "ISO_5427",
  "JIS_C6226-1978",
  "BS_viewdata",
  "INIS",
  "INIS-8",
  "INIS-cyrillic",
  "ISO_5427:1981",
  "ISO_5428:1980",
  "GB_1988-80",
  "GB_2312-80",
  "NS_4551-2",
  "videotex-suppl",
  "PT2",
  "ES2",
  "MSZ_7795.3",
  "JIS_C6226-1983",
  "greek7",
  "ASMO_449",
  "iso-ir-90",
  "JIS_C6229-1984-a",
  "JIS_C6229-1984-b",
  "JIS_C6229-1984-b-add",
  "JIS_C6229-1984-hand",
  "JIS_C6229-1984-hand-add",
  "JIS_C6229-1984-kana",
  "ISO_2033-1983",
  "ANSI_X3.110-1983",
  "T.61-7bit",
  "T.61-8bit",
  "ECMA-cyrillic",
  "CSA_Z243.4-1985-1",
  "CSA_Z243.4-1985-2",
  "CSA_Z243.4-1985-gr",
  "ISO_8859-6-E",
  "ISO_8859-6-I",
  "T.101-G2",
  "ISO_8859-8-E",
  "ISO_8859-8-I",
  "CSN_369103",
  "JUS_I.B1.002",
  "IEC_P27-1",
  "JUS_I.B1.003-serb",
  "JUS_I.B1.003-mac",
  "greek-ccitt",
  "NC_NC00-10:81",
  "ISO_6937-2-25",
  "GOST_19768-74",
  "ISO_8859-supp",
  "ISO_10367-box",
  "latin-lap",
  "JIS_X0212-1990",
  "DS_2089",
  "us-dk",
  "dk-us",
  "KSC5636",
  "UNICODE-1-1-UTF-7",
  "ISO-2022-CN",
  "ISO-2022-CN-EXT",
  "UTF-8",
  "ISO-8859-13",
  "ISO-8859-14",
  "ISO-8859-15",
  "ISO-8859-16",
  "GBK",
  "GB18030",
  "OSD_EBCDIC_DF04_15",
  "OSD_EBCDIC_DF03_IRV",
  "OSD_EBCDIC_DF04_1",
  "ISO-11548-1",
  "KZ-1048",
  "ISO-10646-UCS-2",
  "ISO-10646-UCS-4",
  "ISO-10646-UCS-Basic",
  "ISO-10646-Unicode-Latin1",
  "ISO-10646-J-1",
  "ISO-Unicode-IBM-1261",
  "ISO-Unicode-IBM-1268",
  "ISO-Unicode-IBM-1276",
  "ISO-Unicode-IBM-1264",
  "ISO-Unicode-IBM-1265",
  "UNICODE-1-1",
  "SCSU",
  "UTF-7",
  "UTF-16BE",
  "UTF-16LE",
  "UTF-16",
  "CESU-8",
  "UTF-32",
  "UTF-32BE",
  "UTF-32LE",
  "BOCU-1",
  "UTF-7-IMAP",
  "ISO-8859-1-Windows-3.0-Latin-1",
  "ISO-8859-1-Windows-3.1-Latin-1",
  "ISO-8859-2-Windows-Latin-2",
  "ISO-8859-9-Windows-Latin-5",
  "hp-roman8",
  "Adobe-Standard-Encoding",
  "Ventura-US",
  "Ventura-International",
  "DEC-MCS",
  "IBM850",
  "PC8-Danish-Norwegian",
  "IBM862",
  "PC8-Turkish",
  "IBM-Symbols",
  "IBM-Thai",
  "HP-Legal",
  "HP-Pi-font",
  "HP-Math8",
  "Adobe-Symbol-Encoding",
  "HP-DeskTop",
  "Ventura-Math",
  "Microsoft-Publishing",
  "Windows-31J",
  "GB2312",
  "Big5",
  "macintosh",
  "IBM037",
  "IBM038",
  "IBM273",
  "IBM274",
  "IBM275",
  "IBM277",
  "IBM278",
  "IBM280",
  "IBM281",
  "IBM284",
  "IBM285",
  "IBM290",
  "IBM297",
  "IBM420",
  "IBM423",
  "IBM424",
  "IBM437",
  "IBM500",
  "IBM851",
  "IBM852",
  "IBM855",
  "IBM857",
  "IBM860",
  "IBM861",
  "IBM863",
  "IBM864",
  "IBM865",
  "IBM868",
  "IBM869",
  "IBM870",
  "IBM871",
  "IBM880",
  "IBM891",
  "IBM903",
  "IBM904",
  "IBM905",
  "IBM918",
  "IBM1026",
  "EBCDIC-AT-DE",
  "EBCDIC-AT-DE-A",
  "EBCDIC-CA-FR",
  "EBCDIC-DK-NO",
  "EBCDIC-DK-NO-A",
  "EBCDIC-FI-SE",
  "EBCDIC-FI-SE-A",
  "EBCDIC-FR",
  "EBCDIC-IT",
  "EBCDIC-PT",
  "EBCDIC-ES",
  "EBCDIC-ES-A",
  "EBCDIC-ES-S",
  "EBCDIC-UK",
  "EBCDIC-US",
  "UNKNOWN-8BIT",
  "MNEMONIC",
  "MNEM",
  "VISCII",
  "VIQR",
  "KOI8-R",
  "HZ-GB-2312",
  "IBM866",
  "IBM775",
  "KOI8-U",
  "IBM00858",
  "IBM00924",
  "IBM01140",
  "IBM01141",
  "IBM01142",
  "IBM01143",
  "IBM01144",
  "IBM01145",
  "IBM01146",
  "IBM01147",
  "IBM01148",
  "IBM01149",
  "Big5-HKSCS",
  "IBM1047",
  "PTCP154",
  "Amiga-1251",
  "KOI7-switched",
  "BRF",
  "TSCII",
  "CP51932",
  "windows-874",
  "windows-1250",
  "windows-1251",
  "windows-1252",
  "windows-1253",
  "windows-1254",
  "windows-1255",
  "windows-1256",
  "windows-1257",
  "windows-1258",
  "TIS-620",
  "CP50220",
  "Alexander Uskov",
  "Alexei Veremeev",
  "Chris Wendt",
  "Florian Weimer",
  "Hank Nussbacher",
  "Internet Assigned Numbers Authority",
  "Jun Murai",
  "Katya Lazhintseva",
  "Keld Simonsen",
  "Keld Simonsen",
  "Kuppuswamy Kalyanasundaram",
  "Mark Davis",
  "Markus Scherer",
  "Masataka Ohta",
  "Nicky Yick",
  "Reuel Robrigado",
  "Rick Pond",
  "Sairan M. Kikkarin",
  "Samuel Thibault",
  "Shawn Steele",
  "Tamer Mahdi",
  "Toby Phipps",
  "Trin Tantsetthi",
  "Vladas Tumasonis",
  "Woohyong Choi",
  "Yui Naruse",
];
class ExiumStyleSheet extends ExiumProtocol {
  constructor(...args2) {
    super(...args2);
  }
  stylesheet_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const lastIsAStyleNode = this.currentContexts.find((context) =>
        context.type === ContextTypes.Node && context.related.find((node) =>
          node.type === ContextTypes.Identifier && node.source === "style"
        ) && !context.related.find((node) =>
          node.type === ContextTypes.NodeClosing
        )
      );
      const isValid = !!lastIsAStyleNode || this.isParsingStylesheet;
      if (!isValid) return false;
      if (opts?.checkOnly) return !this.isEndOfStylesheet();
      let result = true;
      const children = [];
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.comment_block_CTX,
        this.comment_CTX,
        this.stylesheet_charset_at_rule_CTX,
        this.stylesheet_const_at_rule_CTX,
        this.stylesheet_export_at_rule_CTX,
        this.stylesheet_default_at_rule_CTX,
        this.stylesheet_selector_list_CTX,
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
      const token = source2.slice(x, this.cursor.x);
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
  stylesheet_charset_at_rule_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const sequence = [
        __char,
        next,
        source2[x + 2],
        source2[x + 3],
        source2[x + 4],
        source2[x + 5],
        source2[x + 6],
      ].join("");
      const isValid = Boolean(prev === "@" && sequence === "charset");
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children = [];
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_double_quote_CTX,
        this.string_single_quote_CTX,
      ];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === ";") {
          break;
        }
      }
      const isClosedBySemicolon = this.semicolon_CTX();
      isClosed = Boolean(
        isClosedBySemicolon && children.length && children.find((context) =>
          [
            ContextTypes.StringSingleQuote,
            ContextTypes.StringDoubleQuote,
          ].includes(context.type)
        ),
      );
      const token = source2.slice(x, this.cursor.x);
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
      const str = children.find((context1) =>
        [
          ContextTypes.StringSingleQuote,
          ContextTypes.StringDoubleQuote,
        ].includes(context1.type)
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
  stylesheet_export_at_rule_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const sequence = [
        __char,
        next,
        source2[x + 2],
        source2[x + 3],
        source2[x + 4],
        source2[x + 5],
        source2[x + 6],
      ].join("");
      const isValid = Boolean(prev === "@" && sequence === "export ");
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children = [];
      const allSubContexts = [
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_const_at_rule_CTX,
      ];
      const shifted = this.shiftUntilEndOf("export");
      if (!shifted) return false;
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
      const token = source2.slice(x, this.cursor.x);
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
  stylesheet_const_at_rule_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const sequence = [
        __char,
        next,
        source2[x + 2],
        source2[x + 3],
        source2[x + 4],
        source2[x + 5],
      ].join("");
      const isValid = Boolean(
        (prev === "@" || opts?.data?.isExportStatement) &&
          sequence === "const ",
      );
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isNamed = false;
      const children = [];
      const related = [];
      const allSubContexts = [
        this.multiple_spaces_CTX,
        this.space_CTX,
      ];
      const describers = [
        this.stylesheet_const_at_rule_name_CTX,
        this.stylesheet_type_assignment_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.stylesheet_const_at_rule_equal_CTX,
      ];
      const shifted = this.shiftUntilEndOf("const");
      if (!shifted) return false;
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (!isNamed) {
          this.saveContextsTo(describers, related, {
            data: {
              force_type_assignment_context: true,
            },
          });
          isNamed = Boolean(
            related.find((context) =>
              context.type === ContextTypes.Identifier
            ),
          );
        } else {
          this.saveContextsTo(allSubContexts, children);
        }
        if (this.char === ";") {
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
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
  stylesheet_const_at_rule_name_CTX(opts) {
    try {
      let { nextPart } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const isValid = /^[a-zA-Z]/i.test(nextPart);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (/[^a-zA-Z0-9_]/i.test(this.char)) {
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.Identifier,
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
  stylesheet_const_at_rule_equal_CTX(opts) {
    try {
      let { char: __char, next } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const isValid = __char === "=" && next !== "=";
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children = [];
      const subs = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(subs, children);
        if (this.semicolon_CTX() || this.next === ";") {
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
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
  stylesheet_default_at_rule_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const isValid = Boolean(prev === "@" && __char !== " ");
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isTyped = false;
      let isClosed = false;
      const children = [];
      const describers = [
        this.stylesheet_at_rule_name_CTX,
        this.stylesheet_type_assignment_CTX,
      ];
      const allSubContexts = [];
      const related = [];
      this.saveContextsTo(describers, related);
      isTyped = !!related.find((context) =>
        context.type === ContextTypes.StyleSheetTypeAssignment
      );
      const atRuleName = related.find((context) =>
        context.type === ContextTypes.Identifier
      );
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (
          this.char === "{" || this.char === ";" || this.isEndOfStylesheet()
        ) {
          break;
        }
      }
      const subCurlyBracesContexts = [];
      isClosed = this.curly_braces_CTX({
        contexts: subCurlyBracesContexts,
      });
      if (isClosed) {
        const { lastContext: lastContext1 } = this;
        lastContext1.type = ContextTypes.StyleSheetCurlyBraces;
        children.push(lastContext1);
      }
      const token = source2.slice(x, this.cursor.x);
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
  stylesheet_type_assignment_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const isValid = __char === "<" &&
        (prev === "@" || opts?.data?.force_type_assignment_context);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const children = [];
      const allSubContexts = opts?.contexts || [];
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
      const token = source2.slice(x, this.cursor.x);
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
  stylesheet_at_rule_name_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const isValid = ![
        " ",
        "@",
        "<",
      ].includes(__char);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children = [];
      const allSubContexts = opts?.contexts || [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === " ") {
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
      const context = new ExiumContext(
        ContextTypes.Identifier,
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
  stylesheet_selector_list_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext, nextPart } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const isValid = ![
        ",",
        "@",
      ].includes(__char) && nextPart.match(/^([^;\{]+?)(\{)/mi);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const supportedSelectors = [
        this.stylesheet_selector_element_CTX,
        this.stylesheet_selector_class_CTX,
      ];
      const children = [];
      const allSubContexts = opts?.contexts || [
        this.multiple_spaces_CTX,
        this.space_CTX,
        ...supportedSelectors,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.line_break_CTX,
        this.coma_CTX,
        this.line_break_CTX,
      ];
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
      const token = source2.slice(x, this.cursor.x);
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
  stylesheet_selector_element_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const isValid = ![
        "#",
        ".",
        "[",
        " ",
        "@",
        "{",
      ].includes(__char);
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (
          [
            "#",
            ".",
            "[",
            ",",
            " ",
            "{",
          ].includes(this.char) || this.isEndOfStylesheet()
        ) {
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
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
  stylesheet_selector_class_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const isValid = __char === ".";
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (
          [
            "#",
            "[",
            ",",
            " ",
            "{",
          ].includes(this.char) || this.isEndOfStylesheet()
        ) {
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
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
  stylesheet_selector_id_CTX(opts) {
    try {
      let { char: __char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source: source2 } = this;
      const isValid = __char === "#" && !this.isEndOfStylesheet();
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        if (
          [
            ".",
            "[",
            ",",
            " ",
          ].includes(this.char) || this.isEndOfStylesheet()
        ) {
          break;
        }
      }
      const token = source2.slice(x, this.cursor.x);
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
class Exium1 extends ExiumStyleSheet {
  constructor(...args3) {
    super(...args3);
  }
  scopedTopLevel = {
    lexer: [
      this.comment_CTX,
      this.comment_block_CTX,
      this.line_break_CTX,
      this.multiple_spaces_CTX,
      this.space_CTX,
      this.string_template_quote_CTX,
    ],
    component: [
      this.comment_CTX,
      this.comment_block_CTX,
      this.line_break_CTX,
      this.multiple_spaces_CTX,
      this.space_CTX,
      this.string_single_quote_CTX,
      this.string_double_quote_CTX,
      this.import_ambient_CTX,
      this.import_statements_CTX,
      this.html_comment_CTX,
      this.node_CTX,
      this.stylesheet_CTX,
      this.protocol_CTX,
      this.textnode_CTX,
    ],
    stylesheet: [
      this.comment_CTX,
      this.comment_block_CTX,
      this.line_break_CTX,
      this.multiple_spaces_CTX,
      this.space_CTX,
      this.stylesheet_CTX,
    ],
    protocol: [
      this.line_break_CTX,
      this.multiple_spaces_CTX,
      this.space_CTX,
      this.protocol_CTX,
    ],
    custom: [],
  };
  readSync(text, opts) {
    try {
      this.parseOptions = opts;
      this.source = text;
      const toplevel = this.scopedTopLevel[opts.type];
      if (opts.type === "custom") {
        toplevel.push(...opts.contexts || []);
      }
      while (!this.isEOF) {
        const isValid = this.topCTX(toplevel);
        if (!isValid) {
          this.onError(Reason.UnexpectedToken, this.cursor, this.unexpected);
          break;
        }
      }
      if (this.openTags.length) {
        const lastNode = this.openTags[this.openTags.length - 1];
        this.onError(Reason.HTMLTagNotClosed, this.cursor, lastNode);
      }
      return this.currentContexts;
    } catch (err) {
      throw err;
    }
  }
}
export { Exium1 as Exium };
