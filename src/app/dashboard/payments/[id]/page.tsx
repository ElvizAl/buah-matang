import { getPaymentById } from "@/actions/payment-actions"
import { notFound } from "next/navigation"
import { PaymentDetail } from "@/components/payments/payment-detail"

interface PaymentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PaymentDetailPage({ params }: PaymentDetailPageProps) {

  const { id } = await params
  const { data: payment, error } = await getPaymentById(id)

  if (!payment || error) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detail Pembayaran</h1>
        <p className="text-muted-foreground">Informasi lengkap pembayaran</p>
      </div>

      <PaymentDetail payment={payment} />
    </div>
  )
}
