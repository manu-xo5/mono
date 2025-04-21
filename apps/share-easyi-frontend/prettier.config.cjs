/** 
 * @type { import("prettier").Config }
 */
const config = {
  experimentalTernaries: true,
  experimentalOperatorPosition: "start",
  arrowParens: "always",
  semi: true,
  printWidth: 200,
  bracketSpacing: true,
  endOfLine: "lf",
  quoteProps: "as-needed",
  singleAttributePerLine: true,
  singleQuote: false,
  trailingComma: "none",
};

module.exports = config;
