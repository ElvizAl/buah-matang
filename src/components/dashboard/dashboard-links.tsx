"use client"

import { BarChart3, LayoutDashboard, Package, Settings, ShoppingCart, Users, } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Buah",
    href: "/dashboard/buah",
    icon: Package,
  },
  {
    title: "Pesanan",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "Pembayaran",
    href: "/dashboard/payments",
    icon: ShoppingCart,
  },
  {
    title: "Pelanggan",
    href: "/dashboard/pelanggan",
    icon: Users,
  },
  {
    title: "Laporan",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Pengguna",
    href: "/dashboard/users",
    icon: Users,
  },
]

export const DashboardLinks = () => {
  const pathname = usePathname()
  return (
    <div>
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary",
            pathname === item.href && "bg-muted font-medium text-primary",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </div>
  )
}