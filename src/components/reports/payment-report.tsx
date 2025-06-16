"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { Download, FileText, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getPaymentSummary, getRecentPayments } from "@/actions/report-action"
import { formatCurrency } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DateRange } from "react-day-picker"
import { autoTable } from "jspdf-autotable"
import jsPDF from "jspdf"

// Type definitions
interface PaymentSummary {
  totalAmount: number
  completedCount: number
  pendingCount: number
  failedCount: number
  totalCount: number
  methodDistribution: Array<{
    name: string
    value: number
    count: number
  }>
}

interface RecentPayment {
  id: string
  orderNumber: string
  customer: string
  amount: number
  method: string
  status: string
  date: Date | string
}

export function PaymentReport() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  })

  const [reportType, setReportType] = useState("monthly")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for report data
  const [summary, setSummary] = useState<PaymentSummary>({
    totalAmount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    totalCount: 0,
    methodDistribution: [],
  })

  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])

  // Load data when component mounts or date changes
  useEffect(() => {
    async function loadReportData() {
      if (!date?.from || !date?.to) return

      setLoading(true)
      setError(null)

      try {
        // Load payment summary
        const summaryResult = await getPaymentSummary(date.from, date.to)
        if (summaryResult.success) {
          setSummary(summaryResult.data as PaymentSummary)
        } else {
          setError(summaryResult.error || "Failed to load payment summary")
        }

        // Load recent payments
        const paymentsResult = await getRecentPayments(50) // Get more data for PDF
        if (paymentsResult.success) {
          setRecentPayments(paymentsResult.data as RecentPayment[])
        } else {
          setError(paymentsResult.error || "Failed to load recent payments")
        }
      } catch (err) {
        console.error("Error loading report data:", err)
        setError("Terjadi kesalahan saat memuat data laporan")
      } finally {
        setLoading(false)
      }
    }

    loadReportData()
  }, [date, reportType])

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "TRANSFER":
        return "Transfer Bank"
      case "DIGITAL_WALLET":
        return "E-Wallet"
      case "CASH":
        return "Tunai"
      default:
        return method
    }
  }

  const getStatusName = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Selesai"
      case "PENDING":
        return "Pending"
      case "FAILED":
        return "Gagal"
      default:
        return status
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Gagal</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Export to PDF function
  const handleExportPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Laporan Pembayaran", 20, 20)

      // Add date range
      doc.setFontSize(12)
      const dateRange = `Periode: ${formatDate(date?.from || new Date())} - ${formatDate(date?.to || new Date())}`
      doc.text(dateRange, 20, 35)

      // Add summary section
      doc.setFontSize(14)
      doc.text("Ringkasan Pembayaran", 20, 55)

      doc.setFontSize(10)
      const summaryData = [
        ["Total Pendapatan", formatCurrency(summary.totalAmount)],
        ["Pembayaran Sukses", `${summary.completedCount} transaksi`],
        ["Pembayaran Pending", `${summary.pendingCount} transaksi`],
        ["Pembayaran Gagal", `${summary.failedCount} transaksi`],
        ["Total Transaksi", `${summary.totalCount} transaksi`],
        [
          "Success Rate",
          summary.totalCount > 0 ? `${((summary.completedCount / summary.totalCount) * 100).toFixed(1)}%` : "0%",
        ],
      ]

      autoTable(doc, {
        startY: 65,
        head: [["Metrik", "Nilai"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 20, right: 20 },
      })

      // Add method distribution section
      if (summary.methodDistribution.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY + 20
        doc.setFontSize(14)
        doc.text("Distribusi Metode Pembayaran", 20, finalY)

        const methodData = summary.methodDistribution.map((method) => [
          method.name,
          `${method.count} transaksi`,
          `${method.value.toFixed(1)}%`,
        ])

        autoTable(doc, {
          startY: finalY + 10,
          head: [["Metode Pembayaran", "Jumlah Transaksi", "Persentase"]],
          body: methodData,
          theme: "grid",
          headStyles: { fillColor: [34, 197, 94] },
          margin: { left: 20, right: 20 },
        })
      }

      // Add recent payments section
      if (recentPayments.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY + 20
        doc.setFontSize(14)
        doc.text("Daftar Pembayaran Terbaru", 20, finalY)

        const paymentData = recentPayments
          .slice(0, 20)
          .map((payment) => [
            payment.orderNumber,
            payment.customer,
            formatCurrency(payment.amount),
            getPaymentMethodName(payment.method),
            getStatusName(payment.status),
            formatDate(payment.date),
          ])

        autoTable(doc, {
          startY: finalY + 10,
          head: [["Order", "Pelanggan", "Jumlah", "Metode", "Status", "Tanggal"]],
          body: paymentData,
          theme: "grid",
          headStyles: { fillColor: [34, 197, 94] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 30 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 25 },
          },
        })
      }

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
          `Halaman ${i} dari ${pageCount} - Generated on ${new Date().toLocaleDateString("id-ID")}`,
          20,
          doc.internal.pageSize.height - 10,
        )
      }

      // Save the PDF
      const fileName = `laporan-pembayaran-${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Terjadi kesalahan saat membuat PDF")
    }
  }

  // Handle export to Excel
  const handleExportExcel = () => {
    try {
      // Create CSV data
      const csvData = []

      // Add summary
      csvData.push(["LAPORAN PEMBAYARAN"])
      csvData.push([`Periode: ${formatDate(date?.from || new Date())} - ${formatDate(date?.to || new Date())}`])
      csvData.push([])
      csvData.push(["RINGKASAN PEMBAYARAN"])
      csvData.push(["Metrik", "Nilai"])
      csvData.push(["Total Pendapatan", formatCurrency(summary.totalAmount)])
      csvData.push(["Pembayaran Sukses", `${summary.completedCount} transaksi`])
      csvData.push(["Pembayaran Pending", `${summary.pendingCount} transaksi`])
      csvData.push(["Pembayaran Gagal", `${summary.failedCount} transaksi`])
      csvData.push([])

      // Add method distribution
      if (summary.methodDistribution.length > 0) {
        csvData.push(["DISTRIBUSI METODE PEMBAYARAN"])
        csvData.push(["Metode Pembayaran", "Jumlah Transaksi", "Persentase"])
        summary.methodDistribution.forEach((method) => {
          csvData.push([method.name, `${method.count} transaksi`, `${method.value.toFixed(1)}%`])
        })
        csvData.push([])
      }

      // Add payments data
      csvData.push(["DAFTAR PEMBAYARAN"])
      csvData.push(["Order", "Pelanggan", "Jumlah", "Metode", "Status", "Tanggal"])
      recentPayments.forEach((payment) => {
        csvData.push([
          payment.orderNumber,
          payment.customer,
          payment.amount,
          getPaymentMethodName(payment.method),
          getStatusName(payment.status),
          formatDate(payment.date),
        ])
      })

      // Convert to CSV string
      const csvContent = csvData.map((row) => row.join(",")).join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `laporan-pembayaran-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error generating Excel:", error)
      alert("Terjadi kesalahan saat membuat Excel")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Memuat data laporan...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <DatePickerWithRange date={date} setDate={setDate} />
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipe Laporan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Harian</SelectItem>
              <SelectItem value="weekly">Mingguan</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="yearly">Tahunan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Dari {summary.completedCount} pembayaran sukses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pembayaran Sukses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.completedCount}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalCount > 0
                ? `${((summary.completedCount / summary.totalCount) * 100).toFixed(1)}% dari total`
                : "0% dari total"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pembayaran Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.pendingCount}</div>
            <p className="text-xs text-muted-foreground">Menunggu konfirmasi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pembayaran Gagal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.failedCount}</div>
            <p className="text-xs text-muted-foreground">Transaksi gagal</p>
          </CardContent>
        </Card>
      </div>

      {summary.methodDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Metode Pembayaran</CardTitle>
            <CardDescription>Breakdown pembayaran berdasarkan metode</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metode Pembayaran</TableHead>
                  <TableHead>Jumlah Transaksi</TableHead>
                  <TableHead>Persentase</TableHead>
                  <TableHead>Total Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.methodDistribution.map((method, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>{method.count} transaksi</TableCell>
                    <TableCell>{method.value.toFixed(1)}%</TableCell>
                    <TableCell>{formatCurrency((summary.totalAmount * method.value) / 100)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran Terbaru</CardTitle>
          <CardDescription>Transaksi pembayaran terbaru (50 data terakhir)</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.orderNumber}</TableCell>
                    <TableCell>{payment.customer}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{getPaymentMethodName(payment.method)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-muted-foreground">Tidak ada data pembayaran terbaru</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
