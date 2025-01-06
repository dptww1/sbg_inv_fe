import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: [
      "app/**/*.js"
    ],
    ignores: [
      "app/assets"
    ],
    languageOptions: {
      globals: globals.browser
    },
    rules: {
      "array-callback-return": "error",
      "consistent-return": "error",
      "for-direction": "error",
      "no-cond-assign": "error",
      "no-const-assign": "error",
      "no-constant-binary-expression": "error",
      "no-constant-condition": "error",
      "no-debugger": "error",
      "no-dupe-args": "error",
      "no-duplicate-case": "error",
      "no-empty-pattern": "error",
      "no-fallthrough": "error",
      "no-global-assign": "error",
      "no-implicit-coercion": "error",
      "no-invalid-this": "error",
      "no-irregular-whitespace": "error",
      "no-octal": "error",
      "no-octal-escape": "error",
      "no-promise-executor-return": "error",
      "no-prototype-builtins": "error",
      "no-redeclare": ["error", { "builtinGlobals": false }],
      "no-self-assign": "error",
      "no-self-compare": "error",
      "no-sequences": "error",
      "no-shadow": "error",
      "no-template-curly-in-string": "error",
      "no-undef": "error",
      "no-unexpected-multiline": "error",
      "no-unmodified-loop-condition": "error",
      "no-unreachable": "error",
      "no-unreachable-loop": "error",
      "no-unsafe-negation": "error",
      "no-unsafe-optional-chaining": "error",
      "no-unused-vars": "error",
      "no-use-before-define": ["error", { "allowNamedExports": true, "variables": false }],
      "no-useless-assignment": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "radix": "error",
      "sort-vars": "error",
      "valid-typeof": "error",
      "vars-on-top": "error",
    }
  },
  pluginJs.configs.recommended,
];
