import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Plus,
  Printer,
  Send,
  Settings,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { SiAdyen, SiPaypal, SiStripe } from "react-icons/si";
import { toast } from "sonner";

const MOCK_PENDING_PAYMENTS = [
  {
    id: "1",
    vendor: "Acme Corp",
    amount: 4500,
    dueDate: "2026-03-01",
    invoice: "INV-001",
  },
  {
    id: "2",
    vendor: "Tech Supplies Ltd",
    amount: 1200,
    dueDate: "2026-03-05",
    invoice: "INV-002",
  },
  {
    id: "3",
    vendor: "Office Depot",
    amount: 890,
    dueDate: "2026-03-10",
    invoice: "INV-003",
  },
  {
    id: "4",
    vendor: "Cloud Services Inc",
    amount: 2300,
    dueDate: "2026-03-15",
    invoice: "INV-004",
  },
];

const MOCK_BILLS = [
  { id: "1", vendor: "Acme Corp", amount: 4500, checkNumber: "1001" },
  { id: "2", vendor: "Tech Supplies Ltd", amount: 1200, checkNumber: "1002" },
  { id: "3", vendor: "Office Depot", amount: 890, checkNumber: "1003" },
];

export default function PaymentsTab() {
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [sepaForm, setSepaForm] = useState({
    iban: "",
    bic: "",
    amount: "",
    reference: "",
    date: "",
  });
  const [sepaTransfers, setSepaTransfers] = useState<(typeof sepaForm)[]>([]);

  const togglePayment = (id: string) => {
    setSelectedPayments((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleCheck = (id: string) => {
    setSelectedChecks((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleBatchReconcile = () => {
    if (selectedPayments.length === 0) {
      toast.error("Select at least one payment to reconcile");
      return;
    }
    toast.success(`${selectedPayments.length} payment(s) marked as reconciled`);
    setSelectedPayments([]);
  };

  const handleScheduleSEPA = () => {
    if (!sepaForm.iban || !sepaForm.amount) {
      toast.error("IBAN and amount are required");
      return;
    }
    setSepaTransfers((prev) => [...prev, sepaForm]);
    setSepaForm({ iban: "", bic: "", amount: "", reference: "", date: "" });
    toast.success("SEPA transfer scheduled");
  };

  const handlePrintChecks = () => {
    if (selectedChecks.length === 0) {
      toast.error("Select at least one check to print");
      return;
    }
    toast.success(`${selectedChecks.length} check(s) sent to printer`);
  };

  const totalSelected = MOCK_PENDING_PAYMENTS.filter((p) =>
    selectedPayments.includes(p.id),
  ).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payments</h2>
        <p className="text-muted-foreground">
          Manage payment gateways, batch payments, SEPA transfers, and check
          printing
        </p>
      </div>

      <Tabs defaultValue="gateways">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="batch">Batch Payments</TabsTrigger>
          <TabsTrigger value="sepa">SEPA Transfer</TabsTrigger>
          <TabsTrigger value="checks">Print Checks</TabsTrigger>
        </TabsList>

        {/* Payment Gateways */}
        <TabsContent value="gateways" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Stripe - Active */}
            <Card className="border-green-500/30 bg-green-50/30 dark:bg-green-950/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SiStripe className="h-6 w-6 text-[#635BFF]" />
                    <CardTitle className="text-base">Stripe</CardTitle>
                  </div>
                  <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                  </Badge>
                </div>
                <CardDescription>
                  Credit cards, debit cards, and more
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" className="w-full gap-2">
                  <Settings className="h-3.5 w-3.5" /> Configure Stripe
                </Button>
                <Button size="sm" variant="outline" className="w-full gap-2">
                  <DollarSign className="h-3.5 w-3.5" /> Process Payment
                </Button>
              </CardContent>
            </Card>

            {/* PayPal - Coming Soon */}
            <GatewayPlaceholder
              icon={<SiPaypal className="h-6 w-6 text-[#003087]" />}
              name="PayPal"
              desc="PayPal, Venmo, and Pay Later"
            />

            {/* Adyen - Coming Soon */}
            <GatewayPlaceholder
              icon={<SiAdyen className="h-6 w-6 text-[#0ABF53]" />}
              name="Adyen"
              desc="Global payment processing"
            />

            {/* Authorize.net - Coming Soon */}
            <GatewayPlaceholder
              icon={<CreditCard className="h-6 w-6 text-blue-600" />}
              name="Authorize.net"
              desc="Secure payment gateway"
            />

            {/* SEPA Direct Debit - Coming Soon */}
            <GatewayPlaceholder
              icon={<Send className="h-6 w-6 text-indigo-600" />}
              name="SEPA Direct Debit"
              desc="Automated EU bank payments"
            />

            {/* Alipay - Coming Soon */}
            <GatewayPlaceholder
              icon={<CreditCard className="h-6 w-6 text-blue-500" />}
              name="Alipay"
              desc="Chinese digital payments"
            />
          </div>
        </TabsContent>

        {/* Batch Payments */}
        <TabsContent value="batch" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Payments</CardTitle>
              <CardDescription>
                Select multiple payments to batch and reconcile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_PENDING_PAYMENTS.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30"
                >
                  <Checkbox
                    checked={selectedPayments.includes(payment.id)}
                    onCheckedChange={() => togglePayment(payment.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{payment.vendor}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.invoice} · Due {payment.dueDate}
                    </p>
                  </div>
                  <span className="font-semibold text-sm">
                    ${payment.amount.toLocaleString()}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {selectedPayments.length} selected
                  </p>
                  {selectedPayments.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Total: ${totalSelected.toLocaleString()}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleBatchReconcile}
                  disabled={selectedPayments.length === 0}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" /> Mark Reconciled
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEPA Credit Transfer */}
        <TabsContent value="sepa" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Schedule SEPA Credit Transfer
              </CardTitle>
              <CardDescription>
                Automate supplier payments throughout the SEPA zone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IBAN *</Label>
                  <Input
                    placeholder="DE89 3704 0044 0532 0130 00"
                    value={sepaForm.iban}
                    onChange={(e) =>
                      setSepaForm((p) => ({ ...p, iban: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>BIC/SWIFT</Label>
                  <Input
                    placeholder="COBADEFFXXX"
                    value={sepaForm.bic}
                    onChange={(e) =>
                      setSepaForm((p) => ({ ...p, bic: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (EUR) *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={sepaForm.amount}
                    onChange={(e) =>
                      setSepaForm((p) => ({ ...p, amount: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reference</Label>
                  <Input
                    placeholder="Invoice reference"
                    value={sepaForm.reference}
                    onChange={(e) =>
                      setSepaForm((p) => ({ ...p, reference: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Execution Date</Label>
                  <Input
                    type="date"
                    value={sepaForm.date}
                    onChange={(e) =>
                      setSepaForm((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>
              </div>
              <Button onClick={handleScheduleSEPA} className="gap-2">
                <Send className="h-4 w-4" /> Schedule Transfer
              </Button>
            </CardContent>
          </Card>

          {sepaTransfers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scheduled Transfers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sepaTransfers.map((t) => (
                  <div
                    key={t.iban}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="text-sm font-medium">{t.iban}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.reference || "No reference"} · {t.date || "No date"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">€{t.amount}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() =>
                          setSepaTransfers((prev) =>
                            prev.filter((entry) => entry.iban !== t.iban),
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Print Checks */}
        <TabsContent value="checks" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Print Checks</CardTitle>
              <CardDescription>
                Select supplier bills and print checks in batches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_BILLS.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50"
                >
                  <Checkbox
                    checked={selectedChecks.includes(bill.id)}
                    onCheckedChange={() => toggleCheck(bill.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{bill.vendor}</p>
                    <p className="text-xs text-muted-foreground">
                      Check #{bill.checkNumber}
                    </p>
                  </div>
                  <span className="font-semibold text-sm">
                    ${bill.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {selectedChecks.length} check(s) selected
                </p>
                <Button
                  onClick={handlePrintChecks}
                  disabled={selectedChecks.length === 0}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" /> Print Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GatewayPlaceholder({
  icon,
  name,
  desc,
}: { icon: React.ReactNode; name: string; desc: string }) {
  return (
    <Card className="opacity-70">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{name}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" /> Coming Soon
          </Badge>
        </div>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="sm" variant="outline" className="w-full" disabled>
          <AlertCircle className="h-3.5 w-3.5 mr-2" /> Not Available
        </Button>
      </CardContent>
    </Card>
  );
}
