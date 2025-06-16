
import Link from "next/link"
import { Package} from "lucide-react"
import UserDropdown from "@/components/dashboard/user-dropdown"
import { Menus } from "@/components/dashboard/menu"
import { DashboardLinks } from "@/components/dashboard/dashboard-links"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Menus />
        <Link href="/" className="flex items-center gap-2 md:ml-0">
          <Package className="h-6 w-6" />
          <span className="font-bold inline-block">Toko Buah</span>
        </Link>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <UserDropdown />
        </div>
      </header>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            <div className="grid gap-1">
              <DashboardLinks />
            </div>
          </nav>
        </aside>
        <main className="flex flex-col">{children}</main>
      </div>
    </div>
  )
}