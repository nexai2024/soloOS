'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { fetchPost } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';

interface SubscriberImportProps {
  onClose: () => void;
  onImported: () => void;
}

interface ParsedRow {
  [key: string]: string;
}

interface ColumnMapping {
  email: string;
  firstName: string;
  lastName: string;
}

export default function SubscriberImport({ onClose, onImported }: SubscriberImportProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);

  const parseCSV = (text: string): { headers: string[]; rows: ParsedRow[] } => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return { headers: [], rows: [] };

    const csvHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1, 6).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const row: ParsedRow = {};
      csvHeaders.forEach((h, i) => {
        row[h] = values[i] ?? '';
      });
      return row;
    });

    return { headers: csvHeaders, rows };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { headers: csvHeaders, rows } = parseCSV(text);
      setHeaders(csvHeaders);
      setPreviewRows(rows);

      // Auto-map columns
      const emailCol = csvHeaders.find(
        (h) => h.toLowerCase().includes('email')
      );
      const firstNameCol = csvHeaders.find(
        (h) =>
          h.toLowerCase().includes('first') ||
          h.toLowerCase() === 'firstname' ||
          h.toLowerCase() === 'first_name'
      );
      const lastNameCol = csvHeaders.find(
        (h) =>
          h.toLowerCase().includes('last') ||
          h.toLowerCase() === 'lastname' ||
          h.toLowerCase() === 'last_name'
      );

      setMapping({
        email: emailCol ?? '',
        firstName: firstNameCol ?? '',
        lastName: lastNameCol ?? '',
      });
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;
    if (!mapping.email) {
      toast.warning('Please map the email column');
      return;
    }

    setIsImporting(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('emailColumn', mapping.email);
    if (mapping.firstName) formData.append('firstNameColumn', mapping.firstName);
    if (mapping.lastName) formData.append('lastNameColumn', mapping.lastName);

    try {
      const response = await fetch('/api/newsletters/subscribers/import', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setImportResult({ imported: data.imported ?? 0, skipped: data.skipped ?? 0 });
        toast.success(`Imported ${data.imported ?? 0} subscribers`);
        onImported();
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch {
      toast.error('Import failed');
    }
    setIsImporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Import Subscribers
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* File upload */}
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            >
              <Upload className="h-8 w-8 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Click to upload a CSV file
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Must include an email column
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <>
              {/* File info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {headers.length} columns found
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setHeaders([]);
                    setPreviewRows([]);
                    setImportResult(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Change
                </button>
              </div>

              {/* Column mapping */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Column Mapping
                </h4>

                {[
                  { key: 'email' as const, label: 'Email', required: true },
                  { key: 'firstName' as const, label: 'First Name', required: false },
                  { key: 'lastName' as const, label: 'Last Name', required: false },
                ].map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    <label className="w-28 text-sm text-slate-600 dark:text-slate-400">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <select
                      value={mapping[field.key]}
                      onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select column --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview */}
              {previewRows.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Preview (first {previewRows.length} rows)
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50">
                          {headers.map((h) => (
                            <th key={h} className="text-left px-3 py-2 font-medium text-slate-500 dark:text-slate-400">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {previewRows.map((row, i) => (
                          <tr key={i}>
                            {headers.map((h) => (
                              <td key={h} className="px-3 py-2 text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                                {row[h]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import result */}
              {importResult && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                  <div className="text-sm text-green-800 dark:text-green-300">
                    <span className="font-medium">{importResult.imported}</span> subscribers imported
                    {importResult.skipped > 0 && (
                      <span>, <span className="font-medium">{importResult.skipped}</span> skipped (duplicates)</span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {!mapping.email && file && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Please map the email column before importing
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {importResult ? 'Done' : 'Cancel'}
          </button>
          {file && !importResult && (
            <button
              onClick={handleImport}
              disabled={isImporting || !mapping.email}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Import Subscribers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
