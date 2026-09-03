const CV_TEXT_LIMIT = 8_000;

const LIGATURES: Record<string, string> = {
  "\uFB00": "ff",
  "\uFB01": "fi",
  "\uFB02": "fl",
  "\uFB03": "ffi",
  "\uFB04": "ffl",
  "\u00A0": " ",
  "\u2028": "\n",
  "\u2029": "\n",
};

/** Normalize PDF / Word extraction artefacts so Gemini sees clean HR text. */
export function sanitizeCvText(raw: string, limit = CV_TEXT_LIMIT) {
  let text = raw.normalize("NFC");
  for (const [from, to] of Object.entries(LIGATURES)) {
    text = text.replaceAll(from, to);
  }
  return text
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, "")
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[–—−]/g, "-")
    .replace(/[•‣∙]/g, "-")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]{2,}/g, " ")
    .replace(/(\w)-\n(\w)/g, "$1$2")
    .replace(/([^\s\n])-\n([^\s\n])/g, "$1$2")
    .trim()
    .slice(0, limit);
}
