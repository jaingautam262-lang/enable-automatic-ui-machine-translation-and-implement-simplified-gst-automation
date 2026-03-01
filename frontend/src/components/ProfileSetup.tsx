import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { useI18n } from '../i18n/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ProfileSetup() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t('profileSetup.nameRequired'));
      return;
    }

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        businessName: businessName.trim() || undefined,
      });
      toast.success(t('profileSetup.success'));
    } catch (error) {
      toast.error(t('profileSetup.error'));
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <img
              src="/assets/generated/dashboard-icon-transparent.dim_64x64.png"
              alt={t('profileSetup.logoAlt')}
              className="h-12 w-12"
            />
          </div>
          <CardTitle className="text-2xl">{t('profileSetup.title')}</CardTitle>
          <CardDescription>{t('profileSetup.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('profileSetup.fullName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder={t('profileSetup.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {t('profileSetup.email')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('profileSetup.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">{t('profileSetup.businessName')}</Label>
              <Input
                id="businessName"
                placeholder={t('profileSetup.businessPlaceholder')}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? t('profileSetup.creating') : t('profileSetup.continue')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
