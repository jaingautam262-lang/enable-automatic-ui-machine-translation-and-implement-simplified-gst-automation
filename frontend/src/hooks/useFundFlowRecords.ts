import { useState, useEffect } from 'react';
import { safeLocalStorage } from '../lib/serialization';

export interface FundFlowData {
  id: string;
  date: Date;
  sourcesOfFunds: {
    capitalIntroduced: number;
    loansReceived: number;
    retainedEarnings: number;
    assetSales: number;
    otherSources: number;
  };
  applicationOfFunds: {
    assetPurchases: number;
    loanRepayments: number;
    dividendsPaid: number;
    operatingExpenses: number;
    otherApplications: number;
  };
  workingCapitalChanges: {
    currentAssetsIncrease: number;
    currentLiabilitiesIncrease: number;
    netWorkingCapitalChange: number;
  };
}

const STORAGE_KEY = 'fundFlowRecords';

// Serialize Date objects for storage
function serializeRecord(record: FundFlowData): any {
  return {
    ...record,
    date: record.date.toISOString(),
  };
}

// Deserialize Date objects from storage
function deserializeRecord(data: any): FundFlowData {
  return {
    ...data,
    date: new Date(data.date),
  };
}

export function useFundFlowRecords() {
  const [records, setRecords] = useState<FundFlowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load records from localStorage on mount
  useEffect(() => {
    const loadRecords = () => {
      try {
        const saved = safeLocalStorage.getItem<any[]>(STORAGE_KEY, []);
        if (saved && Array.isArray(saved)) {
          const deserialized = saved.map(deserializeRecord);
          setRecords(deserialized);
        }
      } catch (error) {
        console.error('Failed to load fund flow records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  const addRecord = (record: FundFlowData) => {
    const newRecords = [record, ...records];
    setRecords(newRecords);
    
    // Save to localStorage
    const serialized = newRecords.map(serializeRecord);
    safeLocalStorage.setItem(STORAGE_KEY, serialized);
  };

  const getLatest = (): FundFlowData | null => {
    return records.length > 0 ? records[0] : null;
  };

  const getHistory = (): FundFlowData[] => {
    return records;
  };

  return {
    records,
    isLoading,
    addRecord,
    getLatest,
    getHistory,
  };
}
