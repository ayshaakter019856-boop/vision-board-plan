import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Papa from 'papaparse';
import { Account } from '@/hooks/useAccounts';

interface CSVUploadProps {
  onUpload: (accounts: Omit<Account, 'id' | 'created_at' | 'updated_at'>[]) => Promise<any>;
}

interface CSVAccount {
  product_name: string;
  email: string;
  password: string;
  category: string;
  note?: string;
  customer_name?: string;
  expired_date?: string;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onUpload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<CSVAccount[]>([]);

  const expectedColumns = ['product_name', 'email', 'password', 'category'];
  const optionalColumns = ['note', 'customer_name', 'expired_date'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
      previewCSV(selectedFile);
    }
  };

  const previewCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVAccount[];
        
        // Validate required columns
        const firstRow = data[0];
        if (!firstRow) {
          setError('CSV file is empty');
          return;
        }

        const missingColumns = expectedColumns.filter(col => !(col in firstRow));
        if (missingColumns.length > 0) {
          setError(`Missing required columns: ${missingColumns.join(', ')}`);
          return;
        }

        // Validate data
        const invalidRows = data.filter((row, index) => {
          return !row.product_name?.trim() || !row.email?.trim() || !row.password?.trim() || !row.category?.trim();
        });

        if (invalidRows.length > 0) {
          setError(`${invalidRows.length} rows have missing required data (product_name, email, password, category)`);
          return;
        }

        setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
        setError(null);
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const data = results.data as CSVAccount[];
          
          // Clean and validate data
          const cleanedData = data.map(row => ({
            product_name: row.product_name?.trim() || '',
            email: row.email?.trim() || '',
            password: row.password?.trim() || '',
            category: row.category?.trim() || '',
            note: row.note?.trim() || '',
            customer_name: row.customer_name?.trim() || '',
            order_date: row.expired_date?.trim() || ''
          })).filter(row => row.product_name && row.email && row.password && row.category);

          try {
            await onUpload(cleanedData);
            setSuccess(`Successfully imported ${cleanedData.length} accounts`);
            setFile(null);
            setPreviewData([]);
            
            // Close dialog after a brief delay
            setTimeout(() => {
              setIsOpen(false);
              setSuccess(null);
            }, 2000);
          } catch (uploadError) {
            setError('Failed to upload accounts. Please try again.');
          }
        }
      });
    } catch (parseError) {
      setError('Failed to process CSV file');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['product_name', 'email', 'password', 'category', 'note', 'customer_name', 'expired_date'],
      ['Netflix', 'user@example.com', 'password123', 'Streaming', 'Premium account', 'John Doe', '2024-12-31'],
      ['Spotify', 'user2@example.com', 'mypassword', 'Music', 'Family plan', 'Jane Smith', '2024-11-15']
    ];
    
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accounts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Accounts from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your digital account details. Make sure your CSV includes the required columns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Download CSV Template</p>
                <p className="text-sm text-muted-foreground">Get a sample CSV file with the correct format</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              Download
            </Button>
          </div>

          {/* Required Columns Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-medium mb-2">Required columns:</p>
            <p className="text-sm text-muted-foreground">
              {expectedColumns.join(', ')}
            </p>
            <p className="font-medium mb-2 mt-3">Optional columns:</p>
            <p className="text-sm text-muted-foreground">
              {optionalColumns.join(', ')}
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label htmlFor="csv-file" className="text-sm font-medium">
              Select CSV File
            </label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Preview (first 5 rows):</p>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Product</th>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-left">Category</th>
                        <th className="px-3 py-2 text-left">Customer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2">{row.product_name}</td>
                          <td className="px-3 py-2">{row.email}</td>
                          <td className="px-3 py-2">{row.category}</td>
                          <td className="px-3 py-2">{row.customer_name || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading || !!error}
          >
            {isUploading ? 'Uploading...' : 'Import Accounts'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};