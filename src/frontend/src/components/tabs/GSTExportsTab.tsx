import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Download, FileJson } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDownloadExport,
  useGenerateExport,
} from "../../hooks/useGSTExports";
import { useI18n } from "../../i18n/useI18n";
import type { ExportType } from "../../lib/gst/exports/types";
import type { GSPProvider } from "../../types/gst-universal";

export default function GSTExportsTab() {
  const { t } = useI18n();
  const [selectedProvider, setSelectedProvider] =
    useState<GSPProvider>("cleartax");
  const [selectedExportType, setSelectedExportType] =
    useState<ExportType>("einvoice");

  const generateExport = useGenerateExport();
  const downloadExport = useDownloadExport();

  const handleGenerateExport = async () => {
    try {
      // Mock data for demonstration
      const mockData = getMockDataForExportType(selectedExportType);

      const result = await generateExport.mutateAsync({
        provider: selectedProvider,
        exportType: selectedExportType,
        data: mockData,
      });

      if (!result.validation.isValid) {
        toast.error(t("gstExports.validationFailed"));
        return;
      }

      const fileName = await downloadExport.mutateAsync(result);
      toast.success(`${t("gstExports.exportSuccess")}: ${fileName}`);
    } catch (error: any) {
      toast.error(error.message || t("gstExports.exportFailed"));
    }
  };

  const validationResult = generateExport.data?.validation;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileJson className="h-6 w-6" />
        <h2 className="text-2xl font-bold">{t("gstExports.title")}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("gstExports.configuration")}</CardTitle>
          <CardDescription>
            {t("gstExports.configurationDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">{t("gstExports.selectProvider")}</Label>
              <Select
                value={selectedProvider}
                onValueChange={(value) =>
                  setSelectedProvider(value as GSPProvider)
                }
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleartax">ClearTax</SelectItem>
                  <SelectItem value="mastersIndia">Masters India</SelectItem>
                  <SelectItem value="iris">IRIS</SelectItem>
                  <SelectItem value="tally">Tally GSP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exportType">
                {t("gstExports.selectExportType")}
              </Label>
              <Select
                value={selectedExportType}
                onValueChange={(value) =>
                  setSelectedExportType(value as ExportType)
                }
              >
                <SelectTrigger id="exportType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="einvoice">
                    {t("gstExports.types.einvoice")}
                  </SelectItem>
                  <SelectItem value="ewayBill">
                    {t("gstExports.types.ewayBill")}
                  </SelectItem>
                  <SelectItem value="gstr1">
                    {t("gstExports.types.gstr1")}
                  </SelectItem>
                  <SelectItem value="gstr3b">
                    {t("gstExports.types.gstr3b")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerateExport}
            disabled={generateExport.isPending || downloadExport.isPending}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {generateExport.isPending || downloadExport.isPending
              ? t("gstExports.generating")
              : t("gstExports.generateAndDownload")}
          </Button>
        </CardContent>
      </Card>

      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              {t("gstExports.validationSummary")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-destructive">
                  {t("gstExports.errors")}
                </h4>
                {validationResult.errors.map((error, idx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                  <Alert key={idx} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{error.field}:</strong> {error.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-600">
                  {t("gstExports.warnings")}
                </h4>
                {validationResult.warnings.map((warning, idx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                  <Alert key={idx}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{warning.field}:</strong> {warning.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {validationResult.isValid &&
              validationResult.errors.length === 0 && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    {t("gstExports.validationPassed")}
                  </AlertDescription>
                </Alert>
              )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("gstExports.providerInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("gstExports.selectedProvider")}:
              </span>
              <Badge>{selectedProvider}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("gstExports.selectedExportType")}:
              </span>
              <Badge variant="outline">{selectedExportType}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getMockDataForExportType(exportType: ExportType): any {
  const baseDate = Date.now();

  switch (exportType) {
    case "einvoice":
      return {
        invoiceId: "INV-001",
        invoiceNumber: "INV-2026-001",
        invoiceDate: baseDate,
        supplierGSTIN: "29AABCT1332L1Z5",
        customerGSTIN: "29AABCU9603R1ZM",
        items: [
          {
            description: "Product A",
            hsnCode: "1234",
            quantity: 10,
            unitPrice: 100,
            taxRate: 18,
            total: 1180,
          },
        ],
        totalAmount: 1180,
      };
    case "ewayBill":
      return {
        invoiceNumber: "INV-2026-001",
        invoiceDate: baseDate,
        fromGSTIN: "29AABCT1332L1Z5",
        toGSTIN: "29AABCU9603R1ZM",
        transportMode: "road",
        vehicleNumber: "KA01AB1234",
        distance: 150,
        items: [
          {
            description: "Product A",
            hsnCode: "1234",
            quantity: 10,
            value: 1000,
          },
        ],
      };
    case "gstr1":
      return {
        period: "022026",
        gstin: "29AABCT1332L1Z5",
        b2bInvoices: [
          {
            customerGSTIN: "29AABCU9603R1ZM",
            invoiceNumber: "INV-2026-001",
            invoiceDate: baseDate,
            invoiceValue: 1180,
            taxableValue: 1000,
            cgst: 90,
            sgst: 90,
            igst: 0,
          },
        ],
        b2cInvoices: [],
      };
    case "gstr3b":
      return {
        period: "022026",
        gstin: "29AABCT1332L1Z5",
        outwardSupplies: {
          taxableValue: 10000,
          cgst: 900,
          sgst: 900,
          igst: 0,
          cess: 0,
        },
        inwardSupplies: {
          taxableValue: 5000,
          cgst: 450,
          sgst: 450,
          igst: 0,
          itcAvailable: 900,
        },
        netTaxLiability: 900,
      };
    default:
      return {};
  }
}
