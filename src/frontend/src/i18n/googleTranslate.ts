// Machine translation provider implementation
// Default: MyMemory Translation API (free, no API key required)

export interface TranslateOptions {
  sourceText: string;
  targetLanguage: string;
  sourceLanguage?: string;
  provider?: "mymemory" | "libretranslate" | "google" | "azure" | "deepl";
  apiKey?: string;
  baseUrl?: string;
}

export interface TranslateResponse {
  translatedText: string;
  provider: string;
}

export interface ProviderSettings {
  provider: "mymemory" | "libretranslate" | "google" | "azure" | "deepl";
  baseUrl?: string;
  apiKey?: string;
}

// Get translation provider settings from localStorage
function getProviderSettings(): ProviderSettings {
  try {
    const settings = localStorage.getItem("translation_provider_settings");
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.warn("Failed to load translation provider settings:", error);
  }
  return { provider: "mymemory" };
}

/**
 * Translate text using configured provider
 * Default: MyMemory Translation API (free, no API key required, 5000 requests/day)
 */
export async function translateText(
  options: TranslateOptions,
): Promise<TranslateResponse> {
  const settings = getProviderSettings();
  const provider = options.provider || settings.provider || "mymemory";

  try {
    if (provider === "libretranslate") {
      return await translateWithLibreTranslate(options, settings);
    }
    if (provider === "google") {
      return await translateWithGoogle(options, settings);
    }
    if (provider === "azure") {
      return await translateWithAzure(options, settings);
    }
    if (provider === "deepl") {
      return await translateWithDeepL(options, settings);
    }
    return await translateWithMyMemory(options);
  } catch (error) {
    console.error("Translation failed:", error);
    // Fallback to MyMemory if configured provider fails
    if (provider !== "mymemory") {
      try {
        return await translateWithMyMemory(options);
      } catch (fallbackError) {
        console.error("Fallback translation also failed:", fallbackError);
        throw fallbackError;
      }
    }
    throw error;
  }
}

/**
 * Translate using MyMemory API (default, free, no API key)
 * https://mymemory.translated.net/doc/spec.php
 */
async function translateWithMyMemory(
  options: TranslateOptions,
): Promise<TranslateResponse> {
  const { sourceText, targetLanguage, sourceLanguage = "en" } = options;

  // Convert language codes to MyMemory format (e.g., 'en-US' -> 'en')
  const sourceLang = sourceLanguage.split("-")[0];
  const targetLang = targetLanguage.split("-")[0];

  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.append("q", sourceText);
  url.searchParams.append("langpair", `${sourceLang}|${targetLang}`);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`MyMemory API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.responseStatus !== 200) {
    throw new Error(
      `MyMemory translation failed: ${data.responseDetails || "Unknown error"}`,
    );
  }

  return {
    translatedText: data.responseData.translatedText,
    provider: "mymemory",
  };
}

/**
 * Translate using LibreTranslate API (requires self-hosted instance or API key)
 * https://libretranslate.com/docs/
 */
async function translateWithLibreTranslate(
  options: TranslateOptions,
  settings: ProviderSettings,
): Promise<TranslateResponse> {
  const { sourceText, targetLanguage, sourceLanguage = "en" } = options;
  const baseUrl =
    options.baseUrl || settings.baseUrl || "https://libretranslate.com";

  // Convert language codes to LibreTranslate format (e.g., 'en-US' -> 'en')
  const sourceLang = sourceLanguage.split("-")[0];
  const targetLang = targetLanguage.split("-")[0];

  const body: any = {
    q: sourceText,
    source: sourceLang,
    target: targetLang,
    format: "text",
  };

  if (options.apiKey || settings.apiKey) {
    body.api_key = options.apiKey || settings.apiKey;
  }

  const response = await fetch(`${baseUrl}/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`LibreTranslate API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.translatedText) {
    throw new Error("LibreTranslate returned no translation");
  }

  return {
    translatedText: data.translatedText,
    provider: "libretranslate",
  };
}

/**
 * Translate using Google Translate API (requires API key)
 * Placeholder implementation - requires valid API key
 */
async function translateWithGoogle(
  options: TranslateOptions,
  settings: ProviderSettings,
): Promise<TranslateResponse> {
  const apiKey = options.apiKey || settings.apiKey;

  if (!apiKey || apiKey === "YOUR_GOOGLE_TRANSLATE_API_KEY") {
    throw new Error("Google Translate API key not configured");
  }

  const { sourceText, targetLanguage, sourceLanguage = "en" } = options;
  const targetLang = targetLanguage.split("-")[0];

  const url = new URL(
    "https://translation.googleapis.com/language/translate/v2",
  );
  url.searchParams.append("key", apiKey);
  url.searchParams.append("q", sourceText);
  url.searchParams.append("target", targetLang);
  url.searchParams.append("source", sourceLanguage.split("-")[0]);

  const response = await fetch(url.toString(), { method: "POST" });

  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.data?.translations?.[0]?.translatedText) {
    throw new Error("Google Translate returned no translation");
  }

  return {
    translatedText: data.data.translations[0].translatedText,
    provider: "google",
  };
}

/**
 * Translate using Azure Translator API (requires API key)
 * Placeholder implementation - requires valid API key
 */
async function translateWithAzure(
  options: TranslateOptions,
  settings: ProviderSettings,
): Promise<TranslateResponse> {
  const apiKey = options.apiKey || settings.apiKey;

  if (!apiKey || apiKey === "YOUR_AZURE_TRANSLATE_API_KEY") {
    throw new Error("Azure Translator API key not configured");
  }

  const { sourceText, targetLanguage, sourceLanguage = "en" } = options;
  const targetLang = targetLanguage.split("-")[0];
  const sourceLang = sourceLanguage.split("-")[0];

  const endpoint =
    settings.baseUrl || "https://api.cognitive.microsofttranslator.com";
  const url = `${endpoint}/translate?api-version=3.0&from=${sourceLang}&to=${targetLang}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{ text: sourceText }]),
  });

  if (!response.ok) {
    throw new Error(`Azure Translator API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data[0]?.translations?.[0]?.text) {
    throw new Error("Azure Translator returned no translation");
  }

  return {
    translatedText: data[0].translations[0].text,
    provider: "azure",
  };
}

/**
 * Translate using DeepL API (requires API key)
 * Placeholder implementation - requires valid API key
 */
async function translateWithDeepL(
  options: TranslateOptions,
  settings: ProviderSettings,
): Promise<TranslateResponse> {
  const apiKey = options.apiKey || settings.apiKey;

  if (!apiKey || apiKey === "YOUR_DEEPL_API_KEY") {
    throw new Error("DeepL API key not configured");
  }

  const { sourceText, targetLanguage, sourceLanguage = "en" } = options;
  const targetLang = targetLanguage.split("-")[0].toUpperCase();
  const sourceLang = sourceLanguage.split("-")[0].toUpperCase();

  const endpoint =
    settings.baseUrl || "https://api-free.deepl.com/v2/translate";

  const body = new URLSearchParams();
  body.append("auth_key", apiKey);
  body.append("text", sourceText);
  body.append("target_lang", targetLang);
  body.append("source_lang", sourceLang);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`DeepL API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.translations?.[0]?.text) {
    throw new Error("DeepL returned no translation");
  }

  return {
    translatedText: data.translations[0].text,
    provider: "deepl",
  };
}

/**
 * Save translation provider settings
 */
export function saveProviderSettings(settings: ProviderSettings): void {
  try {
    localStorage.setItem(
      "translation_provider_settings",
      JSON.stringify(settings),
    );
  } catch (error) {
    console.error("Failed to save translation provider settings:", error);
    throw error;
  }
}

/**
 * Get current provider settings
 */
export function getProviderSettingsPublic(): ProviderSettings {
  return getProviderSettings();
}
