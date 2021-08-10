/**
 * all the context parsed by Exium
 */
export enum ContextTypes {
  Unexpected = "Unexpected",
  Space = "Space",
  Identifier = "Identifier",
  AsStatement = "AsStatement",
  // *
  Asterix = "Asterix",
  IdentifierAsStatement = "IdentifierAsStatement",
  // Identifier separated by a coma
  IdentifierList = "IdentifierList",
  IdentifierSemiColonList = "IdentifierSemiColonList",
  // @
  At = "At",
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
  CurlyBrackets = "CurlyBrackets",
  Array = "Array",
  Parenthese = "Parenthese",
  Argument = "Argument",
  // COMPONENT
  ComponentTypeStatement = "ComponentTypeStatement",
  ComponentDeclaration = "ComponentDeclaration",
  // HTML
  HTMLComment = "HTMLComment",
  ImportAmbient = "ImportAmbient",
  ImportStatement = "ImportStatement",
  ExportStatement = "ExportStatement",
  ImportComponentStatement = "ImportComponentStatement",
  ImportStatementFrom = "ImportStatementFrom",
  ImportAllAlias = "ImportAllAlias",
  InjectAmbient = "InjectAmbient",
  TextNode = "TextNode",
  Node = "Node",
  NodeOpening = "NodeOpening",
  NodeOpeningEnd = "NodeOpeningEnd",
  NodeClosing = "NodeClosing",
  NodeClosingEnd = "NodeClosingEnd",
  Flag = "Flag",
  FlagStruct = "FlagStruct",
  FlagSpread = "FlagSpread",
  Attribute = "Attribute",
  AttributeModifier = "AttributeModifier",
  AttributeModifierType = "AttributeModifierType",
  AttributeProperty = "AttributeProperty",
  AttributeBoolean = "AttributeBoolean",
  AttributeValueQuoteSingle = "AttributeValueQuoteSingle",
  AttributeValueQuoteDouble = "AttributeValueQuoteDouble",
  AttributeValueQuoteTemplate = "AttributeValueQuoteTemplate",
  AttributeValueCurlyBrackets = "AttributeValueCurlyBrackets",
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
  StyleSheetAtRuleCharset = "StyleSheetAtRuleCharset",
  StyleSheetTypeAssignment = "StyleSheetTypeAssignment",
  StyleSheetAtRuleConst = "StyleSheetAtRuleConst",
  StyleSheetAtRuleConstType = "StyleSheetAtRuleConstType",
  StyleSheetAtRuleConstEqual = "StyleSheetAtRuleConstEqual",
  StyleSheetAtRuleConstValue = "StyleSheetAtRuleConstValue",
  StyleSheetAtRuleExport = "StyleSheetAtRuleExport",
  StyleSheetType = "StyleSheetType",
  StyleSheetCurlyBrackets = "StyleSheetCurlyBrackets",
  StyleSheetRuleSpread = "StyleSheetRuleSpread",
  StyleSheetParentRef = "StyleSheetParentRef",
  StyleSheetPropertyList = "StyleSheetPropertyList",
  StyleSheetProperty = "StyleSheetProperty",
  StyleSheetPropertyValue = "StyleSheetPropertyValue",
  StyleSheetPseudoProperty = "StyleSheetPseudoProperty",
  StyleSheetPseudoPropertyName = "StyleSheetPseudoPropertyName",
  StyleSheetPseudoPropertyParentheses = "StyleSheetPseudoPropertyParentheses",
  StyleSheetPseudoPropertyItem = "StyleSheetPseudoPropertyItem",
  StyleSheetPseudoPropertyItemName = "StyleSheetPseudoPropertyItemName",
  StyleSheetPseudoPropertyItemValue = "StyleSheetPseudoPropertyItemValue",
  StyleSheetSelector = "StyleSheetSelector",
  StyleSheetSelectorList = "StyleSheetSelectorList",
  StyleSheetSelectorHTMLElement = "StyleSheetSelectorHTMLElement",
  StyleSheetSelectorClass = "StyleSheetSelectorClass",
  StyleSheetSelectorId = "StyleSheetSelectorId",
  StyleSheetSelectorAttribute = "StyleSheetSelectorAttribute",
  StyleSheetSelectorAttributeEqual = "StyleSheetSelectorAttributeEqual",
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
