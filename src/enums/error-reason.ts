/**
 * reasons for the Ogone Lexer
 * to use the onError function passed in parameters
 */
export enum Reason {
  UnexpectedToken = 1436,
  HTMLTagNotClosed = 1443,
  CommentBlockOpen = 1519,
  StringSingleQuoteOpen = 1593,
  StringDoubleQuoteOpen = 1633,
  StringTemplateQuoteOpen = 1678,
  StringTemplateQuoteEvaluationOpen = 1725,
  BracesOpen = 1773,
  CurlyBracesOpen = 1819,
  ArrayOpen = 1866,
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
  StyleSheetAtRuleCurlyBracesAreMissing = 2960,
  StyleSheetTypeAssignmentNotFinish = 3004,
}
