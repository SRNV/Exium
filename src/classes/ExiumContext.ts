import { ContextTypes } from "../../src/enums/context-types.ts";
import { ExiumDocument } from "./ExiumDocument.ts";
import { Position } from "../types/main.d.ts";
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
  /**
   * id to differentiate the contexts
   */
  id = 0;
  /**
   * the exium document that is using this context
   */
  document?: ExiumDocument;
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
   * any data to pass to the ExiumContext
   */
  public data: { [k: string]: unknown } = {};
  constructor(
    public type: ContextTypes,
    public source: string,
    public start: number,
  ) {}

  get end() {
    return this.start + this.source.length;
  }
  /**
   * the computed value of the ExiumContext
   */
  get value(): ExiumContextValue {
    if (this.#_value) return this.#_value;
    const attributeValue = this.children.find((context) =>
      [
        ContextTypes.Braces,
        ContextTypes.StringDoubleQuote,
        ContextTypes.StringSingleQuote,
        ContextTypes.CurlyBrackets,
        ContextTypes.AttributeValueUnquoted,
      ].includes(context.type)
    );
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
      // modifiers
      case ContextTypes.AttributeModifier: {
        const attribute = this.children.find((context) =>
          [
            ContextTypes.Attribute,
            ContextTypes.AttributeBoolean,
            ContextTypes.AttributeProperty,
          ].includes(context.type)
        );
        return attribute?.value || "";
      }
      // attributes and flags
      case ContextTypes.Attribute:
      case ContextTypes.AttributeProperty:
      case ContextTypes.Flag:
      case ContextTypes.FlagStruct:
        return attributeValue?.value || "";
      case ContextTypes.Argument:
        return this.name as string;
      case ContextTypes.AttributeBoolean:
        return "";

      // stylesheet

      case ContextTypes.StyleSheetProperty: {
        const valueCTX = this.related.find((context) =>
          context.type === ContextTypes.StyleSheetPropertyValue
        );
        return valueCTX?.value || "";
      }
      case ContextTypes.StyleSheetPropertyValue:
        return this.source;
    }
    return "";
  }
  /**
   * the name of the ExiumContext
   */
  get name(): string | undefined {
    if (this.#_name) return this.#_name;
    if (this.type === ContextTypes.ComponentDeclaration) {
      const ctx = this.children.find((ctx) => ctx.type === ContextTypes.Node);
      return (this.#_name = ctx?.name);
    }
    const ctx = this.related.find((ctx) =>
      ctx.type === ContextTypes.Identifier
    );
    return (this.#_name = ctx?.source);
  }
  /**
   * the node type of the context
   * default is 6: ENTITY_NODE
   */
  get nodeType(): number {
    switch (this.type) {
      case ContextTypes.Node:
        return 1;
      case ContextTypes.NodeClosing:
        return 1;
      case ContextTypes.Attribute:
        return 2;
      case ContextTypes.AttributeBoolean:
        return 2;
      case ContextTypes.Flag:
        return 2;
      case ContextTypes.FlagStruct:
        return 2;
      case ContextTypes.TextNode:
        return 3;
      case ContextTypes.Protocol:
        return 3;
      case ContextTypes.StyleSheet:
        return 9;
    }
    return 6;
  }
  get nodeStart(): number {
    return this.start;
  }
  get nodeEnd(): number {
    const nodeEnd = this.related.find((context) =>
      context.type === ContextTypes.NodeClosing
    );
    if (nodeEnd) return nodeEnd.end;
    return this.end;
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
    return !this.parentNode && this.nodeType === 1 ||
        this.type === ContextTypes.ComponentDeclaration
      ? this.#_template ||
        (this.#_template = this.children.find((context) =>
          context.type === ContextTypes.Node &&
          !context.data.isNodeClosing &&
          context.name === "template"
        ))
      : undefined;
  }
  get proto(): ExiumContext | undefined {
    return !this.parentNode && this.nodeType === 1
      ? this.#_proto ||
        (this.#_proto = this.children.find((context) =>
          context.type === ContextTypes.Node &&
          !context.data.isNodeClosing &&
          context.name === "proto"
        ))
      : undefined;
  }
  get protocol(): ExiumContext | null | undefined {
    if (!this.proto) return null;
    return this.#_protocol ||
      (this.#_protocol = this.#getDeepElement((context) =>
        context.type === ContextTypes.Protocol
      ));
  }
  /**
   * provides all the properties of the CSS rule
   */
  get cssProperties(): ExiumContext[] | null {
    switch (this.type) {
      case ContextTypes.StyleSheetSelectorList: {
        const { cssList } = this;
        return cssList?.cssProperties || null;
      }
      case ContextTypes.StyleSheetPropertyList:
        return this.children.filter((context) =>
          context.type === ContextTypes.StyleSheetProperty
        );
      default:
        return null;
    }
  }
  get cssList(): ExiumContext | undefined {
    switch (this.type) {
      case ContextTypes.StyleSheetSelectorList:
        return this.related.find((context) =>
          context.type === ContextTypes.StyleSheetPropertyList
        );
    }
    return undefined;
  }
  /**
   * recursive function
   * @param search a function to use to retrieve a context, a basic find function
   * @returns the matching context
   */
  #getDeepElement(
    search: (
      context: ExiumContext,
      index?: number,
      obj?: ExiumContext[],
    ) => unknown,
  ): ExiumContext | undefined {
    let result = this.children.find(search);
    if (!result) {
      this.children.forEach((context) => {
        if (!result) {
          result = context.#getDeepElement(search);
        }
      });
    }
    return result;
  }
  #getDeepElements(
    search: (
      context: ExiumContext,
      index?: number,
      obj?: ExiumContext[],
    ) => unknown,
  ): ExiumContext[] {
    const result: ExiumContext[] = [
      ...this.related.filter(search),
    ];
    this.children.forEach((context) => {
      result.push(...context.#getDeepElements(search));
    });
    return result;
  }
  /**
   * the path of an import statement or null if the current context is not an ImportStatement
   * @returns the path of an ImportStatementContext
   */
  getImportPath(): string | null {
    switch (this.type) {
      case ContextTypes.ImportAmbient:
      case ContextTypes.ImportStatement:
        {
          const str = this.related.find((context) =>
            [
              ContextTypes.StringDoubleQuote,
              ContextTypes.StringSingleQuote,
            ].includes(context.type)
          );
          if (str) return str.value;
        }
        break;
      default: {
        return null;
      }
    }
    return null;
  }
  /**
   * @returns the complete position description
   */
  getPosition(content: string): Position {
    let line = 0;
    let column = 0;
    let x = 0;
    for (const char of content) {
      if (x >= this.start) break;
      if (char === "\n") {
        line++;
        column = 0;
      } else {
        column++;
      }
      x++;
    }
    return {
      line,
      column,
      start: this.start,
      end: this.start + this.source.length,
    };
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
    const attr = this.children.find((context) =>
      [ContextTypes.Attribute, ContextTypes.AttributeBoolean].includes(
        context.type,
      ) &&
      context.name === attribute
    );
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
    if (this.type !== ContextTypes.Node) {
      throw new Error(
        `getFlagContext is not allowed with this context. context's type has to be ${ContextTypes.Node}`,
      );
    }
    return this.children.find((context) =>
      [
        ContextTypes.Flag,
        ContextTypes.FlagStruct,
      ].includes(context.type) &&
      context.name === name
    );
  }
  getArguments(): ExiumContext[] {
    return this.children.filter((context) =>
      context.type === ContextTypes.Argument
    );
  }
  /**
   * @param name the property name
   * @returns all the properties identified with the name
   */
  getPropertyContexts(name: string): ExiumContext[] {
    switch (this.type) {
      case ContextTypes.StyleSheetSelectorList: {
        const propertyList = this.related.find((context) =>
          context.type === ContextTypes.StyleSheetPropertyList
        );
        if (!propertyList) return [];
        const properties = propertyList.children.filter((context) =>
          context.type === ContextTypes.StyleSheetProperty &&
          context.name === name
        );
        return properties;
      }
      default:
        return [];
    }
  }
  /**
 * retrieve the stylesheet's rules that apply on an element
 */
  getStylesheetRulesByTagName(tagname: string): ExiumContext[] {
    if (!this.document) return [];
    return this.document.contexts.filter((child) => {
      return child.type === ContextTypes.StyleSheetSelectorList &&
        child.start >= this.nodeStart &&
        child.end <= this.nodeEnd &&
        child.children.find((subchild) =>
          subchild.type === ContextTypes.StyleSheetSelectorHTMLElement &&
          subchild.source === tagname
        );
    });
  }
  /**
   * retrieve the stylesheet's rules that apply on a class
   */
  getStylesheetRulesByClassName(className: string): ExiumContext[] {
    if (!this.document) return [];
    return this.document.contexts.filter((child) => {
      return child.type === ContextTypes.StyleSheetSelectorList &&
        child.start >= this.nodeStart &&
        child.end <= this.nodeEnd &&
        child.children.find((subchild) =>
          subchild.type === ContextTypes.StyleSheetSelectorClass &&
          subchild.source === `.${className}`
        );
    });
  }
  /**
   * retrieve the stylesheet's rules that apply on an id
   */
  getStylesheetRulesById(id: string): ExiumContext[] {
    if (!this.document) return [];
    return this.document.contexts.filter((child) => {
      return child.type === ContextTypes.StyleSheetSelectorList &&
        child.start >= this.nodeStart &&
        child.end <= this.nodeEnd &&
        child.children.find((subchild) =>
          subchild.type === ContextTypes.StyleSheetSelectorId &&
          subchild.source === `#${id}`
        );
    });
  }
  /**
   * retrieve the stylesheet's rules that apply on an attribute
   */
  getStylesheetRulesByAttribute(attr: string): ExiumContext[] {
    if (!this.document) return [];
    return this.document.contexts.filter((child) => {
      return child.type === ContextTypes.StyleSheetSelectorList &&
        child.start >= this.nodeStart &&
        child.end <= this.nodeEnd &&
        child.children.find((subchild) =>
          subchild.type === ContextTypes.StyleSheetSelectorAttribute &&
          subchild.name === attr
        );
    });
  }
  /**
   * retrieve the stylesheet's rules that are using a property
   */
  getStylesheetRulesByProperty(
    property: string,
    value?: string,
  ): ExiumContext[] {
    if (!this.document) return [];
    return this.document.contexts.filter((child) => {
      return child.type === ContextTypes.StyleSheetSelectorList &&
        child.start >= this.nodeStart &&
        child.end <= this.nodeEnd &&
        child.related.find((subchild) =>
          subchild.type === ContextTypes.StyleSheetPropertyList &&
          subchild.children.find((props) =>
            (!value &&
              props.type === ContextTypes.StyleSheetProperty &&
              props.name === property) ||
            (value &&
              props.type === ContextTypes.StyleSheetProperty &&
              props.name === property &&
              props.related.find((propValue) =>
                propValue.type === ContextTypes.StyleSheetPropertyValue &&
                propValue.source.trim() === value
              ))
          )
        );
    });
  }
  /**
   * retrieve the stylesheet's rules that are using a pseudo-property
   */
  getStylesheetRulesByPseudoProperty(property: string): ExiumContext[] {
    if (!this.document) return [];
    return this.document.contexts.filter((child) => {
      return child.type === ContextTypes.StyleSheetSelectorList &&
        child.start >= this.nodeStart &&
        child.end <= this.nodeEnd &&
        child.related.find((subchild) =>
          subchild.type === ContextTypes.StyleSheetPropertyList &&
          subchild.children.find((props) => {
            return props.type === ContextTypes.StyleSheetPseudoProperty &&
              props.name === property;
          })
        );
    });
  }
  /**
   * @returns returns all the stylesheets constants
   */
  getStylesheetConstants(): ExiumContext[] {
    if (!this.document) return [];
    return this.document.contexts.filter((context) => {
      return context.type === ContextTypes.StyleSheetAtRuleConst &&
        context.start >= this.nodeStart &&
        context.end <= this.nodeEnd;
    });
  }
  /**
   * @returns all the exported stylesheets constants
   */
  getStylesheetExportedConstants(): ExiumContext[] {
    if (!this.document) return [];
    const exports = this.document.contexts.filter((context) => {
      return context.type === ContextTypes.StyleSheetAtRuleExport &&
        context.start >= this.nodeStart &&
        context.end <= this.nodeEnd;
    });
    const isConst = exports.filter((exp) =>
      exp.children.find((child) =>
        child.type === ContextTypes.StyleSheetAtRuleConst
      )
    );
    return isConst.map((exp) =>
      exp.children.find((child) =>
        child.type === ContextTypes.StyleSheetAtRuleConst
      )!
    );
  }
  /**
   * @returns the context describing the constant
   */
  getStylesheetConstant(name: string): ExiumContext | undefined {
    if (!this.document) return;
    return this.document.contexts.find((context) => {
      return context.type === ContextTypes.StyleSheetAtRuleConst &&
        context.start >= this.nodeStart &&
        context.end <= this.nodeEnd &&
        context.name === name;
    });
  }
  /**
   * @returns the context describing the constant that is exported
   */
  getStylesheetExportedConstant(name: string): ExiumContext | undefined {
    if (!this.document) return;
    const exportCTX = this.document.contexts.find((context) => {
      return context.type === ContextTypes.StyleSheetAtRuleExport &&
        context.start >= this.nodeStart &&
        context.end <= this.nodeEnd;
    });
    if (!exportCTX) return;
    return exportCTX.children.find((child) =>
      child.type === ContextTypes.StyleSheetAtRuleConst &&
      child.name === name
    );
  }
  /**
   * @returns a list of ExiumContext, empty if the curent context is not an ImportStatement
   */
  getImportedIdentifiers(): ExiumContext[] | null {
    if (this.type !== ContextTypes.ImportStatement) return null;
    const identifierList = this.children.find((context) =>
      context.type === ContextTypes.IdentifierList
    );
    if (identifierList) {
      return identifierList.children.filter((context) =>
        context.type === ContextTypes.Identifier
      );
    }
    const identifier = this.children.find((context) =>
      context.type === ContextTypes.Identifier
    );
    if (identifier) {
      return [identifier];
    }
    return null;
  }
  /**
   * @returns the slice of the source between the node start and the node end.
   * null if the operation is impossible.
   * no ExiumDocument required.
   */
  getNodeInnerTextWithSource(source: string): string | null {
    const nodeEnd = this.related.find((context) =>
      context.type === ContextTypes.NodeClosing
    );
    if (this.nodeType === 1 && nodeEnd) {
      const { end } = this;
      const { start } = nodeEnd;
      return source.slice(end, start);
    }
    return null;
  }
  /**
   * @returns the slice of the source between the node start and the node end.
   * null if the operation is impossible
   */
  getNodeInnerTextWithInternalDocument(): string | null {
    const { document } = this;
    if (!document) {
      throw new Error(
        "cannot use getNodeInnerTextWithInternalDocument because this context is not retrieved with an ExiumDocument.",
      );
    }
    const source = document.getText();
    const nodeEnd = this.related.find((context) =>
      context.type === ContextTypes.NodeClosing
    );
    if (this.nodeType === 1 && nodeEnd) {
      const { end } = this;
      const { start } = nodeEnd;
      return source.slice(end, start);
    }
    return null;
  }
  /**
   * @returns the slice of the source between the node start and the node end.
   * null if the operation is impossible
   */
  getNodeInnerTextWithExternalDocument(document: ExiumDocument): string | null {
    if (!document || !(document instanceof ExiumDocument)) {
      throw new Error(
        "missing first argument, getNodeInnerTextWithExternalDocument is waiting for an ExiumDocument.",
      );
    }
    const source = document.getText();
    const nodeEnd = this.related.find((context) =>
      context.type === ContextTypes.NodeClosing
    );
    if (this.nodeType === 1 && nodeEnd) {
      const { end } = this;
      const { start } = nodeEnd;
      return source.slice(end, start);
    }
    return null;
  }
  getAttributeModifiers(
    name: string,
    attributeName?: string,
  ): ExiumContext[] | null {
    switch (this.type) {
      case ContextTypes.Node: {
        const modifier = this.children.filter((context) =>
          context.type === ContextTypes.AttributeModifier &&
          context.name === name
        );
        return attributeName
          ? modifier.filter((context) =>
            context.children.find((child) =>
              [
                ContextTypes.AttributeBoolean,
                ContextTypes.AttributeProperty,
                ContextTypes.Attribute,
              ].includes(child.type) &&
              child.name === attributeName
            )
          )
          : modifier;
      }
      case ContextTypes.ComponentDeclaration: {
        const node = this.children.find((context) =>
          context.type === ContextTypes.Node &&
          !context.data.isNodeClosing
        );
        if (node) {
          const modifier = node.getAttributeModifiers(name, attributeName);
          return modifier;
        } else return null;
      }
      default:
        return null;
    }
  }
  getBioComponentType(): string | null {
    switch(this.type) {
      case ContextTypes.ComponentDeclaration: {
        const { type } = this.data;
        return type as string || null;
      }
      default: throw new TypeError("the method getBioComponentType is only usable if the type of the context is ComponentDeclaration")
    }
  }
}
