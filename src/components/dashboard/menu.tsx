"use client"

import { BarChart3, LayoutDashboard, Menu, Package, Settings, ShoppingCart, Users } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
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
        title: "Inventaris",
        href: "/dashboard/inventory",
        icon: Package,
    },
    {
        title: "Pesanan",
        href: "/dashboard/orders",
        icon: ShoppingCart,
    },
    {
        title: "Pelanggan",
        href: "/dashboard/customers",
        icon: Users,
    },
    {
        title: "Analitik",
        href: "/dashboard/analytics",
        icon: BarChart3,
    },
    {
        title: "Pengaturan",
        href: "/dashboard/settings",
        icon: Settings,
    },
    {
        title: "Pengguna",
        href: "/dashboard/users",
        icon: Settings,
    },
]

export const Menus = () => {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    return (
        <div>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                    <nav className="grid gap-2 text-lg font-medium">
                        <Link href="/" className="flex items-center gap-2 text-lg font-semibold" onClick={() => setOpen(false)}>
                            <Package className="h-6 w-6" />
                            <span className="font-bold">Toko Buah</span>
                        </Link>
                        <div className="mt-8 grid gap-2">
                            {navItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary",
                                        pathname === item.href && "bg-muted font-medium text-primary",
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    )
}