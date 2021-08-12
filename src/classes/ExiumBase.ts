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
}
