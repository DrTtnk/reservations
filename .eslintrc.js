const E = `error`;
const O = `off`;

// eslint-disable-next-line no-undef
module.exports = {
    extends: [
        `eslint:recommended`,
        `plugin:@typescript-eslint/recommended`,
        `plugin:@typescript-eslint/eslint-recommended`,

        `plugin:fp-ts/recommended`,
    ],
    parser  : `@typescript-eslint/parser`,
    plugins : [
        `@typescript-eslint`,
        `arca`,
        `align-assignments`,
        `fp-ts`,
        `import-newlines`,
    ],
    parserOptions : { ecmaFeatures: { jsx: true } },
    rules         : {
        "key-spacing": [E, {
            "mode"  : `strict`,
            "align" : {
                "beforeColon" : true,
                "afterColon"  : true,
                "on"          : `colon`,
            },
        }],

        "import-newlines/enforce": [ E, { "items": 2, "semi": true, forceSingleLine: true } ],

        "no-trailing-spaces"                  : E,
        "align-assignments/align-assignments" : [E, { "requiresOnly": false } ],
        "no-multiple-empty-lines"             : [E, { "max": 1 }],
        "comma-dangle"                        : [E, `always-multiline`],
        "operator-linebreak"                  : [E, `before`, { "overrides": { "?": `ignore` } }],

        // Arrow functions
        "prefer-arrow-callback" : [E, { "allowNamedFunctions": true }],
        "arrow-body-style"      : [E, `as-needed`],
        "arrow-parens"          : [E, `as-needed`],
        "arrow-spacing"         : [E, { "before": true, "after": true }],

        "semi-style"           : [E, `last`],
        "semi-spacing"         : [E, { "before": false, "after": true }],
        // Overwritten by @typescript-eslint/eslint-plugin
        "quotes"               : O,
        "object-curly-spacing" : O,

        // TypeScript
        "@typescript-eslint/quotes"               : [E, `backtick`],
        "@typescript-eslint/semi"                 : [E, `always`],
        "@typescript-eslint/no-inferrable-types"  : E,
        "@typescript-eslint/no-extra-parens"      : [E, `all`],
        "@typescript-eslint/object-curly-spacing" : [E, `always`],
        "@typescript-eslint/no-unused-vars"       : [E, { "argsIgnorePattern": `_+` }],

        "arca/curly"                        : E,
        "arca/import-align"                 : [E, { collapseExtraSpaces: true }],
        "arca/import-ordering"              : E,
        "arca/melted-constructs"            : E,
        "arca/newline-after-import-section" : E,

        "space-in-parens" : [E, `never`],
        "indent"          : [E, 4, {
            SwitchCase               : 1,
            ignoredNodes             : [`JSXElement *`],
            flatTernaryExpressions   : true,
            offsetTernaryExpressions : true,
        }],
    },
};