import {
  ContextReader,
  CursorDescriber,
  OgooneLexerParseOptions,
  ContextReaderOptions,
} from '../types/main.d.ts';
import { ExiumContext } from './ExiumContext.ts';
import { ContextTypes } from '../enums/context-types.ts';
import { Reason } from '../enums/error-reason.ts';

/**
 * final class of Exium
 * all basic methods or properties
 * to use into Exium classes
 */
export class ExiumBase {
  protected readonly checkOnlyOptions: ContextReaderOptions = { checkOnly: true };
  /**
   * returns true if the parse method is configured has stylesheet
   */
   get isParsingStylesheet(): boolean {
    return Boolean(this.parseOptions && this.parseOptions.type === 'stylesheet');
  }
  /**
   * all regular at rules
   * that aren't followed by curly braces
   */
  protected regularAtRulesNames: string[] = [
    'charset',
    'import',
    'namespace',
  ];
  /**
   * cache for contexts
   * where the key is the text
   * if the text match, should return all the retrieved contexts
   */
  static mapContexts: Map<string, ExiumContext[]> = new Map();
  /**
   * you should save here all the retrieved context
   * of the document
   */
  protected currentContexts: ExiumContext[] = [];
  // to retrieve all remaining open tag
  protected openTags: ExiumContext[] = [];
  /**
   * this will shift the cursor into the document
   */
  protected cursor: CursorDescriber = {
    x: 0,
    line: 0,
    column: 0,
  };
  protected source: string = '';
  /**
   * the current character
   */
  protected get char(): string {
    return this.source[this.cursor.x];
  };
  /**
  * the next character
  */
  protected get next(): string | undefined {
    return this.source[this.cursor.x + 1];
  };
  /**
  * the previous character
  */
  protected get prev(): string | undefined {
    return this.source[this.cursor.x - 1];
  };
  /**
   * the following part
   * from the cursor index until the end of the document
   */
  protected get nextPart(): string {
    return this.source.slice(this.cursor.x);
  }
  /**
   * the following part
   * from the cursor index until the end of the document
   */
  protected get previousPart(): string {
    return this.source.slice(0, this.cursor.x);
  }
  /**
   * should return the previously defined context
   */
  protected get unexpected(): ExiumContext {
    return new ExiumContext(ContextTypes.Unexpected, this.source.slice(this.cursor.x), {
      start: this.cursor.x,
      line: this.cursor.line,
      column: this.cursor.column,
      end: this.cursor.x + 1,
    });
  }
  protected get lastContext(): ExiumContext {
    const last = this.currentContexts[this.currentContexts.length - 1]
      || this.unexpected;
    return last;
  }
  // returns if a node context has been declared
  protected get nodeContextStarted(): boolean {
    return Boolean(this.currentContexts.find((context) => [ContextTypes.Node].includes(context.type)))
  }
  protected parseOptions: OgooneLexerParseOptions | null = null;
  /**
   * returns if the lexer has finished to read
   */
  protected get isEOF(): boolean {
    return Boolean(this.source.length === this.cursor.x);
  }
  constructor(protected onError: (reason: Reason, cursor: CursorDescriber, context: ExiumContext) => any) { }
  /**
   * should validate if the character is accepted inside the current context
   * if it's not the ogone lexer will use the error function passed into the constructor
   */
  isValidChar(unexpected?: ContextReader[]) {
    if (!unexpected) return;
    for (let reader of unexpected) {
      const isUnexpected = reader.apply(this, [this.checkOnlyOptions]);
      if (isUnexpected) {
        this.onError(Reason.UnexpectedToken, this.cursor, this.lastContext);
      }
    }
  }

  /**
   * find through the first argument the children context
   * will push the contexts to the second argument
   */
  saveContextsTo(
    /**
     * the contexts to check
     */
    fromContexts: ContextReader[],
    /**
     * the array used to save the children contexts
     */
    to: ExiumContext[],
    opts?: ContextReaderOptions) {
    fromContexts.forEach((reader) => {
      const recognized = reader.apply(this, [opts || {}]);
      if (recognized) {
        to.push(this.lastContext);
      }
    });
  }
  /**
   * same as saveContextsTo but if no context is found,
   * the function onError iscalled
   */
  saveStrictContextsTo(
    /**
     * the contexts to check
     */
    fromContexts: ContextReader[],
    /**
     * the array used to save the children contexts
     */
    to: ExiumContext[],
    opts?: ContextReaderOptions) {
    const { length } = to;
    fromContexts.forEach((reader) => {
      const recognized = reader.apply(this, [opts || {}]);
      if (recognized) {
        to.push(this.lastContext);
      }
    });
    // no changes
    if (to.length === length && !this.isEOF) {
      this.onError(Reason.UnexpectedToken, this.cursor, this.unexpected);
    }
  }
  /**
   * move the cursor and the column,
   * this method is used during parsing step
   */
  shift(movement: number = 1) {
    this.cursor.x += + movement;
    this.cursor.column += + movement;
  }
  shiftUntilEndOf(text: string): boolean {
    if (!this.nextPart.startsWith(text)) return false;
    let result = '';
    while (result !== text) {
      result += this.char;
      this.shift(1);
    }
    return true;
  }
  /**
   * read the top level of the current document
   * @param readers array of context readers which will shift the cursor of the lexer
   */
   topCTX(readers: ContextReader[]): boolean {
    try {
      return Boolean(
        readers.find((reader) => reader.apply(this, []))
      );
    } catch (err) {
      throw err;
    }
  }
  /**
   * will parse any comment blocks starting with /* and ending with * /
   */
  comment_block_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "/" || char === "/" && next !== '*') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts: ContextReader[] = [
        this.line_break_CTX,
      ];
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "/" && this.prev === '*') {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
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
  /**
   * will parse any comment blocks starting with /* and ending with * /
   */
  comment_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "/" || char === "/" && next !== '/') return false;
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
      const token = source.slice(x, this.cursor.x);
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
  /**
   * reads the all strings starting with a '
   */
  string_single_quote_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      let { source } = this;
      const { x, column, line } = this.cursor;
      if (char !== "'" || char === "'" && prev === '\\') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected || [
          this.line_break_CTX
        ]);
        if (this.char === "'" && this.prev !== '\\') {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
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
  /**
   * reads the all strings starting with a "
   */
  string_double_quote_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      let { source } = this;
      const { x, column, line } = this.cursor;
      if (char !== "\"" || char === "\"" && prev === '\\') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected || [
          this.line_break_CTX
        ]);
        if (this.char === "\"" && this.prev !== '\\') {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
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
  /**
   * reads the all strings starting with a `
   */
  string_template_quote_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "`" || char === "`" && prev === '\\') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.string_template_quote_eval_CTX,
      ];
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "`" && this.prev !== '\\') {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.StringTemplateQuote, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
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
  /**
   * checks inside a string_template_quote_context if there's an evaluation
   */
  string_template_quote_eval_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "$" || char === "$" && prev === '\\' || char === "$" && next !== '{') return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.string_template_quote_CTX,
      ];
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === "}" && this.prev !== '\\') {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.StringTemplateQuoteEval, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.StringTemplateQuoteEvaluationOpen, this.cursor, context);
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
   multiple_spaces_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char, next, source } = this;
      if (char !== ' ' || next !== ' ') return false;
      const { x, column, line } = this.cursor;
      let result = false;
      while (this.char === ' ') {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
      }
      result = x !== this.cursor.x;
      if (result) {
        const token = source.slice(x, this.cursor.x);
        this.currentContexts.push(new ExiumContext(ContextTypes.MultipleSpaces, token, {
          start: x,
          end: this.cursor.x,
          line,
          column,
        }));
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  space_CTX() {
    let result = this.char === ' ' && this.next !== this.char;
    if (result) {
      this.currentContexts.push(new ExiumContext(ContextTypes.Space, this.char, {
        start: this.cursor.x,
        end: this.cursor.x + 1,
        line: this.cursor.line,
        column: this.cursor.column,
      }))
      this.cursor.x++;
      this.cursor.column++;
    }
    return result;
  }
  semicolon_CTX() {
    let result = this.char === ';';
    if (result) {
      this.currentContexts.push(new ExiumContext(ContextTypes.SemiColon, this.char, {
        start: this.cursor.x,
        end: this.cursor.x + 1,
        line: this.cursor.line,
        column: this.cursor.column,
      }))
      this.cursor.x++;
      this.cursor.column++;
    }
    return result;
  }
  coma_CTX() {
    let result = this.char === ',';
    if (result) {
      this.currentContexts.push(new ExiumContext(ContextTypes.Coma, this.char, {
        start: this.cursor.x,
        end: this.cursor.x + 1,
        line: this.cursor.line,
        column: this.cursor.column,
      }))
      this.cursor.x++;
      this.cursor.column++;
    }
    return result;
  }
  line_break_CTX() {
    let result = this.char === '\n';
    if (result) {
      this.currentContexts.push(new ExiumContext(ContextTypes.LineBreak, this.char, {
        start: this.cursor.x,
        end: this.cursor.x + 1,
        line: this.cursor.line,
        column: this.cursor.column,
      }))
      this.cursor.column = 0;
      this.cursor.line++;
      this.cursor.x++;
    }
    return result;
  }
  /**
   * should match with ( ... ) and is recursive
   */
   braces_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "(") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.braces_CTX,
      ];
      const children: ExiumContext[] = [];
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
      const token = source.slice(x, this.cursor.x);
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
  /**
   * should match with {...} and is recursive
   */
  curly_braces_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "{") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = opts?.contexts || [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.curly_braces_CTX,
      ];
      const children: ExiumContext[] = [];
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
      const token = source.slice(x, this.cursor.x);
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
  /**
   * should match with [...] and is recursive
   */
  array_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      if (char !== "[") return false;
      if (opts?.checkOnly) return true;
      let result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.array_CTX,
      ];
      const children: ExiumContext[] = [];
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
      const token = source.slice(x, this.cursor.x);
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
