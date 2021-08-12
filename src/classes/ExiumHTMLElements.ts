import { ExiumBase } from "./ExiumBase.ts";
import { ContextReader, ContextReaderOptions } from "../types/main.d.ts";
import { ExiumContext } from "./ExiumContext.ts";
import { ContextTypes } from "../enums/context-types.ts";
import { Reason } from "../enums/error-reason.ts";

/**
 * all ContextReaders to read HTMLElements.
 */
export class ExiumHTMLElements extends ExiumBase {
  constructor(...args: ConstructorParameters<typeof ExiumBase>) {
    super(...args);
  }
}
