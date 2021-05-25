import { Exium } from './../../mod.ts';
import { ExiumContext } from './ExiumContext.ts';
import { ContextTypes } from '../enums/context-types.ts';
/**
 * a class to manager contexts
 * and retrieve them easily
 */
export interface ExiumDocumentOptions {
  onError: ConstructorParameters<typeof Exium>[0];
  source: Parameters<Exium['readSync']>[0];
  options?: Parameters<Exium['readSync']>[1];
};
export interface ExiumDocumentComponentDescriber {
  elements: ExiumContext[];
  imports: ExiumContext[];
};
export class ExiumDocument {
  private exium: Exium;
  private contexts: ExiumContext[];
  #_stylesheets?: ExiumContext[];
  #_proto?: ExiumContext;
  #_protocol?: ExiumContext;
  #_template?: ExiumContext;
  constructor(opts: ExiumDocumentOptions) {
    this.exium = new Exium(opts.onError);
    this.contexts = this.exium.readSync(opts.source, opts.options || { type: 'component' });
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
  /**
   * retrieve all the matching elements inside the document
   * @param tagname the tagname of the element
   * @returns {ExiumContext}
   */
  getElementsByTagName(tagname: string): ExiumContext[] {
    return this.contexts.filter((context) => context.type === ContextTypes.Node
      && context.related.find((related) => related.source === tagname)
      && !context.data.isNodeClosing);
  }
  /**
   * @returns < element class="tagname" />[]
   */
  getElementsByClassName(className: string): ExiumContext[] {
    return this.contexts.filter((context) => context.type === ContextTypes.Node
      && context.children.find((child) => child.type === ContextTypes.Attribute
        && child.related[0]?.source === 'class'
        && child.children[0]?.source
          .split(' ')
          .includes(className))
      && !context.data.isNodeClosing);
  }
  /**
   * @returns < element id="id" />
   */
  getElementById(id: string): ExiumContext | undefined {
    return this.contexts.find((context) => context.type === ContextTypes.Node
      && context.children.find((child) => child.type === ContextTypes.Attribute
        && child.related[0]?.source === 'id'
        && child.children[0]?.source === id)
      && !context.data.isNodeClosing);
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
  getComponentsByTagName(tagname: string): ExiumDocumentComponentDescriber {
    return {
      elements: this.getElementsByTagName(tagname),
      imports: [] // this.getComponentImports(tagname),
    };
  }
}