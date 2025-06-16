import { getCurrentUserCustomer } from "@/actions/customer-actions"
import { CustomerProfileForm } from "@/components/profile/customer-profile-form"
import { CustomerProfileDisplay } from "@/components/profile/customer-profile-display"
import { auth } from "@/auth"

export default async function ProfilePage() {
  const session = await auth();
  const customerResult = await getCurrentUserCustomer();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}!</h1>
        <p className="text-gray-600">Manage your profile and view your activity</p>
      </div>

      {customerResult.success ? (
        <CustomerProfileDisplay customer={customerResult.data} />
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Complete Your Profile</h2>
            <p className="text-gray-600 mb-6">
              To start shopping and placing orders, please complete your customer profile first.
            </p>
          </div>
          <CustomerProfileForm />
        </div>
      )}
    </div>
  )
}
