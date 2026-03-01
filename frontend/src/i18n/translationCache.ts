// Translation cache with localStorage persistence and in-flight request de-duplication

const CACHE_VERSION = 'v1';
const CACHE_KEY_PREFIX = 'translation_cache_';
const MAX_CACHE_SIZE = 1000; // Maximum number of cached translations per language

interface CacheEntry {
  translation: string;
  timestamp: number;
}

type LanguageCache = Record<string, CacheEntry>;

class TranslationCache {
  private memoryCache: Map<string, LanguageCache> = new Map();
  private inFlightRequests: Map<string, Promise<string>> = new Map();
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Get cache key for a language
   */
  private getCacheKey(language: string): string {
    return `${CACHE_KEY_PREFIX}${CACHE_VERSION}_${language}`;
  }

  /**
   * Get in-flight request key
   */
  private getInFlightKey(language: string, sourceText: string): string {
    return `${language}:${sourceText}`;
  }

  /**
   * Get translation from cache
   */
  get(language: string, sourceText: string): string | null {
    const langCache = this.memoryCache.get(language);
    if (!langCache) {
      this.cacheMisses++;
      return null;
    }

    const entry = langCache[sourceText];
    if (!entry) {
      this.cacheMisses++;
      return null;
    }

    this.cacheHits++;
    return entry.translation;
  }

  /**
   * Set translation in cache
   */
  set(language: string, sourceText: string, translation: string): void {
    let langCache = this.memoryCache.get(language);
    
    if (!langCache) {
      langCache = {};
      this.memoryCache.set(language, langCache);
    }

    // Check cache size and evict oldest entries if needed
    const entries = Object.entries(langCache);
    if (entries.length >= MAX_CACHE_SIZE) {
      // Sort by timestamp and remove oldest 20%
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = Math.floor(MAX_CACHE_SIZE * 0.2);
      for (let i = 0; i < toRemove; i++) {
        delete langCache[entries[i][0]];
      }
    }

    langCache[sourceText] = {
      translation,
      timestamp: Date.now(),
    };

    // Persist to localStorage
    this.saveToLocalStorage(language, langCache);
  }

  /**
   * Get or create in-flight translation request with de-duplication
   */
  async getOrFetch(
    language: string,
    sourceText: string,
    fetchFn: () => Promise<string>
  ): Promise<string> {
    // Check cache first
    const cached = this.get(language, sourceText);
    if (cached) {
      return cached;
    }

    // Check if request is already in flight
    const inFlightKey = this.getInFlightKey(language, sourceText);
    const existingRequest = this.inFlightRequests.get(inFlightKey);
    if (existingRequest) {
      return existingRequest;
    }

    // Create new request
    const request = fetchFn()
      .then((translation) => {
        this.set(language, sourceText, translation);
        this.inFlightRequests.delete(inFlightKey);
        return translation;
      })
      .catch((error) => {
        this.inFlightRequests.delete(inFlightKey);
        throw error;
      });

    this.inFlightRequests.set(inFlightKey, request);
    return request;
  }

  /**
   * Clear cache for a specific language
   */
  clearLanguage(language: string): void {
    this.memoryCache.delete(language);
    try {
      localStorage.removeItem(this.getCacheKey(language));
    } catch (error) {
      console.warn('Failed to clear language cache from localStorage:', error);
    }
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.memoryCache.clear();
    this.inFlightRequests.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear all caches from localStorage:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX + CACHE_VERSION)) {
          const language = key.replace(CACHE_KEY_PREFIX + CACHE_VERSION + '_', '');
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const langCache = JSON.parse(data) as LanguageCache;
              this.memoryCache.set(language, langCache);
            } catch (error) {
              console.warn(`Failed to parse cache for language ${language}:`, error);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Failed to load translation cache from localStorage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToLocalStorage(language: string, langCache: LanguageCache): void {
    try {
      const key = this.getCacheKey(language);
      localStorage.setItem(key, JSON.stringify(langCache));
    } catch (error) {
      console.warn(`Failed to save cache for language ${language} to localStorage:`, error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
      languages: this.memoryCache.size,
      totalEntries: Array.from(this.memoryCache.values()).reduce(
        (sum, cache) => sum + Object.keys(cache).length,
        0
      ),
      inFlightRequests: this.inFlightRequests.size,
    };
  }
}

// Singleton instance
export const translationCache = new TranslationCache();
