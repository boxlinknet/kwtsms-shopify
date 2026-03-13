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

export function normalize(phone: string, defaultCountryCode?: string): PhoneResult {
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

  // Prepend default country code if number looks local (8 digits or fewer)
  // Kuwait local numbers are 8 digits, Saudi 9, UAE 9, etc.
  if (defaultCountryCode && normalized.length <= 9 && !normalized.startsWith(defaultCountryCode)) {
    normalized = defaultCountryCode + normalized;
  }

  if (normalized.length < 7) {
    return { valid: false, normalized, error: "Phone number too short (minimum 7 digits)" };
  }

  if (normalized.length > 15) {
    return { valid: false, normalized, error: "Phone number too long (maximum 15 digits)" };
  }

  return { valid: true, normalized };
}

export const COUNTRY_NAMES: Record<string, string> = {
  // Middle East & North Africa
  "965": "Kuwait",
  "966": "Saudi Arabia",
  "971": "UAE",
  "973": "Bahrain",
  "974": "Qatar",
  "968": "Oman",
  "962": "Jordan",
  "961": "Lebanon",
  "970": "Palestine",
  "964": "Iraq",
  "963": "Syria",
  "967": "Yemen",
  "98": "Iran",
  "90": "Turkey",
  "972": "Israel",
  "20": "Egypt",
  "218": "Libya",
  "216": "Tunisia",
  "212": "Morocco",
  "213": "Algeria",
  "249": "Sudan",
  "211": "South Sudan",
  // Africa
  "27": "South Africa",
  "234": "Nigeria",
  "254": "Kenya",
  "233": "Ghana",
  "251": "Ethiopia",
  "255": "Tanzania",
  "256": "Uganda",
  "237": "Cameroon",
  "225": "Ivory Coast",
  "221": "Senegal",
  "258": "Mozambique",
  "260": "Zambia",
  "263": "Zimbabwe",
  "250": "Rwanda",
  "243": "DR Congo",
  "242": "Congo",
  "226": "Burkina Faso",
  "223": "Mali",
  "227": "Niger",
  "235": "Chad",
  "261": "Madagascar",
  "244": "Angola",
  "252": "Somalia",
  "253": "Djibouti",
  "291": "Eritrea",
  "222": "Mauritania",
  "220": "Gambia",
  "224": "Guinea",
  "232": "Sierra Leone",
  "231": "Liberia",
  "228": "Togo",
  "229": "Benin",
  "230": "Mauritius",
  "236": "Central African Republic",
  "238": "Cape Verde",
  "239": "Sao Tome and Principe",
  "240": "Equatorial Guinea",
  "241": "Gabon",
  "245": "Guinea-Bissau",
  "246": "Diego Garcia",
  "247": "Ascension Island",
  "248": "Seychelles",
  "257": "Burundi",
  "262": "Reunion",
  "264": "Namibia",
  "265": "Malawi",
  "266": "Lesotho",
  "267": "Botswana",
  "268": "Eswatini",
  "269": "Comoros",
  // Europe
  "44": "UK",
  "33": "France",
  "49": "Germany",
  "39": "Italy",
  "34": "Spain",
  "31": "Netherlands",
  "32": "Belgium",
  "41": "Switzerland",
  "43": "Austria",
  "46": "Sweden",
  "47": "Norway",
  "45": "Denmark",
  "358": "Finland",
  "353": "Ireland",
  "351": "Portugal",
  "48": "Poland",
  "420": "Czech Republic",
  "421": "Slovakia",
  "36": "Hungary",
  "40": "Romania",
  "359": "Bulgaria",
  "30": "Greece",
  "385": "Croatia",
  "386": "Slovenia",
  "381": "Serbia",
  "387": "Bosnia and Herzegovina",
  "389": "North Macedonia",
  "382": "Montenegro",
  "355": "Albania",
  "383": "Kosovo",
  "370": "Lithuania",
  "371": "Latvia",
  "372": "Estonia",
  "380": "Ukraine",
  "375": "Belarus",
  "373": "Moldova",
  "7": "Russia/Kazakhstan",
  "354": "Iceland",
  "352": "Luxembourg",
  "356": "Malta",
  "357": "Cyprus",
  "350": "Gibraltar",
  "376": "Andorra",
  "377": "Monaco",
  "378": "San Marino",
  "379": "Vatican City",
  "423": "Liechtenstein",
  // Americas
  "1": "USA/Canada",
  "52": "Mexico",
  "55": "Brazil",
  "54": "Argentina",
  "57": "Colombia",
  "56": "Chile",
  "58": "Venezuela",
  "51": "Peru",
  "593": "Ecuador",
  "591": "Bolivia",
  "595": "Paraguay",
  "598": "Uruguay",
  "53": "Cuba",
  "506": "Costa Rica",
  "507": "Panama",
  "502": "Guatemala",
  "503": "El Salvador",
  "504": "Honduras",
  "505": "Nicaragua",
  "509": "Haiti",
  "592": "Guyana",
  "597": "Suriname",
  "501": "Belize",
  "599": "Curacao",
  // Caribbean
  "876": "Jamaica",
  "868": "Trinidad and Tobago",
  // Asia
  "91": "India",
  "92": "Pakistan",
  "93": "Afghanistan",
  "86": "China",
  "81": "Japan",
  "82": "South Korea",
  "850": "North Korea",
  "852": "Hong Kong",
  "853": "Macau",
  "886": "Taiwan",
  "65": "Singapore",
  "60": "Malaysia",
  "62": "Indonesia",
  "63": "Philippines",
  "66": "Thailand",
  "84": "Vietnam",
  "855": "Cambodia",
  "856": "Laos",
  "95": "Myanmar",
  "977": "Nepal",
  "880": "Bangladesh",
  "94": "Sri Lanka",
  "960": "Maldives",
  "975": "Bhutan",
  "976": "Mongolia",
  "992": "Tajikistan",
  "993": "Turkmenistan",
  "994": "Azerbaijan",
  "995": "Georgia",
  "996": "Kyrgyzstan",
  "998": "Uzbekistan",
  "374": "Armenia",
  // Oceania
  "61": "Australia",
  "64": "New Zealand",
  "679": "Fiji",
  "675": "Papua New Guinea",
  "676": "Tonga",
  "685": "Samoa",
  "678": "Vanuatu",
  "677": "Solomon Islands",
  "686": "Kiribati",
  "674": "Nauru",
  "688": "Tuvalu",
  "691": "Micronesia",
  "692": "Marshall Islands",
  "680": "Palau",
};

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return "****";
  const prefix = phone.slice(0, 4);
  const suffix = phone.slice(-3);
  const masked = "*".repeat(phone.length - 7);
  return `${prefix}${masked}${suffix}`;
}
