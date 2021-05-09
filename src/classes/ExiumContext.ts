import { ContextTypes } from "../../src/enums/context-types.ts";
/**
 * ExiumContext constructor for all retrieved contexts.
 *
 * @usage
 * ```typescript
 * new ExiumContext(ContextTypes.Attribute, source, {
 *   start: 0,
 *   end: 10,
 *   column: 0,
 *   line: 0,
 * });
 * ```
 *
 * where the first argument is the type of the ExiumContext (it should be on type ContextTypes),
 * the second argument is the source code parsed,
 * the third argument should describe
 * the position of the source in the text
 */
export class ExiumContext {
  /**
   * the children context
   * mainly the context that doesn't describe the current context
   * but are parsed into it
   */
  public children: ExiumContext[] = [];
  /**
   * related contexts
   *
   * these whill describe the current context.
   *
   * mainly things like name or type of the current context.
   */
  public related: ExiumContext[] = [];
  /**
   * any data to pass to the ExiumContext
   */
  public data: { [k: string]: unknown } = {};
  constructor(
    public type: ContextTypes,
    public source: string,
    public position: {
      start: number;
      end: number;
      line: number;
      column: number;
    },
  ) {}
}
