export const SupportedStyleSheetPseudoElements = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error",
  "target-text",
];

export const SupportedStyleSheetPseudoClasses = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  "disabled",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "focus",
  "focus-visible",
  "focus-within",
  "fullscreen",
  "future",
  "has",
  "host",
  "host-context",
  "hover",
  "in-range",
  "indeterminate",
  "invalid",
  "is",
  "lang",
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  "nth-child",
  "nth-col",
  "nth-last-child",
  "nth-last-col",
  "nth-last-of-type",
  "nth-of-type",
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "paused",
  "picture-in-picture",
  "placeholder-shown",
  "playing",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "user-valid",
  "valid",
  "visited",
  "where",
];

export const SupportedStyleSheetFunctionalNotations = [
  "abs",
  "acos",
  "annotation",
  "asin",
  "atan",
  "atan2",
  "attr",
  "blur",
  "brightness",
  "calc",
  "character-variant",
  "circle",
  "clamp",
  "color",
  "conic-gradient",
  "cos",
  "counter",
  "counters",
  "contrast",
  "cross-fade",
  "cubic-bezier",
  "device-cmyk",
  "drop-shadow",
  "element",
  "env",
  "ellipse",
  "exp",
  "fit-content",
  "format",
  "grayscale",
  "hsl",
  "hsla",
  "hue-rotate",
  "hwb",
  "hypot",
  "image",
  "image-set",
  "inset",
  "invert",
  "lab",
  "lch",
  "leader",
  "linear-gradient",
  "local",
  "log",
  "matrix",
  "matrix3d",
  "max",
  "min",
  "minmax",
  "mod",
  "opacity",
  "ornaments",
  "paint",
  "path",
  "perspective",
  "polygon",
  "pow",
  "radial-gradient",
  "rem",
  "repeat",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "repeating-conic-gradient",
  "rgb",
  "rgba",
  "rotate",
  "rotate3d",
  "rotateX",
  "rotateY",
  "rotateZ",
  "round",
  "saturate",
  "scale",
  "scale3d",
  "scaleX",
  "scaleY",
  "scaleZ",
  "sepia",
  "sign",
  "sin",
  "skew",
  "skewX",
  "skewY",
  "sqrt",
  "steps",
  "styleset",
  "stylistic",
  "swash",
  "symbols",
  "tan",
  "target-counter",
  "target-counters",
  "target-text",
  "toggle",
  "translate",
  "translate3d",
  "translateX",
  "translateY",
  "translateZ",
  "url",
  "var",
];
export const SupportedStyleSheetUnits = [
  "px", // pixels
  "vh", // viewport height
  "vw", // viewport with
  "vmin", // viewport min
  "vmax", // viewport max
  "em",
  "percent", // percentage
  "Q", // quarter
  "in", // inches
  "pc", // picas
  "pt", // points
  "ex",
  "ch",
  "rem",
  "1h",
  "fr", // grid fragment
  "auto",
];
// available constants types
export const SupportedStyleSheetAtRuleConstantTypes = [
  // functions
  ...SupportedStyleSheetFunctionalNotations,
  // colors
  "color",
  "hex",
  "basic-color",
  // units
  ...SupportedStyleSheetUnits,
  // rules
  "rule",
];
export const SupportedStyleSheetProperties = [
  "align-content",
  "align-items",
  "align-self",
  "align-tracks",
  "all",
  "angle",
  "animation",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-decoration-break",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "color",
  "color-adjust",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cursor",
  "direction",
  "display",
  "resolution",
  "empty-cells",
  "length",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "flex_value",
  "float",
  "font",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "frequency",
  "hanging-punctuation",
  "height",
  "hyphens",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "inherit",
  "initial",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "justify-tracks",
  "left",
  "letter-spacing",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "time",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "Pseudo-classes",
  "Pseudo-elements",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "quotes",
  "resize",
  "revert",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-last",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "unset",
  "user-select",
  "vertical-align",
  "visibility",
  "white-space",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "z-index",
];

/**
 * all the css colors
 */
export const SupportedStyleSheetColors = [
  /**
   * basic color keywords
   */
  "aqua",
  "black",
  "blue",
  "fuchsia",
  "gray",
  "green",
  "lime",
  "maroon",
  "navy",
  "olive",
  "purple",
  "red",
  "silver",
  "teal",
  "white",
  "yellow",
  /**
   * all colors
   */
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "green",
  "greenyellow",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgreen",
  "lightgrey",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "navyblue",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen",
];

export const SupportedStyleSheetCharset = [
  "US-ASCII",
  "ISO_8859-1:1987",
  "ISO_8859-2:1987",
  "ISO_8859-3:1988",
  "ISO_8859-4:1988",
  "ISO_8859-5:1988",
  "ISO_8859-6:1987",
  "ISO_8859-7:1987",
  "ISO_8859-8:1988",
  "ISO_8859-9:1989",
  "ISO-8859-10",
  "ISO_6937-2-add",
  "JIS_X0201",
  "JIS_Encoding",
  "Shift_JIS",
  "Extended_UNIX_Code_Packed_Format_for_Japanese",
  "Extended_UNIX_Code_Fixed_Width_for_Japanese",
  "BS_4730",
  "SEN_850200_C",
  "IT",
  "ES",
  "DIN_66003",
  "NS_4551-1",
  "NF_Z_62-010",
  "ISO-10646-UTF-1",
  "ISO_646.basic:1983",
  "INVARIANT",
  "ISO_646.irv:1983",
  "NATS-SEFI",
  "NATS-SEFI-ADD",
  "NATS-DANO",
  "NATS-DANO-ADD",
  "SEN_850200_B",
  "KS_C_5601-1987",
  "ISO-2022-KR",
  "EUC-KR",
  "ISO-2022-JP",
  "ISO-2022-JP-2",
  "JIS_C6220-1969-jp",
  "JIS_C6220-1969-ro",
  "PT",
  "greek7-old",
  "latin-greek",
  "NF_Z_62-010_(1973)",
  "Latin-greek-1",
  "ISO_5427",
  "JIS_C6226-1978",
  "BS_viewdata",
  "INIS",
  "INIS-8",
  "INIS-cyrillic",
  "ISO_5427:1981",
  "ISO_5428:1980",
  "GB_1988-80",
  "GB_2312-80",
  "NS_4551-2",
  "videotex-suppl",
  "PT2",
  "ES2",
  "MSZ_7795.3",
  "JIS_C6226-1983",
  "greek7",
  "ASMO_449",
  "iso-ir-90",
  "JIS_C6229-1984-a",
  "JIS_C6229-1984-b",
  "JIS_C6229-1984-b-add",
  "JIS_C6229-1984-hand",
  "JIS_C6229-1984-hand-add",
  "JIS_C6229-1984-kana",
  "ISO_2033-1983",
  "ANSI_X3.110-1983",
  "T.61-7bit",
  "T.61-8bit",
  "ECMA-cyrillic",
  "CSA_Z243.4-1985-1",
  "CSA_Z243.4-1985-2",
  "CSA_Z243.4-1985-gr",
  "ISO_8859-6-E",
  "ISO_8859-6-I",
  "T.101-G2",
  "ISO_8859-8-E",
  "ISO_8859-8-I",
  "CSN_369103",
  "JUS_I.B1.002",
  "IEC_P27-1",
  "JUS_I.B1.003-serb",
  "JUS_I.B1.003-mac",
  "greek-ccitt",
  "NC_NC00-10:81",
  "ISO_6937-2-25",
  "GOST_19768-74",
  "ISO_8859-supp",
  "ISO_10367-box",
  "latin-lap",
  "JIS_X0212-1990",
  "DS_2089",
  "us-dk",
  "dk-us",
  "KSC5636",
  "UNICODE-1-1-UTF-7",
  "ISO-2022-CN",
  "ISO-2022-CN-EXT",
  "UTF-8",
  "ISO-8859-13",
  "ISO-8859-14",
  "ISO-8859-15",
  "ISO-8859-16",
  "GBK",
  "GB18030",
  "OSD_EBCDIC_DF04_15",
  "OSD_EBCDIC_DF03_IRV",
  "OSD_EBCDIC_DF04_1",
  "ISO-11548-1",
  "KZ-1048",
  "ISO-10646-UCS-2",
  "ISO-10646-UCS-4",
  "ISO-10646-UCS-Basic",
  "ISO-10646-Unicode-Latin1",
  "ISO-10646-J-1",
  "ISO-Unicode-IBM-1261",
  "ISO-Unicode-IBM-1268",
  "ISO-Unicode-IBM-1276",
  "ISO-Unicode-IBM-1264",
  "ISO-Unicode-IBM-1265",
  "UNICODE-1-1",
  "SCSU",
  "UTF-7",
  "UTF-16BE",
  "UTF-16LE",
  "UTF-16",
  "CESU-8",
  "UTF-32",
  "UTF-32BE",
  "UTF-32LE",
  "BOCU-1",
  "UTF-7-IMAP",
  "ISO-8859-1-Windows-3.0-Latin-1",
  "ISO-8859-1-Windows-3.1-Latin-1",
  "ISO-8859-2-Windows-Latin-2",
  "ISO-8859-9-Windows-Latin-5",
  "hp-roman8",
  "Adobe-Standard-Encoding",
  "Ventura-US",
  "Ventura-International",
  "DEC-MCS",
  "IBM850",
  "PC8-Danish-Norwegian",
  "IBM862",
  "PC8-Turkish",
  "IBM-Symbols",
  "IBM-Thai",
  "HP-Legal",
  "HP-Pi-font",
  "HP-Math8",
  "Adobe-Symbol-Encoding",
  "HP-DeskTop",
  "Ventura-Math",
  "Microsoft-Publishing",
  "Windows-31J",
  "GB2312",
  "Big5",
  "macintosh",
  "IBM037",
  "IBM038",
  "IBM273",
  "IBM274",
  "IBM275",
  "IBM277",
  "IBM278",
  "IBM280",
  "IBM281",
  "IBM284",
  "IBM285",
  "IBM290",
  "IBM297",
  "IBM420",
  "IBM423",
  "IBM424",
  "IBM437",
  "IBM500",
  "IBM851",
  "IBM852",
  "IBM855",
  "IBM857",
  "IBM860",
  "IBM861",
  "IBM863",
  "IBM864",
  "IBM865",
  "IBM868",
  "IBM869",
  "IBM870",
  "IBM871",
  "IBM880",
  "IBM891",
  "IBM903",
  "IBM904",
  "IBM905",
  "IBM918",
  "IBM1026",
  "EBCDIC-AT-DE",
  "EBCDIC-AT-DE-A",
  "EBCDIC-CA-FR",
  "EBCDIC-DK-NO",
  "EBCDIC-DK-NO-A",
  "EBCDIC-FI-SE",
  "EBCDIC-FI-SE-A",
  "EBCDIC-FR",
  "EBCDIC-IT",
  "EBCDIC-PT",
  "EBCDIC-ES",
  "EBCDIC-ES-A",
  "EBCDIC-ES-S",
  "EBCDIC-UK",
  "EBCDIC-US",
  "UNKNOWN-8BIT",
  "MNEMONIC",
  "MNEM",
  "VISCII",
  "VIQR",
  "KOI8-R",
  "HZ-GB-2312",
  "IBM866",
  "IBM775",
  "KOI8-U",
  "IBM00858",
  "IBM00924",
  "IBM01140",
  "IBM01141",
  "IBM01142",
  "IBM01143",
  "IBM01144",
  "IBM01145",
  "IBM01146",
  "IBM01147",
  "IBM01148",
  "IBM01149",
  "Big5-HKSCS",
  "IBM1047",
  "PTCP154",
  "Amiga-1251",
  "KOI7-switched",
  "BRF",
  "TSCII",
  "CP51932",
  "windows-874",
  "windows-1250",
  "windows-1251",
  "windows-1252",
  "windows-1253",
  "windows-1254",
  "windows-1255",
  "windows-1256",
  "windows-1257",
  "windows-1258",
  "TIS-620",
  "CP50220",
  "Alexander Uskov",
  "Alexei Veremeev",
  "Chris Wendt",
  "Florian Weimer",
  "Hank Nussbacher",
  "Internet Assigned Numbers Authority",
  "Jun Murai",
  "Katya Lazhintseva",
  "Keld Simonsen",
  "Keld Simonsen",
  "Kuppuswamy Kalyanasundaram",
  "Mark Davis",
  "Markus Scherer",
  "Masataka Ohta",
  "Nicky Yick",
  "Reuel Robrigado",
  "Rick Pond",
  "Sairan M. Kikkarin",
  "Samuel Thibault",
  "Shawn Steele",
  "Tamer Mahdi",
  "Toby Phipps",
  "Trin Tantsetthi",
  "Vladas Tumasonis",
  "Woohyong Choi",
  "Yui Naruse",
];

/**
 * supported flags
 * should only appear on HTMLElements
 */
export const SupportedFlags = [
  /**
   * structural flags
   */
  "--for",
  "--await",
  "--if",
  "--else-if",
  "--else",
  /**
   * DOM L3 events
   */
  "--click",
  "--dblclick",
  "--mouseenter",
  "--mouseover",
  "--mousemove",
  "--mousedown",
  "--mouseup",
  "--mouseleave",
  "--keypress",
  "--keydown",
  "--keyup",
  "--wheel",
  /**
   * custom event flags
   */
  "--event",
  /**
   * style flags
   */
  "--class",
  "--style",
  "--keyframes",
  /**
   * value flags
   */
  "--bind",
  /**
   * router flags
   */
  "--router-go",
  "--router-dev-tool",
  /**
   * async flags
   */
  "--defer",
  "--then",
  "--finally",
  "--catch",
];
