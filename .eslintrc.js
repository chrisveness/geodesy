module.exports = {
  "env": {
      "browser": true,
      "node": true,
      "mocha": true
  },
  "extends": "eslint:recommended",
  "rules": {
      "array-bracket-spacing": [ "error", "always" ],
      "comma-dangle": [ "error", "always-multiline" ],
      "curly": [ "error", "multi-line" ],
      "indent": [ "error", 4, { "SwitchCase": 1 } ],
      "key-spacing": [ "error", { "align": "value" } ],
      "no-console": "warn",
      "no-redeclare": "warn",
      "no-shadow": "warn",
      "no-unused-vars": "warn",
      "object-curly-spacing": [ "error", "always" ],
      "quotes": [ "error", "single", "avoid-escape" ],
      "semi": [ "error", "always" ],
      "strict": [ "error", "global" ]
  }
}