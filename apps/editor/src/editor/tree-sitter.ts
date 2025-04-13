import { Language, Parser } from "web-tree-sitter";

async function initParser() {
  await Parser.init({
    locateFile: (scriptName: string) => scriptName,
  });
  const parser = new Parser();
  const JavaScript = await Language.load("/tree-sitter-javascript.wasm");
  parser.setLanguage(JavaScript);

  return {
    parser,
    JavaScript,
  };
}

const parser = initParser();

export { parser };
