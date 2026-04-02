'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, Download, FileText, CheckCircle, AlertTriangle } from 'lucide-react'
import { importUsersCSV, downloadImportTemplate } from '@/lib/users'

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export function CSVImportDialog({ onImportComplete }: { onImportComplete?: () => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        setError('Please select a CSV file')
        return
      }
      setFile(selected)
      setError('')
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return
    try {
      setImporting(true)
      setError('')
      const res = await importUsersCSV(file)
      setResult(res)
      if (onImportComplete) onImportComplete()
    } catch (err: any) {
      setError(err.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      await downloadImportTemplate()
    } catch {
      setError('Failed to download template')
    }
  }

  const resetState = () => {
    setFile(null)
    setResult(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState() }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with user data. Required columns: email, role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download CSV Template
          </Button>

          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            {file ? (
              <div className="space-y-2">
                <FileText className="h-8 w-8 mx-auto text-primary" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}>
                  Change file
                </Button>
              </div>
            ) : (
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to select a CSV file</p>
              </label>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Import Complete</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Imported:</span>{' '}
                  <span className="font-medium text-green-600">{result.imported}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Skipped:</span>{' '}
                  <span className="font-medium">{result.skipped}</span>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-destructive font-medium">Errors:</p>
                  <ul className="text-xs text-destructive max-h-24 overflow-y-auto">
                    {result.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {file && !result && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : 'Import Users'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
