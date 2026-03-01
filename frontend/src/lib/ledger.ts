import { JournalEntry } from '../types';

export interface LedgerAccountBalance {
  accountName: string;
  balance: number;
}

export function computeLedgerBalances(journalEntries: JournalEntry[]): Record<string, number> {
  const balances: Record<string, number> = {};

  for (const entry of journalEntries) {
    for (const line of entry.entries) {
      if (!balances[line.accountName]) {
        balances[line.accountName] = 0;
      }
      // Debit increases asset/expense accounts, credit increases liability/income accounts
      balances[line.accountName] += line.debit - line.credit;
    }
  }

  return balances;
}

export function computeTrialBalance(ledgerBalances: Record<string, number>): {
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
} {
  let totalDebit = 0;
  let totalCredit = 0;

  for (const balance of Object.values(ledgerBalances)) {
    if (balance >= 0) {
      totalDebit += balance;
    } else {
      totalCredit += Math.abs(balance);
    }
  }

  // Allow small floating point tolerance
  const tolerance = 0.01;
  const isBalanced = Math.abs(totalDebit - totalCredit) < tolerance;

  return {
    totalDebit,
    totalCredit,
    isBalanced,
  };
}
