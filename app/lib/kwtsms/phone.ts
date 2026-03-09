export interface PhoneResult {
  valid: boolean;
  normalized: string;
  error?: string;
}

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EXTENDED_ARABIC_INDIC = "۰۱۲۳۴۵۶۷۸۹";

function convertArabicDigits(input: string): string {
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

export function normalize(phone: string): PhoneResult {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, normalized: "", error: "Phone number is required" };
  }

  // Convert Arabic-Indic and Extended Arabic-Indic digits to Latin
  let normalized = convertArabicDigits(phone);

  // Strip all non-digit characters
  normalized = normalized.replace(/\D/g, "");

  // Strip leading zeros (handles 00 country prefix)
  normalized = normalized.replace(/^0+/, "");

  if (normalized.length === 0) {
    return { valid: false, normalized: "", error: "No digits found in phone number" };
  }

  if (normalized.length < 7) {
    return { valid: false, normalized, error: "Phone number too short (minimum 7 digits)" };
  }

  if (normalized.length > 15) {
    return { valid: false, normalized, error: "Phone number too long (maximum 15 digits)" };
  }

  return { valid: true, normalized };
}

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return "****";
  const prefix = phone.slice(0, 4);
  const suffix = phone.slice(-3);
  const masked = "*".repeat(phone.length - 7);
  return `${prefix}${masked}${suffix}`;
}
