"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { Download, FileText, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSalesSummary, getTopProducts } from "@/actions/report-action"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"
import type { DateRange } from "react-day-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Type definitions
interface SalesSummary {
  totalSales: number
  orderCount: number
  averageOrderValue: number
  growthPercentage: number
}

interface TopProduct {
  id: string
  name: string
  image?: string
  quantitySold: number
  revenue: number
}

interface TopProductsData {
  byQuantity: TopProduct[]
  byRevenue: TopProduct[]
}

export function SalesReport() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  })

  const [reportType, setReportType] = useState("monthly")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for report data
  const [summary, setSummary] = useState<SalesSummary>({
    totalSales: 0,
    orderCount: 0,
    averageOrderValue: 0,
    growthPercentage: 0,
  })

  const [topProducts, setTopProducts] = useState<TopProductsData>({
    byQuantity: [],
    byRevenue: [],
  })

  // Load data when component mounts or date/report type changes
  useEffect(() => {
    async function loadReportData() {
      if (!date?.from || !date?.to) return

      setLoading(true)
      setError(null)

      try {
        // Load sales summary
        const summaryResult = await getSalesSummary(date.from, date.to)
        if (summaryResult.success) {
          setSummary(summaryResult.data as SalesSummary)
        } else {
          setError(summaryResult.error || "Failed to load sales summary")
        }

        // Load top products
        const productsResult = await getTopProducts(date.from, date.to, 20) // Get more data for PDF
        if (productsResult.success) {
          setTopProducts(productsResult.data as TopProductsData)
        } else {
          setError(productsResult.error || "Failed to load top products")
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

  const formatDate = (dateInput: Date) => {
    return dateInput.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Export to PDF function
  const handleExportPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Laporan Penjualan", 20, 20)

      // Add date range
      doc.setFontSize(12)
      const dateRange = `Periode: ${formatDate(date?.from || new Date())} - ${formatDate(date?.to || new Date())}`
      doc.text(dateRange, 20, 35)

      // Add summary section
      doc.setFontSize(14)
      doc.text("Ringkasan Penjualan", 20, 55)

      doc.setFontSize(10)
      const summaryData = [
        ["Total Penjualan", formatCurrency(summary.totalSales)],
        ["Jumlah Order", `${summary.orderCount} pesanan`],
        ["Nilai Order Rata-rata", formatCurrency(summary.averageOrderValue)],
        ["Pertumbuhan", `${summary.growthPercentage >= 0 ? "+" : ""}${summary.growthPercentage.toFixed(1)}%`],
      ]

      autoTable(doc, {
        startY: 65,
        head: [["Metrik", "Nilai"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 20, right: 20 },
      })

      // Add top products by quantity
      if (topProducts.byQuantity.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY + 20
        doc.setFontSize(14)
        doc.text("Produk Terlaris (Berdasarkan Kuantitas)", 20, finalY)

        const quantityData = topProducts.byQuantity
          .slice(0, 10)
          .map((product, index) => [
            index + 1,
            product.name,
            `${product.quantitySold} unit`,
            formatCurrency(product.revenue),
          ])

        autoTable(doc, {
          startY: finalY + 10,
          head: [["Rank", "Nama Produk", "Terjual", "Pendapatan"]],
          body: quantityData,
          theme: "grid",
          headStyles: { fillColor: [34, 197, 94] },
          margin: { left: 20, right: 20 },
        })
      }

      // Add top products by revenue
      if (topProducts.byRevenue.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY + 20
        doc.setFontSize(14)
        doc.text("Produk dengan Pendapatan Tertinggi", 20, finalY)

        const revenueData = topProducts.byRevenue
          .slice(0, 10)
          .map((product, index) => [
            index + 1,
            product.name,
            formatCurrency(product.revenue),
            `${product.quantitySold} unit`,
          ])

        autoTable(doc, {
          startY: finalY + 10,
          head: [["Rank", "Nama Produk", "Pendapatan", "Terjual"]],
          body: revenueData,
          theme: "grid",
          headStyles: { fillColor: [34, 197, 94] },
          margin: { left: 20, right: 20 },
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
      const fileName = `laporan-penjualan-${new Date().toISOString().split("T")[0]}.pdf`
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
      csvData.push(["LAPORAN PENJUALAN"])
      csvData.push([`Periode: ${formatDate(date?.from || new Date())} - ${formatDate(date?.to || new Date())}`])
      csvData.push([])
      csvData.push(["RINGKASAN PENJUALAN"])
      csvData.push(["Metrik", "Nilai"])
      csvData.push(["Total Penjualan", formatCurrency(summary.totalSales)])
      csvData.push(["Jumlah Order", `${summary.orderCount} pesanan`])
      csvData.push(["Nilai Order Rata-rata", formatCurrency(summary.averageOrderValue)])
      csvData.push([
        "Pertumbuhan",
        `${summary.growthPercentage >= 0 ? "+" : ""}${summary.growthPercentage.toFixed(1)}%`,
      ])
      csvData.push([])

      // Add top products by quantity
      csvData.push(["PRODUK TERLARIS (BERDASARKAN KUANTITAS)"])
      csvData.push(["Rank", "Nama Produk", "Terjual", "Pendapatan"])
      topProducts.byQuantity.forEach((product, index) => {
        csvData.push([index + 1, product.name, `${product.quantitySold} unit`, product.revenue])
      })
      csvData.push([])

      // Add top products by revenue
      csvData.push(["PRODUK DENGAN PENDAPATAN TERTINGGI"])
      csvData.push(["Rank", "Nama Produk", "Pendapatan", "Terjual"])
      topProducts.byRevenue.forEach((product, index) => {
        csvData.push([index + 1, product.name, product.revenue, `${product.quantitySold} unit`])
      })

      // Convert to CSV string
      const csvContent = csvData.map((row) => row.join(",")).join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `laporan-penjualan-${new Date().toISOString().split("T")[0]}.csv`)
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
            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</div>
            <p className={`text-xs ${summary.growthPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summary.growthPercentage >= 0 ? "+" : ""}
              {summary.growthPercentage.toFixed(1)}% dari periode sebelumnya
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.orderCount}</div>
            <p className="text-xs text-muted-foreground">Jumlah pesanan dalam periode</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nilai Order Rata-rata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Rata-rata nilai per pesanan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Produk Terjual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topProducts.byQuantity.reduce((total, product) => total + product.quantitySold, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total unit terjual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
            <CardDescription>Berdasarkan jumlah penjualan</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Terjual</TableHead>
                  <TableHead>Pendapatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.byQuantity.slice(0, 10).map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-md overflow-hidden">
                          {product.image ? (
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No img</span>
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.quantitySold} unit</TableCell>
                    <TableCell>{formatCurrency(product.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produk dengan Pendapatan Tertinggi</CardTitle>
            <CardDescription>Berdasarkan total pendapatan</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Pendapatan</TableHead>
                  <TableHead>Terjual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.byRevenue.slice(0, 10).map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-md overflow-hidden">
                          {product.image ? (
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No img</span>
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(product.revenue)}</TableCell>
                    <TableCell>{product.quantitySold} unit</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
