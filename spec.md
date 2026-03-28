# BizAccounts Pro — GSP Feature Development (ClearTax, Masters India, IRIS, Tally)

## Current State
- `GSTSuiteTab.tsx` (2496 lines) has 6 panels: Automated Data Processing, Reconciliation Engine, ERP Integration, E-Way Bill & E-Invoicing, Multi-GSTIN Management, Alerts & Reports.
- `GSTAutomationTab.tsx` has a scheduler with toggle, manual run, and combined logs.
- `useGSTProviderSettings.ts` stores/reads credentials per provider (cleartax, masters_india, iris, tally) in localStorage, per user principal.
- `types/gst-universal.ts` defines universal schemas for e-invoice, e-way bill, GSTR-1/3B, reconciliation.
- The GSP Suite already has credential forms and API key storage, but no dedicated per-GSP workflow UI showing their specific features, statuses, and operations.

## Requested Changes (Diff)

### Add
A new **GSP Providers** section (either as a new tab inside GSTSuiteTab, or a standalone dedicated tab in the Dashboard) that gives each of the 4 GSPs (ClearTax, Masters India, IRIS GST, Tally) their own expanded panel with:

**Per-GSP Panel contains:**
1. **Connection Status Card** — Shows connected/disconnected badge, last sync time, API endpoint health indicator (simulated ping).
2. **Credentials Form** — API Key, Client ID, Client Secret (or provider-specific fields), Save/Disconnect buttons.
3. **Feature Workflow Cards** — Specific to each GSP:
   - **ClearTax**: E-Invoice generation, GSTR-1 bulk upload, GSTR-3B filing, ITC reconciliation, HSN validation, Bulk IRN generation status.
   - **Masters India**: GSTIN verification, E-Way Bill generation, GSTR-2B auto-reconciliation, Taxpayer profile lookup, Return status check.
   - **IRIS GST**: GSTR-9 annual return, GSTR-9C reconciliation statement, Demand & notices tracker, GST audit support, ITC-04 job work.
   - **Tally**: Tally XML/JSON export, GSTR-1 from Tally, Purchase register sync, Sales register sync, Reconciliation with Tally data.
4. **Activity Log** — Last 5 operations with status (success/failed/pending), timestamp, and records count.
5. **Quick Actions bar** — "Run Now", "View Last Report", "Download Logs" buttons per GSP.

**GSP Overview Card** at the top of the section:
- 4 provider cards side by side showing: logo/initials, name, connection status badge, last activity timestamp.
- A "Configure All" button that expands/scrolls to the credentials section.

### Modify
- `GSTSuiteTab.tsx`: Add a 7th tab "GSP Providers" to the existing tab list.
- The new tab renders a `GSPProvidersPanel` component (can be defined inline or in a separate file imported into GSTSuiteTab).

### Remove
Nothing removed — purely additive.

## Implementation Plan
1. Define GSP config data (name, color, initials, features list, credential fields) as a constant in GSTSuiteTab or inline in the new panel.
2. Build `GSPProvidersPanel` component:
   - Top overview grid: 4 provider status cards.
   - Accordion or collapsible section per provider (default: all expanded).
   - Each provider section: connection card + credentials form + feature workflow cards + activity log + quick actions.
   - Use `useGSTProviderSettings` hooks for credential read/write.
   - Simulate API health ping with a local loading state (fake 1s delay → "Online"/"Degraded").
   - Simulate "Run Now" per workflow with toast feedback and a fake progress bar.
   - Activity log: static demo data per provider showing realistic operations.
3. Add the 7th tab trigger and content in `GSTSuiteTab.tsx`.
4. Apply data-ocid markers to all interactive surfaces.
5. Validate (typecheck + build).
