import {
  ContextReader,
  ContextReaderOptions,
  CursorDescriber,
  ExiumParseOptions,
} from "../types/main.d.ts";
import { ExiumContext } from "./ExiumContext.ts";
import { ContextTypes } from "../enums/context-types.ts";
import { Reason } from "../enums/error-reason.ts";

const importRegExp = /^import\b/i;
const importComponentRegExp = /^import\s+component\b/i;
const asRegExp = /^\s+as/i;

/**
 * final class of Exium
 * all basic methods or properties
 * to use into Exium classes
 */
export class ExiumBase {
  public treePosition = 0;
  public supportedComponentTypes = [
    "component",
    "app",
    "async",
    "router",
    "store",
    "controller",
    "gl",
  ];
  public readonly checkOnlyOptions: ContextReaderOptions = {
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
  public regularAtRulesNames: string[] = [
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
  public currentContexts: ExiumContext[] = [];
  // to retrieve all remaining open tag
  public openTags: ExiumContext[] = [];
  /**
   * this will shift the cursor into the document
   */
  public cursor: CursorDescriber = {
    x: 0,
    line: 0,
    column: 0,
  };
  public source = "";
  /**
   * the current character
   */
  public get char(): string {
    return this.source[this.cursor.x];
  }
  /**
   * the character code of the current character
   */
  public get charCode(): number {
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
  public get next(): string | undefined {
    return this.source[this.cursor.x + 1];
  }
  /**
  * the previous character
  */

  public get prev(): string | undefined {
    return this.source[this.cursor.x - 1];
  } /**
   * the following part
   * from the cursor index until the end of the document
   */

  public get nextPart(): string {
    return this.source.slice(this.cursor.x);
  }
  /**
   * the following part
   * from the cursor index until the end of the document
   */
  public get previousPart(): string {
    return this.source.slice(0, this.cursor.x);
  }

  // returns if a node context has been declared
  public get nodeContextStarted(): boolean {
    return Boolean(
      this.currentContexts.find((context) =>
        [ContextTypes.Node].includes(context.type)
      ),
    );
  }
  public parseOptions: ExiumParseOptions | null = null;
  public debugg(...args: unknown[]): void {
    if (this.parseOptions?.debugg) {
      console.log(...args);
    }
  }
  public debuggPosition(name: string): void {
    if (this.parseOptions?.debugg) {
      this.debugg(`${this.cursor.x} - %c${name.trim()}`, "color:orange", {
        prev: this.prev,
        char: this.char,
        next: this.next,
      });
    }
  }
  constructor(
    /**
     * function used when Exium find an unexpected token
     */
    public onError: (
      reason: Reason,
      cursor: CursorDescriber,
      context: ExiumContext,
    ) => void,
  ) { }

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
    if (!isIdentified) {
      this.onError(Reason.AsStatementMissingIdentifier, this.cursor, context);
    }
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
      const { nextPart } = this;
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
          this.coma_CTX,
          this.space_CTX,
        ], children, isComponent ? undefined : {
          data: {
            identifier_allow_alias: true,
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
