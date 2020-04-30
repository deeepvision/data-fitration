"use strict";

module.exports = {
  root: true,
  extends: ['@deepvision', '@deepvision/eslint-config/plugins/typescript'],
  rules: {
    '@typescript-eslint/no-type-alias': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/explicit-function-return-type': ['error', {
      allowExpressions: true
    }]
    /* [UGC rules] */

    /* [/UGC] */

  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  }
};