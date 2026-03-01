import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '../../i18n/I18nProvider';
import { useGetNotificationSettings, useSetNotificationSettings } from '../../hooks/useQueries';
import { useSelectedTaxCountry } from '../../hooks/useSelectedTaxCountry';
import { useGetLegacyTaxSettings, useSetLegacyTaxSettings } from '../../hooks/useLegacyTaxSettings';
import { useInvoiceBranding } from '../../hooks/useInvoiceBranding';
import { COUNTRY_TAX_RATES } from '../../lib/taxRates';
import { toast } from 'sonner';
import { getProviderSettingsPublic, saveProviderSettings, type ProviderSettings } from '../../i18n/googleTranslate';

export default function SettingsTab() {
  const { t } = useI18n();
  const { data: notificationSettings } = useGetNotificationSettings();
  const setNotificationSettings = useSetNotificationSettings();
  const { selectedCountry, setSelectedCountry } = useSelectedTaxCountry();
  const { data: legacySettings } = useGetLegacyTaxSettings();
  const setLegacySettings = useSetLegacyTaxSettings();
  const { branding, saveBranding, isLoading: brandingLoading } = useInvoiceBranding();

  const [localWebsiteUrl, setLocalWebsiteUrl] = useState(branding.websiteURL || '');
  const [localQrDataUrl, setLocalQrDataUrl] = useState(branding.paymentQRDataURL || '');

  // Translation provider settings
  const [providerSettings, setProviderSettings] = useState<ProviderSettings>(() => getProviderSettingsPublic());

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings.mutate(
      { ...notificationSettings, [key]: value },
      {
        onSuccess: () => {
          toast.success('Notification settings updated');
        },
      }
    );
  };

  const handleLegacySettingsChange = (key: string, value: any) => {
    setLegacySettings.mutate(
      { ...legacySettings, [key]: value },
      {
        onSuccess: () => {
          toast.success('Tax settings updated');
        },
      }
    );
  };

  const handleBrandingSave = () => {
    saveBranding({
      websiteURL: localWebsiteUrl,
      paymentQRDataURL: localQrDataUrl,
    });
    toast.success('Invoice branding updated');
  };

  const handleProviderSave = () => {
    try {
      saveProviderSettings(providerSettings);
      toast.success(t('settings.translation.providerSaved'));
    } catch (error) {
      console.error('Failed to save provider settings:', error);
      toast.error(t('settings.translation.providerFailed'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
        <p className="text-muted-foreground mt-1">{t('settings.autoTranslationNote')}</p>
      </div>

      <Tabs defaultValue="tax" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tax">Tax Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="branding">Invoice Branding</TabsTrigger>
          <TabsTrigger value="translation">Translation</TabsTrigger>
        </TabsList>

        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>Configure your tax settings and GST information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_TAX_RATES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={legacySettings?.gstin || ''}
                  onChange={(e) => handleLegacySettingsChange('gstin', e.target.value)}
                  placeholder="Enter GSTIN"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstType">GST Type</Label>
                <Select
                  value={legacySettings?.gstType || 'regular'}
                  onValueChange={(value) => handleLegacySettingsChange('gstType', value)}
                >
                  <SelectTrigger id="gstType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="composition">Composition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stateCode">State Code</Label>
                <Input
                  id="stateCode"
                  value={legacySettings?.stateCode || ''}
                  onChange={(e) => handleLegacySettingsChange('stateCode', e.target.value)}
                  placeholder="Enter state code (e.g., 27 for Maharashtra)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage your notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts when product stock falls below threshold
                  </p>
                </div>
                <Switch
                  checked={notificationSettings?.lowStockAlert ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('lowStockAlert', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Overdue Invoice Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for overdue invoices
                  </p>
                </div>
                <Switch
                  checked={notificationSettings?.overdueInvoiceAlert ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('overdueInvoiceAlert', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Branding</CardTitle>
              <CardDescription>Customize your invoice appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  value={localWebsiteUrl}
                  onChange={(e) => setLocalWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={brandingLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qrDataUrl">Payment QR Code Data URL</Label>
                <Input
                  id="qrDataUrl"
                  value={localQrDataUrl}
                  onChange={(e) => setLocalQrDataUrl(e.target.value)}
                  placeholder="upi://pay?pa=example@upi"
                  disabled={brandingLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Enter UPI payment URL or other payment data for QR code
                </p>
              </div>

              <Button onClick={handleBrandingSave} disabled={brandingLoading}>
                Save Branding Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.translation.title')}</CardTitle>
              <CardDescription>{t('settings.translation.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="translationProvider">{t('settings.translation.provider')}</Label>
                <Select
                  value={providerSettings.provider}
                  onValueChange={(value: any) =>
                    setProviderSettings({ ...providerSettings, provider: value })
                  }
                >
                  <SelectTrigger id="translationProvider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mymemory">{t('settings.translation.myMemory')}</SelectItem>
                    <SelectItem value="libretranslate">{t('settings.translation.libreTranslate')}</SelectItem>
                    <SelectItem value="google">{t('settings.translation.googleTranslate')}</SelectItem>
                    <SelectItem value="azure">{t('settings.translation.azureTranslate')}</SelectItem>
                    <SelectItem value="deepl">{t('settings.translation.deepL')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {providerSettings.provider === 'mymemory' && t('settings.translation.myMemoryNote')}
                  {providerSettings.provider === 'libretranslate' && t('settings.translation.libreTranslateNote')}
                  {providerSettings.provider === 'google' && t('settings.translation.googleNote')}
                  {providerSettings.provider === 'azure' && t('settings.translation.azureNote')}
                  {providerSettings.provider === 'deepl' && t('settings.translation.deeplNote')}
                </p>
              </div>

              {providerSettings.provider === 'libretranslate' && (
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">{t('settings.translation.baseUrl')}</Label>
                  <Input
                    id="baseUrl"
                    value={providerSettings.baseUrl || ''}
                    onChange={(e) =>
                      setProviderSettings({ ...providerSettings, baseUrl: e.target.value })
                    }
                    placeholder={t('settings.translation.baseUrlPlaceholder')}
                  />
                </div>
              )}

              {['google', 'azure', 'deepl', 'libretranslate'].includes(providerSettings.provider) && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">{t('settings.translation.apiKey')}</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={providerSettings.apiKey || ''}
                    onChange={(e) =>
                      setProviderSettings({ ...providerSettings, apiKey: e.target.value })
                    }
                    placeholder={
                      providerSettings.provider === 'google'
                        ? 'YOUR_GOOGLE_TRANSLATE_API_KEY'
                        : providerSettings.provider === 'azure'
                        ? 'YOUR_AZURE_TRANSLATE_API_KEY'
                        : providerSettings.provider === 'deepl'
                        ? 'YOUR_DEEPL_API_KEY'
                        : t('settings.translation.apiKeyPlaceholder')
                    }
                  />
                </div>
              )}

              <Button onClick={handleProviderSave}>{t('settings.translation.saveProvider')}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
