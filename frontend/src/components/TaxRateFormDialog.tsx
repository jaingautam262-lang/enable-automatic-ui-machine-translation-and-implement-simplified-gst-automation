import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TaxRate, TaxRateType } from '../types';
import { COUNTRY_TAX_RATES } from '../lib/taxRates';
import { useAddTaxRate, useUpdateTaxRate } from '../hooks/useTaxRateManagement';
import { toast } from 'sonner';

interface TaxRateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRate?: TaxRate | null;
}

const TAX_TYPES: { value: TaxRateType; label: string }[] = [
  { value: 'GST', label: 'GST (Goods & Services Tax)' },
  { value: 'VAT', label: 'VAT (Value Added Tax)' },
  { value: 'IncomeTax', label: 'Income Tax' },
  { value: 'Custom', label: 'Custom' },
];

const defaultForm = {
  country: '',
  countryCode: '',
  taxType: 'GST' as TaxRateType,
  rateName: '',
  percentage: '',
  isDefault: false,
  description: '',
};

export default function TaxRateFormDialog({ open, onOpenChange, editingRate }: TaxRateFormDialogProps) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addMutation = useAddTaxRate();
  const updateMutation = useUpdateTaxRate();
  const isLoading = addMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (editingRate) {
      setForm({
        country: editingRate.country,
        countryCode: editingRate.countryCode,
        taxType: editingRate.taxType,
        rateName: editingRate.rateName,
        percentage: String(editingRate.percentage),
        isDefault: editingRate.isDefault,
        description: editingRate.description ?? '',
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [editingRate, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.countryCode) newErrors.countryCode = 'Country is required';
    if (!form.rateName.trim()) newErrors.rateName = 'Rate name is required';
    const pct = parseFloat(form.percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) newErrors.percentage = 'Percentage must be between 0 and 100';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCountryChange = (code: string) => {
    const country = COUNTRY_TAX_RATES.find(c => c.code === code);
    setForm(f => ({ ...f, countryCode: code, country: country?.name ?? code }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const pct = parseFloat(form.percentage);
    try {
      if (editingRate) {
        await updateMutation.mutateAsync({
          ...editingRate,
          country: form.country,
          countryCode: form.countryCode,
          taxType: form.taxType,
          rateName: form.rateName,
          percentage: pct,
          isDefault: form.isDefault,
          description: form.description || undefined,
        });
        toast.success('Tax rate updated successfully');
      } else {
        await addMutation.mutateAsync({
          country: form.country,
          countryCode: form.countryCode,
          taxType: form.taxType,
          rateName: form.rateName,
          percentage: pct,
          isDefault: form.isDefault,
          description: form.description || undefined,
        });
        toast.success('Tax rate added successfully');
      }
      onOpenChange(false);
    } catch {
      toast.error('Failed to save tax rate');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingRate ? 'Edit Tax Rate' : 'Add New Tax Rate'}</DialogTitle>
          <DialogDescription>
            {editingRate ? 'Update the details for this tax rate.' : 'Fill in the details to create a new tax rate entry.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Country */}
          <div className="space-y-1.5">
            <Label>Country <span className="text-destructive">*</span></Label>
            <Select value={form.countryCode} onValueChange={handleCountryChange}>
              <SelectTrigger className={errors.countryCode ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select country..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {COUNTRY_TAX_RATES.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.countryCode && <p className="text-xs text-destructive">{errors.countryCode}</p>}
          </div>

          {/* Tax Type */}
          <div className="space-y-1.5">
            <Label>Tax Type <span className="text-destructive">*</span></Label>
            <Select value={form.taxType} onValueChange={(v) => setForm(f => ({ ...f, taxType: v as TaxRateType }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAX_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rate Name */}
          <div className="space-y-1.5">
            <Label>Rate Name <span className="text-destructive">*</span></Label>
            <Input
              placeholder="e.g. GST 18%, Standard VAT, IGST 12%"
              value={form.rateName}
              onChange={e => setForm(f => ({ ...f, rateName: e.target.value }))}
              className={errors.rateName ? 'border-destructive' : ''}
            />
            {errors.rateName && <p className="text-xs text-destructive">{errors.rateName}</p>}
          </div>

          {/* Percentage */}
          <div className="space-y-1.5">
            <Label>Percentage (%) <span className="text-destructive">*</span></Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="e.g. 18.00"
              value={form.percentage}
              onChange={e => setForm(f => ({ ...f, percentage: e.target.value }))}
              className={errors.percentage ? 'border-destructive' : ''}
            />
            {errors.percentage && <p className="text-xs text-destructive">{errors.percentage}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea
              placeholder="Brief description of when this rate applies..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Is Default */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Set as Default</p>
              <p className="text-xs text-muted-foreground">Use this rate as the default for the selected country & type</p>
            </div>
            <Switch
              checked={form.isDefault}
              onCheckedChange={v => setForm(f => ({ ...f, isDefault: v }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </span>
            ) : editingRate ? 'Update Rate' : 'Add Rate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
