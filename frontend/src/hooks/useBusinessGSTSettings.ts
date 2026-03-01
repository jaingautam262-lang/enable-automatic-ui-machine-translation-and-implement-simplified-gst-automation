import { useState, useEffect } from 'react';

const STORAGE_KEY = 'business_gst_settings';

interface BusinessGSTSettings {
  businessStateCode: string;
  businessGSTIN?: string;
}

export function useBusinessGSTSettings() {
  const [settings, setSettings] = useState<BusinessGSTSettings>({
    businessStateCode: '27', // Default to Maharashtra
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load business GST settings:', error);
      }
    }
  }, []);

  const saveSettings = (newSettings: BusinessGSTSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  return {
    businessStateCode: settings.businessStateCode,
    businessGSTIN: settings.businessGSTIN,
    saveSettings,
  };
}
