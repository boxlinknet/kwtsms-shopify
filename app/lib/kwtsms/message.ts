const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EXTENDED_ARABIC_INDIC = "۰۱۲۳۴۵۶۷۸۹";

function convertArabicNumerals(input: string): string {
  let result = "";
  for (const char of input) {
    const arabicIdx = ARABIC_INDIC.indexOf(char);
    if (arabicIdx !== -1) {
      result += arabicIdx.toString();
      continue;
    }
    const extIdx = EXTENDED_ARABIC_INDIC.indexOf(char);
    if (extIdx !== -1) {
      result += extIdx.toString();
      continue;
    }
    result += char;
  }
  return result;
}

/* eslint-disable no-misleading-character-class */
function stripEmojis(text: string): string {
  return text.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu,
    "",
  );
}

function stripControlChars(text: string): string {
  return text.replace(
    /[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD\u2060\u2061\u2062\u2063\u2064\u206A-\u206F]/g,
    "",
  );
}
/* eslint-enable no-misleading-character-class */

function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

export function cleanMessage(text: string): string {
  let cleaned = text;
  cleaned = convertArabicNumerals(cleaned);
  cleaned = stripEmojis(cleaned);
  cleaned = stripControlChars(cleaned);
  cleaned = stripHtmlTags(cleaned);
  cleaned = cleaned.trim();
  return cleaned;
}

export interface PageCount {
  pages: number;
  chars: number;
  isUnicode: boolean;
}

export function countPages(text: string): PageCount {
  const chars = text.length;

  // If any character is above ASCII 127, treat as Unicode (Arabic)
  // eslint-disable-next-line no-control-regex
  const isUnicode = /[^\x00-\x7F]/.test(text);

  if (chars === 0) {
    return { pages: 0, chars: 0, isUnicode };
  }

  if (isUnicode) {
    // Unicode: 70 chars first page, 67 chars subsequent
    if (chars <= 70) return { pages: 1, chars, isUnicode };
    return { pages: Math.ceil(chars / 67), chars, isUnicode };
  }

  // GSM-7: 160 chars first page, 153 chars subsequent
  if (chars <= 160) return { pages: 1, chars, isUnicode };
  return { pages: Math.ceil(chars / 153), chars, isUnicode };
}
