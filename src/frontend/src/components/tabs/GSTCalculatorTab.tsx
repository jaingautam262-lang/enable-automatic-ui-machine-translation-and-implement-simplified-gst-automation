import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelectedTaxCountry } from "../../hooks/useSelectedTaxCountry";
import { useEffectiveTaxRate } from "../../hooks/useTaxSettings";
import { useI18n } from "../../i18n/useI18n";

export default function GSTCalculatorTab() {
  const { t } = useI18n();
  const { selectedCountry } = useSelectedTaxCountry();
  const { taxRate: effectiveTaxRate } = useEffectiveTaxRate(selectedCountry);

  const [scheme, setScheme] = useState<"regular" | "composition">("regular");
  const [amount, setAmount] = useState("");
  const [gstRate, setGstRate] = useState(effectiveTaxRate?.toString() || "18");
  const [compositionRate, setCompositionRate] = useState("1");

  // Update GST rate when effective rate changes
  useEffect(() => {
    if (effectiveTaxRate) {
      setGstRate(effectiveTaxRate.toString());
    }
  }, [effectiveTaxRate]);

  const calculateRegularGST = () => {
    const baseAmount = Number.parseFloat(amount) || 0;
    const rate = Number.parseFloat(gstRate) || 0;
    const gstAmount = (baseAmount * rate) / 100;
    const totalAmount = baseAmount + gstAmount;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;

    return { baseAmount, gstAmount, totalAmount, cgst, sgst, rate };
  };

  const calculateCompositionGST = () => {
    const turnover = Number.parseFloat(amount) || 0;
    const rate = Number.parseFloat(compositionRate) || 0;
    const gstPayable = (turnover * rate) / 100;

    return { turnover, rate, gstPayable };
  };

  const regularResult = calculateRegularGST();
  const compositionResult = calculateCompositionGST();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6" />
        <h2 className="text-2xl font-bold">{t("gstCalculator.title")}</h2>
      </div>

      <Tabs
        value={scheme}
        onValueChange={(v) => setScheme(v as "regular" | "composition")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="regular">
            {t("gstCalculator.regularScheme")}
          </TabsTrigger>
          <TabsTrigger value="composition">
            {t("gstCalculator.compositionScheme")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regular">
          <Card>
            <CardHeader>
              <CardTitle>{t("gstCalculator.regularScheme")}</CardTitle>
              <CardDescription>
                {t("gstCalculator.regularDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">{t("gstCalculator.baseAmount")}</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstRate">{t("gstCalculator.gstRate")}</Label>
                <Input
                  id="gstRate"
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  placeholder="18"
                />
                <p className="text-xs text-muted-foreground">
                  {t("gstCalculator.defaultRateNote")}
                </p>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">
                    {t("gstCalculator.baseAmount")}:
                  </span>
                  <span className="font-medium">
                    ₹{regularResult.baseAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">
                    {t("gstCalculator.cgst")} (
                    {(regularResult.rate / 2).toFixed(2)}%):
                  </span>
                  <span className="font-medium">
                    ₹{regularResult.cgst.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">
                    {t("gstCalculator.sgst")} (
                    {(regularResult.rate / 2).toFixed(2)}%):
                  </span>
                  <span className="font-medium">
                    ₹{regularResult.sgst.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">
                    {t("gstCalculator.totalGST")}:
                  </span>
                  <span className="font-medium">
                    ₹{regularResult.gstAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>{t("gstCalculator.totalAmount")}:</span>
                  <span>₹{regularResult.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md space-y-2">
                <h4 className="font-semibold text-sm">
                  {t("gstCalculator.regularFeatures")}
                </h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>{t("gstCalculator.regularFeature1")}</li>
                  <li>{t("gstCalculator.regularFeature2")}</li>
                  <li>{t("gstCalculator.regularFeature3")}</li>
                  <li>{t("gstCalculator.regularFeature4")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="composition">
          <Card>
            <CardHeader>
              <CardTitle>{t("gstCalculator.compositionScheme")}</CardTitle>
              <CardDescription>
                {t("gstCalculator.compositionDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="turnover">
                  {t("gstCalculator.annualTurnover")}
                </Label>
                <Input
                  id="turnover"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compositionRate">
                  {t("gstCalculator.compositionRate")}
                </Label>
                <Input
                  id="compositionRate"
                  type="number"
                  value={compositionRate}
                  onChange={(e) => setCompositionRate(e.target.value)}
                  placeholder="1"
                />
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">
                    {t("gstCalculator.annualTurnover")}:
                  </span>
                  <span className="font-medium">
                    ₹{compositionResult.turnover.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">
                    {t("gstCalculator.compositionRate")}:
                  </span>
                  <span className="font-medium">{compositionResult.rate}%</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>{t("gstCalculator.gstPayable")}:</span>
                  <span>₹{compositionResult.gstPayable.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md space-y-2">
                <h4 className="font-semibold text-sm">
                  {t("gstCalculator.compositionFeatures")}
                </h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>{t("gstCalculator.compositionFeature1")}</li>
                  <li>{t("gstCalculator.compositionFeature2")}</li>
                  <li>{t("gstCalculator.compositionFeature3")}</li>
                  <li>{t("gstCalculator.compositionFeature4")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
