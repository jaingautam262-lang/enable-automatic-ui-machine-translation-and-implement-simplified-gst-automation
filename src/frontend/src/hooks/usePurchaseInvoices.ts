import { useEffect, useState } from "react";
import type { GSTPurchaseInvoice } from "../types/gst-purchase";
import { useInternetIdentity } from "./useInternetIdentity";

const STORAGE_KEY = "gst_purchase_invoices";

export function usePurchaseInvoices() {
  const { identity } = useInternetIdentity();
  const [invoices, setInvoices] = useState<GSTPurchaseInvoice[]>([]);

  const getStorageKey = () => {
    const principal = identity?.getPrincipal().toString() || "anonymous";
    return `${STORAGE_KEY}_${principal}`;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: getStorageKey depends on identity
  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const invoices = parsed.map((inv: any) => ({
          ...inv,
          vendorType: inv.vendorType || "Normal",
          supplierInvoiceDate: BigInt(inv.supplierInvoiceDate),
          createdAt: BigInt(inv.createdAt),
        }));
        setInvoices(invoices);
      } catch (error) {
        console.error("Failed to load purchase invoices:", error);
      }
    }
  }, [identity]);

  const saveToStorage = (invoices: GSTPurchaseInvoice[]) => {
    const serializable = invoices.map((inv) => ({
      ...inv,
      supplierInvoiceDate: inv.supplierInvoiceDate.toString(),
      createdAt: inv.createdAt.toString(),
    }));
    localStorage.setItem(getStorageKey(), JSON.stringify(serializable));
  };

  const createInvoice = (
    invoice: Omit<GSTPurchaseInvoice, "id" | "createdAt">,
  ) => {
    const newInvoice: GSTPurchaseInvoice = {
      ...invoice,
      vendorType: invoice.vendorType || "Normal",
      id: `PI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: BigInt(Date.now()),
    };
    const updated = [...invoices, newInvoice];
    setInvoices(updated);
    saveToStorage(updated);
  };

  const updateInvoice = (invoice: GSTPurchaseInvoice) => {
    const updated = invoices.map((inv) =>
      inv.id === invoice.id ? invoice : inv,
    );
    setInvoices(updated);
    saveToStorage(updated);
  };

  const deleteInvoice = (id: string) => {
    const updated = invoices.filter((inv) => inv.id !== id);
    setInvoices(updated);
    saveToStorage(updated);
  };

  return {
    invoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
}
