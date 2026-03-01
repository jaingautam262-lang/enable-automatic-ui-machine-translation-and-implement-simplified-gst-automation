import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { enTranslations } from './en';
import { esTranslations } from './es-ES';
import { hiTranslations } from './hi-IN';
import { taTranslations } from './ta-IN';
import { teTranslations } from './te-IN';
import { bnTranslations } from './bn-IN';
import { mrTranslations } from './mr-IN';
import { guTranslations } from './gu-IN';
import { knTranslations } from './kn-IN';
import { mlTranslations } from './ml-IN';
import { paTranslations } from './pa-IN';
import { frTranslations } from './fr-FR';
import { deTranslations } from './de-DE';
import { zhTranslations } from './zh-CN';
import { orTranslations } from './or-IN';
import { asTranslations } from './as-IN';
import { urTranslations } from './ur-IN';
import { saTranslations } from './sa-IN';
import { ksTranslations } from './ks-IN';
import { sdTranslations } from './sd-IN';
import { neTranslations } from './ne-IN';
import { kokTranslations } from './kok-IN';
import { mniTranslations } from './mni-IN';
import { satTranslations } from './sat-IN';
import { doiTranslations } from './doi-IN';
import { maiTranslations } from './mai-IN';
import { zhTWTranslations } from './zh-TW';
import { jaTranslations } from './ja-JP';
import { koTranslations } from './ko-KR';
import { ptPTTranslations } from './pt-PT';
import { ptBRTranslations } from './pt-BR';
import { ruTranslations } from './ru-RU';
import { arTranslations } from './ar-SA';
import { itTranslations } from './it-IT';
import { nlTranslations } from './nl-NL';
import { plTranslations } from './pl-PL';
import { trTranslations } from './tr-TR';
import { viTranslations } from './vi-VN';
import { thTranslations } from './th-TH';
import { idTranslations } from './id-ID';
import { msTranslations } from './ms-MY';
import { filTranslations } from './fil-PH';
import { swTranslations } from './sw-KE';
import { heTranslations } from './he-IL';
import { faTranslations } from './fa-IR';
import { ukTranslations } from './uk-UA';
import { roTranslations } from './ro-RO';
import { csTranslations } from './cs-CZ';
import { elTranslations } from './el-GR';
import { svTranslations } from './sv-SE';
import { daTranslations } from './da-DK';
import { fiTranslations } from './fi-FI';
import { noTranslations } from './no-NO';
import { huTranslations } from './hu-HU';
import { skTranslations } from './sk-SK';
import { bgTranslations } from './bg-BG';
import { hrTranslations } from './hr-HR';
import { srTranslations } from './sr-RS';
import { ltTranslations } from './lt-LT';
import { lvTranslations } from './lv-LV';
import { etTranslations } from './et-EE';
import { slTranslations } from './sl-SI';
import { afTranslations } from './af-ZA';
import { amTranslations } from './am-ET';
import { azTranslations } from './az-AZ';
import { euTranslations } from './eu-ES';
import { beTranslations } from './be-BY';
import { caTranslations } from './ca-ES';
import { glTranslations } from './gl-ES';
import { kaTranslations } from './ka-GE';
import { isTranslations } from './is-IS';
import { kmTranslations } from './km-KH';
import { loTranslations } from './lo-LA';
import { mkTranslations } from './mk-MK';
import { mnTranslations } from './mn-MN';
import { myTranslations } from './my-MM';
import { siTranslations } from './si-LK';
import { zuTranslations } from './zu-ZA';
import { useAppLanguagePreference } from '../hooks/useAppLanguagePreference';
import { translateText } from './googleTranslate';
import { translationCache } from './translationCache';
import { usePersistedTranslationsBootstrap } from './usePersistedTranslationsBootstrap';
import { persistTranslation } from './persistedTranslations';
import { useActor } from '../hooks/useActor';

interface I18nContextType {
  language: string;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Dictionary map for all supported languages
const dictionaries: Record<string, any> = {
  'en-US': enTranslations,
  'es-ES': esTranslations,
  'hi-IN': hiTranslations,
  'ta-IN': taTranslations,
  'te-IN': teTranslations,
  'bn-IN': bnTranslations,
  'mr-IN': mrTranslations,
  'gu-IN': guTranslations,
  'kn-IN': knTranslations,
  'ml-IN': mlTranslations,
  'pa-IN': paTranslations,
  'or-IN': orTranslations,
  'as-IN': asTranslations,
  'ur-IN': urTranslations,
  'sa-IN': saTranslations,
  'ks-IN': ksTranslations,
  'sd-IN': sdTranslations,
  'ne-IN': neTranslations,
  'kok-IN': kokTranslations,
  'mni-IN': mniTranslations,
  'sat-IN': satTranslations,
  'doi-IN': doiTranslations,
  'mai-IN': maiTranslations,
  'fr-FR': frTranslations,
  'de-DE': deTranslations,
  'zh-CN': zhTranslations,
  'zh-TW': zhTWTranslations,
  'ja-JP': jaTranslations,
  'ko-KR': koTranslations,
  'pt-PT': ptPTTranslations,
  'pt-BR': ptBRTranslations,
  'ru-RU': ruTranslations,
  'ar-SA': arTranslations,
  'it-IT': itTranslations,
  'nl-NL': nlTranslations,
  'pl-PL': plTranslations,
  'tr-TR': trTranslations,
  'vi-VN': viTranslations,
  'th-TH': thTranslations,
  'id-ID': idTranslations,
  'ms-MY': msTranslations,
  'fil-PH': filTranslations,
  'sw-KE': swTranslations,
  'he-IL': heTranslations,
  'fa-IR': faTranslations,
  'uk-UA': ukTranslations,
  'ro-RO': roTranslations,
  'cs-CZ': csTranslations,
  'el-GR': elTranslations,
  'sv-SE': svTranslations,
  'da-DK': daTranslations,
  'fi-FI': fiTranslations,
  'no-NO': noTranslations,
  'hu-HU': huTranslations,
  'sk-SK': skTranslations,
  'bg-BG': bgTranslations,
  'hr-HR': hrTranslations,
  'sr-RS': srTranslations,
  'lt-LT': ltTranslations,
  'lv-LV': lvTranslations,
  'et-EE': etTranslations,
  'sl-SI': slTranslations,
  'af-ZA': afTranslations,
  'am-ET': amTranslations,
  'az-AZ': azTranslations,
  'eu-ES': euTranslations,
  'be-BY': beTranslations,
  'ca-ES': caTranslations,
  'gl-ES': glTranslations,
  'ka-GE': kaTranslations,
  'is-IS': isTranslations,
  'km-KH': kmTranslations,
  'lo-LA': loTranslations,
  'mk-MK': mkTranslations,
  'mn-MN': mnTranslations,
  'my-MM': myTranslations,
  'si-LK': siTranslations,
  'zu-ZA': zuTranslations,
};

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { language } = useAppLanguagePreference();
  const { actor } = useActor();
  const { isReady, persistedTranslations } = usePersistedTranslationsBootstrap();
  const [translationState, setTranslationState] = useState<Record<string, string>>({});

  const t = (key: string): string => {
    // Skip translation for English
    if (language === 'en-US') {
      const englishTranslation = getNestedValue(enTranslations, key);
      if (englishTranslation) {
        return englishTranslation;
      }
      const parts = key.split('.');
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
      const parts = key.split('.');
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
          sourceLanguage: 'en',
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
          persistTranslation(actor, key, language, translatedText, englishText).catch((error) => {
            console.warn('Failed to persist translation to backend:', error);
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
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
