import { ExportType } from '../types';
import { ProviderMetadata } from '../../../../types/gst-universal';

export function mapToClearTax(exportType: ExportType, data: any): any {
  const providerMetadata: ProviderMetadata = {
    providerName: 'ClearTax',
    status: 'pending',
    timestamp: Date.now(),
  };

  switch (exportType) {
    case 'einvoice':
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          version: '1.1',
          doc_type: 'INV',
        },
      };
    case 'ewayBill':
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          version: '1.0',
          supply_type: 'O',
        },
      };
    case 'gstr1':
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          gstin: data.gstin || '',
          ret_period: data.period,
        },
      };
    case 'gstr3b':
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          gstin: data.gstin || '',
          ret_period: data.period,
        },
      };
    default:
      return { ...data, providerMetadata };
  }
}
