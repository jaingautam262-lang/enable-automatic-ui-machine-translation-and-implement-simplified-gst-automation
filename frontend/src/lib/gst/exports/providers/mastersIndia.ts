import { ExportType } from '../types';
import { ProviderMetadata } from '../../../../types/gst-universal';

export function mapToMastersIndia(exportType: ExportType, data: any): any {
  const providerMetadata: ProviderMetadata = {
    providerName: 'Masters India',
    status: 'pending',
    timestamp: Date.now(),
  };

  switch (exportType) {
    case 'einvoice':
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          api_version: '2.0',
          document_type: 'INVOICE',
        },
      };
    case 'ewayBill':
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          api_version: '2.0',
          transaction_type: 'REGULAR',
        },
      };
    case 'gstr1':
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          filing_type: 'ORIGINAL',
          return_period: data.period,
        },
      };
    case 'gstr3b':
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          filing_type: 'ORIGINAL',
          return_period: data.period,
        },
      };
    default:
      return { ...data, providerMetadata };
  }
}
