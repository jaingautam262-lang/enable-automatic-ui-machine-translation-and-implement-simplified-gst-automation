import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Upload, Plus, Trash2, Edit, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import {
  useListGSTRecords,
  useCreateGSTRecord,
  useDeleteGSTRecord,
} from '../../hooks/useGSTUniversalData';
import { parseAndValidateGSTImport } from '../../lib/gst/import/parseAndValidate';
import { toast } from 'sonner';

export default function GSTDataManagementTab() {
  const { t } = useI18n();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  const { data: records = [], isLoading } = useListGSTRecords(principal);
  const createRecord = useCreateGSTRecord(principal);
  const deleteRecord = useDeleteGSTRecord(principal);

  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importValidation, setImportValidation] = useState<any>(null);

  const handleImport = () => {
    const result = parseAndValidateGSTImport(importJson);
    setImportValidation(result);

    if (result.isValid && result.data) {
      createRecord.mutate(
        {
          type: result.data.type,
          data: result.data.data,
        },
        {
          onSuccess: () => {
            toast.success(t('gstData.importSuccess'));
            setImportJson('');
            setImportValidation(null);
            setShowImport(false);
          },
          onError: (error: any) => {
            toast.error(error.message || t('gstData.importFailed'));
          },
        }
      );
    } else {
      toast.error(t('gstData.validationFailed'));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('gstData.confirmDelete'))) {
      deleteRecord.mutate(id, {
        onSuccess: () => toast.success(t('gstData.deleteSuccess')),
        onError: (error: any) => toast.error(error.message || t('gstData.deleteFailed')),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{t('gstData.title')}</h2>
        </div>
        <Button onClick={() => setShowImport(!showImport)}>
          <Upload className="h-4 w-4 mr-2" />
          {t('gstData.importJson')}
        </Button>
      </div>

      {showImport && (
        <Card>
          <CardHeader>
            <CardTitle>{t('gstData.importJsonTitle')}</CardTitle>
            <CardDescription>{t('gstData.importJsonDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-json">{t('gstData.pasteJson')}</Label>
              <Textarea
                id="import-json"
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder={t('gstData.jsonPlaceholder')}
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            {importValidation && (
              <div className="space-y-2">
                {importValidation.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-destructive">{t('gstData.validationErrors')}</h4>
                    {importValidation.errors.map((error: any, idx: number) => (
                      <Alert key={idx} variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{error.path}:</strong> {error.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {importValidation.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-600">{t('gstData.validationWarnings')}</h4>
                    {importValidation.warnings.map((warning: any, idx: number) => (
                      <Alert key={idx}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{warning.path}:</strong> {warning.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {importValidation.isValid && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{t('gstData.validationPassed')}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={createRecord.isPending || !importJson}>
                {createRecord.isPending ? t('gstData.importing') : t('gstData.import')}
              </Button>
              <Button variant="outline" onClick={() => setShowImport(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('gstData.storedRecords')}</CardTitle>
          <CardDescription>{t('gstData.storedRecordsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('gstData.noRecords')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('gstData.type')}</TableHead>
                  <TableHead>{t('gstData.id')}</TableHead>
                  <TableHead>{t('gstData.createdAt')}</TableHead>
                  <TableHead>{t('gstData.updatedAt')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Badge>{record.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{record.id}</TableCell>
                    <TableCell>{new Date(record.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(record.updatedAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                        disabled={deleteRecord.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
