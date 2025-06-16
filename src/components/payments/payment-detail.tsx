"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { approvePayment, rejectPayment } from "@/actions/payment-actions"
import { toast } from "sonner"
import { useState } from "react"
import { ExternalLink, Check, X, ArrowLeft } from "lucide-react"
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

interface PaymentDetailProps {
  payment: {
    id: string
    orderId: string
    amountPaid: number
    paymentStatus: string
    paymentMethod: string
    paymentDate: Date
    proofUrl?: string | null // Menerima string | null | undefined
    order: {
      id: string
      orderNumber: string
      total: number
      status: string
      customer: {
        id: string
        name: string
        email?: string | null
        phone?: string | null
        address?: string | null
      }
      orderItems: Array<{
        id: string
        quantity: number
        price: number
        subtotal: number
        fruit: {
          id: string
          name: string
          image?: string | null
        }
      }>
    }
  }
}

export function PaymentDetail({ payment }: PaymentDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false)

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

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "CASH":
        return "Tunai"
      case "TRANSFER":
        return "Transfer Bank"
      case "DIGITAL_WALLET":
        return "E-Wallet"
      case "CREDIT_CARD":
        return "Kartu Kredit"
      default:
        return method
    }
  }

  const handleApprove = async () => {
    setIsUpdating(true)
    try {
      const result = await approvePayment(payment.id)
      if (result.success) {
        toast.success("Pembayaran berhasil disetujui")
        window.location.reload()
      } else {
        toast.error(result.error || "Gagal menyetujui pembayaran")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReject = async () => {
    setIsUpdating(true)
    try {
      const result = await rejectPayment(payment.id)
      if (result.success) {
        toast.success("Pembayaran berhasil ditolak")
        window.location.reload()
      } else {
        toast.error(result.error || "Gagal menolak pembayaran")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/payments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>

        {payment.paymentStatus === "PENDING" && (
          <div className="flex gap-2">
            <Button onClick={handleApprove} disabled={isUpdating} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              Setujui Pembayaran
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isUpdating} className="text-red-600 border-red-600 hover:bg-red-50">
                  <X className="h-4 w-4 mr-2" />
                  Tolak Pembayaran
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
                  <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                    Tolak Pembayaran
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">ID Pembayaran:</span>
              <span className="text-sm">{payment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Nomor Order:</span>
              <span className="text-sm">#{payment.order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Jumlah Dibayar:</span>
              <span className="text-sm font-semibold">{formatCurrency(payment.amountPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Metode Pembayaran:</span>
              <span className="text-sm">{getPaymentMethodText(payment.paymentMethod)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(payment.paymentStatus)}
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Tanggal Pembayaran:</span>
              <span className="text-sm">{formatDate(payment.paymentDate)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pelanggan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Nama:</span>
              <span className="text-sm">{payment.order.customer.name}</span>
            </div>
            {payment.order.customer.email && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{payment.order.customer.email}</span>
              </div>
            )}
            {payment.order.customer.phone && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Telepon:</span>
                <span className="text-sm">{payment.order.customer.phone}</span>
              </div>
            )}
            {payment.order.customer.address && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Alamat:</span>
                <span className="text-sm">{payment.order.customer.address}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bukti Transfer */}
      {payment.proofUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Bukti Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => window.open(payment.proofUrl || "", "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Lihat Bukti Transfer
              </Button>
              <span className="text-sm text-muted-foreground">Klik untuk membuka bukti transfer di tab baru</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payment.order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {item.fruit.image && (
                    <img
                      src={item.fruit.image || "/placeholder.svg"}
                      alt={item.fruit.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.fruit.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
                <span className="font-medium">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(payment.order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
