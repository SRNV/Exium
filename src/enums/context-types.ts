/**
 * all the context names parsed by Exium
 */
export enum ContextTypes {
  Unexpected = "Unexpected",
  Space = "Space",
  SemiColon = "SemiColon",
  Coma = "Coma",
  DoublePoint = "DoublePoint",
  Point = "Point",
  MultipleSpaces = "MultipleSpaces",
  LineBreak = "LineBreak",
  StringSingleQuote = "StringSingleQuote",
  StringDoubleQuote = "StringDoubleQuote",
  StringTemplateQuote = "StringTemplateQuote",
  StringTemplateQuoteEval = "StringTemplateQuoteEval",
  Comment = "Comment",
  CommentBlock = "CommentBlock",
  Braces = "Braces",
  CurlyBraces = "CurlyBraces",
  Array = "Array",
  Parenthese = "Parenthese",
  HTMLComment = "HTMLComment",
  ImportAmbient = "ImportAmbient",
  ImportStatement = "ImportStatement",
  ImportComponentStatement = "ImportComponentStatement",
  ImportStatementFrom = "ImportStatementFrom",
  InjectAmbient = "InjectAmbient",
  TextNode = "TextNode",
  Node = "Node",
  NodeName = "NodeName",
  NodeOpening = "NodeOpening",
  NodeOpeningEnd = "NodeOpeningEnd",
  NodeClosing = "NodeClosing",
  NodeClosingEnd = "NodeClosingEnd",
  Flag = "Flag",
  FlagName = "FlagName",
  FlagSpread = "FlagSpread",
  Attribute = "Attribute",
  AttributeName = "AttributeName",
  AttributeBoolean = "AttributeBoolean",
  AttributeValueQuoteSingle = "AttributeValueQuoteSingle",
  AttributeValueQuoteDouble = "AttributeValueQuoteDouble",
  AttributeValueQuoteTemplate = "AttributeValueQuoteTemplate",
  AttributeValueCurlyBraces = "AttributeValueCurlyBraces",
  AttributeValueUnquoted = "AttributeValueUnquoted",
  AttributeValueBraces = "AttributeValueBraces",
  AttributeValueArray = "AttributeValueArray",
  AttributeValueContent = "AttributeValueContent",
  AttributeValueStart = "AttributeValueStart",
  AttributeValueEnd = "AttributeValueEnd",
  /**
   * all contexts involved into protocol
   */
  Protocol = "Protocol",
  /**
   * all contexts involved into stylesheet
   */
  StyleSheet = "StyleSheet",
  StyleSheetEnd = "StyleSheetEnd",
  StyleSheetRule = "StyleSheetRule",
  StyleSheetAtRule = "StyleSheetAtRule",
  StyleSheetAtRuleName = "StyleSheetAtRuleName",
  StyleSheetAtRuleCharset = "StyleSheetAtRuleCharset",
  StyleSheetTypeAssignment = "StyleSheetTypeAssignment",
  StyleSheetAtRuleConst = "StyleSheetAtRuleConst",
  StyleSheetAtRuleConstName = "StyleSheetAtRuleConstName",
  StyleSheetAtRuleConstType = "StyleSheetAtRuleConstType",
  StyleSheetAtRuleConstEqual = "StyleSheetAtRuleConstEqual",
  StyleSheetAtRuleConstValue = "StyleSheetAtRuleConstValue",
  StyleSheetAtRuleExport = "StyleSheetAtRuleExport",
  StyleSheetType = "StyleSheetType",
  StyleSheetCurlyBraces = "StyleSheetCurlyBraces",
  StyleSheetRuleSpread = "StyleSheetRuleSpread",
  StyleSheetRuleSpreadName = "StyleSheetRuleSpreadName",
  StyleSheetParentRef = "StyleSheetParentRef",
  StyleSheetPropertyList = "StyleSheetPropertyList",
  StyleSheetProperty = "StyleSheetProperty",
  StyleSheetPropertyName = "StyleSheetPropertyName",
  StyleSheetPropertyValue = "StyleSheetPropertyValue",
  StyleSheetPseudoProperty = "StyleSheetPseudoProperty",
  StyleSheetSelector = "StyleSheetSelector",
  StyleSheetSelectorList = "StyleSheetSelectorList",
  StyleSheetSelectorHTMLElement = "StyleSheetSelectorHTMLElement",
  StyleSheetSelectorClass = "StyleSheetSelectorClass",
  StyleSheetSelectorId = "StyleSheetSelectorId",
  StyleSheetSelectorAttribute = "StyleSheetSelectorAttribute",
  StyleSheetSelectorAttributeEqual = "StyleSheetSelectorAttributeEqual",
  StyleSheetSelectorAttributeName = "StyleSheetSelectorAttributeName",
  StyleSheetSelectorAttributeValue = "StyleSheetSelectorAttributeValue",
  StyleSheetSelectorPseudoClass = "StyleSheetSelectorPseudoClass",
  StyleSheetSelectorPseudoElement = "StyleSheetSelectorPseudoElement",
  StyleSheetSelectorCombinatorChildSelector =
    "StyleSheetSelectorCombinatorChildSelector",
  StyleSheetSelectorCombinatorAdjacentSibling =
    "StyleSheetSelectorCombinatorAdjacentSibling",
  StyleSheetSelectorCombinatorGeneralSibling =
    "StyleSheetSelectorCombinatorGeneralSibling",
  StyleSheetSelectorCombinatorAll = "StyleSheetSelectorCombinatorAll",
  StyleSheetHexType = "StyleSheetHexType",
  StyleSheetPixelType = "StyleSheetPixelType",
}
