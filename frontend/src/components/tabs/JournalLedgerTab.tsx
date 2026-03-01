import { useGetJournalEntries, useGetAllTransactions } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, TrendingUp, Activity, Filter } from 'lucide-react';
import { formatINR, formatDate } from '../../lib/formatters';
import { computeLedgerBalances, computeTrialBalance } from '../../lib/ledger';
import { useI18n } from '../../i18n/useI18n';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';

type TimelineEventType = 'journal' | 'transaction' | 'activity';

interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: bigint;
  description: string;
  amount?: number;
  category?: string;
  details?: any;
}

export default function JournalLedgerTab() {
  const { t } = useI18n();
  const { data: journalEntries = [], isLoading: isLoadingJournal } = useGetJournalEntries();
  const { data: transactions = [], isLoading: isLoadingTransactions } = useGetAllTransactions();
  const [filterType, setFilterType] = useState<TimelineEventType | 'all'>('all');

  const ledgerBalances = computeLedgerBalances(journalEntries);
  const trialBalance = computeTrialBalance(ledgerBalances);

  // Build unified timeline
  const timeline = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Add journal entries
    journalEntries.forEach((entry) => {
      events.push({
        id: `journal-${entry.id}`,
        type: 'journal',
        date: entry.date,
        description: entry.description,
        details: entry,
      });
    });

    // Add transactions
    transactions.forEach((tx) => {
      events.push({
        id: `transaction-${tx.id}`,
        type: 'transaction',
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        category: tx.category,
        details: tx,
      });
    });

    // Sort by date (newest first)
    return events.sort((a, b) => {
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;
      return 0;
    });
  }, [journalEntries, transactions]);

  const filteredTimeline = useMemo(() => {
    if (filterType === 'all') return timeline;
    return timeline.filter((event) => event.type === filterType);
  }, [timeline, filterType]);

  const sortedJournalEntries = [...journalEntries].sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });

  const isLoading = isLoadingJournal || isLoadingTransactions;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('Journal & Ledger')}</h2>
        <p className="text-muted-foreground">{t('Double-entry bookkeeping with unified activity timeline')}</p>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">
            <Activity className="h-4 w-4 mr-2" />
            Unified Timeline
          </TabsTrigger>
          <TabsTrigger value="journal">
            <BookOpen className="h-4 w-4 mr-2" />
            {t('Journal Entries')}
          </TabsTrigger>
          <TabsTrigger value="trial">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t('Trial Balance')}
          </TabsTrigger>
        </TabsList>

        {/* Unified Timeline */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity & Transaction Ledger
                  </CardTitle>
                  <CardDescription>All user activities and financial transactions in chronological order</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    <Button
                      variant={filterType === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterType === 'transaction' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('transaction')}
                    >
                      Transactions
                    </Button>
                    <Button
                      variant={filterType === 'journal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('journal')}
                    >
                      Journal
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading timeline...</div>
              ) : filteredTimeline.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No activity yet</p>
                  <p className="text-sm text-muted-foreground">Create transactions to see activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTimeline.map((event) => (
                    <Card key={event.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={event.type === 'transaction' ? 'default' : 'secondary'}>
                                {event.type === 'transaction' ? 'Transaction' : 'Journal Entry'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                            </div>
                            <p className="font-medium">{event.description}</p>
                            {event.category && (
                              <p className="text-sm text-muted-foreground mt-1">Category: {event.category}</p>
                            )}
                          </div>
                          {event.amount !== undefined && (
                            <div className="text-right">
                              <p className="font-bold text-lg">{formatINR(event.amount)}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journal Entries */}
        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t('Journal Entries')}
              </CardTitle>
              <CardDescription>{t('All journal entries with debit and credit details')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJournal ? (
                <div className="text-center py-8 text-muted-foreground">{t('Loading journal entries...')}</div>
              ) : journalEntries.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">{t('No journal entries yet')}</p>
                  <p className="text-sm text-muted-foreground">{t('Create transactions to generate journal entries')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedJournalEntries.map((entry) => (
                    <Card key={entry.id.toString()} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{entry.description}</CardTitle>
                            <CardDescription>{formatDate(entry.date)}</CardDescription>
                          </div>
                          {entry.associatedTransactionId && (
                            <Badge variant="outline">{t('Linked to Transaction')}</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('Account')}</TableHead>
                              <TableHead className="text-right">{t('Debit')}</TableHead>
                              <TableHead className="text-right">{t('Credit')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {entry.entries.map((line, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{line.accountName}</TableCell>
                                <TableCell className="text-right">
                                  {line.debit > 0 ? formatINR(line.debit) : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                  {line.credit > 0 ? formatINR(line.credit) : '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="font-bold border-t-2">
                              <TableCell>{t('Total')}</TableCell>
                              <TableCell className="text-right">
                                {formatINR(entry.entries.reduce((sum, e) => sum + e.debit, 0))}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatINR(entry.entries.reduce((sum, e) => sum + e.credit, 0))}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trial Balance */}
        <TabsContent value="trial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('Trial Balance')}
              </CardTitle>
              <CardDescription>{t('Summary of all ledger account balances')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Account')}</TableHead>
                    <TableHead className="text-right">{t('Debit Balance')}</TableHead>
                    <TableHead className="text-right">{t('Credit Balance')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(ledgerBalances).map(([accountName, balance]) => (
                    <TableRow key={accountName}>
                      <TableCell className="font-medium">{accountName}</TableCell>
                      <TableCell className="text-right">
                        {balance >= 0 ? formatINR(balance) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {balance < 0 ? formatINR(Math.abs(balance)) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell>{t('Total')}</TableCell>
                    <TableCell className="text-right">{formatINR(trialBalance.totalDebit)}</TableCell>
                    <TableCell className="text-right">{formatINR(trialBalance.totalCredit)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium">
                  {trialBalance.isBalanced ? (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ {t('Trial balance is balanced')}
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      ✗ {t('Trial balance is not balanced')} ({t('Difference')}: {formatINR(Math.abs(trialBalance.totalDebit - trialBalance.totalCredit))})
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
