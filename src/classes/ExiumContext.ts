import { ContextTypes } from "../../src/enums/context-types.ts";
export type ExiumContextValue = string;
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
  #_name?: string;
  /**
   * if the context doesn't have a parent context, and is a Node context
   * we can say it's a Local Component and use the template and protocol inside it
   */
  #_template?: ExiumContext;
  #_proto?: ExiumContext;
  #_protocol?: ExiumContext;
  // #_styles?: ExiumContext[];
  /**
   * cache for value
   * can return the ExiumContext
   */
  #_value?: ExiumContextValue;
  /**
   * the children context
   * mostly the context that doesn't describe the current context
   * but are parsed into it
   */
  public children: ExiumContext[] = [];
  /**
   * related contexts
   * these whill describe the current context.
   * mostly things like name or type of the current context.
   */
  public related: ExiumContext[] = [];
  /**
   * the computed value of the ExiumContext
   */
  get value(): ExiumContextValue {
    if (this.#_value) return this.#_value;
    const attributeValue = this.children.find((context) => [
      ContextTypes.Braces,
      ContextTypes.StringDoubleQuote,
      ContextTypes.StringSingleQuote,
      ContextTypes.CurlyBrackets,
      ContextTypes.AttributeValueUnquoted,
    ].includes(context.type));
    switch (this.type) {
      case ContextTypes.Braces:
      case ContextTypes.CurlyBrackets:
      case ContextTypes.Parenthese:
      case ContextTypes.StringDoubleQuote:
      case ContextTypes.StringSingleQuote:
        return (this.#_value = this.source.slice(1, -1));
      case ContextTypes.AttributeValueUnquoted:
      case ContextTypes.TextNode:
        return this.source;

      // attributes and flags
      case ContextTypes.Attribute:
      case ContextTypes.Flag:
      case ContextTypes.FlagStruct:
        return attributeValue?.value || '';
      case ContextTypes.Argument:
        return this.name as string;
      case ContextTypes.AttributeBoolean:
        return '';

      // stylesheet
      case ContextTypes.StyleSheetProperty: {
        const valueCTX = this.related.find((context) => context.type === ContextTypes.StyleSheetPropertyValue);
        return valueCTX?.value || '';
      }
      case ContextTypes.StyleSheetPropertyValue:
        return this.source;
    }
    return '';
  }
  /**
   * the name of the ExiumContext
   */
  get name(): string | undefined {
    if (this.#_name) return this.#_name;
    const ctx = this.related.find((ctx) => ctx.type === ContextTypes.Identifier);
    return (this.#_name = ctx?.source);
  }
  /**
   * the node type of the context
   * default is 6: ENTITY_NODE
   */
  get nodeType(): number {
    switch (this.type) {
      case ContextTypes.Node: return 1;
      case ContextTypes.NodeClosing: return 1;
      case ContextTypes.Attribute: return 2;
      case ContextTypes.AttributeBoolean: return 2;
      case ContextTypes.Flag: return 2;
      case ContextTypes.FlagStruct: return 2;
      case ContextTypes.TextNode: return 3;
      case ContextTypes.Protocol: return 3;
      case ContextTypes.StyleSheet: return 9;
    }
    return 6;
  }
  /**
   * @returns the parentNode of the context
   * @usage
   * ```
   * const [div] = document.getElementsByTagName('div');
   * assert(div);
   * console.log(div.parentNode); // ExiumContext {}
   * ```
   */
  get parentNode(): ExiumContext | undefined {
    return this.data.parentNode as ExiumContext | undefined;
  }
  /**
   * if the context is a node
   */
  get template(): ExiumContext | undefined {
    return !this.parentNode && this.nodeType === 1 ?
      this.#_template || (this.#_template = this.children.find((context) => context.type === ContextTypes.Node
        && !context.data.isNodeClosing
        && context.name === 'template'))
      : undefined;
  }
  get proto(): ExiumContext | undefined {
    return !this.parentNode && this.nodeType === 1 ?
      this.#_proto || (this.#_proto = this.children.find((context) => context.type === ContextTypes.Node
        && !context.data.isNodeClosing
        && context.name === 'proto'))
      : undefined;
  }
  get protocol(): ExiumContext | undefined {
    if (!this.proto) return;
    return this.#_protocol
      || (this.#_protocol = this.#getDeepElement((context) => context.type === ContextTypes.Protocol));
  }
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
  ) { }
  /**
   * recursive function
   * @param search a function to use to retrieve a context, a basic find function
   * @returns the matching context
   */
  #getDeepElement(search: (context: ExiumContext, index?: number, obj?: ExiumContext[]) => unknown): ExiumContext | undefined {
    let result = this.children.find(search);
    if (!result) {
      this.children.forEach((context) => {
        if (!result) {
          result = context.#getDeepElement(search)
        }
      });
    }
    return result;
  }
  /**
   * @returns the value of the attribute or undefined
   * @usage
   * ```typescript
   *  const [div] = document.getElementsByAttribute('attribute');
   *  assert(div);
   *  const value = div.getAttribute('attribute'); // string or undefined
   * ```
   */
  getAttributeContext(attribute: string): ExiumContext | undefined {
    const attr = this.children.find((context) => [ContextTypes.Attribute, ContextTypes.AttributeBoolean].includes(context.type)
      && context.name === attribute);
    return attr;
  }
  /**
   * @returns the value of the attribute or undefined
   * @usage
   * ```typescript
   *  const [div] = document.getElementsByAttribute('attribute');
   *  assert(div);
   *  const value = div.getAttribute('attribute'); // string or undefined
   * ```
   */
  getAttribute(attribute: string): string | undefined {
    const attr = this.getAttributeContext(attribute);
    if (!attr) return;
    return attr.value as string;
  }
  /**
   * @returns the flag context of a node context
   * @usage
   * ```typescript
   *  const [div] = document.getElementsByFlag('then');
   *  assert(div);
   *  const thenFlag = div.getFlagContext('then');
   * ```
   */
  getFlagContext(name: string): ExiumContext | undefined {
    if (this.type !== ContextTypes.Node) throw new Error(`getFlagContext is not allowed with this context. context's type has to be ${ContextTypes.Node}`);
    return this.children.find((context) => [
      ContextTypes.Flag,
      ContextTypes.FlagStruct,
    ].includes(context.type)
      && context.name === name);
  }
  getArguments(): ExiumContext[] {
    return this.children.filter((context) => context.type === ContextTypes.Argument);
  }
  /**
   * @param name the property name
   * @returns all the properties identified with the name
   */
  getPropertyContexts(name: string): ExiumContext[] {
    switch (this.type) {
      case ContextTypes.StyleSheetSelectorList: {
        const propertyList = this.related.find((context) => context.type === ContextTypes.StyleSheetPropertyList);
        if (!propertyList) return [];
        const properties = propertyList.children.filter((context) => context.type === ContextTypes.StyleSheetProperty
          && context.name === name);
        return properties;
      }
      default: return [];
    }
  }
}
