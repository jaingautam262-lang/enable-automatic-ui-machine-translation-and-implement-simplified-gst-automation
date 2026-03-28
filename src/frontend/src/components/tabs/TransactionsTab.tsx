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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, DollarSign, Edit, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddTransaction,
  useCreateJournalEntryFromTransaction,
  useGetAllTransactions,
  useUpdateTransaction,
} from "../../hooks/useQueries";
import { useI18n } from "../../i18n/useI18n";
import { formatDate, formatINR } from "../../lib/formatters";
import { TransactionType } from "../../types";
import { VoiceInput } from "../VoiceInput";

export default function TransactionsTab() {
  const { t } = useI18n();
  const { data: transactions = [], isLoading } = useGetAllTransactions();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const createJournalEntry = useCreateJournalEntryFromTransaction();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const [formData, setFormData] = useState({
    transactionType: "" as TransactionType | "",
    category: "",
    amount: "",
    description: "",
    associatedParty: "",
    isCash: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.transactionType ||
      !formData.category ||
      !formData.amount ||
      !formData.description
    ) {
      toast.error(t("Please fill in all required fields"));
      return;
    }

    const amount = Number.parseFloat(formData.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error(t("Please enter a valid amount"));
      return;
    }

    try {
      await addTransaction.mutateAsync({
        transactionType: formData.transactionType,
        category: formData.category,
        amount,
        description: formData.description,
        associatedParty: formData.associatedParty || null,
        isCash: formData.isCash,
        referenceId: null,
      });

      toast.success(t("Transaction added successfully"));
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(t("Failed to add transaction"));
      console.error(error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedTransaction ||
      !formData.category ||
      !formData.amount ||
      !formData.description
    ) {
      toast.error(t("Please fill in all required fields"));
      return;
    }

    const amount = Number.parseFloat(formData.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error(t("Please enter a valid amount"));
      return;
    }

    try {
      await updateTransaction.mutateAsync({
        id: selectedTransaction.id,
        transactionType: selectedTransaction.transactionType,
        date: selectedTransaction.date,
        category: formData.category,
        amount,
        description: formData.description,
        associatedParty: formData.associatedParty || null,
        isCash: formData.isCash,
        referenceId: selectedTransaction.referenceId || null,
      });

      toast.success(
        t(
          "Transaction updated successfully. Journal entry and ledger updated automatically.",
        ),
      );
      setIsEditDialogOpen(false);
      setSelectedTransaction(null);
      resetForm();
    } catch (error) {
      toast.error(t("Failed to update transaction"));
      console.error(error);
    }
  };

  const handleCreateJournalEntry = async (transaction: any) => {
    if (transaction.referenceId) {
      toast.error(t("Journal entry already exists for this transaction"));
      return;
    }

    try {
      await createJournalEntry.mutateAsync(transaction.id);
      toast.success(
        t(
          "Journal entry created from transaction. Ledger and trial balance updated.",
        ),
      );
    } catch (error: any) {
      toast.error(error.message || t("Failed to create journal entry"));
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      transactionType: "",
      category: "",
      amount: "",
      description: "",
      associatedParty: "",
      isCash: false,
    });
  };

  const openEditDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setFormData({
      transactionType: transaction.transactionType,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
      associatedParty: transaction.associatedParty || "",
      isCash: transaction.isCash,
    });
    setIsEditDialogOpen(true);
  };

  const getTransactionTypeBadge = (type: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "outline" | "destructive"
    > = {
      sale: "default",
      purchase: "secondary",
      income: "outline",
      expense: "destructive",
      cash: "default",
    };
    return (
      <Badge variant={variants[type] || "outline"}>{type.toUpperCase()}</Badge>
    );
  };

  // Sort by date descending using bigint-safe comparison
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("Transactions")}
          </h2>
          <p className="text-muted-foreground">
            {t(
              "Record and manage all business transactions with journal entry creation",
            )}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              {t("Add Transaction")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Add New Transaction")}</DialogTitle>
              <DialogDescription>
                {t(
                  "Record a new business transaction with voice input support",
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactionType">
                  {t("Transaction Type")} *
                </Label>
                <Select
                  value={formData.transactionType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      transactionType: value as TransactionType,
                    })
                  }
                >
                  <SelectTrigger id="transactionType">
                    <SelectValue placeholder={t("Select type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TransactionType.Sale}>
                      {t("Sale")}
                    </SelectItem>
                    <SelectItem value={TransactionType.Purchase}>
                      {t("Purchase")}
                    </SelectItem>
                    <SelectItem value={TransactionType.Income}>
                      {t("Other Income")}
                    </SelectItem>
                    <SelectItem value={TransactionType.Expense}>
                      {t("Expense")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t("Category")} *</Label>
                <div className="flex gap-2">
                  <Input
                    id="category"
                    placeholder={t("e.g., Office Supplies")}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                    className="flex-1"
                  />
                  <VoiceInput
                    onTranscript={(text) =>
                      setFormData({ ...formData, category: text })
                    }
                    size="icon"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t("Amount")} (₹) *</Label>
                <div className="flex gap-2">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                    className="flex-1"
                  />
                  <VoiceInput
                    onTranscript={(text) =>
                      setFormData({
                        ...formData,
                        amount: text.replace(/[^0-9.]/g, ""),
                      })
                    }
                    size="icon"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("Description")} *</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="description"
                    placeholder={t("Transaction details")}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    className="flex-1"
                  />
                  <VoiceInput
                    onTranscript={(text) =>
                      setFormData({ ...formData, description: text })
                    }
                    size="icon"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="associatedParty">
                  {t("Associated Party")} ({t("Optional")})
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="associatedParty"
                    placeholder={t("Customer or Supplier name")}
                    value={formData.associatedParty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        associatedParty: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  <VoiceInput
                    onTranscript={(text) =>
                      setFormData({ ...formData, associatedParty: text })
                    }
                    size="icon"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCash"
                  checked={formData.isCash}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isCash: checked as boolean })
                  }
                />
                <label htmlFor="isCash" className="text-sm cursor-pointer">
                  {t("Cash Transaction")}
                </label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("Cancel")}
                </Button>
                <Button type="submit" disabled={addTransaction.isPending}>
                  {addTransaction.isPending
                    ? t("Adding...")
                    : t("Add Transaction")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Transaction History")}</CardTitle>
          <CardDescription>
            {t(
              "All recorded transactions with edit support and journal entry creation",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("Loading transactions...")}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {t("No transactions yet")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("Add your first transaction to get started")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Date")}</TableHead>
                    <TableHead>{t("Type")}</TableHead>
                    <TableHead>{t("Category")}</TableHead>
                    <TableHead>{t("Description")}</TableHead>
                    <TableHead>{t("Party")}</TableHead>
                    <TableHead className="text-right">{t("Amount")}</TableHead>
                    <TableHead>{t("Payment")}</TableHead>
                    <TableHead>{t("Journal")}</TableHead>
                    <TableHead>{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id.toString()}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        {getTransactionTypeBadge(transaction.transactionType)}
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        {transaction.associatedParty || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatINR(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.isCash ? "default" : "secondary"}
                        >
                          {transaction.isCash ? t("Cash") : t("Non-Cash")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.referenceId ? (
                          <Badge variant="outline">{t("Linked")}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(transaction)}
                            title={t("Edit Transaction")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleCreateJournalEntry(transaction)
                            }
                            title={t("Create Journal Entry")}
                            disabled={
                              createJournalEntry.isPending ||
                              !!transaction.referenceId
                            }
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Edit Transaction")}</DialogTitle>
            <DialogDescription>
              {t(
                "Update transaction details. Journal entry and ledger will be updated automatically.",
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">{t("Category")} *</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-category"
                  placeholder={t("e.g., Office Supplies")}
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                  className="flex-1"
                />
                <VoiceInput
                  onTranscript={(text) =>
                    setFormData({ ...formData, category: text })
                  }
                  size="icon"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount">{t("Amount")} (₹) *</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  className="flex-1"
                />
                <VoiceInput
                  onTranscript={(text) =>
                    setFormData({
                      ...formData,
                      amount: text.replace(/[^0-9.]/g, ""),
                    })
                  }
                  size="icon"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">{t("Description")} *</Label>
              <div className="flex gap-2">
                <Textarea
                  id="edit-description"
                  placeholder={t("Transaction details")}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  className="flex-1"
                />
                <VoiceInput
                  onTranscript={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  size="icon"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-associatedParty">
                {t("Associated Party")} ({t("Optional")})
              </Label>
              <div className="flex gap-2">
                <Input
                  id="edit-associatedParty"
                  placeholder={t("Customer or Supplier name")}
                  value={formData.associatedParty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      associatedParty: e.target.value,
                    })
                  }
                  className="flex-1"
                />
                <VoiceInput
                  onTranscript={(text) =>
                    setFormData({ ...formData, associatedParty: text })
                  }
                  size="icon"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isCash"
                checked={formData.isCash}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isCash: checked as boolean })
                }
              />
              <label htmlFor="edit-isCash" className="text-sm cursor-pointer">
                {t("Cash Transaction")}
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                {t("Cancel")}
              </Button>
              <Button type="submit" disabled={updateTransaction.isPending}>
                {updateTransaction.isPending
                  ? t("Updating...")
                  : t("Update Transaction")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
