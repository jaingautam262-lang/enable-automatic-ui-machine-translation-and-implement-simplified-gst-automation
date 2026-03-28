import { useEffect, useState } from "react";
import type { PersistedTranslation } from "../backend";
import { useActor } from "../hooks/useActor";
import {
  fetchPersistedTranslations,
  normalizePersistedTranslations,
} from "./persistedTranslations";

interface UsePersistedTranslationsBootstrapReturn {
  isReady: boolean;
  isLoading: boolean;
  persistedTranslations: Map<string, Map<string, string>>;
  error: Error | null;
}

/**
 * Hook to bootstrap persisted translations from backend
 * Loads translations once actor is available and provides ready flag
 */
export function usePersistedTranslationsBootstrap(): UsePersistedTranslationsBootstrapReturn {
  const { actor, isFetching } = useActor();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [persistedTranslations, setPersistedTranslations] = useState<
    Map<string, Map<string, string>>
  >(new Map());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!actor || isFetching) {
      return;
    }

    if (isReady) {
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchPersistedTranslations(actor)
      .then((translations) => {
        const normalized = normalizePersistedTranslations(translations);
        setPersistedTranslations(normalized);
        setIsReady(true);
      })
      .catch((err) => {
        console.error("Failed to bootstrap persisted translations:", err);
        setError(err);
        setIsReady(true); // Still mark as ready to allow app to continue
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [actor, isFetching, isReady]);

  return {
    isReady,
    isLoading,
    persistedTranslations,
    error,
  };
}
