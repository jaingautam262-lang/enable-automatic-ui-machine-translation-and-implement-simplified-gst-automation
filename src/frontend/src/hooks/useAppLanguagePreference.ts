import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES } from "../i18n/languages";
import { useInternetIdentity } from "./useInternetIdentity";

const STORAGE_KEY = "appLanguage";
const DEFAULT_LANGUAGE = "en-US";

export { SUPPORTED_LANGUAGES };

export function useAppLanguagePreference() {
  const { identity } = useInternetIdentity();
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize language from localStorage
  // biome-ignore lint/correctness/useExhaustiveDependencies: identity used to scope storage key
  useEffect(() => {
    const initLanguage = async () => {
      try {
        // Load from localStorage
        const savedLang = localStorage.getItem(STORAGE_KEY);
        if (savedLang) {
          setLanguageState(savedLang);
        } else {
          // Detect browser language
          const browserLang = navigator.language || DEFAULT_LANGUAGE;
          const supported = SUPPORTED_LANGUAGES.find(
            (lang) => lang.code === browserLang,
          );
          const detectedLang = supported ? browserLang : DEFAULT_LANGUAGE;
          setLanguageState(detectedLang);
          localStorage.setItem(STORAGE_KEY, detectedLang);
        }
      } catch (error) {
        console.error("Error initializing language:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initLanguage();
  }, [identity]);

  const setLanguage = async (newLanguage: string) => {
    setIsSaving(true);
    try {
      // Update localStorage immediately for instant UI update
      localStorage.setItem(STORAGE_KEY, newLanguage);
      setLanguageState(newLanguage);

      // Dispatch event for app reload with userInitiated flag
      window.dispatchEvent(
        new CustomEvent("languageChanged", {
          detail: { language: newLanguage, userInitiated: true },
        }),
      );

      const langName =
        SUPPORTED_LANGUAGES.find((l) => l.code === newLanguage)?.name ||
        newLanguage;
      toast.success(`Language updated: ${langName}`);
    } catch (error) {
      console.error("Failed to save language preference:", error);
      toast.error("Failed to save language preference");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    language,
    setLanguage,
    isSaving,
    isInitializing,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}
