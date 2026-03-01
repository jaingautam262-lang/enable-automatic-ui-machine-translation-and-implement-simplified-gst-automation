// Global country list and default tax rates
export interface CountryTaxRate {
  code: string;
  name: string;
  defaultTaxRate: number;
}

export const COUNTRY_TAX_RATES: CountryTaxRate[] = [
  { code: 'IN', name: 'India', defaultTaxRate: 18 },
  { code: 'US', name: 'United States', defaultTaxRate: 7 },
  { code: 'GB', name: 'United Kingdom', defaultTaxRate: 20 },
  { code: 'CA', name: 'Canada', defaultTaxRate: 13 },
  { code: 'AU', name: 'Australia', defaultTaxRate: 10 },
  { code: 'DE', name: 'Germany', defaultTaxRate: 19 },
  { code: 'FR', name: 'France', defaultTaxRate: 20 },
  { code: 'IT', name: 'Italy', defaultTaxRate: 22 },
  { code: 'ES', name: 'Spain', defaultTaxRate: 21 },
  { code: 'NL', name: 'Netherlands', defaultTaxRate: 21 },
  { code: 'BE', name: 'Belgium', defaultTaxRate: 21 },
  { code: 'SE', name: 'Sweden', defaultTaxRate: 25 },
  { code: 'NO', name: 'Norway', defaultTaxRate: 25 },
  { code: 'DK', name: 'Denmark', defaultTaxRate: 25 },
  { code: 'FI', name: 'Finland', defaultTaxRate: 24 },
  { code: 'PL', name: 'Poland', defaultTaxRate: 23 },
  { code: 'PT', name: 'Portugal', defaultTaxRate: 23 },
  { code: 'GR', name: 'Greece', defaultTaxRate: 24 },
  { code: 'IE', name: 'Ireland', defaultTaxRate: 23 },
  { code: 'AT', name: 'Austria', defaultTaxRate: 20 },
  { code: 'CH', name: 'Switzerland', defaultTaxRate: 7.7 },
  { code: 'JP', name: 'Japan', defaultTaxRate: 10 },
  { code: 'CN', name: 'China', defaultTaxRate: 13 },
  { code: 'KR', name: 'South Korea', defaultTaxRate: 10 },
  { code: 'SG', name: 'Singapore', defaultTaxRate: 8 },
  { code: 'MY', name: 'Malaysia', defaultTaxRate: 6 },
  { code: 'TH', name: 'Thailand', defaultTaxRate: 7 },
  { code: 'ID', name: 'Indonesia', defaultTaxRate: 11 },
  { code: 'PH', name: 'Philippines', defaultTaxRate: 12 },
  { code: 'VN', name: 'Vietnam', defaultTaxRate: 10 },
  { code: 'NZ', name: 'New Zealand', defaultTaxRate: 15 },
  { code: 'ZA', name: 'South Africa', defaultTaxRate: 15 },
  { code: 'BR', name: 'Brazil', defaultTaxRate: 17 },
  { code: 'MX', name: 'Mexico', defaultTaxRate: 16 },
  { code: 'AR', name: 'Argentina', defaultTaxRate: 21 },
  { code: 'CL', name: 'Chile', defaultTaxRate: 19 },
  { code: 'AE', name: 'United Arab Emirates', defaultTaxRate: 5 },
  { code: 'SA', name: 'Saudi Arabia', defaultTaxRate: 15 },
  { code: 'IL', name: 'Israel', defaultTaxRate: 17 },
  { code: 'TR', name: 'Turkey', defaultTaxRate: 18 },
  { code: 'RU', name: 'Russia', defaultTaxRate: 20 },
  { code: 'EG', name: 'Egypt', defaultTaxRate: 14 },
  { code: 'NG', name: 'Nigeria', defaultTaxRate: 7.5 },
  { code: 'KE', name: 'Kenya', defaultTaxRate: 16 },
];

export function getDefaultTaxRateForCountry(countryCode: string): number {
  const country = COUNTRY_TAX_RATES.find(c => c.code === countryCode);
  return country?.defaultTaxRate ?? 18; // Default to 18% if not found
}

export function getCountryByCode(countryCode: string): CountryTaxRate | undefined {
  return COUNTRY_TAX_RATES.find(c => c.code === countryCode);
}

export function getCountryByName(countryName: string): CountryTaxRate | undefined {
  return COUNTRY_TAX_RATES.find(c => c.name.toLowerCase() === countryName.toLowerCase());
}
