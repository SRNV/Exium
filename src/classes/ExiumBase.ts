import {
  ContextReader,
  ContextReaderOptions,
  CursorDescriber,
  OgooneLexerParseOptions,
} from "../types/main.d.ts";
import { ExiumContext } from "./ExiumContext.ts";
import { ContextTypes } from "../enums/context-types.ts";
import { Reason } from "../enums/error-reason.ts";

const regImportStart = /import\s+$/;
const importRegExp = /^import\b/i;
const importComponentRegExp = /^import\s+component\b/i;
/**
 * final class of Exium
 * all basic methods or properties
 * to use into Exium classes
 */
export class ExiumBase {
  private treePosition = 0;
  protected supportedComponentTypes = [
    "component",
    "app",
    "async",
    "router",
    "store",
    "controller",
    "gl",
  ];
  protected readonly checkOnlyOptions: ContextReaderOptions = {
    checkOnly: true,
  };
  /**
   * returns true if the parse method is configured has stylesheet
   */
  get isParsingStylesheet(): boolean {
    return Boolean(
      this.parseOptions && this.parseOptions.type === "stylesheet",
    );
  }
  /**
   * all regular at rules
   * that aren't followed by curly braces
   */
  protected regularAtRulesNames: string[] = [
    "charset",
    "import",
    "namespace",
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
  protected source = "";
  /**
   * the current character
   */
  protected get char(): string {
    return this.source[this.cursor.x];
  }
  /**
   * the character code of the current character
   */
  protected get charCode(): number {
    return this.char?.charCodeAt(0);
  }
  /**
   * if the current character is \n \t \r \s
   */
  get isCharSpacing(): boolean {
    const code = this.charCode;
    return code === 9 ||
      code === 10 ||
      code === 13 ||
      code === 32;
  }
  /**
   * if the current character is a letter
   */
  get isCharIdentifier(): boolean {
    if (this.isCharSpacing) return false;
    const code = this.charCode;
    return code >= 65 &&
      code <= 90 ||
      code === 36 ||
      code === 95 ||
      code >= 97 &&
      code <= 122;
  }
  /**
   * if the current character is a number
   */
  get isCharDigit(): boolean {
    if (this.isCharSpacing) return false;
    const code = this.charCode;
    return code >= 48 && code <= 57;
  }
  /**
   * if the current character is a punctuation
   */
  get isCharPuntuation(): boolean {
    const code = this.charCode;
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
  * the next character
  */
  protected get next(): string | undefined {
    return this.source[this.cursor.x + 1];
  }
  /**
  * the previous character
  */

  protected get prev(): string | undefined {
    return this.source[this.cursor.x - 1];
  } /**
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
   * @param text text that the next part of the source should start with
   * @param shiftToTheEnd move the cursor to the end of the text, will only sift if the the next part is starting with the text
   * @returns true if the next part of the source is starting with the first argument
   */
  protected isFollowedBy(text: string, shiftToTheEnd?: boolean): boolean {
    const { nextPart } = this;
    const result = nextPart.startsWith(text);
    if (shiftToTheEnd && result) {
      this.shiftUntilEndOf(text);
    }
    return result;
  }
  /**
   * checks if the context.source is included into the support list
   */
  protected checkSupport(
    context: ExiumContext,
    supportList: string[],
    strict?: boolean,
  ) {
    const result = supportList.includes(context.source);
    if (strict && !result) {
      this.onError(Reason.Unsupported, this.cursor, context);
      return result;
    }
    return result;
  }
  /**
   * should return the previously defined context
   */
  protected get unexpected(): ExiumContext {
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
  protected get lastContext(): ExiumContext {
    const last = this.currentContexts[this.currentContexts.length - 1] ||
      this.unexpected;
    return last;
  }
  // returns if a node context has been declared
  protected get nodeContextStarted(): boolean {
    return Boolean(
      this.currentContexts.find((context) =>
        [ContextTypes.Node].includes(context.type)
      ),
    );
  }
  protected parseOptions: OgooneLexerParseOptions | null = null;
  protected debugg(...args: unknown[]): void {
    if (this.parseOptions?.debugg) {
      console.log(...args);
    }
  }
  protected debuggPosition(name: string): void {
    if (this.parseOptions?.debugg) {
      this.debugg(`${this.cursor.x} - %c${name.trim()}`, "color:orange", {
        prev: this.prev,
        char: this.char,
        next: this.next,
      });
    }
  }
  /**
   * returns if the lexer has finished to read
   */
  protected get isEOF(): boolean {
    const { char } = this;
    return Boolean(!char || this.source.length === this.cursor.x);
  }
  constructor(
    /**
     * function used when Exium find an unexpected token
     */
    protected onError: (
      reason: Reason,
      cursor: CursorDescriber,
      context: ExiumContext,
    ) => void,
  ) { }
  /**
   * should validate if the character is accepted inside the current context
   * if it's not the ogone lexer will use the error function passed into the constructor
   */
  isValidChar(unexpected?: ContextReader[]) {
    if (!unexpected) return;
    for (const reader of unexpected) {
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
    opts?: ContextReaderOptions,
  ) {
    let endingCTX = false;
    this.treePosition++;
    for (const reader of fromContexts) {
      this.debugg(
        `${"\t".repeat(this.treePosition)}%c[${this.char}]`,
        "color:yellow",
      );
      const recognized = reader.apply(this, [opts || {}]);
      if (recognized === null) {
        to.push(this.lastContext);
        fromContexts.splice(0);
        endingCTX = true;
        break;
      }
      if (recognized) {
        this.debugg(
          `\n\t\t\t%cusing reader: ${reader.name} was sucessful\n`,
          "color:gray",
        );
        to.push(this.lastContext);
      }
    }
    this.treePosition--;
    if (endingCTX) return;
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
    opts?: ContextReaderOptions,
  ) {
    const { length } = to;
    let endingCTX = false;
    this.treePosition++;
    for (const reader of fromContexts) {
      this.debugg(
        `${"\t".repeat(this.treePosition)}%c[${this.char}]`,
        "color:yellow",
      );
      const recognized = reader.apply(this, [opts || {}]);
      if (recognized === null) {
        to.push(this.lastContext);
        fromContexts.splice(0);
        endingCTX = true;
        break;
      }
      if (recognized) {
        this.debugg(
          `\n\t\t\t%cusing reader: ${reader.name} was sucessful\n`,
          "color:gray",
        );
        to.push(this.lastContext);
      }
    }
    this.treePosition--;
    if (endingCTX) return;
    // no changes
    if (to.length === length && !this.isEOF) {
      this.onError(Reason.UnexpectedToken, this.cursor, this.unexpected);
    }
  }
  /**
   * move the cursor and the column,
   * this method is used during parsing step
   */
  shift(movement = 1) {
    this.cursor.x += +movement;
    this.cursor.column += +movement;
    this.debugg(
      `%c\t\t${movement} ${this.prev} ${">".repeat(movement > 0 ? movement : 0)
      } ${this.char}`,
      "color:gray",
    );
  }
  shiftUntilEndOf(text: string): boolean {
    if (!this.nextPart.startsWith(text)) return false;
    let result = "";
    while (result !== text) {
      result += this.char;
      this.shift(1);
    }
    return true;
  }
  saveToken(token: string, type: ContextTypes): ExiumContext | undefined {
    const { x, line, column } = this.cursor;
    const hasShifted = this.shiftUntilEndOf(token);
    if (hasShifted) {
      const context = new ExiumContext(type, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      this.currentContexts.push(context);
      return context;
    }
  }
  /**
   * read the top level of the current document
   * @param readers array of context readers which will shift the cursor of the lexer
   */
  topCTX(readers: ContextReader[]): boolean {
    try {
      return Boolean(
        readers.find((reader) => reader.apply(this, [])),
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
      const { char, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (char !== "/" || char === "/" && next !== "*") return false;
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      const allSubContexts: ContextReader[] = [
        this.line_break_CTX,
      ];
      const children: ExiumContext[] = [];
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
      const { char, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (char !== "/" || char === "/" && next !== "/") return false;
      if (opts?.checkOnly) return true;
      const result = true;
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
      const { char, prev } = this;
      const { source } = this;
      const { x, column, line } = this.cursor;
      if (char !== "'" || char === "'" && prev === "\\") return false;
      if (opts?.checkOnly) return true;
      const result = true;
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
      const { char, prev } = this;
      const { source } = this;
      const { x, column, line } = this.cursor;
      if (char !== '"' || char === '"' && prev === "\\") return false;
      if (opts?.checkOnly) return true;
      const result = true;
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
      const { char, prev } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (char !== "`" || char === "`" && prev === "\\") return false;
      if (opts?.checkOnly) return true;
      const result = true;
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
        if (this.char === "`" && this.prev !== "\\") {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
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
  /**
   * checks inside a string_template_quote_context if there's an evaluation
   */
  string_template_quote_eval_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char, prev, next } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
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
        if (this.char === "}" && this.prev !== "\\") {
          this.shift(1);
          isClosed = true;
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
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
  /**
   * reads if the cursor's character is a space
   * @returns true if the current character and the next characters are spaces
   */
  multiple_spaces_CTX(opts?: ContextReaderOptions): boolean {
    this.debuggPosition("\n\n\t\tMULTISPACE START");
    try {
      const { char, next, source } = this;
      if (char !== " " || next !== " ") return false;
      const { x, column, line } = this.cursor;
      let result = false;
      while (this.char === " ") {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
      }
      result = x !== this.cursor.x;
      if (result) {
        const token = source.slice(x, this.cursor.x);
        this.currentContexts.push(
          new ExiumContext(ContextTypes.MultipleSpaces, token, {
            start: x,
            end: this.cursor.x,
            line,
            column,
          }),
        );
      }
      this.debuggPosition("\n\n\t\tMULTISPACE END");
      return result;
    } catch (err) {
      throw err;
    }
  }
  identifier_asterix_CTX(opts?: ContextReaderOptions): boolean | null {
    this.debuggPosition("ASTERIX CTX START");
    const { line, column, x } = this.cursor;
    const { char, source } = this;
    const isValid = char === '*';
    if (!isValid) return false;
    if (opts?.checkOnly) return true;
    this.shift(1);
    const related: ExiumContext[] = [];
    this.saveStrictContextsTo([
      this.multiple_spaces_CTX,
      this.space_CTX,
      this.identifier_alias_CTX,
    ], related);
    const isGlobalAlias = related.find((context) => context.type === ContextTypes.IdentifierAsStatement);
    const token = source.slice(x, this.cursor.x);
    const context = new ExiumContext(!!isGlobalAlias ? ContextTypes.ImportAllAlias : ContextTypes.Asterix, token, {
      line,
      column,
      start: x,
      end: this.cursor.x,
    });
    this.currentContexts.push(context);
    this.debuggPosition("ASTERIX CTX END");
    return true;
  }
  identifier_CTX(opts?: ContextReaderOptions) {
    this.debuggPosition("Identifier CTX START");
    const { line, column, x } = this.cursor;
    if (
      !this.isCharIdentifier &&
      (!opts?.data?.allowDigit && !this.isCharDigit)
    ) {
      return false;
    }
    if (opts?.checkOnly) return true;
    const allowAliases = opts?.data?.identifer_allow_alias;
    const allowedIdentifierChars = [
      ...(opts?.data?.allowedIdentifierChars as string[] || []),
    ];
    this.shift(1);
    let isAliased = false;
    const related: ExiumContext[] = [];
    while (!this.isEOF) {
      if (!isAliased && allowAliases) {
        const recognized = this.identifier_alias_CTX();
        if (recognized) {
          const { lastContext } = this;
          related.push(lastContext);
          isAliased = true;
        }
      }
      if (
        (this.isCharPuntuation || this.isCharSpacing) &&
        !allowedIdentifierChars.includes(this.char)
      ) {
        break;
      }
      this.shift(1);
    }
    const token = this.source.slice(x, this.cursor.x);
    this.currentContexts.push(
      new ExiumContext(ContextTypes.Identifier, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      }),
    );
    return true;
  }
  identifier_list_CTX(opts?: ContextReaderOptions): boolean | null {
    this.debuggPosition("Identifier LIST CTX Start");
    const { char, source } = this;
    const isValid = char === "{";
    if (!isValid) return false;
    if (opts?.checkOnly) return true;
    const { line, column, x } = this.cursor;
    this.shift(1);
    const readers: ContextReader[] = [
      this.line_break_CTX,
      this.space_CTX,
      this.multiple_spaces_CTX,
    ];
    const children: ExiumContext[] = [];
    let isComaNeeded = false;
    let isUnexpected = false;
    while (!this.isEOF) {
      this.saveContextsTo(readers, children);
      if (
        (!isComaNeeded) && this.identifier_CTX(this.checkOnlyOptions) &&
        this.char !== ","
      ) {
        const identified = this.identifier_CTX(opts);
        if (identified) {
          const { lastContext } = this;
          children.push(lastContext);
          isComaNeeded = true;
        }
      }
      if (isComaNeeded && this.char === ",") {
        const identifiedComa = this.coma_CTX();
        if (identifiedComa) {
          const { lastContext } = this;
          children.push(lastContext);
          isComaNeeded = false;
        }
      }
      if (!(this.char === "}" || this.isCharSpacing)) {
        isUnexpected = true;
      }
      if (isUnexpected) {
        this.onError(Reason.UnexpectedToken, this.cursor, this.unexpected);
      }
      if (this.char === "}") {
        this.shift(1);
        break;
      }
      this.isValidChar(opts?.unexpected);
      this.shift(1);
    }
    const token = source.slice(x, this.cursor.x);
    const context = new ExiumContext(ContextTypes.IdentifierList, token, {
      start: x,
      end: this.cursor.x,
      line,
      column,
    });
    this.currentContexts.push(context);
    context.children.push(...children);
    return true;
  }
  identifier_alias_CTX(opts?: ContextReaderOptions): boolean | null {
    const { x, line, column } = this.cursor;
    const { source } = this;
    // check if it's a as stmt
    const identified = this.identifier_CTX();
    const children: ExiumContext[] = [];
    let isValid = false;
    if (identified) {
      const { lastContext } = this;
      isValid = lastContext.source === 'as';
      if (isValid) lastContext.type = ContextTypes.AsStatement;
    }
    if (!isValid) return false;
    if (opts?.checkOnly) return true;
    let isIdentified = false;
    const allsubs: ContextReader[] = [
      this.multiple_spaces_CTX,
      this.space_CTX,
      this.identifier_CTX,
    ];
    while (!this.isEOF) {
      this.saveStrictContextsTo(allsubs, children);
      isIdentified = !!children.find((context) => context.type === ContextTypes.Identifier);
      if (isIdentified) {
        break;
      }
      this.shift(1);
    }
    const token = source.slice(x, this.cursor.x);
    const context = new ExiumContext(ContextTypes.IdentifierAsStatement, token, {
      start: x,
      end: this.cursor.x,
      line,
      column,
    });
    this.currentContexts.push(context);
    context.children.push(...children);
    return true;
  }
  space_CTX() {
    this.debuggPosition("\n\n\t\tSPACE START");
    const result = this.char === " " && this.next !== this.char;
    if (result) {
      this.currentContexts.push(
        new ExiumContext(ContextTypes.Space, this.char, {
          start: this.cursor.x,
          end: this.cursor.x + 1,
          line: this.cursor.line,
          column: this.cursor.column,
        }),
      );
      this.shift(1);
    }
    this.debuggPosition("\n\n\t\tSPACE START");
    return result;
  }
  semicolon_CTX() {
    this.debuggPosition("\n\n\t\tSEMICOLON START");
    const result = this.char === ";";
    if (result) {
      this.currentContexts.push(
        new ExiumContext(ContextTypes.SemiColon, this.char, {
          start: this.cursor.x,
          end: this.cursor.x + 1,
          line: this.cursor.line,
          column: this.cursor.column,
        }),
      );
      this.shift(1);
    }
    this.debuggPosition("\n\n\t\tSEMICOLON END");
    return result;
  }
  point_CTX() {
    this.debuggPosition("\n\n\t\tPOINT START");
    const result = this.char === ".";
    if (result) {
      this.currentContexts.push(
        new ExiumContext(ContextTypes.Point, this.char, {
          start: this.cursor.x,
          end: this.cursor.x + 1,
          line: this.cursor.line,
          column: this.cursor.column,
        }),
      );
      this.shift(1);
    }
    this.debuggPosition("\n\n\t\tPOINT END");
    return result;
  }
  coma_CTX() {
    this.debuggPosition("\n\n\t\tCOMA START");
    const result = this.char === ",";
    if (result) {
      this.currentContexts.push(
        new ExiumContext(ContextTypes.Coma, this.char, {
          start: this.cursor.x,
          end: this.cursor.x + 1,
          line: this.cursor.line,
          column: this.cursor.column,
        }),
      );
      this.shift(1);
    }
    this.debuggPosition("\n\n\t\tCOMA END");
    return result;
  }
  double_point_CTX() {
    this.debuggPosition("\n\n\t\tDOUBLE POINT START");
    const result = this.char === ":";
    if (result) {
      this.currentContexts.push(
        new ExiumContext(ContextTypes.DoublePoint, this.char, {
          start: this.cursor.x,
          end: this.cursor.x + 1,
          line: this.cursor.line,
          column: this.cursor.column,
        }),
      );
      this.shift(1);
    }
    this.debuggPosition("\n\n\t\tDOUBLE POINT END");
    return result;
  }
  line_break_CTX() {
    this.debuggPosition("\n\n\t\tLINEBREAK START");
    const { x, line, column } = this.cursor;
    const isChariot = this.char === "\r" && this.next === "\n";
    const result = this.char === "\n" || isChariot;
    if (result) {
      if (isChariot) this.shift(2);
      else this.shift(1);
      this.currentContexts.push(
        new ExiumContext(ContextTypes.LineBreak, this.char, {
          start: x,
          end: this.cursor.x,
          line: line,
          column: column,
        }),
      );
      this.cursor.column = 0;
      this.cursor.line++;
    }
    this.debuggPosition("\n\n\t\tLINEBREAK END");
    return result;
  }
  /**
   * should match with ( ... ) and is recursive
   */
  braces_CTX(opts?: ContextReaderOptions): boolean {
    try {
      this.debuggPosition("BRACES_CTX START");
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (char !== "(") return false;
      if (opts?.checkOnly) return true;
      this.shift(1);
      const result = true;
      let isClosed = false;
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.braces_CTX,
        ...(opts?.data?.braces_contexts as [] || []),
      ];
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.debuggPosition("BRACES_CTX");
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.char === ")") {
          this.shift(1);
          isClosed = true;
          break;
        }
        this.shift(1);
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
  curly_brackets_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (char !== "{") return false;
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      const allSubContexts = opts?.contexts || [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.curly_brackets_CTX,
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
      const context = new ExiumContext(ContextTypes.CurlyBrackets, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.CurlyBracketsOpen, this.cursor, context);
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
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (char !== "[") return false;
      if (opts?.checkOnly) return true;
      const result = true;
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
  /**
   * should match with (...) and is recursive
   */
  parenthese_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const { char } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
      if (char !== "(") return false;
      if (opts?.checkOnly) return true;
      const result = true;
      let isClosed = false;
      const allSubContexts = (opts?.contexts || [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
        this.array_CTX,
        this.parenthese_CTX,
      ]);
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
      const context = new ExiumContext(ContextTypes.Parenthese, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      if (!isClosed) {
        this.onError(Reason.ParentheseOpen, this.cursor, context);
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
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.ImportAmbient, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      Object.assign(context.data, {
        path: str,
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
  export_statements_CTX(): boolean | null {
    try {
      const isValid = this.identifier_CTX(this.checkOnlyOptions);
      if (!isValid) return false;
      const recognized = this.identifier_CTX();
      if (!recognized) return false;
      const { lastContext } = this;
      const { x, line, column } = this.cursor;
      if (lastContext.source !== "export") {
        this.shift(-lastContext.source.length);
        return false;
      }
      const context = new ExiumContext(
        ContextTypes.ExportStatement,
        lastContext.source,
        {
          line,
          column,
          start: x,
          end: this.cursor.x,
        },
      );
      context.related.push(lastContext);
      this.currentContexts.push(context);
      return true;
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
      const { char, next, nextPart } = this;
      const { x, line, column } = this.cursor;
      const { source } = this;
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
      this.shiftUntilEndOf('import');
      if (isComponent) {
        this.saveStrictContextsTo([
          this.multiple_spaces_CTX,
          this.space_CTX,
        ], children);
        this.saveToken(
          "component",
          ContextTypes.ImportComponentStatement,
        );
      }
      while (!this.isEOF) {
        this.saveStrictContextsTo([
          this.multiple_spaces_CTX,
          this.space_CTX,
          this.identifier_asterix_CTX,
          this.identifier_list_CTX,
          this.identifier_CTX,
          this.multiple_spaces_CTX,
          this.space_CTX,
        ], children, isComponent ? undefined : {
          data: {
            identifer_allow_alias: true,
          }
        });
        fromStatement = this.saveToken(
          "from",
          ContextTypes.ImportStatementFrom,
        );
        if (fromStatement) {
          break;
        }
        this.isValidChar(opts?.unexpected);
      }
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
      nextContexts.forEach((reader: ContextReader, i: number, arr) => {
        const recognized = reader.apply(this, []);
        if (recognized) {
          related.push(this.lastContext);
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
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.ImportStatement, token, {
        start: x,
        end: this.cursor.x,
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
  argument_CTX(opts?: ContextReaderOptions): boolean {
    try {
      const {
        char,
        source,
      } = this;
      const {
        line,
        column,
        x,
      } = this.cursor;
      const startingChar =
        opts && opts.data?.argument_CTX_starts_with as string || ":";
      const isValid = char === startingChar;
      if (!isValid) return false;
      this.shiftUntilEndOf(startingChar);
      const related: ExiumContext[] = [];
      const children: ExiumContext[] = [];
      while (!this.isEOF) {
        this.isValidChar(opts && opts?.unexpected);
        Boolean(
          this.identifier_CTX({
            data: {
              allowedIdentifierChars: ["-"],
            },
          }) &&
          related.push(this.lastContext),
        );
        if (this.isCharPuntuation) break;
        this.shift(1);
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.Argument, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.related.push(...related);
      context.children.push(...children);
      this.currentContexts.push(context);
      return true;
    } catch (err) {
      throw err;
    }
  }
}
