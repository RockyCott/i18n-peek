/**
 * Normalizes the given text by removing special characters and optionally converting it to upper or lower case.
 * @param text - The text to be normalized.
 * @param deleteSpecialChars - Whether to delete special characters from the text. Default is false.
 * @param format - The format to convert the text to. Can be 'upper' or 'lower'. Default is 'lower'.
 * @returns The normalized text.
 */
export function normalizeText(
  text = "",
  deleteSpecialChars = false,
  format: "upper" | "lower" = "lower"
): string {
  if (!text) {
    return text;
  }
  let transformedText = text?.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (deleteSpecialChars) {
    transformedText = transformedText?.replace(/[^a-zA-Z0-9]/g, "");
  }
  return format === "upper"
    ? transformedText?.toUpperCase()
    : transformedText?.toLowerCase();
}
