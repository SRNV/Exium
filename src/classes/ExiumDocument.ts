import { Exium } from "./../../mod.ts";
import { ExiumContext } from "./ExiumContext.ts";
import { ContextTypes } from "../enums/context-types.ts";
export interface ExiumDocumentOptions {
  url: URL;
  onError: ConstructorParameters<typeof Exium>[0];
  source: Parameters<Exium["readSync"]>[0];
  options?: Parameters<Exium["readSync"]>[1];
  injections?: ExiumContext[];
}
export interface ExiumDocumentComponentDescriber {
  elements: ExiumContext[];
  imports: ExiumContext[];
}
/**
 * a class to manage contexts
 * and retrieve them easily
 * @usage
 *
 * ```typescript
 * const document = new ExiumDocument({
 *   url: new URL('./App.o3', import.meta.url),
 *   source: Deno.readTextFileSync('./App.o3'),
 *   onError(reason, cursor, lastContext) {
 *     // do something when there's something unexpected
 *   },
 * });
 * ```
 *
 * ```ogone
 * // ./App.o3
 *import component Message from './Message.o3';
 *<App>
 *  <template>
 *    <div
 *      --click(console.warn('click'))
 *      id=b
 *      class=a></div>
 *    <Message content={'My super App'}/>
 *  </template>
 *  <proto type=app/>
 </App>
 * ```
 *
 * in the example,
 * it's possible to get the div using the methods `getElementsByTagName, getElementById, getElementsByClassName`.
 *
 * like following:
 *
 * ```typescript
 * const [div] = document.getElementsByTagName('div');
 * // or
 * const div = document.getElementById('b');
 * // or
 * const [div] = document.getElementsByClassName('a');
 * // or
 * const [div] = document.getElementsByFlag('click');
 * ```
 *
 * also it's possible to get the description of a component, by using its name,
 * like following:
 *
 * ```typescript
 * const {
 *   elements, // where the component is used
 *   imports // where the component is imported
 * } = document.getExternalComponentByName('Message');
 *
 * ```
 */
export class ExiumDocument {
  public url: URL;
  private injections: ExiumDocumentOptions["injections"];
  private exium: Exium;
  public contexts: ExiumContext[];
  private readonly text: string;
  private idProvider: { [k: string]: number } = {};
  #_stylesheets?: ExiumContext[];
  #_proto?: ExiumContext;
  #_head?: ExiumContext;
  #_protocol?: ExiumContext;
  #_template?: ExiumContext;
  #_components?: ExiumContext[];
  #_type?: Parameters<Exium["readSync"]>[1]["type"];
  constructor(opts: ExiumDocumentOptions) {
    this.exium = new Exium(opts.onError);
    this.contexts = this.exium.readSync(
      opts.source,
      opts.options || { type: "ogone" },
    );
    this.url = opts.url;
    this.#_type = opts.options?.type || "ogone";
    this.injections = opts.injections;
    this.text = opts.source;
    this.#onload();
  }
  getText() {
    return this.text;
  }
  /**
   * @returns styles declared in the document
   */
  get styles(): ExiumContext[] {
    if (this.#_type === "bio") {
      return [];
    }
    return this.#_stylesheets ||
      (this.#_stylesheets = this.contexts.filter((context) =>
        context.type === ContextTypes.Node && context.name === "style"
      ));
  }
  /**
   * @returns all css content inside the style elements
   */
  get stylesheets(): ExiumContext[] {
    if (this.#_type === "bio") {
      return [];
    }
    return this.#_stylesheets ||
      (this.#_stylesheets = this.contexts.filter((context) =>
        context.type === ContextTypes.StyleSheet
      ));
  }
  /**
   * @returns the proto element of the document
   * @deprecated support single file poly components
   */
  get proto(): ExiumContext | undefined {
    if (this.#_type === "bio") {
      return undefined;
    }
    return this.#_proto ||
      (this.#_proto = this.contexts.find((context) =>
        context.type === ContextTypes.Node &&
        context.related.find((related) => related.source === "proto") &&
        !context.data.parentNode &&
        !context.data.isNodeClosing
      ));
  }
  /**
   * @returns the protocol content inside the proto element
   * @deprecated support single file poly components
   */
  get protocol(): ExiumContext | undefined {
    if (this.#_type === "bio") {
      return undefined;
    }
    return this.#_protocol ||
      (this.#_protocol = this.contexts.find((context) =>
        context.type === ContextTypes.Protocol
      ));
  }
  /**
   * @returns the template element of the document
   * @deprecated support single file poly components
   */
  get template(): ExiumContext | undefined {
    if (this.#_type === "bio") {
      return undefined;
    }
    return this.#_template ||
      (this.#_template = this.contexts.find((context) =>
        context.type === ContextTypes.Node &&
        context.related.find((related) => related.source === "template") &&
        context.data.parentNode &&
        !(context.data.parentNode as ExiumContext).data.parentNode &&
        !context.data.isNodeClosing
      ));
  }
  /**
   * @returns the head element of the document
   * @deprecated support single file poly components
   */
  get head(): ExiumContext | undefined {
    if (this.#_type === "bio") {
      return undefined;
    }
    return this.#_head ||
      (this.#_head = this.contexts.find((context) =>
        context.type === ContextTypes.Node &&
        context.related.find((related) => related.source === "head") &&
        !context.data.isNodeClosing &&
        context.data.parentNode === this.template
      ));
  }
  /**
   * retrieve top level components
   */
  get components(): ExiumContext[] {
    if (this.#_type === "bio") {
      return (this.contexts.filter((context) =>
        context.type === ContextTypes.ComponentDeclaration
      ));
    }
    return this.#_components ||
      (this.#_components = this.contexts.filter((context) =>
        context.type === ContextTypes.Node &&
        context.name &&
        context.name[0] === context.name[0].toUpperCase() &&
        !context.data.parentNode
      ));
  }
  /**
   * retrieve all the matching elements inside the document
   * @param tagname the tagname of the element
   * @returns {ExiumContext}
   */
  getElementsByTagName(tagname: string): ExiumContext[] {
    return this.contexts.filter((context) => {
      return context.type === ContextTypes.Node &&
        context.related.find((related) => related.source === tagname) &&
        !context.data.isNodeClosing;
    });
  }
  /**
   * @returns < element class="tagname" />[]
   */
  getElementsByClassName(className: string): ExiumContext[] {
    return this.contexts.filter((context) => {
      return context.type === ContextTypes.Node &&
        context.children.find((child) => {
          const subChild = child.children[0];
          return child.type === ContextTypes.Attribute &&
            child.related[0]?.source === "class" &&
            (
              subChild
                  ?.source === className ||
              typeof subChild.value === "string" &&
                subChild.value
                  .split(" ")
                  .includes(className)
            );
        }) &&
        !context.data.isNodeClosing;
    });
  }
  /**
   * @returns < element id="id" id=id />
   */
  getElementById(value: string): ExiumContext | undefined {
    return this.contexts.find((context) => {
      return context.type === ContextTypes.Node &&
        context.children.find((child) =>
          child.type === ContextTypes.Attribute &&
          child.related[0]?.source === "id" &&
          (child.children[0]?.source === value ||
            child.children[0]?.value === value)
        ) &&
        !context.data.isNodeClosing;
    });
  }
  /**
   * @returns < element --flag={value} />
   */
  getElementsByFlag(flag: string): ExiumContext[] {
    return this.contexts.filter((context) => {
      return context.type === ContextTypes.Node &&
        context.children.find((child) =>
          [ContextTypes.Flag, ContextTypes.FlagStruct].includes(child.type) &&
          child.related.find((sub) =>
            sub.type === ContextTypes.Identifier &&
            (sub.source === flag || sub.source.startsWith(`${flag}:`))
          )
        ) &&
        !context.data.isNodeClosing;
    });
  }
  /**
   * @returns Flag.value
   */
  getFlagValue(
    element: ExiumContext,
    flag: string,
  ): string | boolean | undefined {
    if (!element || element.type !== ContextTypes.Node) {
      throw new Error("first argument should be a Node");
    }
    const retrievedFlag = element.children.find((context) =>
      [ContextTypes.Flag, ContextTypes.FlagStruct].includes(context.type) &&
      context.name === flag
    );
    if (!retrievedFlag) return undefined;
    const flagValue = retrievedFlag.children.find((context) =>
      [ContextTypes.Braces, ContextTypes.CurlyBrackets].includes(context.type)
    );
    if (!flagValue) return true;
    return flagValue.value as string;
  }
  /**
   * get all elements by attributes defined inside the document
   * @param attribute the attribute that the element should have
   * @returns an array of element {ExiumContext}
   */
  getElementsByAttribute(attribute: string) {
    return this.contexts.filter((context) =>
      context.type === ContextTypes.Node &&
      context.children.find((child) =>
        child.type === ContextTypes.Attribute &&
        child.related[0]?.source === attribute
      ) &&
      !context.data.isNodeClosing
    );
  }
  /**
   * retrieve local component
   * @param tagname the name of the component
   * @returns {ExiumContext}
   */
  getComponentByName(tagname: string): ExiumContext | undefined {
    return this.components.find((context) => context.name === tagname);
  }
  /**
   * retrieve imported component by tagname
   * @param tagname the name of the component
   * @returns {ExiumDocumentComponentDescriber}
   */
  getExternalComponentByName(
    tagname: string,
  ): ExiumDocumentComponentDescriber | null {
    const imports = this.getImportsOfExternalComponentByTagName(tagname);
    if (!imports.length) return null;
    return {
      elements: this.getElementsByTagName(tagname),
      imports,
    };
  }
  getImportsOfExternalComponentByTagName(tagname: string): ExiumContext[] {
    if (this.#_type === "bio") {
      return this.contexts.filter((context) => {
        const result = context.type === ContextTypes.ImportStatement &&
          context.children.find((child) =>
            child.type === ContextTypes.IdentifierList &&
            child.children.find((subchild) => subchild.source === tagname)
          ) &&
          context.data.isComponent;
        return result;
      });
    }
    return this.contexts.filter((context) =>
      context.type === ContextTypes.ImportStatement &&
      context.source.includes(tagname) &&
      context.data.isComponent
    );
  }
  /**
   *
   * @returns list of identifiers, those are the name of the components imported into the file
   */
  getIdentifiersOfExternalComponents(): ExiumContext[] {
    const accumulated: ExiumContext[] = [];
    this.contexts.forEach((context) => {
      if (
        context.type !== ContextTypes.ImportStatement ||
        !context.data.isComponent
      ) {
        return;
      }
      const identifierList: ExiumContext | undefined = context.children.find((
        child,
      ) => child.type === ContextTypes.IdentifierList);
      const identifier = context.children.find((child) =>
        child.type === ContextTypes.Identifier
      );
      if (identifierList) {
        accumulated.push(
          ...identifierList.children.filter((context) =>
            context.type === ContextTypes.Identifier
          ),
        );
      }
      if (identifier) {
        accumulated.push(identifier);
      }
    });
    return accumulated;
  }
  /**
   *
   * @returns a list of exported `ComponentDeclaration` context
   */
  getExportedComponents(): ExiumContext[] {
    const accumulated: ExiumContext[] = [];
    this.contexts.forEach((context) => {
      if (context.type !== ContextTypes.ExportStatement) return;
      const componentDeclaration = context.children.find((child) =>
        child.type === ContextTypes.ComponentDeclaration &&
        child.data.isExported
      );
      if (componentDeclaration) {
        accumulated.push(componentDeclaration);
      }
    });
    return accumulated;
  }
  /**
   *
   * @returns a list of exported `ComponentDeclaration` context
   */
  getLocalComponents(): ExiumContext[] {
    const accumulated: ExiumContext[] = [];
    this.contexts.forEach((context) => {
      if (
        context.type !== ContextTypes.ComponentDeclaration ||
        context.data.isExported
      ) {
        return;
      }
      accumulated.push(context);
    });
    return accumulated;
  }
  /**
   * @param importStatement an ImportStatement context
   * @returns {URL} the URL instance
   */
  getURLFromImport(importStatement: ExiumContext): URL {
    if (
      !importStatement ||
      ![ContextTypes.ImportAmbient, ContextTypes.ImportStatement].includes(
        importStatement.type,
      )
    ) {
      throw new Error(
        "Unexpected in getURLFromImport: first argument should be an import context",
      );
    }
    const path = importStatement.data.path as ExiumContext;
    if (!path) {
      throw new Error("path field is not exposed from the ImportStatement");
    }
    return new URL(path.source.replace(/(^['"]|['"]$)/gi, ""), this.url);
  }
  /**
   *
   * @returns the type of the document
   * if the document is set as ogone
   * it will the attribute type of the proto element
   */
  getType(): string {
    switch (this.#_type) {
      case "bio":
        return "bio";
      case "stylesheet":
        return "stylesheet";
      case "protocol":
        return "protocol";
      case "ogone": {
        const [component] = this.components;
        const { proto } = component;
        if (!proto) return "component";
        const type = proto.getAttribute("type");
        return type && type.length ? type : "component";
      }
    }
    return "component";
  }
  /**
   * retrieve the stylesheet's rules that apply on an element
   */
  getStylesheetRulesByTagName(tagname: string): ExiumContext[] {
    if (this.#_type !== "stylesheet") return [];
    return this.contexts.filter((child) => {
      return child.type === ContextTypes.StyleSheetSelectorList &&
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
    if (this.#_type !== "stylesheet") return [];
    return this.contexts.filter((child) => {
      return child.type === ContextTypes.StyleSheetSelectorList &&
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
    if (this.#_type !== "stylesheet") return [];
    return this.contexts.filter((child) => {
      return child.type === ContextTypes.StyleSheetSelectorList &&
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
    if (this.#_type !== "stylesheet") return [];
    return this.contexts.filter((child) => {
      return child.type === ContextTypes.StyleSheetSelectorList &&
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
    if (this.#_type !== "stylesheet") return [];
    return this.contexts.filter((child) => {
      return child.type === ContextTypes.StyleSheetSelectorList &&
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
    if (this.#_type !== "stylesheet") return [];
    return this.contexts.filter((child) => {
      return child.type === ContextTypes.StyleSheetSelectorList &&
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
    if (this.#_type !== "stylesheet") return [];
    return this.contexts.filter((context) => {
      return context.type === ContextTypes.StyleSheetAtRuleConst;
    });
  }
  /**
   * @returns all the exported stylesheets constants
   */
  getStylesheetExportedConstants(): ExiumContext[] {
    if (this.#_type !== "stylesheet") return [];
    const exports = this.contexts.filter((context) => {
      return context.type === ContextTypes.StyleSheetAtRuleExport;
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
    if (this.#_type !== "stylesheet") return undefined;
    return this.contexts.find((context) => {
      return context.type === ContextTypes.StyleSheetAtRuleConst &&
        context.name === name;
    });
  }
  /**
   * @returns the context describing the constant that is exported
   */
  getStylesheetExportedConstant(name: string): ExiumContext | undefined {
    if (this.#_type !== "stylesheet") return undefined;
    const exportCTX = this.contexts.find((context) => {
      return context.type === ContextTypes.StyleSheetAtRuleExport;
    });
    if (!exportCTX) return undefined;
    return exportCTX.children.find((child) =>
      child.type === ContextTypes.StyleSheetAtRuleConst &&
      child.name === name
    );
  }
  prepareTheIdProvider() {
    Object.assign(this.idProvider, {
      node: 0,
      textnode: 0,
      styleRule: 0,
    });
  }
  /**
   * when the document is ready, update the node contexts, set the context's document.
   * basically save the node contexts into their parent
   */
  #onload() {
    this.prepareTheIdProvider();
    this.contexts.forEach((context) => {
      switch (context.type) {
        case ContextTypes.Node:
          context.parentNode?.children.push(context);
          context.id = this.idProvider.node;
          this.idProvider.node++;
          break;
        case ContextTypes.TextNode:
          context.id = this.idProvider.textnode;
          this.idProvider.textnode++;
          break;
        case ContextTypes.StyleSheetRule:
          context.id = this.idProvider.stylerule;
          this.idProvider.stylerule++;
          break;
      }
      /**
       * save the document to allow global actions/search from the context
       */
      context.document = this;
    });
  }
}
