import { Exium } from './../../mod.ts';
import { ExiumContext } from './ExiumContext.ts';
import { ContextTypes } from '../enums/context-types.ts';
/**
 * a class to manager contexts
 * and retrieve them easily
 */
export interface ExiumDocumentOptions {
  url: URL,
  onError: ConstructorParameters<typeof Exium>[0];
  source: Parameters<Exium['readSync']>[0];
  options?: Parameters<Exium['readSync']>[1];
}
export interface ExiumDocumentComponentDescriber {
  elements: ExiumContext[];
  imports: ExiumContext[];
}
export class ExiumDocument {
  public url: URL;
  private exium: Exium;
  private contexts: ExiumContext[];
  #_stylesheets?: ExiumContext[];
  #_proto?: ExiumContext;
  #_head?: ExiumContext;
  #_protocol?: ExiumContext;
  #_template?: ExiumContext;
  constructor(opts: ExiumDocumentOptions) {
    this.exium = new Exium(opts.onError);
    this.contexts = this.exium.readSync(opts.source, opts.options || { type: 'component' });
    this.url = opts.url;
  }
  get stylesheets(): ExiumContext[] {
    return this.#_stylesheets
      || (this.#_stylesheets = this.contexts.filter((context) => context.type === ContextTypes.StyleSheet));
  }
  get proto(): ExiumContext | undefined {
    return this.#_proto
      || (this.#_proto = this.contexts.find((context) => context.type === ContextTypes.Node
        && context.related.find((related) => related.source === "proto")
        && !context.data.parentNode
        && !context.data.isNodeClosing));
  }
  get protocol(): ExiumContext | undefined {
    return this.#_protocol
      || (this.#_protocol = this.contexts.find((context) => context.type === ContextTypes.Protocol));
  }
  get template(): ExiumContext | undefined {
    return this.#_template
      || (this.#_template = this.contexts.find((context) => context.type === ContextTypes.Node
        && context.related.find((related) => related.source === "template")
        && !context.data.parentNode
        && !context.data.isNodeClosing
      ));
  }
  get head(): ExiumContext | undefined {
    return this.#_head
      || (this.#_head = this.contexts.find((context) => context.type === ContextTypes.Node
        && context.related.find((related) => related.source === "head")
        && !context.data.isNodeClosing
        && context.data.parentNode === this.template
      ));
  }
  /**
   * retrieve all the matching elements inside the document
   * @param tagname the tagname of the element
   * @returns {ExiumContext}
   */
  getElementsByTagName(tagname: string): ExiumContext[] {
    return this.contexts.filter((context) => {
      return context.type === ContextTypes.Node
        && context.related.find((related) => related.source === tagname)
        && !context.data.isNodeClosing;
    });
  }
  /**
   * @returns < element class="tagname" />[]
   */
  getElementsByClassName(className: string): ExiumContext[] {
    return this.contexts.filter((context) => {
      return context.type === ContextTypes.Node
        && context.children.find((child) => {
          const subChild = child.children[0];
          return child.type === ContextTypes.Attribute
            && child.related[0]?.source === 'class'
            && (
              subChild
                ?.source === className
              || typeof subChild.value === 'string'
              && subChild.value
                .split(' ')
                .includes(className))
        })
        && !context.data.isNodeClosing
    });
  }
  /**
   * @returns < element id="id" id=id />
   */
  getElementById(value: string): ExiumContext | undefined {
    return this.contexts.find((context) => {
      return context.type === ContextTypes.Node
        && context.children.find((child) => child.type === ContextTypes.Attribute
          && child.related[0]?.source === 'id'
          && (child.children[0]?.source === value
            || child.children[0]?.value === value))
        && !context.data.isNodeClosing
    });
  }
  /**
   * @returns < element --flag={value} />
   */
  getElementsByFlag(flag: string): ExiumContext[] {
    return this.contexts.filter((context) => {
      return context.type === ContextTypes.Node
        && context.children.find((child) => [ContextTypes.Flag, ContextTypes.FlagStruct].includes(child.type)
          && child.related.find((sub) => sub.type === ContextTypes.Identifier
            && (sub.source === flag || sub.source.startsWith(`${flag}:`))))
        && !context.data.isNodeClosing
    });
  }
  /**
   * @returns Flag.value
   */
  getFlagValue(element: ExiumContext, flag: string): string | boolean | undefined {
    if (!element || element.type !== ContextTypes.Node) throw new Error('first argument should be a Node');
    const retrievedFlag = element.children.find((context) => [ContextTypes.Flag, ContextTypes.FlagStruct].includes(context.type)
      && context.name === flag);
    if (!retrievedFlag) return;
    const flagValue = retrievedFlag.children.find((context) => [ContextTypes.Braces, ContextTypes.CurlyBraces,].includes(context.type));
    if (!flagValue) return true;
    return flagValue.value as string;
  }
  /**
   * get all elements by attributes defined inside the document
   * @param attribute the attribute that the element should have
   * @returns an array of element {ExiumContext}
   */
  getElementsByAttribute(attribute: string) {
    return this.contexts.filter((context) => context.type === ContextTypes.Node
      && context.children.find((child) => child.type === ContextTypes.Attribute
        && child.related[0]?.source === attribute)
      && !context.data.isNodeClosing);
  }
  /**
   *
   * @param tagname the name of the component
   * @returns {ExiumDocumentComponentDescriber}
   */
  getComponentByName(tagname: string): ExiumDocumentComponentDescriber | null {
    const imports = this.getComponentImports(tagname);
    if (!imports.length) return null;
    return {
      elements: this.getElementsByTagName(tagname),
      imports,
    };
  }
  getComponentImports(tagname: string): ExiumContext[] {
    return this.contexts.filter((context) => context.type === ContextTypes.ImportStatement
      && context.source.includes(tagname)
      && context.data.isComponent
    );
  }
  getURLFromImport(importStatement: ExiumContext): URL {
    if (!importStatement
      || ![ContextTypes.ImportAmbient, ContextTypes.ImportStatement].includes(importStatement.type)) {
      throw new Error('Unexpected in getURLFromImport: first argument should be an import context');
    }
    const path = importStatement.data.path as ExiumContext;
    if (!path) {
      throw new Error('path field is not exposed from the ImportStatement');
    }
    return new URL(path.source.replace(/(^['"]|['"]$)/gi, ''), this.url);
  }
}