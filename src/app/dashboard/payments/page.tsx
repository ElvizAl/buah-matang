import { getPayments } from "@/actions/payment-actions"
import { PaymentList } from "@/components/payments/payment-list"
import { PaymentStats } from "@/components/payments/payment-stats"

export default async function PaymentsPage() {
  const paymentsResult = await getPayments()
  const payments = paymentsResult.success ? paymentsResult.data : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pembayaran</h1>
          <p className="text-muted-foreground">Kelola semua pembayaran dari pelanggan</p>
        </div>
      </div>

      <PaymentStats payments={payments} />
      <PaymentList payments={payments} />
    </div>
  )
}
