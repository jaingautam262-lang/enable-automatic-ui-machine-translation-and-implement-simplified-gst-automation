"""
Documentation for ClearTax Integration and GST Filing.

This document provides comprehensive information about integrating with ClearTax
for GST filing and tax compliance.
"""

# ClearTax Integration Guide

## Overview

This module provides integration with ClearTax for:
- GST return filing
- Invoice management
- Tax compliance monitoring
- Tax summary reports

## Setup

### Prerequisites

- ClearTax Business Account
- API Key from ClearTax Dashboard
- HTTPS connectivity

### Configuration

```env
# .env file
CLEARTAX_ENABLED=true
CLEARTAX_API_URL=https://api.cleartax.in
CLEARTAX_API_KEY=your_api_key_here
```

## Features

### 1. GST Return Filing

```python
from src.cleartax_integration.cleartax_manager import ClearTaxManager

cleartax = ClearTaxManager(
    api_url='https://api.cleartax.in',
    api_key='your_api_key'
)

return_data = {
    'period': '2024-01',
    'total_sales': 100000,
    'total_purchases': 50000,
    'total_cgst': 9000,
    'total_sgst': 9000
}

result = cleartax.file_gst_return(return_data)
```

### 2. Invoice Management

```python
invoices = [
    {
        'invoice_number': 'INV001',
        'date': '2024-01-15',
        'amount': 10000,
        'gst_rate': 18,
        'gst_amount': 1800
    }
]

result = cleartax.upload_invoices(invoices)
```

## API Endpoints (ClearTax)

### /gst/returns/file
File GST return

### /invoices/upload
Upload invoices for tracking

### /compliance/status
Check GST compliance status

### /tax/summary
Get tax summary for period

---

**Version**: 1.0  
**Last Updated**: September 2026
