/**
 * author: Rudy Alula
 * project: exium
 * description: global lexer for ogone
 *
 * we will use this lexer in different engine
 * to make it isomorphic with Node and Deno
 * this project shouldn't use the Deno namespace
 */
import type {
  ContextReader,
  CursorDescriber,
  ExiumParseOptions,
  Position,
} from "./src/types/main.d.ts";
import { Reason } from "./src/enums/error-reason.ts";
import { ContextTypes } from "./src/enums/context-types.ts";
import { ExiumContext } from "./src/classes/ExiumContext.ts";
import { ExiumDocument } from "./src/classes/ExiumDocument.ts";
import {
  getUnexpected,
  isEOF,
  readCommentBlockCtx,
  readCommentCtx,
  readComponentCtx,
  readExportComponentStatementsCtx,
  readHTMLCommentCtx,
  readImportAmbientCtx,
  readImportStatementsCtx,
  readLineBreakCtx,
  readMultiSpacesCtx,
  readNodeCtx,
  readProtocolCtx,
  readSpaceCtx,
  readStringDoubleQuoteCtx,
  readStringSingleQuoteCtx,
  readStringTemplateQuoteCtx,
  readStyleSheetCtx,
  readTextnodeCtx,
  topCTX,
} from "./src/functions/index.ts";
export {
  ContextTypes,
  ExiumContext,
  ExiumDocument,
  Reason,
};
export type {
  Position
};

/**
 * @README
 * this class exists to improve the performances
 * of the Ogone Compiler
 * it should provide all the contexts of an Ogone Component
 * and expose a way to parse error and unexpected tokens
 *
 * Ogone 0.29.0: a component can't reach 250 lines without performance issues
 *
 * so this lexer should go quick without any issues
 *
 * @usage
 * ```typescript
 * const exium = new Exium((
 *   reason: string,
 *   cursor: CursorDescriber,
 *   context: ExiumContext,
 * ) => {
 *   // do things when there's an unexpected token
 * });
 *
 * // to parse stylesheets (CSS and Typed-CSS)
 * exium.readSync(text, { type: 'stylesheet' });
 *
 * // to test the lexic
 * exium.readSync(text, { type: 'lexer' });
 *
 * // to parse ogone components
 * exium.readSync(text, { type: "ogone" });
 *
 * // to parse protocols
 * exium.readSync(text, { type: 'protocol' });
 *
 * // to parse custom languages
 * exium.readSync(text, {
 *  type: 'custom',
 *  contexts: []
 * });
 * ```
 */
export class Exium {
  public treePosition = 0;
  public allowPseudoProperties = true;
  public isInPseudoProperty = false;
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
  };
  public source = "";
  public parseOptions: ExiumParseOptions | null = null;
  constructor(
    /**
     * function used when Exium find an unexpected token
     */
    public onError: (
      reason: Reason,
      cursor: CursorDescriber,
      context: ExiumContext,
    ) => void,
  ) {}
  private scopedTopLevel: Record<
    ExiumParseOptions["type"],
    ContextReader[]
  > = {
    /**
     * use this scope to test the lexer
     */
    lexer: [
      readCommentCtx,
      readCommentBlockCtx,
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readStringTemplateQuoteCtx,
    ],

    /**
     * use this scope to parse ogone components
     */
    ogone: [
      readCommentCtx,
      readCommentBlockCtx,
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readStringSingleQuoteCtx,
      readStringDoubleQuoteCtx,
      readImportAmbientCtx,
      readImportStatementsCtx,
      readHTMLCommentCtx,
      readNodeCtx,
      readStyleSheetCtx,
      readProtocolCtx,
      readTextnodeCtx,
    ],
    /**
     * use this scope to parse bio components
     */
    bio: [
      readCommentCtx,
      readCommentBlockCtx,
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readStringSingleQuoteCtx,
      readStringDoubleQuoteCtx,
      readImportAmbientCtx,
      readImportStatementsCtx,
      readHTMLCommentCtx,
      readExportComponentStatementsCtx,
      readComponentCtx,
    ],
    script: [
      readCommentCtx,
      readCommentBlockCtx,
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readImportAmbientCtx,
      readImportStatementsCtx,
    ],
    /**
     * use this scope to parse stylesheets (CSS and Typed-CSS)
     */
    stylesheet: [
      readCommentCtx,
      readCommentBlockCtx,
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readStyleSheetCtx,
    ],
    /**
     * use this scope to parse ogone components protocols
     */
    protocol: [
      readLineBreakCtx,
      readMultiSpacesCtx,
      readSpaceCtx,
      readProtocolCtx,
    ],
    custom: [],
  };
  /**
   * parse the text and retrieve all the contexts
   */
  readSync(text: string, opts: ExiumParseOptions): ExiumContext[] {
    try {
      /**remove previous contexts */
      this.currentContexts.length && this.currentContexts.splice(0);
      /**
       * save the options argument
       */
      this.parseOptions = opts;
      /**
       * save the current parsed text
       * to source
       * used internally
       */
      this.source = text;
      /**
       * retrieve the top level contexts
       * if custom is used as the opts.type of the method
       * push the opts.contexts or an empty array
       */
      const toplevel = this.scopedTopLevel[opts.type];
      if (opts.type === "custom") {
        toplevel.push(...(opts.contexts || []));
      }
      while (!isEOF(this)) {
        // we are at the top level
        // start using context readers
        const isValid = topCTX(this, toplevel);
        if (!isValid) {
          this.onError(
            Reason.UnexpectedToken,
            this.cursor,
            getUnexpected(this),
          );
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
  /**
   * return position of the token in the source
   */
  getPositionSync(context: ExiumContext): Position {
    return context.getPosition(this.source);
  }
}
