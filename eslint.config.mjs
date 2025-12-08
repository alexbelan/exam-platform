// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt([
  {
    rules: {
      "no-console": [
        "error",
        {
          allow: ["error", "warn"],
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@entities/*/model/*",
                "@entities/*/ui/*",
                "@entities/*/style/*",
                "@features/*/model/*",
                "@features/*/ui/*",
                "@features/*/style/*",
                "@pages/*/model/*",
                "@pages/*/ui/*",
                "@shared/*/hooks/*",
                "@shared/*/ui/*",
                "@shared/*/utils/*",
              ],
              message:
                "Используйте Public API (index.ts) для импорта. Например: '@entities/questions-card' вместо '@entities/questions-card/model/types'",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "warn",
        {
          selector: "CallExpression[callee.name='Number']",
          message:
            "Avoid using Number() for type conversion. Use parseInt(), parseFloat(), or explicit type conversion instead.",
        },
        {
          selector: "CallExpression[callee.name='String']",
          message:
            "Avoid using String() for type conversion. Use .toString() or template literals instead.",
        },
        {
          selector: "TSParameterProperty > TSTypeAnnotation > TSTypeLiteral",
          message:
            "Do not use inline object types in function parameters. Extract to a separate 'type' or 'interface' definition.",
        },
        {
          selector:
            ":matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression) > Identifier[typeAnnotation.typeAnnotation.type='TSTypeLiteral']",
          message:
            "Do not use inline object types in function parameters. Extract to a separate 'type' or 'interface' definition.",
        },
      ],
    },
  },
  {
    files: ["prisma/seed.ts", "prisma/seed-interview-questions.ts"],
    rules: {
      "no-console": "off",
    },
  },
]);
