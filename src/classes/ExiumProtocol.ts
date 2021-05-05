import { ExiumHTMLElements } from './ExiumHTMLElements.ts';
import {
  ContextReader,
  CursorDescriber,
  OgooneLexerParseOptions,
  ContextReaderOptions,
} from '../types/main.d.ts';
import { ExiumContext } from './ExiumContext.ts';
import { ContextTypes } from '../enums/context-types.ts';
import { Reason } from '../enums/error-reason.ts';

/**
 * all ContextReaders to read protocols elements inside components
 */
export class ExiumProtocol extends ExiumHTMLElements {
  constructor(...args: ConstructorParameters<typeof ExiumHTMLElements>) {
    super(...args);
  }
  /**
   * reads the textnode that should match (protocol)> ... </(protocol)
   */
   protocol_CTX(opts?: ContextReaderOptions): boolean {
    try {
      let { char, prev, next, lastContext } = this;
      const { x, line, column } = this.cursor;
      let { source } = this;
      const lastIsAStyleNode = this.currentContexts.find((context) => context.type === ContextTypes.Node
        && context.related.find((node) => node.type === ContextTypes.NodeName
          && node.source === 'proto')
        && !context.related.find((node) => node.type === ContextTypes.NodeClosing));
      const isValid = !!lastIsAStyleNode;
      if (!isValid) return false;
      if (opts?.checkOnly) return true;
      let result = true;
      const children: ExiumContext[] = [];
      const allSubContexts = [
        this.line_break_CTX,
        this.multiple_spaces_CTX,
        this.space_CTX,
      ];
      while (!this.isEOF) {
        this.shift(1);
        this.isValidChar(opts?.unexpected);
        this.saveContextsTo(allSubContexts, children);
        if (this.isStartingNode() && this.nextPart.startsWith('</proto')) {
          break;
        }
      }
      const token = source.slice(x, this.cursor.x);
      const context = new ExiumContext(ContextTypes.Protocol, token, {
        start: x,
        end: this.cursor.x,
        line,
        column,
      });
      context.children.push(...children);
      this.currentContexts.push(context);
      return result;
    } catch (err) {
      throw err;
    }
  }
}
