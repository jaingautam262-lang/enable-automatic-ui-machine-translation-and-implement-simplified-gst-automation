import React, {
  createContext,
  useContext,
  type ReactNode,
  useState,
  useEffect,
} from "react";
import { useActor } from "../hooks/useActor";
import { useAppLanguagePreference } from "../hooks/useAppLanguagePreference";
import { afTranslations } from "./af-ZA";
import { amTranslations } from "./am-ET";
import { arTranslations } from "./ar-SA";
import { asTranslations } from "./as-IN";
import { azTranslations } from "./az-AZ";
import { beTranslations } from "./be-BY";
import { bgTranslations } from "./bg-BG";
import { bnTranslations } from "./bn-IN";
import { caTranslations } from "./ca-ES";
import { csTranslations } from "./cs-CZ";
import { daTranslations } from "./da-DK";
import { deTranslations } from "./de-DE";
import { doiTranslations } from "./doi-IN";
import { elTranslations } from "./el-GR";
import { enTranslations } from "./en";
import { esTranslations } from "./es-ES";
import { etTranslations } from "./et-EE";
import { euTranslations } from "./eu-ES";
import { faTranslations } from "./fa-IR";
import { fiTranslations } from "./fi-FI";
import { filTranslations } from "./fil-PH";
import { frTranslations } from "./fr-FR";
import { glTranslations } from "./gl-ES";
import { translateText } from "./googleTranslate";
import { guTranslations } from "./gu-IN";
import { heTranslations } from "./he-IL";
import { hiTranslations } from "./hi-IN";
import { hrTranslations } from "./hr-HR";
import { huTranslations } from "./hu-HU";
import { idTranslations } from "./id-ID";
import { isTranslations } from "./is-IS";
import { itTranslations } from "./it-IT";
import { jaTranslations } from "./ja-JP";
import { kaTranslations } from "./ka-GE";
import { kmTranslations } from "./km-KH";
import { knTranslations } from "./kn-IN";
import { koTranslations } from "./ko-KR";
import { kokTranslations } from "./kok-IN";
import { ksTranslations } from "./ks-IN";
import { loTranslations } from "./lo-LA";
import { ltTranslations } from "./lt-LT";
import { lvTranslations } from "./lv-LV";
import { maiTranslations } from "./mai-IN";
import { mkTranslations } from "./mk-MK";
import { mlTranslations } from "./ml-IN";
import { mnTranslations } from "./mn-MN";
import { mniTranslations } from "./mni-IN";
import { mrTranslations } from "./mr-IN";
import { msTranslations } from "./ms-MY";
import { myTranslations } from "./my-MM";
import { neTranslations } from "./ne-IN";
import { nlTranslations } from "./nl-NL";
import { noTranslations } from "./no-NO";
import { orTranslations } from "./or-IN";
import { paTranslations } from "./pa-IN";
import { persistTranslation } from "./persistedTranslations";
import { plTranslations } from "./pl-PL";
import { ptBRTranslations } from "./pt-BR";
import { ptPTTranslations } from "./pt-PT";
import { roTranslations } from "./ro-RO";
import { ruTranslations } from "./ru-RU";
import { saTranslations } from "./sa-IN";
import { satTranslations } from "./sat-IN";
import { sdTranslations } from "./sd-IN";
import { siTranslations } from "./si-LK";
import { skTranslations } from "./sk-SK";
import { slTranslations } from "./sl-SI";
import { srTranslations } from "./sr-RS";
import { svTranslations } from "./sv-SE";
import { swTranslations } from "./sw-KE";
import { taTranslations } from "./ta-IN";
import { teTranslations } from "./te-IN";
import { thTranslations } from "./th-TH";
import { trTranslations } from "./tr-TR";
import { translationCache } from "./translationCache";
import { ukTranslations } from "./uk-UA";
import { urTranslations } from "./ur-IN";
import { usePersistedTranslationsBootstrap } from "./usePersistedTranslationsBootstrap";
import { viTranslations } from "./vi-VN";
import { zhTranslations } from "./zh-CN";
import { zhTWTranslations } from "./zh-TW";
import { zuTranslations } from "./zu-ZA";

interface I18nContextType {
  language: string;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Dictionary map for all supported languages
const dictionaries: Record<string, any> = {
  "en-US": enTranslations,
  "es-ES": esTranslations,
  "hi-IN": hiTranslations,
  "ta-IN": taTranslations,
  "te-IN": teTranslations,
  "bn-IN": bnTranslations,
  "mr-IN": mrTranslations,
  "gu-IN": guTranslations,
  "kn-IN": knTranslations,
  "ml-IN": mlTranslations,
  "pa-IN": paTranslations,
  "or-IN": orTranslations,
  "as-IN": asTranslations,
  "ur-IN": urTranslations,
  "sa-IN": saTranslations,
  "ks-IN": ksTranslations,
  "sd-IN": sdTranslations,
  "ne-IN": neTranslations,
  "kok-IN": kokTranslations,
  "mni-IN": mniTranslations,
  "sat-IN": satTranslations,
  "doi-IN": doiTranslations,
  "mai-IN": maiTranslations,
  "fr-FR": frTranslations,
  "de-DE": deTranslations,
  "zh-CN": zhTranslations,
  "zh-TW": zhTWTranslations,
  "ja-JP": jaTranslations,
  "ko-KR": koTranslations,
  "pt-PT": ptPTTranslations,
  "pt-BR": ptBRTranslations,
  "ru-RU": ruTranslations,
  "ar-SA": arTranslations,
  "it-IT": itTranslations,
  "nl-NL": nlTranslations,
  "pl-PL": plTranslations,
  "tr-TR": trTranslations,
  "vi-VN": viTranslations,
  "th-TH": thTranslations,
  "id-ID": idTranslations,
  "ms-MY": msTranslations,
  "fil-PH": filTranslations,
  "sw-KE": swTranslations,
  "he-IL": heTranslations,
  "fa-IR": faTranslations,
  "uk-UA": ukTranslations,
  "ro-RO": roTranslations,
  "cs-CZ": csTranslations,
  "el-GR": elTranslations,
  "sv-SE": svTranslations,
  "da-DK": daTranslations,
  "fi-FI": fiTranslations,
  "no-NO": noTranslations,
  "hu-HU": huTranslations,
  "sk-SK": skTranslations,
  "bg-BG": bgTranslations,
  "hr-HR": hrTranslations,
  "sr-RS": srTranslations,
  "lt-LT": ltTranslations,
  "lv-LV": lvTranslations,
  "et-EE": etTranslations,
  "sl-SI": slTranslations,
  "af-ZA": afTranslations,
  "am-ET": amTranslations,
  "az-AZ": azTranslations,
  "eu-ES": euTranslations,
  "be-BY": beTranslations,
  "ca-ES": caTranslations,
  "gl-ES": glTranslations,
  "ka-GE": kaTranslations,
  "is-IS": isTranslations,
  "km-KH": kmTranslations,
  "lo-LA": loTranslations,
  "mk-MK": mkTranslations,
  "mn-MN": mnTranslations,
  "my-MM": myTranslations,
  "si-LK": siTranslations,
  "zu-ZA": zuTranslations,
};

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { language } = useAppLanguagePreference();
  const { actor } = useActor();
  const { isReady, persistedTranslations } =
    usePersistedTranslationsBootstrap();
  const [translationState, setTranslationState] = useState<
    Record<string, string>
  >({});

  const t = (key: string): string => {
    // Skip translation for English
    if (language === "en-US") {
      const englishTranslation = getNestedValue(enTranslations, key);
      if (englishTranslation) {
        return englishTranslation;
      }
      const parts = key.split(".");
      return parts[parts.length - 1] || key;
    }

    // Get the dictionary for the current language
    const dictionary = dictionaries[language];

    // Try to get translation from current language dictionary
    if (dictionary) {
      const translation = getNestedValue(dictionary, key);
      if (translation) {
        return translation;
      }
    }

    // Get English source text
    const englishText = getNestedValue(enTranslations, key);
    if (!englishText) {
      // Final fallback: return readable key
      const parts = key.split(".");
      return parts[parts.length - 1] || key;
    }

    // Check persisted translations first (if bootstrap is ready)
    if (isReady && persistedTranslations.has(language)) {
      const langMap = persistedTranslations.get(language)!;
      const persisted = langMap.get(englishText);
      if (persisted) {
        return persisted;
      }
    }

    const cacheKey = `${key}:${language}:${englishText}`;

    // Check memory state
    if (translationState[cacheKey]) {
      return translationState[cacheKey];
    }

    // Use cache with in-flight de-duplication
    translationCache
      .getOrFetch(language, englishText, async () => {
        const response = await translateText({
          sourceText: englishText,
          targetLanguage: language,
          sourceLanguage: "en",
        });
        return response.translatedText;
      })
      .then((translatedText) => {
        setTranslationState((prev) => ({
          ...prev,
          [cacheKey]: translatedText,
        }));

        // Persist to backend if actor is available
        if (actor && isReady) {
          persistTranslation(
            actor,
            key,
            language,
            translatedText,
            englishText,
          ).catch((error) => {
            console.warn("Failed to persist translation to backend:", error);
          });
        }
      })
      .catch((error) => {
        console.warn(`Translation failed for key "${key}":`, error);
      });

    // Return English while translation is pending
    return englishText;
  };

  return (
    <I18nContext.Provider value={{ language, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
