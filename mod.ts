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
  ExiumParseOptions,
} from "./src/types/main.d.ts";
import { ExiumBase } from "./src/classes/ExiumBase.ts";
import { Reason } from "./src/enums/error-reason.ts";
import { ContextTypes } from "./src/enums/context-types.ts";
import { ExiumContext } from "./src/classes/ExiumContext.ts";
import { ExiumDocument } from "./src/classes/ExiumDocument.ts";
import {
  topCTX,
  comment_CTX,
  comment_block_CTX,
  line_break_CTX,
  multiple_spaces_CTX,
  space_CTX,
  string_template_quote_CTX,
  getUnexpected,
  string_single_quote_CTX,
  string_double_quote_CTX,
  import_ambient_CTX,
  import_statements_CTX,
  html_comment_CTX,
  node_CTX,
  stylesheet_CTX,
  protocol_CTX,
  textnode_CTX,
  export_component_statements_CTX,
  component_CTX,
  isEOF
} from "./src/functions/index.ts";
export { ContextTypes, ExiumContext, ExiumDocument, Reason };

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
export class Exium extends ExiumBase {
  constructor(...args: ConstructorParameters<typeof ExiumBase>) {
    super(...args);
  }
  private scopedTopLevel: Record<
    ExiumParseOptions["type"],
    ContextReader[]
  > = {
    /**
     * use this scope to test the lexer
     */
    lexer: [
      comment_CTX,
      comment_block_CTX,
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      string_template_quote_CTX,
    ],

    /**
     * use this scope to parse ogone components
     */
    ogone: [
      comment_CTX,
      comment_block_CTX,
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      string_single_quote_CTX,
      string_double_quote_CTX,
      import_ambient_CTX,
      import_statements_CTX,
      html_comment_CTX,
      node_CTX,
      stylesheet_CTX,
      protocol_CTX,
      textnode_CTX,
    ],
    /**
     * use this scope to parse bio components
     */
    bio: [
      comment_CTX,
      comment_block_CTX,
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      string_single_quote_CTX,
      string_double_quote_CTX,
      import_ambient_CTX,
      import_statements_CTX,
      html_comment_CTX,
      export_component_statements_CTX,
      component_CTX,
    ],
    script: [
      comment_CTX,
      comment_block_CTX,
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      import_ambient_CTX,
      import_statements_CTX,
    ],
    /**
     * use this scope to parse stylesheets (CSS and Typed-CSS)
     */
    stylesheet: [
      comment_CTX,
      comment_block_CTX,
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      stylesheet_CTX,
    ],
    /**
     * use this scope to parse ogone components protocols
     */
    protocol: [
      line_break_CTX,
      multiple_spaces_CTX,
      space_CTX,
      protocol_CTX,
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
          this.onError(Reason.UnexpectedToken, this.cursor, getUnexpected(this));
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
