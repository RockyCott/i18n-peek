/**
 * Flattens a JSON object by converting nested properties into dot-separated keys.
 * @param json - The JSON object to flatten.
 * @param parentKey - The parent key used for recursive calls. Defaults to an empty string.
 * @returns The flattened JSON object.
 */
export function flatten(json: any, parentKey = ""): any {
  const flattenedJson: any = {};

  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof json[key] === "object" && !Array.isArray(json[key])) {
        Object.assign(flattenedJson, flatten(json[key], newKey));
      } else {
        flattenedJson[newKey] = json[key];
      }
    }
  }

  return flattenedJson;
}

/**
 * Function to get the value from a JSON object using a path
 * @param json - JSON object
 * @param path - Path to the value
 * @returns - The value from the JSON object
 */
export function getValueFromJsonPath(json: any, path: string): any {
  return path.split(".").reduce((prev, curr) => {
    return prev ? prev[curr] : undefined;
  }, json);
}
