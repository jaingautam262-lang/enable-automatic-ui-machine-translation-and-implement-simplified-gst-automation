// Global country list and default tax rates
export interface CountryTaxRate {
  code: string;
  name: string;
  defaultTaxRate: number;
}

export interface CurrencyInfo {
  symbol: string;
  code: string;
  locale: string;
  name: string;
}

export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = {
  IN: { symbol: "₹", code: "INR", locale: "en-IN", name: "Indian Rupee" },
  US: { symbol: "$", code: "USD", locale: "en-US", name: "US Dollar" },
  GB: { symbol: "£", code: "GBP", locale: "en-GB", name: "British Pound" },
  CA: { symbol: "C$", code: "CAD", locale: "en-CA", name: "Canadian Dollar" },
  AU: { symbol: "A$", code: "AUD", locale: "en-AU", name: "Australian Dollar" },
  DE: { symbol: "€", code: "EUR", locale: "de-DE", name: "Euro" },
  FR: { symbol: "€", code: "EUR", locale: "fr-FR", name: "Euro" },
  IT: { symbol: "€", code: "EUR", locale: "it-IT", name: "Euro" },
  ES: { symbol: "€", code: "EUR", locale: "es-ES", name: "Euro" },
  NL: { symbol: "€", code: "EUR", locale: "nl-NL", name: "Euro" },
  BE: { symbol: "€", code: "EUR", locale: "fr-BE", name: "Euro" },
  SE: { symbol: "kr", code: "SEK", locale: "sv-SE", name: "Swedish Krona" },
  NO: { symbol: "kr", code: "NOK", locale: "nb-NO", name: "Norwegian Krone" },
  DK: { symbol: "kr", code: "DKK", locale: "da-DK", name: "Danish Krone" },
  FI: { symbol: "€", code: "EUR", locale: "fi-FI", name: "Euro" },
  PL: { symbol: "zł", code: "PLN", locale: "pl-PL", name: "Polish Złoty" },
  PT: { symbol: "€", code: "EUR", locale: "pt-PT", name: "Euro" },
  GR: { symbol: "€", code: "EUR", locale: "el-GR", name: "Euro" },
  IE: { symbol: "€", code: "EUR", locale: "en-IE", name: "Euro" },
  AT: { symbol: "€", code: "EUR", locale: "de-AT", name: "Euro" },
  CH: { symbol: "Fr", code: "CHF", locale: "de-CH", name: "Swiss Franc" },
  JP: { symbol: "¥", code: "JPY", locale: "ja-JP", name: "Japanese Yen" },
  CN: { symbol: "¥", code: "CNY", locale: "zh-CN", name: "Chinese Yuan" },
  KR: { symbol: "₩", code: "KRW", locale: "ko-KR", name: "South Korean Won" },
  SG: { symbol: "S$", code: "SGD", locale: "en-SG", name: "Singapore Dollar" },
  MY: { symbol: "RM", code: "MYR", locale: "ms-MY", name: "Malaysian Ringgit" },
  TH: { symbol: "฿", code: "THB", locale: "th-TH", name: "Thai Baht" },
  ID: { symbol: "Rp", code: "IDR", locale: "id-ID", name: "Indonesian Rupiah" },
  PH: { symbol: "₱", code: "PHP", locale: "fil-PH", name: "Philippine Peso" },
  VN: { symbol: "₫", code: "VND", locale: "vi-VN", name: "Vietnamese Đồng" },
  NZ: {
    symbol: "NZ$",
    code: "NZD",
    locale: "en-NZ",
    name: "New Zealand Dollar",
  },
  ZA: { symbol: "R", code: "ZAR", locale: "en-ZA", name: "South African Rand" },
  BR: { symbol: "R$", code: "BRL", locale: "pt-BR", name: "Brazilian Real" },
  MX: { symbol: "$", code: "MXN", locale: "es-MX", name: "Mexican Peso" },
  AR: { symbol: "$", code: "ARS", locale: "es-AR", name: "Argentine Peso" },
  CL: { symbol: "$", code: "CLP", locale: "es-CL", name: "Chilean Peso" },
  AE: { symbol: "د.إ", code: "AED", locale: "ar-AE", name: "UAE Dirham" },
  SA: { symbol: "﷼", code: "SAR", locale: "ar-SA", name: "Saudi Riyal" },
  IL: { symbol: "₪", code: "ILS", locale: "he-IL", name: "Israeli Shekel" },
  TR: { symbol: "₺", code: "TRY", locale: "tr-TR", name: "Turkish Lira" },
  RU: { symbol: "₽", code: "RUB", locale: "ru-RU", name: "Russian Ruble" },
  EG: { symbol: "E£", code: "EGP", locale: "ar-EG", name: "Egyptian Pound" },
  NG: { symbol: "₦", code: "NGN", locale: "en-NG", name: "Nigerian Naira" },
  KE: { symbol: "KSh", code: "KES", locale: "sw-KE", name: "Kenyan Shilling" },
};

export function getCurrencyForCountry(countryCode: string): CurrencyInfo {
  return COUNTRY_CURRENCY_MAP[countryCode] ?? COUNTRY_CURRENCY_MAP.IN;
}

export const COUNTRY_TAX_RATES: CountryTaxRate[] = [
  { code: "IN", name: "India", defaultTaxRate: 18 },
  { code: "US", name: "United States", defaultTaxRate: 7 },
  { code: "GB", name: "United Kingdom", defaultTaxRate: 20 },
  { code: "CA", name: "Canada", defaultTaxRate: 13 },
  { code: "AU", name: "Australia", defaultTaxRate: 10 },
  { code: "DE", name: "Germany", defaultTaxRate: 19 },
  { code: "FR", name: "France", defaultTaxRate: 20 },
  { code: "IT", name: "Italy", defaultTaxRate: 22 },
  { code: "ES", name: "Spain", defaultTaxRate: 21 },
  { code: "NL", name: "Netherlands", defaultTaxRate: 21 },
  { code: "BE", name: "Belgium", defaultTaxRate: 21 },
  { code: "SE", name: "Sweden", defaultTaxRate: 25 },
  { code: "NO", name: "Norway", defaultTaxRate: 25 },
  { code: "DK", name: "Denmark", defaultTaxRate: 25 },
  { code: "FI", name: "Finland", defaultTaxRate: 24 },
  { code: "PL", name: "Poland", defaultTaxRate: 23 },
  { code: "PT", name: "Portugal", defaultTaxRate: 23 },
  { code: "GR", name: "Greece", defaultTaxRate: 24 },
  { code: "IE", name: "Ireland", defaultTaxRate: 23 },
  { code: "AT", name: "Austria", defaultTaxRate: 20 },
  { code: "CH", name: "Switzerland", defaultTaxRate: 7.7 },
  { code: "JP", name: "Japan", defaultTaxRate: 10 },
  { code: "CN", name: "China", defaultTaxRate: 13 },
  { code: "KR", name: "South Korea", defaultTaxRate: 10 },
  { code: "SG", name: "Singapore", defaultTaxRate: 8 },
  { code: "MY", name: "Malaysia", defaultTaxRate: 6 },
  { code: "TH", name: "Thailand", defaultTaxRate: 7 },
  { code: "ID", name: "Indonesia", defaultTaxRate: 11 },
  { code: "PH", name: "Philippines", defaultTaxRate: 12 },
  { code: "VN", name: "Vietnam", defaultTaxRate: 10 },
  { code: "NZ", name: "New Zealand", defaultTaxRate: 15 },
  { code: "ZA", name: "South Africa", defaultTaxRate: 15 },
  { code: "BR", name: "Brazil", defaultTaxRate: 17 },
  { code: "MX", name: "Mexico", defaultTaxRate: 16 },
  { code: "AR", name: "Argentina", defaultTaxRate: 21 },
  { code: "CL", name: "Chile", defaultTaxRate: 19 },
  { code: "AE", name: "United Arab Emirates", defaultTaxRate: 5 },
  { code: "SA", name: "Saudi Arabia", defaultTaxRate: 15 },
  { code: "IL", name: "Israel", defaultTaxRate: 17 },
  { code: "TR", name: "Turkey", defaultTaxRate: 18 },
  { code: "RU", name: "Russia", defaultTaxRate: 20 },
  { code: "EG", name: "Egypt", defaultTaxRate: 14 },
  { code: "NG", name: "Nigeria", defaultTaxRate: 7.5 },
  { code: "KE", name: "Kenya", defaultTaxRate: 16 },
];

export function getDefaultTaxRateForCountry(countryCode: string): number {
  const country = COUNTRY_TAX_RATES.find((c) => c.code === countryCode);
  return country?.defaultTaxRate ?? 18; // Default to 18% if not found
}

export function getCountryByCode(
  countryCode: string,
): CountryTaxRate | undefined {
  return COUNTRY_TAX_RATES.find((c) => c.code === countryCode);
}

export function getCountryByName(
  countryName: string,
): CountryTaxRate | undefined {
  return COUNTRY_TAX_RATES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase(),
  );
}
