/**
 * reasons for the Ogone Lexer
 * to use the onError function passed in parameters
 */
export enum Reason {
  Unsupported = 0,
  UnexpectedToken = 1436,
  HTMLTagNotClosed = 1443,
  CommentBlockOpen = 1519,
  StringSingleQuoteOpen = 1593,
  StringDoubleQuoteOpen = 1633,
  StringTemplateQuoteOpen = 1678,
  StringTemplateQuoteEvaluationOpen = 1725,
  BracesOpen = 1773,
  CurlyBracketsOpen = 1819,
  ArrayOpen = 1866,
  ParentheseOpen = 1896,
  HTMLClosingTagWithoutOpening = 2116,
  HTMLTagNotFinish = 2128,
  HTMLCommentOpen = 2211,
  ImportAmbientStringMissing = 2274,
  ImportStatementNotFinish = 2354,
  OgoneFlagNotFinish = 2406,
  OgoneSpreadFlagNotClosed = 2491,
  HTMLAttributeNotClosed = 2549,
  HTMLBooleanAttributeNotClosed = 2590,
  HTMLAttributeNameNotClosed = 2630,
  HTMLAttributeValueUnquotedNotClosed = 2670,
  StyleSheetAtRuleCharsetInvalid = 2887,
  StyleSheetAtRuleCharsetStringIsMissing = 2890,
  StyleSheetAtRuleCharsetNotFinish = 2894,
  StyleSheetAtRuleCurlyBracketsAreMissing = 2960,
  StyleSheetTypeAssignmentNotFinish = 3004,
  StyleSheetAttributeNotClosed = 3408,
  StyleSheetPropertyListOpen = 3533,
  StyleSheetRulePropertyValueNotClosed = 3764,
  StyleSheetRuleSpreadNameMissing = 3923,
  ComponentDeclarationNodeMissing = 4200,
  ModifierNotFinished = 4300,
  ComponentNotFound = 5000,
}
