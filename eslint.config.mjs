import nextConfig from "eslint-config-next/core-web-vitals";
import tsConfig from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = [
  ...nextConfig,
  ...tsConfig,
  prettierConfig,
  {
    rules: {
      // Add any custom rules here
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
