export interface ContextReaderOptions {
  contexts?: ContextReader[];
  unexpected?: ContextReader[];
  checkOnly?: boolean;
  /**
   * pass custom data to context readers
   */
  data?: { [k: string]: unknown };
}
/**
 * functions used to retrieve context
 * - Is the first character handled by the context reader or open the context ? negative should return false
 * - While the characters are handled and it's not EOF, shift the cursor position
 * - create the ExiumContext
 * - return true
 * - should return null only to break the parent context read
 */
export type ContextReader = (opts?: ContextReaderOptions) => (boolean | null);
export interface CursorDescriber {
  column: number;
  line: number;
  x: number;
}
export interface ExiumParseOptions {
  /**
   * url of the current document
   */
  url?: URL;
  /**
   * optional contexts
   * to use with the type custom
   */
  contexts?: ContextReader[];
  /**
   * the type of the document
   */
  type:
    | "ogone"
    | "bio"
    | "lexer"
    | "custom"
    | "stylesheet"
    | "script"
    | "protocol";
  /**
   * will print the character
   * and the context that is currently used
   */
  debugg?: boolean;
}
