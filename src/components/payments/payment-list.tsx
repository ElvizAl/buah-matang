"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { approvePayment, rejectPayment } from "@/actions/payment-actions"
import { toast } from "sonner"
import { Eye, ExternalLink, Check, X } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Payment {
  id: string
  orderId: string
  amountPaid: number
  paymentStatus: string
  paymentMethod?: string | null
  paymentDate: Date
  proofUrl?: string | null // Menerima string | null | undefined
  order: {
    orderNumber: string
    customer: {
      name: string
    }
  }
}

interface PaymentListProps {
  payments: Payment[]
}

export function PaymentList({ payments }: PaymentListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const handleApprove = async (paymentId: string) => {
    setIsUpdating(paymentId)
    try {
      const result = await approvePayment(paymentId)
      if (result.success) {
        toast.success("Pembayaran berhasil disetujui")
        window.location.reload()
      } else {
        toast.error(result.error || "Gagal menyetujui pembayaran")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleReject = async (paymentId: string) => {
    setIsUpdating(paymentId)
    try {
      const result = await rejectPayment(paymentId)
      if (result.success) {
        toast.success("Pembayaran berhasil ditolak")
        window.location.reload()
      } else {
        toast.error(result.error || "Gagal menolak pembayaran")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Pembayaran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bukti Transfer</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Tidak ada data pembayaran
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>#{payment.order?.orderNumber || "N/A"}</TableCell>
                    <TableCell>{payment.order?.customer?.name || "N/A"}</TableCell>
                    <TableCell>{formatCurrency(payment.amountPaid)}</TableCell>
                    <TableCell>
                      {payment.paymentMethod === "CASH" && "Tunai"}
                      {payment.paymentMethod === "TRANSFER" && "Transfer Bank"}
                      {payment.paymentMethod === "DIGITAL_WALLET" && "E-Wallet"}
                      {payment.paymentMethod === "CREDIT_CARD" && "Kartu Kredit"}
                      {!payment.paymentMethod && "N/A"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                          payment.paymentStatus,
                        )}`}
                      >
                        {payment.paymentStatus === "COMPLETED" && "Selesai"}
                        {payment.paymentStatus === "PENDING" && "Pending"}
                        {payment.paymentStatus === "FAILED" && "Gagal"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {payment.proofUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(payment.proofUrl || "", "_blank")}
                          className="h-8"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Lihat Bukti
                        </Button>
                      ) : (
                        <span className="text-gray-500 text-sm">Tidak ada</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/payments/${payment.id}`}>
                          <Button variant="outline" size="sm" className="h-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        {payment.paymentStatus === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApprove(payment.id)}
                              disabled={isUpdating === payment.id}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Setujui
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-red-600 border-red-600 hover:bg-red-50"
                                  disabled={isUpdating === payment.id}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Tolak
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Tolak Pembayaran</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menolak pembayaran ini? Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleReject(payment.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Tolak Pembayaran
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {payment.paymentStatus !== "PENDING" && (
                          <Button size="sm" variant="outline" className="h-8" disabled>
                            Sudah Diproses
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
