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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBusinessGSTSettings } from "../../hooks/useBusinessGSTSettings";
import { usePurchaseInvoices } from "../../hooks/usePurchaseInvoices";
import { useSelectedTaxCountry } from "../../hooks/useSelectedTaxCountry";
import { useEffectiveTaxRate } from "../../hooks/useTaxSettings";
import { useI18n } from "../../i18n/useI18n";
import type {
  GSTPurchaseInvoice,
  GSTPurchaseInvoiceItem,
  VendorType,
} from "../../types/gst-purchase";

export default function GSTPurchaseInvoicesTab() {
  const { t } = useI18n();
  const { invoices, createInvoice, deleteInvoice } = usePurchaseInvoices();
  const { businessStateCode } = useBusinessGSTSettings();

  const { selectedCountry } = useSelectedTaxCountry();
  const { taxRate: effectiveTaxRate } = useEffectiveTaxRate(selectedCountry);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [vendorGSTIN, setVendorGSTIN] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorType, setVendorType] = useState<VendorType>("Normal");
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState("");
  const [supplierInvoiceDate, setSupplierInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [items, setItems] = useState<GSTPurchaseInvoiceItem[]>([
    {
      description: "",
      hsnSacCode: "",
      quantity: 1,
      rate: 0,
      taxableValue: 0,
      gstRate: effectiveTaxRate || 18,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
      itcEligibility: "eligible",
    },
  ]);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [paymentMode, setPaymentMode] = useState<"cash" | "credit" | "online">(
    "credit",
  );
  const [reverseCharge, setReverseCharge] = useState(false);

  // Update initial item GST rate when effective rate changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: items dependency intentionally omitted to avoid loop
  useEffect(() => {
    if (effectiveTaxRate && items.length === 1 && items[0].description === "") {
      setItems([{ ...items[0], gstRate: effectiveTaxRate }]);
    }
  }, [effectiveTaxRate]);

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        hsnSacCode: "",
        quantity: 1,
        rate: 0,
        taxableValue: 0,
        gstRate: effectiveTaxRate || 18,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 0,
        itcEligibility: "eligible",
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof GSTPurchaseInvoiceItem,
    value: any,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    const item = newItems[index];
    item.taxableValue = item.quantity * item.rate;

    const vendorStateCode = vendorGSTIN.substring(0, 2);
    const isInterState = businessStateCode !== vendorStateCode;

    if (isInterState) {
      item.igst = (item.taxableValue * item.gstRate) / 100;
      item.cgst = 0;
      item.sgst = 0;
    } else {
      item.cgst = (item.taxableValue * item.gstRate) / 200;
      item.sgst = (item.taxableValue * item.gstRate) / 200;
      item.igst = 0;
    }

    item.total = item.taxableValue + item.cgst + item.sgst + item.igst;

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.taxableValue, 0);
    const totalCGST = items.reduce((sum, item) => sum + item.cgst, 0);
    const totalSGST = items.reduce((sum, item) => sum + item.sgst, 0);
    const totalIGST = items.reduce((sum, item) => sum + item.igst, 0);
    const totalGST = totalCGST + totalSGST + totalIGST;
    const grandTotal = subtotal + totalGST + additionalCharges;

    return { subtotal, totalCGST, totalSGST, totalIGST, totalGST, grandTotal };
  };

  const handleCreateInvoice = () => {
    if (!vendorName || !vendorGSTIN || !supplierInvoiceNumber) {
      toast.error(t("gstPurchase.fillRequiredFields"));
      return;
    }

    const totals = calculateTotals();
    const vendorStateCode = vendorGSTIN.substring(0, 2);

    const invoice: Omit<GSTPurchaseInvoice, "id" | "createdAt"> = {
      vendorName,
      vendorGSTIN,
      vendorAddress,
      vendorStateCode,
      vendorType,
      supplierInvoiceNumber,
      supplierInvoiceDate: BigInt(new Date(supplierInvoiceDate).getTime()),
      items,
      subtotal: totals.subtotal,
      totalCGST: totals.totalCGST,
      totalSGST: totals.totalSGST,
      totalIGST: totals.totalIGST,
      totalGST: totals.totalGST,
      additionalCharges,
      grandTotal: totals.grandTotal,
      paymentMode,
      reverseCharge,
    };

    createInvoice(invoice);
    toast.success(t("gstPurchase.invoiceCreated"));
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setVendorName("");
    setVendorGSTIN("");
    setVendorAddress("");
    setVendorType("Normal");
    setSupplierInvoiceNumber("");
    setSupplierInvoiceDate(new Date().toISOString().split("T")[0]);
    setItems([
      {
        description: "",
        hsnSacCode: "",
        quantity: 1,
        rate: 0,
        taxableValue: 0,
        gstRate: effectiveTaxRate || 18,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 0,
        itcEligibility: "eligible",
      },
    ]);
    setAdditionalCharges(0);
    setPaymentMode("credit");
    setReverseCharge(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{t("gstPurchase.title")}</h2>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("gstPurchase.createInvoice")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("gstPurchase.createNewInvoice")}</DialogTitle>
              <DialogDescription>
                {t("gstPurchase.enterDetails")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("gstPurchase.vendorName")}</Label>
                  <Input
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("gstPurchase.vendorGSTIN")}</Label>
                  <Input
                    value={vendorGSTIN}
                    onChange={(e) => setVendorGSTIN(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("gstPurchase.vendorAddress")}</Label>
                <Input
                  value={vendorAddress}
                  onChange={(e) => setVendorAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("gstPurchase.vendorType")}</Label>
                <Select
                  value={vendorType}
                  onValueChange={(value) => setVendorType(value as VendorType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">
                      {t("gstPurchase.normal")}
                    </SelectItem>
                    <SelectItem value="Composition">
                      {t("gstPurchase.composition")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("gstPurchase.invoiceNumber")}</Label>
                  <Input
                    value={supplierInvoiceNumber}
                    onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("gstPurchase.invoiceDate")}</Label>
                  <Input
                    type="date"
                    value={supplierInvoiceDate}
                    onChange={(e) => setSupplierInvoiceDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{t("gstPurchase.items")}</h3>
                  <Button size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {items.map((item, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                  <div key={index} className="grid grid-cols-7 gap-2 mb-2">
                    <Input
                      placeholder={t("gstPurchase.description")}
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                    />
                    <Input
                      placeholder={t("gstPurchase.hsnCode")}
                      value={item.hsnSacCode}
                      onChange={(e) =>
                        updateItem(index, "hsnSacCode", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder={t("gstPurchase.quantity")}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                    <Input
                      type="number"
                      placeholder={t("gstPurchase.rate")}
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "rate",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                    <Input
                      type="number"
                      placeholder={t("gstPurchase.gstRate")}
                      value={item.gstRate}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "gstRate",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                    <Select
                      value={item.itcEligibility}
                      onValueChange={(value) =>
                        updateItem(index, "itcEligibility", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eligible">
                          {t("gstPurchase.eligible")}
                        </SelectItem>
                        <SelectItem value="ineligible">
                          {t("gstPurchase.ineligible")}
                        </SelectItem>
                        <SelectItem value="blocked">
                          {t("gstPurchase.blocked")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>{t("gstPurchase.additionalCharges")}</Label>
                <Input
                  type="number"
                  value={additionalCharges}
                  onChange={(e) =>
                    setAdditionalCharges(Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("gstPurchase.paymentMode")}</Label>
                  <Select
                    value={paymentMode}
                    onValueChange={(value) =>
                      setPaymentMode(value as "cash" | "credit" | "online")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        {t("gstPurchase.cash")}
                      </SelectItem>
                      <SelectItem value="credit">
                        {t("gstPurchase.credit")}
                      </SelectItem>
                      <SelectItem value="online">
                        {t("gstPurchase.online")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    id="reverseCharge"
                    checked={reverseCharge}
                    onChange={(e) => setReverseCharge(e.target.checked)}
                  />
                  <Label htmlFor="reverseCharge">
                    {t("gstPurchase.reverseCharge")}
                  </Label>
                </div>
              </div>

              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{t("gstPurchase.subtotal")}:</span>
                  <span>₹{calculateTotals().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t("gstPurchase.totalGST")}:</span>
                  <span>₹{calculateTotals().totalGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>{t("gstPurchase.grandTotal")}:</span>
                  <span>₹{calculateTotals().grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleCreateInvoice} className="w-full">
                {t("gstPurchase.createInvoice")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("gstPurchase.allInvoices")}</CardTitle>
          <CardDescription>{t("gstPurchase.manageInvoices")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("gstPurchase.invoiceNumber")}</TableHead>
                <TableHead>{t("gstPurchase.vendor")}</TableHead>
                <TableHead>{t("gstPurchase.date")}</TableHead>
                <TableHead>{t("gstPurchase.amount")}</TableHead>
                <TableHead>{t("gstPurchase.gstType")}</TableHead>
                <TableHead>{t("gstPurchase.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const isInterState =
                  businessStateCode !== invoice.vendorStateCode;
                const gstType = isInterState ? "IGST" : "CGST+SGST";

                return (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.supplierInvoiceNumber}</TableCell>
                    <TableCell>{invoice.vendorName}</TableCell>
                    <TableCell>
                      {new Date(
                        Number(invoice.supplierInvoiceDate),
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>₹{invoice.grandTotal.toFixed(2)}</TableCell>
                    <TableCell>{gstType}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          deleteInvoice(invoice.id);
                          toast.success(t("gstPurchase.invoiceDeleted"));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
