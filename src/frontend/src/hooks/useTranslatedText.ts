import { useEffect, useState } from "react";
import { translateText } from "../i18n/googleTranslate";
import { persistTranslation } from "../i18n/persistedTranslations";
import { translationCache } from "../i18n/translationCache";
import { useActor } from "./useActor";
import { useAppLanguagePreference } from "./useAppLanguagePreference";

/**
 * Hook to translate dynamic (non-keyed) text using machine translation
 * with caching and async loading
 */
export function useTranslatedText(
  sourceText: string,
  sourceLanguage = "en",
): string {
  const { language } = useAppLanguagePreference();
  const { actor } = useActor();
  const [translatedText, setTranslatedText] = useState<string>(sourceText);

  useEffect(() => {
    // Skip translation for same language
    if (language === sourceLanguage || language === "en-US") {
      setTranslatedText(sourceText);
      return;
    }

    // Use cache with in-flight de-duplication
    translationCache
      .getOrFetch(language, sourceText, async () => {
        const response = await translateText({
          sourceText,
          targetLanguage: language,
          sourceLanguage,
        });
        return response.translatedText;
      })
      .then((translated) => {
        setTranslatedText(translated);

        // Persist to backend if actor is available
        if (actor) {
          const key = `dynamic:${sourceText}`;
          persistTranslation(
            actor,
            key,
            language,
            translated,
            sourceText,
          ).catch((error) => {
            console.warn(
              "Failed to persist dynamic translation to backend:",
              error,
            );
          });
        }
      })
      .catch((error) => {
        console.warn("Translation failed:", error);
        setTranslatedText(sourceText);
      });
  }, [sourceText, language, sourceLanguage, actor]);

  return translatedText;
}

/**
 * Hook to translate multiple texts at once
 */
export function useTranslatedTexts(
  texts: string[],
  sourceLanguage = "en",
): Record<string, string> {
  const { language } = useAppLanguagePreference();
  const { actor } = useActor();
  const [translations, setTranslations] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      for (const text of texts) {
        initial[text] = text;
      }
      return initial;
    },
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: texts.join is a stable serialization
  useEffect(() => {
    // Skip translation for same language
    if (language === sourceLanguage || language === "en-US") {
      const sameLanguage: Record<string, string> = {};
      for (const text of texts) {
        sameLanguage[text] = text;
      }
      setTranslations(sameLanguage);
      return;
    }

    // Translate all texts
    Promise.all(
      texts.map((text) =>
        translationCache
          .getOrFetch(language, text, async () => {
            const response = await translateText({
              sourceText: text,
              targetLanguage: language,
              sourceLanguage,
            });
            return response.translatedText;
          })
          .then((translated) => {
            // Persist to backend if actor is available
            if (actor) {
              const key = `dynamic:${text}`;
              persistTranslation(actor, key, language, translated, text).catch(
                (error) => {
                  console.warn(
                    "Failed to persist dynamic translation to backend:",
                    error,
                  );
                },
              );
            }
            return { original: text, translated };
          })
          .catch((error) => {
            console.warn("Translation failed:", error);
            return { original: text, translated: text };
          }),
      ),
    ).then((results) => {
      const newTranslations: Record<string, string> = {};
      for (const { original, translated } of results) {
        newTranslations[original] = translated;
      }
      setTranslations(newTranslations);
    });
  }, [texts.join(","), language, sourceLanguage, actor]);

  return translations;
}
