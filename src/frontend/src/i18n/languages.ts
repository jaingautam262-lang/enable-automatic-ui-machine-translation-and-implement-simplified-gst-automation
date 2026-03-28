// Comprehensive language list for multilingual support
// Includes all Indian languages and major world languages

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  // English
  { code: "en-US", name: "English", nativeName: "English" },

  // Indian Languages
  { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn-IN", name: "Bengali", nativeName: "বাংলা" },
  { code: "te-IN", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr-IN", name: "Marathi", nativeName: "मराठी" },
  { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்" },
  { code: "gu-IN", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn-IN", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml-IN", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa-IN", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "or-IN", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "as-IN", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "ur-IN", name: "Urdu", nativeName: "اردو" },
  { code: "sa-IN", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { code: "ks-IN", name: "Kashmiri", nativeName: "कॉशुर" },
  { code: "sd-IN", name: "Sindhi", nativeName: "سنڌي" },
  { code: "ne-IN", name: "Nepali", nativeName: "नेपाली" },
  { code: "kok-IN", name: "Konkani", nativeName: "कोंकणी" },
  { code: "mni-IN", name: "Manipuri", nativeName: "মৈতৈলোন্" },
  { code: "sat-IN", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "doi-IN", name: "Dogri", nativeName: "डोगरी" },
  { code: "mai-IN", name: "Maithili", nativeName: "मैथिली" },

  // Major World Languages
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "es-ES", name: "Spanish", nativeName: "Español" },
  { code: "fr-FR", name: "French", nativeName: "Français" },
  { code: "de-DE", name: "German", nativeName: "Deutsch" },
  { code: "ja-JP", name: "Japanese", nativeName: "日本語" },
  { code: "ko-KR", name: "Korean", nativeName: "한국어" },
  { code: "pt-PT", name: "Portuguese", nativeName: "Português" },
  {
    code: "pt-BR",
    name: "Portuguese (Brazil)",
    nativeName: "Português (Brasil)",
  },
  { code: "ru-RU", name: "Russian", nativeName: "Русский" },
  { code: "ar-SA", name: "Arabic", nativeName: "العربية" },
  { code: "it-IT", name: "Italian", nativeName: "Italiano" },
  { code: "nl-NL", name: "Dutch", nativeName: "Nederlands" },
  { code: "pl-PL", name: "Polish", nativeName: "Polski" },
  { code: "tr-TR", name: "Turkish", nativeName: "Türkçe" },
  { code: "vi-VN", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "th-TH", name: "Thai", nativeName: "ไทย" },
  { code: "id-ID", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ms-MY", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "fil-PH", name: "Filipino", nativeName: "Filipino" },
  { code: "sw-KE", name: "Swahili", nativeName: "Kiswahili" },
  { code: "he-IL", name: "Hebrew", nativeName: "עברית" },
  { code: "fa-IR", name: "Persian", nativeName: "فارسی" },
  { code: "uk-UA", name: "Ukrainian", nativeName: "Українська" },
  { code: "ro-RO", name: "Romanian", nativeName: "Română" },
  { code: "cs-CZ", name: "Czech", nativeName: "Čeština" },
  { code: "el-GR", name: "Greek", nativeName: "Ελληνικά" },
  { code: "sv-SE", name: "Swedish", nativeName: "Svenska" },
  { code: "da-DK", name: "Danish", nativeName: "Dansk" },
  { code: "fi-FI", name: "Finnish", nativeName: "Suomi" },
  { code: "no-NO", name: "Norwegian", nativeName: "Norsk" },
  { code: "hu-HU", name: "Hungarian", nativeName: "Magyar" },
  { code: "sk-SK", name: "Slovak", nativeName: "Slovenčina" },
  { code: "bg-BG", name: "Bulgarian", nativeName: "Български" },
  { code: "hr-HR", name: "Croatian", nativeName: "Hrvatski" },
  { code: "sr-RS", name: "Serbian", nativeName: "Српски" },
  { code: "lt-LT", name: "Lithuanian", nativeName: "Lietuvių" },
  { code: "lv-LV", name: "Latvian", nativeName: "Latviešu" },
  { code: "et-EE", name: "Estonian", nativeName: "Eesti" },
  { code: "sl-SI", name: "Slovenian", nativeName: "Slovenščina" },
  { code: "af-ZA", name: "Afrikaans", nativeName: "Afrikaans" },
  { code: "am-ET", name: "Amharic", nativeName: "አማርኛ" },
  { code: "az-AZ", name: "Azerbaijani", nativeName: "Azərbaycan" },
  { code: "eu-ES", name: "Basque", nativeName: "Euskara" },
  { code: "be-BY", name: "Belarusian", nativeName: "Беларуская" },
  { code: "ca-ES", name: "Catalan", nativeName: "Català" },
  { code: "gl-ES", name: "Galician", nativeName: "Galego" },
  { code: "ka-GE", name: "Georgian", nativeName: "ქართული" },
  { code: "is-IS", name: "Icelandic", nativeName: "Íslenska" },
  { code: "km-KH", name: "Khmer", nativeName: "ខ្មែរ" },
  { code: "lo-LA", name: "Lao", nativeName: "ລາວ" },
  { code: "mk-MK", name: "Macedonian", nativeName: "Македонски" },
  { code: "mn-MN", name: "Mongolian", nativeName: "Монгол" },
  { code: "my-MM", name: "Burmese", nativeName: "မြန်မာ" },
  { code: "si-LK", name: "Sinhala", nativeName: "සිංහල" },
  { code: "zu-ZA", name: "Zulu", nativeName: "isiZulu" },
];

/**
 * Get language by code
 */
export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}

/**
 * Check if a language code is supported
 */
export function isLanguageSupported(code: string): boolean {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}
