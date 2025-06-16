const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      // Add more rules as needed
    },
    ignorePatterns: ["src/generated/**/**", "node_modules/**"]
  }),
];