import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, FileText, Info, Plus, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useCreateInvoice,
  useGetAllInvoices,
  useGetNextInvoiceNumber,
  useUpdateInvoiceStatus,
} from "../../hooks/useQueries";
import { useSelectedTaxCountry } from "../../hooks/useSelectedTaxCountry";
import { useEffectiveTaxRate } from "../../hooks/useTaxSettings";
import { useI18n } from "../../i18n/useI18n";
import type { GSTScheme } from "../../types";

interface InvoiceItem {
  productId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
  discount: number;
}

// GST Scheme options with labels and metadata
const GST_SCHEME_OPTIONS: {
  value: GSTScheme;
  label: string;
  description: string;
  zeroRated: boolean;
}[] = [
  {
    value: "Regular",
    label: "Regular",
    description: "Standard GST with CGST/SGST or IGST breakdown",
    zeroRated: false,
  },
  {
    value: "Composition",
    label: "Composition Scheme",
    description: "Flat composition levy; no CGST/SGST/IGST line items",
    zeroRated: false,
  },
  {
    value: "Export_WithPayment",
    label: "Export (with Payment of Tax)",
    description: "Zero-rated supply; tax paid upfront with LUT/Bond reference",
    zeroRated: true,
  },
  {
    value: "Export_WithoutPayment",
    label: "Export (without Payment of Tax)",
    description: "Zero-rated supply under LUT/Bond; no tax collected",
    zeroRated: true,
  },
  {
    value: "SEZ_WithPayment",
    label: "SEZ Supply (with Payment of Tax)",
    description: "Supply to SEZ unit/developer with tax payment",
    zeroRated: true,
  },
  {
    value: "SEZ_WithoutPayment",
    label: "SEZ Supply (without Payment of Tax)",
    description: "Supply to SEZ unit/developer under LUT/Bond",
    zeroRated: true,
  },
  {
    value: "DeemedExport",
    label: "Deemed Export",
    description: "Full CGST/SGST/IGST breakdown with Deemed Export designation",
    zeroRated: false,
  },
];

function getSchemeLabel(scheme: GSTScheme): string {
  return GST_SCHEME_OPTIONS.find((o) => o.value === scheme)?.label ?? scheme;
}

function isZeroRatedScheme(scheme: GSTScheme): boolean {
  return GST_SCHEME_OPTIONS.find((o) => o.value === scheme)?.zeroRated ?? false;
}

export default function InvoicesTab() {
  const { t } = useI18n();
  const { data: invoices = [] } = useGetAllInvoices();
  const createInvoice = useCreateInvoice();
  const _updateStatus = useUpdateInvoiceStatus();
  const { data: nextInvoiceNumber } = useGetNextInvoiceNumber();

  const { selectedCountry } = useSelectedTaxCountry();
  const { taxRate: effectiveTaxRate } = useEffectiveTaxRate(selectedCountry);

  // Determine if we're in an Indian GST context
  const isIndianContext = selectedCountry === "IN";

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessContact, setBusinessContact] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      productId: 0,
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      taxRate: effectiveTaxRate || 18,
      discount: 0,
    },
  ]);
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [gstin, setGstin] = useState("");
  const [customerGSTIN, setCustomerGSTIN] = useState("");
  const [customerStateCode, setCustomerStateCode] = useState("");

  // No-GST state: supplier and customer registration
  const [supplierGstRegistered, setSupplierGstRegistered] = useState(true);
  const [customerGstRegistered, setCustomerGstRegistered] = useState(true);

  // GST Scheme state
  const [gstScheme, setGstScheme] = useState<GSTScheme>("Regular");
  const [lutBondReference, setLutBondReference] = useState("");
  const [sezUnitDeveloper, setSezUnitDeveloper] = useState("");
  const [compositionLevy, setCompositionLevy] = useState<number>(0);

  // Update initial item tax rate when effective rate changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: items intentionally omitted to avoid loop
  useEffect(() => {
    if (effectiveTaxRate && items.length === 1 && items[0].description === "") {
      setItems([{ ...items[0], taxRate: effectiveTaxRate }]);
    }
  }, [effectiveTaxRate]);

  // When GST scheme changes, update item tax rates accordingly
  // biome-ignore lint/correctness/useExhaustiveDependencies: effectiveTaxRate intentionally omitted to avoid loop
  useEffect(() => {
    if (!isIndianContext) return;
    const zeroRated = isZeroRatedScheme(gstScheme);
    if (zeroRated) {
      setItems((prev) => prev.map((item) => ({ ...item, taxRate: 0 })));
    } else if (gstScheme === "Regular" || gstScheme === "DeemedExport") {
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          taxRate: item.taxRate === 0 ? effectiveTaxRate || 18 : item.taxRate,
        })),
      );
    }
  }, [gstScheme, isIndianContext]);

  // When supplier GST registration is turned off, zero out all item tax rates
  useEffect(() => {
    if (!supplierGstRegistered) {
      setItems((prev) => prev.map((item) => ({ ...item, taxRate: 0 })));
    }
  }, [supplierGstRegistered]);

  const addItem = () => {
    const taxRateForNewItem =
      isIndianContext && isZeroRatedScheme(gstScheme)
        ? 0
        : effectiveTaxRate || 18;
    setItems([
      ...items,
      {
        productId: 0,
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        taxRate: taxRateForNewItem,
        discount: 0,
      },
    ]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "unitPrice" || field === "discount") {
      const item = newItems[index];
      item.total = item.quantity * item.unitPrice - item.discount;
    }

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);

    let totalTax = 0;
    if (!supplierGstRegistered) {
      totalTax = 0;
    } else if (isIndianContext && gstScheme === "Composition") {
      totalTax = compositionLevy;
    } else {
      totalTax = items.reduce(
        (sum, item) => sum + (item.total * item.taxRate) / 100,
        0,
      );
    }

    const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
    const totalAmount = subtotal + totalTax;

    return { subtotal, totalTax, totalDiscount, totalAmount };
  };

  const handleCreateInvoice = async () => {
    try {
      const { subtotal, totalTax, totalDiscount, totalAmount } =
        calculateTotals();

      const invoice: any = {
        id: Date.now(),
        invoiceNumber: nextInvoiceNumber,
        businessName,
        businessContact,
        businessAddress,
        clientName,
        clientContact,
        clientAddress,
        issuedDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items,
        subtotal,
        totalTax,
        totalDiscount,
        totalAmount,
        status: "unpaid",
        paymentTerms,
        notes,
        gstin,
        customerGSTIN,
        customerStateCode,
      };

      // Attach GST scheme fields for Indian context
      if (isIndianContext) {
        invoice.gstScheme = gstScheme;
        if (
          gstScheme === "Export_WithPayment" ||
          gstScheme === "Export_WithoutPayment"
        ) {
          invoice.lutBondReference = lutBondReference;
        }
        if (
          gstScheme === "SEZ_WithPayment" ||
          gstScheme === "SEZ_WithoutPayment"
        ) {
          invoice.sezUnitDeveloper = sezUnitDeveloper;
        }
        if (gstScheme === "Composition") {
          invoice.compositionLevy = compositionLevy;
        }
      }

      await createInvoice.mutateAsync(invoice);
      toast.success(t("invoices.invoiceCreated"));
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(t("invoices.invoiceCreationFailed"));
      console.error(error);
    }
  };

  const resetForm = () => {
    setBusinessName("");
    setBusinessContact("");
    setBusinessAddress("");
    setClientName("");
    setClientContact("");
    setClientAddress("");
    setItems([
      {
        productId: 0,
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        taxRate: effectiveTaxRate || 18,
        discount: 0,
      },
    ]);
    setPaymentTerms("");
    setNotes("");
    setGstin("");
    setCustomerGSTIN("");
    setCustomerStateCode("");
    setGstScheme("Regular");
    setLutBondReference("");
    setSezUnitDeveloper("");
    setCompositionLevy(0);
    setSupplierGstRegistered(true);
    setCustomerGstRegistered(true);
  };

  const handlePrint = (_invoice: any) => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      unpaid: "secondary",
      overdue: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getGstSchemeBadge = (scheme?: GSTScheme) => {
    if (!scheme || scheme === "Regular") return null;
    const colorMap: Record<GSTScheme, string> = {
      Regular: "",
      Composition:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      Export_WithPayment:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      Export_WithoutPayment:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      SEZ_WithPayment:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      SEZ_WithoutPayment:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      DeemedExport:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[scheme]}`}
      >
        {getSchemeLabel(scheme)}
      </span>
    );
  };

  const { subtotal, totalTax, totalDiscount, totalAmount } = calculateTotals();

  // Determine which tax section to show based on scheme
  const showStandardTax =
    !isIndianContext || gstScheme === "Regular" || gstScheme === "DeemedExport";
  const showCompositionLevy = isIndianContext && gstScheme === "Composition";
  const showZeroRatedNote =
    isIndianContext &&
    (gstScheme === "Export_WithPayment" ||
      gstScheme === "Export_WithoutPayment" ||
      gstScheme === "SEZ_WithPayment" ||
      gstScheme === "SEZ_WithoutPayment");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{t("nav.invoices")}</h2>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("invoices.createInvoice")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("invoices.createNewInvoice")}</DialogTitle>
              <DialogDescription>
                {t("invoices.nextInvoiceNumber")}:{" "}
                <strong>{nextInvoiceNumber}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Business Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("invoices.businessName")}</Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("invoices.businessContact")}</Label>
                  <Input
                    value={businessContact}
                    onChange={(e) => setBusinessContact(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("invoices.businessAddress")}</Label>
                <Input
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                />
              </div>
              {/* Supplier GST Registration toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="supplier-gst-switch"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Supplier is GST Registered
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Turn off for unregistered / composition exempt businesses
                  </p>
                </div>
                <Switch
                  id="supplier-gst-switch"
                  checked={supplierGstRegistered}
                  onCheckedChange={setSupplierGstRegistered}
                  data-ocid="invoice.supplier_gst_switch"
                />
              </div>

              {!supplierGstRegistered && (
                <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Tax Exempt invoice</strong> — no GST will be
                    charged. All line items will have 0% tax rate.
                  </p>
                </div>
              )}

              {supplierGstRegistered && (
                <div className="space-y-2">
                  <Label>{t("invoices.gstin")}</Label>
                  <Input
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              )}

              {/* ── Invoice Type / GST Scheme (India only) ── */}
              {isIndianContext && supplierGstRegistered && (
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">
                      Invoice Type / GST Scheme
                    </h3>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gst-scheme">GST Scheme</Label>
                    <Select
                      value={gstScheme}
                      onValueChange={(v) => setGstScheme(v as GSTScheme)}
                    >
                      <SelectTrigger id="gst-scheme">
                        <SelectValue placeholder="Select GST Scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        {GST_SCHEME_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{opt.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {opt.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Scheme-specific extra fields */}
                  {(gstScheme === "Export_WithPayment" ||
                    gstScheme === "Export_WithoutPayment") && (
                    <div className="space-y-2">
                      <Label htmlFor="lut-bond">
                        LUT / Bond Reference Number
                      </Label>
                      <Input
                        id="lut-bond"
                        value={lutBondReference}
                        onChange={(e) => setLutBondReference(e.target.value)}
                        placeholder="e.g. AD220123456789"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the Letter of Undertaking or Bond reference number
                        for zero-rated export supply.
                      </p>
                    </div>
                  )}

                  {(gstScheme === "SEZ_WithPayment" ||
                    gstScheme === "SEZ_WithoutPayment") && (
                    <div className="space-y-2">
                      <Label htmlFor="sez-unit">
                        SEZ Unit / Developer Name
                      </Label>
                      <Input
                        id="sez-unit"
                        value={sezUnitDeveloper}
                        onChange={(e) => setSezUnitDeveloper(e.target.value)}
                        placeholder="e.g. ABC SEZ Unit, SEEPZ"
                      />
                      <p className="text-xs text-muted-foreground">
                        Specify the SEZ unit or developer to whom the supply is
                        being made.
                      </p>
                    </div>
                  )}

                  {gstScheme === "Composition" && (
                    <div className="space-y-2">
                      <Label htmlFor="composition-levy">
                        Composition Levy Amount (₹)
                      </Label>
                      <Input
                        id="composition-levy"
                        type="number"
                        min={0}
                        value={compositionLevy}
                        onChange={(e) =>
                          setCompositionLevy(
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground">
                        Flat composition levy applicable. Individual
                        CGST/SGST/IGST lines are not shown.
                      </p>
                    </div>
                  )}

                  {gstScheme === "DeemedExport" && (
                    <div className="flex items-start gap-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
                      <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-green-700 dark:text-green-300">
                        <strong>Deemed Export:</strong> Full CGST/SGST/IGST
                        breakdown applies. The invoice will be marked as a
                        Deemed Export supply as per Section 147 of the CGST Act.
                      </p>
                    </div>
                  )}

                  {showZeroRatedNote && (
                    <div className="flex items-start gap-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Zero-Rated Supply:</strong> Tax rate has been
                        set to 0% for all line items. This is a zero-rated
                        supply under the IGST Act.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Client Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">
                  {t("invoices.clientDetails")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("invoices.clientName")}</Label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("invoices.clientContact")}</Label>
                    <Input
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  <Label>{t("invoices.clientAddress")}</Label>
                  <Input
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                  />
                </div>

                {/* Customer GST Registration toggle */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3 mt-3">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="customer-gst-switch"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Customer is GST Registered
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Turn off for B2C / unregistered customers
                    </p>
                  </div>
                  <Switch
                    id="customer-gst-switch"
                    checked={customerGstRegistered}
                    onCheckedChange={setCustomerGstRegistered}
                    data-ocid="invoice.customer_gst_switch"
                  />
                </div>

                {!customerGstRegistered && (
                  <p className="text-xs text-muted-foreground mt-1.5 ml-1 flex items-center gap-1">
                    <Info className="h-3.5 w-3.5" />
                    Unregistered customer — B2C supply.
                  </p>
                )}

                {customerGstRegistered && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label>{t("invoices.customerGSTIN")}</Label>
                      <Input
                        value={customerGSTIN}
                        onChange={(e) => setCustomerGSTIN(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("invoices.customerStateCode")}</Label>
                      <Input
                        value={customerStateCode}
                        onChange={(e) => setCustomerStateCode(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Line Items */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{t("invoices.items")}</h3>
                  <Button size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {items.map((item, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                  <div key={index} className="grid grid-cols-6 gap-2 mb-2">
                    <Input
                      placeholder={t("invoices.description")}
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder={t("invoices.quantity")}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          Number.parseFloat(e.target.value),
                        )
                      }
                    />
                    <Input
                      type="number"
                      placeholder={t("invoices.unitPrice")}
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "unitPrice",
                          Number.parseFloat(e.target.value),
                        )
                      }
                    />
                    <Input
                      type="number"
                      placeholder={t("invoices.taxRate")}
                      value={item.taxRate}
                      disabled={isIndianContext && isZeroRatedScheme(gstScheme)}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "taxRate",
                          Number.parseFloat(e.target.value),
                        )
                      }
                    />
                    <Input
                      type="number"
                      placeholder={t("invoices.discount")}
                      value={item.discount}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "discount",
                          Number.parseFloat(e.target.value),
                        )
                      }
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      {t("common.remove")}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Payment Terms & Notes */}
              <div className="space-y-2">
                <Label>{t("invoices.paymentTerms")}</Label>
                <Input
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("invoices.notes")}</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Totals Summary */}
              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{t("invoices.subtotal")}:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {!supplierGstRegistered ? (
                  <div className="flex justify-between text-sm text-amber-600 dark:text-amber-400">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Tax Exempt
                    </span>
                    <span>₹0.00</span>
                  </div>
                ) : (
                  <>
                    {showStandardTax && (
                      <div className="flex justify-between text-sm">
                        <span>
                          {t("invoices.tax")}
                          {isIndianContext && gstScheme === "DeemedExport" && (
                            <span className="ml-1 text-xs text-green-600 dark:text-green-400">
                              (Deemed Export)
                            </span>
                          )}
                          :
                        </span>
                        <span>₹{totalTax.toFixed(2)}</span>
                      </div>
                    )}

                    {showCompositionLevy && (
                      <div className="flex justify-between text-sm">
                        <span>Composition Levy:</span>
                        <span>₹{compositionLevy.toFixed(2)}</span>
                      </div>
                    )}

                    {showZeroRatedNote && (
                      <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
                        <span>Tax (Zero-Rated):</span>
                        <span>₹0.00</span>
                      </div>
                    )}
                  </>
                )}

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t("invoices.discount")}:</span>
                    <span>-₹{totalDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold border-t pt-1 mt-1">
                  <span>{t("invoices.total")}:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCreateInvoice}
                disabled={createInvoice.isPending}
                className="w-full"
              >
                {createInvoice.isPending
                  ? t("common.creating")
                  : t("invoices.createInvoice")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("invoices.allInvoices")}</CardTitle>
          <CardDescription>{t("invoices.manageInvoices")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("invoices.invoiceNumber")}</TableHead>
                <TableHead>{t("invoices.client")}</TableHead>
                <TableHead>{t("invoices.amount")}</TableHead>
                <TableHead>{t("invoices.status")}</TableHead>
                {isIndianContext && <TableHead>GST Scheme</TableHead>}
                <TableHead>{t("invoices.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>₹{invoice.totalAmount?.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  {isIndianContext && (
                    <TableCell>
                      {invoice.gstScheme ? (
                        getGstSchemeBadge(invoice.gstScheme)
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Regular
                        </span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrint(invoice)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
