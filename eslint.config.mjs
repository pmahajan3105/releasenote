import nextCoreVitals from "eslint-config-next/core-web-vitals";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const eslintConfig = [
  ...nextCoreVitals,
  {
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      // Enforce strict rules – all violations are treated as errors
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "react/no-unescaped-entities": "error",
      "@next/next/no-img-element": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/static-components": "off",
      "prefer-const": "error",
    },
  },
];

export default eslintConfig;
