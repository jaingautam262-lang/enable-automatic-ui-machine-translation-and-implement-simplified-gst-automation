# GST ITC Reconciliation & AI Intelligence Layer - Implementation Guide

## Overview
This document provides a practical implementation plan for adding an AI-powered reconciliation engine and related GST/Tally automation features to this repository.

> Exported from Caffeine project: Enable automatic UI machine translation and implement simplified GST automation with placeholder GSP/ClearTax proxy endpoints

---

## Goals
- Real-time GSTR-2B ↔ books reconciliation with explainable AI matching
- PDF bank-statement → Tally entry extraction with fast OCR and duplicate detection
- Bidirectional, delta-optimized sync with Tally Prime
- Human-in-the-loop supervision and RBI-compliant audit trails

---

## Architecture & Components
- Frontend UI: GSTSuiteTab.tsx (ReconciliationEnginePanel, upload UIs, summary table)
  - File: src/frontend/src/components/tabs/GSTSuiteTab.tsx
  - Relevant sections: ReconciliationEnginePanel (lines ~931, ~1045, ~2437, ~2596)
- Types: gst-universal.ts (UniversalGSTR2BData, ReconciliationResult, GSTR3B payloads)
  - File: src/frontend/src/types/gst-universal.ts
- Predefined workflows: frontend/src/lib/gst/workflows/predefinedWorkflows.ts
  - Contains ‘GST Reconciliation’ workflow and steps
- Validation: frontend/src/lib/gst/exports/validate.ts
  - Validation helpers for GSTR payloads

---

## Implementation Plan (Phases)

Phase 1 — Foundation
1. AI-Powered Reconciliation Engine (core)
   - Implement a matching service that accepts UniversalGSTR2BData and purchase records, returns ReconciliationResult.
   - Matching steps:
     - Exact-key match: (GSTIN, invoice number, invoice date) → immediate match
     - Fuzzy text matching on supplier name/invoice no (Levenshtein / Damerau-Levenshtein)
     - Amount variance check (configurable tolerance, default ±3%)
     - Temporal window matching (configurable days before/after invoice date)
     - Scoring & explainability payload (why matched, which rule triggered, score)
   - Performance: aim for <10ms per transaction in-memory; batch <1min for 10k items via vectorized operations
   - Output: ReconciliationResult (populates matched/unmatched arrays and metadata)

2. PDF Bank Statement Parser
   - OCR engine (Tesseract or commercial provider) to extract transactions
   - Normalizer for dates, amounts, narration parsing
   - Duplicate detection (fingerprint by date+amount+rounded narration)
   - Export to Tally XML (per-company ledger mapping)

Phase 2 — Primary Features
3. GST ITC Reconciliation Tool (UI flows)
   - Upload GSTR-2B (PDF/XML) → normalized UniversalGSTR2BData
   - Upload books/Tally exports → normalized purchase records
   - One-click run: call matching service, render ReconciliationResult in ReconciliationEnginePanel
   - ITC eligibility evaluation per invoice and risk scoring
   - Export audit-ready CSV/JSON and Tally XML for adjustments

4. Tally Integration Sync
   - Connector to Tally APIs / XML endpoints (placeholder provider already exists in UI providers list)
   - Delta sync (calculate diffs via lastSync timestamp, send only changes)
   - Retry and all-or-nothing semantics (transactional batches)

---

## Acceptance Criteria (for each issue)
- AI-Powered Reconciliation Engine
  - Exact matches: >98% on exact-key tests
  - Fuzzy match accuracy: >95% on curated test sets
  - Latency: <10ms per transaction (real-time) on target infra
  - False positives <1% and explainability for each match

- GST ITC Reconciliation Tool
  - Accepts GSTR-2B in PDF or XML
  - Accepts Tally/book exports (CSV/XML)
  - UI shows matched/unmatched with reasoning
  - Reconcile 1k records in <30s
  - ITC eligibility flagged for each invoice
  - Exportable audit trail (CSV/JSON) with provenance

- PDF to Tally Bank Statement
  - OCR accuracy >98% on sample bank PDFs
  - Categorization >95% accuracy
  - Auto-match to ledger accounts >90%
  - Tally XML export generated and downloadable

- Tally Integration Sync
  - >99% sync success rate in integration tests
  - Delta sync reduces bandwidth by ≥80%
  - 10k records sync in <2 minutes (batch)

---

## Human Supervision & Compliance
- All AI decisions include an explainability object with: rule(s) used, confidence score, and feature contributions.
- Every reconciliation run generates an audit event: timestamp, userId, dataset checksums, modelVersion, operator note.
- Role-based access control for approval flows (for blocked/ineligible items).
- Maintain retention policy for audit logs to meet RBI/regulatory requests.
- Provide a simple ‘why’ tooltip in UI generated from explainability object.

---

## Code Integration Points & Snippets
- Types: UniversalGSTR2BData (frontend/src/types/gst-universal.ts)
  - Use as canonical GSTR-2B payload across UI and backend services.

- Reconciliation panel: src/frontend/src/components/tabs/GSTSuiteTab.tsx
  - ReconciliationEnginePanel provides UI scaffold and sample rows; connect Run Reconciliation handler to new matching API endpoint.

- Predefined workflows: src/frontend/src/lib/gst/workflows/predefinedWorkflows.ts
  - Add a workflow step to orchestrate file upload → normalize → match → export

Example (pseudo-code) API contract for matching endpoint:

POST /api/gst/reconcile
Body: {
  gstr2b: UniversalGSTR2BData,
  books: { purchases: PurchaseRecord[] },
  config: { amountTolerancePct: number, dateWindowDays: number }
}
Response: ReconciliationResult

Where PurchaseRecord minimally contains: { supplierGSTIN, invoiceNumber, invoiceDate, invoiceValue, taxableValue, cgst, sgst, igst }

---

## Tests & Validation
- Unit tests for matching rules (exact match, fuzzy, amount variance)
- Integration tests with sample GSTR-2B XMLs and Tally exports (add fixtures under tests/fixtures/gst)
- Performance tests: run the matcher on synthetic datasets of 10k+ records and measure latency & memory

---

## Next Steps (PRs / Issues)
Create the following GitHub issues (drafts included in repository under docs/ISSUE_TEMPLATES or open issues):
- AI-Powered Reconciliation Engine (Foundation)
- GST ITC Reconciliation Tool (GSTR-2B upload & AI Processing)
- PDF to Tally Bank Statement Parser (Bank reconciliation in seconds)
- Tally Integration Sync (Real-time bidirectional sync)

---

## References (in-repo files)
- src/frontend/src/types/gst-universal.ts
- src/frontend/src/lib/gst/workflows/predefinedWorkflows.ts
- src/frontend/src/lib/gst/exports/validate.ts
- src/frontend/src/components/tabs/GSTSuiteTab.tsx

---

_File created by GitHub Copilot assistant: summarized implementation guide for GST ITC reconciliation and Tally integration._
