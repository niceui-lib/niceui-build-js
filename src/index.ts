import _ from "lodash";
import { basename, dirname, join } from "path";
import { writeFileSync } from "fs";

/**
 * Creates Rust struct and const for provided css module.
 *
 * Use it as getJSON method in postcss-modules plugin.
 * ```js
 * require("postcss-modules")({
 *   getJSON: require('niceui-build').postCssPluginJsonToRustStruct,
 * })
 * ```
 */
export function postCssPluginJsonToRustStruct(
  cssFilename: string,
  json: Map<string, string>,
  outputFilename: string
): void {
  if (outputFilename === undefined) {
    throw Error("Please supply outputFilename");
  }
  let cssName = basename(cssFilename, ".css");
  let generatedFilename = join(dirname(outputFilename), cssName + ".rs");
  writeFileSync(generatedFilename, jsonToRustStructAndConst(cssName, json));
}

/**
 * Creates Rust struct and const for provided field mapping.
 *
 * @param name Struct name, would be PascalCase for struct and UPPERCASE_DEFAULT for const.
 * @param json Map of field -> value entries, each field would be converted to snake_case.
 */
export function jsonToRustStructAndConst(
  name: string,
  json: Map<string, string>
): string {
  let structName = _.upperFirst(_.camelCase(name));
  let struct = _.mapKeys(json, (_value: string, key: string) =>
    _.snakeCase(key)
  );
  return `#[derive(Clone, Debug, Hash, PartialEq)]
pub(crate) struct ${structName} {
${_.map(struct, (_value, key) => `    pub(crate) ${key}: &'static str,`).join("\n")}
}

pub(crate) const ${_.toUpper(
    _.snakeCase(structName)
  )}_DEFAULT: ${structName} = ${structName} {
${_.map(struct, (value, key) => `    ${key}: "${value}",`).join("\n")}
};
`;
}
