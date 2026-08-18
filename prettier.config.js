/** @type {import("prettier").Config} */
export default {
  plugins: ["@ianvs/prettier-plugin-sort-imports"],

  // Import sorting options
  importOrder: [
    "", // Empty string for blank line separator
    "<BUILTIN_MODULES>", // Node.js built-ins
    "",
    "<THIRD_PARTY_MODULES>", // External packages
    "",
    "^@stax-ui/(.*)$", // Internal @stax-ui packages
    "",
    "^[./]", // Relative imports
  ],
  importOrderParserPlugins: ["typescript"],
  importOrderTypeScriptVersion: "5.9.3",
};
