import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { CreateCustomerForm } from "@/components/customer/create-customer-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewCustomerPage() {
  // Check authentication
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

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
          <h1 className="text-3xl font-bold">Add New Customer</h1>
          <p className="text-gray-600">Create a new customer profile</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateCustomerForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
