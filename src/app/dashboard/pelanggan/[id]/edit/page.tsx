import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { getCustomerById } from "@/actions/customer-actions"
import { EditCustomerForm } from "@/components/customer/edit-customer-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCustomerPage({ params }: PageProps) {
  // Check authentication
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params
  const customerResult = await getCustomerById(id)

  if (!customerResult.success) {
    notFound()
  }

  const customer = customerResult.data

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/customers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Customer</h1>
          <p className="text-gray-600">Update {customer.name}  information</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <EditCustomerForm customer={customer} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
