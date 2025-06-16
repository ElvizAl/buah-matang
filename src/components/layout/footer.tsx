import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t bg-muted">
      <div className="max-w-7xl mx-auto px-5 py-5">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Buah Manis. Hak Cipta Dilindungi.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Syarat & Ketentuan
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}