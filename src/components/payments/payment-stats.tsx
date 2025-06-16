"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Payment {
  id: string
  paymentStatus: string
  amountPaid: number
  paymentDate: Date
}

interface PaymentStatsProps {
  payments: Payment[]
}

export function PaymentStats({ payments }: PaymentStatsProps) {
  // Hitung statistik pembayaran
  const totalPayments = payments.length
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amountPaid, 0)

  // Pembayaran hari ini
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayPayments = payments.filter((payment) => {
    const paymentDate = new Date(payment.paymentDate)
    return paymentDate >= today
  })
  const todayAmount = todayPayments.reduce((sum, payment) => sum + payment.amountPaid, 0)

  // Pembayaran pending
  const pendingPayments = payments.filter((payment) => payment.paymentStatus === "PENDING")
  const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amountPaid, 0)

  // Tingkat sukses
  const completedPayments = payments.filter((payment) => payment.paymentStatus === "COMPLETED")
  const successRate = totalPayments > 0 ? (completedPayments.length / totalPayments) * 100 : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pembayaran</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          <p className="text-xs text-muted-foreground">Dari {totalPayments} transaksi</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pembayaran Hari Ini</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(todayAmount)}</div>
          <p className="text-xs text-muted-foreground">{todayPayments.length} transaksi hari ini</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pembayaran Pending</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
          <p className="text-xs text-muted-foreground">{pendingPayments.length} pembayaran menunggu konfirmasi</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tingkat Sukses</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {completedPayments.length} dari {totalPayments} pembayaran sukses
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
