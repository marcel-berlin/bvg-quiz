import astro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  // Astro plugin's recommended flat config — sets up the .astro parser
  ...astro.configs["flat/recommended"],

  // a11y rules applied to .astro files
  {
    files: ["**/*.astro"],
    plugins: { "jsx-a11y": jsxA11y },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/label-has-associated-control": "error",
    },
  },

  // Don't lint build output or node_modules
  {
    ignores: ["dist/", ".astro/", "node_modules/", "playwright-report/", "test-results/"],
  },
];
