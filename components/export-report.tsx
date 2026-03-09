"use client"

import { useState } from "react"
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExportColumn {
  key: string
  label: string
}

interface ExportReportProps {
  /** Title for the exported file */
  title: string
  /** Column definitions */
  columns: ExportColumn[]
  /** Row data — array of objects keyed by column.key */
  data: Record<string, any>[]
  /** Optional summary stats to include at the top of the export */
  summary?: Record<string, string | number>[]
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function generateCSV(
  title: string,
  columns: ExportColumn[],
  data: Record<string, any>[],
  summary?: Record<string, string | number>[]
): string {
  const lines: string[] = []

  // Title row
  lines.push(escapeCSV(`${title} — Generated ${new Date().toLocaleDateString()}`))
  lines.push("")

  // Summary section
  if (summary && summary.length > 0) {
    lines.push("SUMMARY")
    for (const row of summary) {
      const entries = Object.entries(row)
      lines.push(entries.map(([k, v]) => `${k}: ${v}`).join(", "))
    }
    lines.push("")
  }

  // Header row
  lines.push(columns.map((c) => escapeCSV(c.label)).join(","))

  // Data rows
  for (const row of data) {
    lines.push(columns.map((c) => escapeCSV(row[c.key])).join(","))
  }

  return lines.join("\n")
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function generatePrintableHTML(
  title: string,
  columns: ExportColumn[],
  data: Record<string, any>[],
  summary?: Record<string, string | number>[]
): string {
  const summaryHTML = summary
    ? `<div style="display:flex;gap:24px;margin-bottom:24px;flex-wrap:wrap">
        ${summary
          .map(
            (row) =>
              Object.entries(row)
                .map(
                  ([k, v]) =>
                    `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 20px">
                      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px">${k}</div>
                      <div style="font-size:22px;font-weight:700;color:#0f172a">${v}</div>
                    </div>`
                )
                .join("")
          )
          .join("")}
       </div>`
    : ""

  return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #0f172a; max-width: 1100px; margin: 0 auto; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .subtitle { color: #64748b; font-size: 13px; margin-bottom: 32px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f1f5f9; text-align: left; padding: 10px 14px; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
    td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
    tr:hover td { background: #f8fafc; }
    .risk-critical { color: #dc2626; font-weight: 600; }
    .risk-elevated { color: #d97706; font-weight: 600; }
    .risk-low { color: #16a34a; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="subtitle">Generated on ${new Date().toLocaleString()} by Sentinel AI</div>
  ${summaryHTML}
  <table>
    <thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
    <tbody>
      ${data
        .map(
          (row) =>
            `<tr>${columns
              .map((c) => {
                const val = row[c.key] ?? ""
                const cls =
                  c.key === "risk_level"
                    ? val === "CRITICAL"
                      ? "risk-critical"
                      : val === "ELEVATED"
                        ? "risk-elevated"
                        : "risk-low"
                    : ""
                return `<td class="${cls}">${val}</td>`
              })
              .join("")}</tr>`
        )
        .join("")}
    </tbody>
  </table>
  <div class="footer">
    Sentinel Employee Intelligence Platform &mdash; Confidential Report &mdash; ${data.length} records
  </div>
</body>
</html>`
}

export function ExportReport({ title, columns, data, summary }: ExportReportProps) {
  const [exporting, setExporting] = useState(false)

  const handleCSV = () => {
    setExporting(true)
    try {
      const csv = generateCSV(title, columns, data, summary)
      const filename = `${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`
      downloadFile(csv, filename, "text/csv;charset=utf-8;")
    } finally {
      setExporting(false)
    }
  }

  const handlePDF = () => {
    setExporting(true)
    try {
      const html = generatePrintableHTML(title, columns, data, summary)
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(html)
        printWindow.document.close()
        // Small delay for styles to load before print dialog
        setTimeout(() => printWindow.print(), 300)
      }
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting || data.length === 0} className="gap-2">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePDF} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Export as PDF (Print)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
