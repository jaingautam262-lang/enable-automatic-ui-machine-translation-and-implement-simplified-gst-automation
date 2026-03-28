import { useEffect, useState } from "react";

export interface ThemeVariant {
  id: string;
  name: string;
  lightBg: string;
  darkBg: string;
}

const THEME_VARIANTS: ThemeVariant[] = [
  {
    id: "coral-sunset",
    name: "Coral Sunset",
    lightBg:
      "linear-gradient(135deg, oklch(0.95 0.08 30) 0%, oklch(0.92 0.12 50) 100%)",
    darkBg:
      "linear-gradient(135deg, oklch(0.25 0.08 30) 0%, oklch(0.20 0.12 50) 100%)",
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    lightBg:
      "linear-gradient(135deg, oklch(0.94 0.06 200) 0%, oklch(0.90 0.10 220) 100%)",
    darkBg:
      "linear-gradient(135deg, oklch(0.22 0.06 200) 0%, oklch(0.18 0.10 220) 100%)",
  },
  {
    id: "forest-mist",
    name: "Forest Mist",
    lightBg:
      "linear-gradient(135deg, oklch(0.93 0.07 150) 0%, oklch(0.89 0.11 170) 100%)",
    darkBg:
      "linear-gradient(135deg, oklch(0.23 0.07 150) 0%, oklch(0.19 0.11 170) 100%)",
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    lightBg:
      "linear-gradient(135deg, oklch(0.94 0.08 290) 0%, oklch(0.91 0.10 310) 100%)",
    darkBg:
      "linear-gradient(135deg, oklch(0.24 0.08 290) 0%, oklch(0.20 0.10 310) 100%)",
  },
  {
    id: "amber-glow",
    name: "Amber Glow",
    lightBg:
      "linear-gradient(135deg, oklch(0.95 0.10 70) 0%, oklch(0.92 0.12 85) 100%)",
    darkBg:
      "linear-gradient(135deg, oklch(0.25 0.10 70) 0%, oklch(0.21 0.12 85) 100%)",
  },
];

const ROTATION_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY = "app-theme-variant";
const DISABLE_KEY = "disable-auto-theme-rotation";

export function useAutoThemeRotation() {
  const [currentVariantIndex, setCurrentVariantIndex] = useState(() => {
    // Load persisted variant on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const index = THEME_VARIANTS.findIndex((v) => v.id === stored);
      return index >= 0 ? index : 0;
    }
    return 0;
  });

  const [isDisabled, setIsDisabled] = useState(() => {
    // Check if rotation is disabled (for tests)
    return localStorage.getItem(DISABLE_KEY) === "true";
  });

  useEffect(() => {
    if (isDisabled) return;

    const interval = setInterval(() => {
      setCurrentVariantIndex((prev) => {
        const next = (prev + 1) % THEME_VARIANTS.length;
        const variant = THEME_VARIANTS[next];
        localStorage.setItem(STORAGE_KEY, variant.id);
        return next;
      });
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isDisabled]);

  const currentVariant = THEME_VARIANTS[currentVariantIndex];

  return {
    currentVariant,
    allVariants: THEME_VARIANTS,
    setVariant: (id: string) => {
      const index = THEME_VARIANTS.findIndex((v) => v.id === id);
      if (index >= 0) {
        setCurrentVariantIndex(index);
        localStorage.setItem(STORAGE_KEY, id);
      }
    },
    disableRotation: () => {
      setIsDisabled(true);
      localStorage.setItem(DISABLE_KEY, "true");
    },
    enableRotation: () => {
      setIsDisabled(false);
      localStorage.removeItem(DISABLE_KEY);
    },
  };
}
