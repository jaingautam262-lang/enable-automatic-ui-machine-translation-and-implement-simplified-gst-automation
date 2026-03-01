import { useMutation } from '@tanstack/react-query';
import { GSPProvider } from '../types/gst-universal';
import { ExportType, ExportResult } from '../lib/gst/exports/types';
import { validateExport } from '../lib/gst/exports/validate';
import { mapToClearTax } from '../lib/gst/exports/providers/cleartax';
import { mapToMastersIndia } from '../lib/gst/exports/providers/mastersIndia';
import { mapToIRIS } from '../lib/gst/exports/providers/iris';
import { mapToTally } from '../lib/gst/exports/providers/tally';

export function useGenerateExport() {
  return useMutation({
    mutationFn: async ({
      provider,
      exportType,
      data,
    }: {
      provider: GSPProvider;
      exportType: ExportType;
      data: any;
    }): Promise<ExportResult> => {
      // Validate export
      const validation = validateExport(provider, exportType, data);

      // Map to provider format
      let payload: any;
      switch (provider) {
        case 'cleartax':
          payload = mapToClearTax(exportType, data);
          break;
        case 'mastersIndia':
          payload = mapToMastersIndia(exportType, data);
          break;
        case 'iris':
          payload = mapToIRIS(exportType, data);
          break;
        case 'tally':
          payload = mapToTally(exportType, data);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      return {
        provider,
        exportType,
        payload,
        validation,
        metadata: {
          generatedAt: Date.now(),
          recordCount: Array.isArray(data) ? data.length : 1,
        },
      };
    },
  });
}

export function useDownloadExport() {
  return useMutation({
    mutationFn: async (exportResult: ExportResult) => {
      const fileName = `${exportResult.provider}_${exportResult.exportType}_${new Date().toISOString().split('T')[0]}.json`;
      const jsonString = JSON.stringify(exportResult.payload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return fileName;
    },
  });
}
