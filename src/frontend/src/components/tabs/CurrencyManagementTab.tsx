import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Globe2,
  RefreshCw,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  previousRate: number;
  isBase: boolean;
}

const INITIAL_CURRENCIES: Currency[] = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    rate: 1.0,
    previousRate: 1.0,
    isBase: true,
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    rate: 0.9234,
    previousRate: 0.918,
    isBase: false,
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    rate: 0.7891,
    previousRate: 0.785,
    isBase: false,
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    rate: 149.82,
    previousRate: 148.5,
    isBase: false,
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "CA$",
    rate: 1.3621,
    previousRate: 1.358,
    isBase: false,
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    rate: 1.5234,
    previousRate: 1.519,
    isBase: false,
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    symbol: "Fr",
    rate: 0.8912,
    previousRate: 0.889,
    isBase: false,
  },
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    rate: 83.12,
    previousRate: 82.95,
    isBase: false,
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    rate: 7.2341,
    previousRate: 7.21,
    isBase: false,
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    rate: 4.9823,
    previousRate: 4.965,
    isBase: false,
  },
  {
    code: "MXN",
    name: "Mexican Peso",
    symbol: "MX$",
    rate: 17.1234,
    previousRate: 17.08,
    isBase: false,
  },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    rate: 1.3412,
    previousRate: 1.338,
    isBase: false,
  },
];

function formatRate(rate: number, code: string): string {
  if (code === "JPY" || code === "INR" || code === "CNY" || code === "MXN") {
    return rate.toFixed(2);
  }
  return rate.toFixed(4);
}

export default function CurrencyManagementTab() {
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [convertAmount, setConvertAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));

    setCurrencies((prev) =>
      prev.map((c) => {
        if (c.isBase) return c;
        // Simulate ±2% variation
        const variation = (Math.random() - 0.5) * 0.04;
        const newRate = c.rate * (1 + variation);
        return {
          ...c,
          previousRate: c.rate,
          rate: Number.parseFloat(newRate.toFixed(4)),
        };
      }),
    );

    setIsRefreshing(false);
    toast.success("Exchange rates updated successfully");
  };

  const handleSaveRate = (code: string) => {
    const newRate = Number.parseFloat(editValue);
    if (Number.isNaN(newRate) || newRate <= 0) {
      toast.error("Invalid rate");
      return;
    }
    setCurrencies((prev) =>
      prev.map((c) =>
        c.code === code ? { ...c, previousRate: c.rate, rate: newRate } : c,
      ),
    );
    setEditingRate(null);
    toast.success(`Rate for ${code} updated`);
  };

  const convertedAmount = () => {
    const from = currencies.find((c) => c.code === fromCurrency);
    const to = currencies.find((c) => c.code === toCurrency);
    if (!from || !to) return 0;
    const inBase = Number.parseFloat(convertAmount) / from.rate;
    return (inBase * to.rate).toFixed(2);
  };

  const baseCurrency = currencies.find((c) => c.isBase);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Currency Management</h2>
        <p className="text-muted-foreground">
          Manage exchange rates with daily updates and multi-currency support
        </p>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Supported Currencies
              </p>
              <p className="text-xl font-bold">{currencies.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Base Currency</p>
              <p className="text-xl font-bold">
                {baseCurrency?.code} ({baseCurrency?.symbol})
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm font-bold">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exchange Rates Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Exchange Rates</CardTitle>
                  <CardDescription>
                    Rates relative to {baseCurrency?.code} ({baseCurrency?.name}
                    )
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={handleRefreshRates}
                  disabled={isRefreshing}
                  className="gap-1.5"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {isRefreshing ? "Updating..." : "Refresh Rates"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map((currency) => {
                    const change = currency.isBase
                      ? 0
                      : ((currency.rate - currency.previousRate) /
                          currency.previousRate) *
                        100;
                    const isUp = change > 0;
                    return (
                      <TableRow key={currency.code}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{currency.symbol}</span>
                            <div>
                              <p className="text-sm font-medium">
                                {currency.name}
                              </p>
                              {currency.isBase && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  Base
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm font-semibold">
                            {currency.code}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {editingRate === currency.code ? (
                            <div className="flex items-center gap-1 justify-end">
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-7 w-24 text-xs text-right"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleSaveRate(currency.code);
                                  if (e.key === "Escape") setEditingRate(null);
                                }}
                              />
                              <Button
                                size="sm"
                                className="h-7 text-xs px-2"
                                onClick={() => handleSaveRate(currency.code)}
                              >
                                ✓
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="font-mono text-sm cursor-pointer hover:text-primary bg-transparent border-none p-0"
                              onClick={() => {
                                if (!currency.isBase) {
                                  setEditingRate(currency.code);
                                  setEditValue(String(currency.rate));
                                }
                              }}
                            >
                              {currency.isBase
                                ? "1.0000"
                                : formatRate(currency.rate, currency.code)}
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!currency.isBase && (
                            <div
                              className={`flex items-center justify-end gap-1 text-xs font-medium ${isUp ? "text-green-600" : "text-red-600"}`}
                            >
                              {isUp ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {Math.abs(change).toFixed(2)}%
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {!currency.isBase && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs"
                              onClick={() => {
                                setEditingRate(currency.code);
                                setEditValue(String(currency.rate));
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Currency Converter */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Currency Converter</CardTitle>
              <CardDescription>
                Convert amounts between currencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="convert-amount"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Amount
                </Label>
                <Input
                  id="convert-amount"
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="from-currency"
                  className="text-xs font-medium text-muted-foreground"
                >
                  From
                </Label>
                <select
                  id="from-currency"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    const tmp = fromCurrency;
                    setFromCurrency(toCurrency);
                    setToCurrency(tmp);
                  }}
                >
                  ⇅
                </Button>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="to-currency"
                  className="text-xs font-medium text-muted-foreground"
                >
                  To
                </Label>
                <select
                  id="to-currency"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Separator />

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {convertAmount} {fromCurrency} =
                </p>
                <p className="text-2xl font-bold text-primary">
                  {convertedAmount()} {toCurrency}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  1 {fromCurrency} = {(() => {
                    const from = currencies.find(
                      (c) => c.code === fromCurrency,
                    );
                    const to = currencies.find((c) => c.code === toCurrency);
                    if (!from || !to) return "—";
                    return (to.rate / from.rate).toFixed(4);
                  })()} {toCurrency}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Base Currency Equivalents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currencies
                .filter((c) => !c.isBase)
                .slice(0, 5)
                .map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{c.code}</span>
                    <span className="font-mono font-medium">
                      1 {baseCurrency?.code} = {formatRate(c.rate, c.code)}{" "}
                      {c.code}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
