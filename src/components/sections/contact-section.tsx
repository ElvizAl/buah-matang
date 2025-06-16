import type React from "react"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Phone } from "lucide-react"

export default function ContactSection() {
  return (
    <section id="kontak" className="py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">Kunjungi Toko Kami</h2>
            <p className="text-muted-foreground mb-8">
              Kami memiliki toko fisik di mana Anda dapat melihat dan memilih buah segar secara langsung. Kunjungi kami
              atau hubungi untuk informasi lebih lanjut.
            </p>
            <div className="space-y-4">
              <ContactInfo
                icon={<MapPin className="h-5 w-5 text-green-500 mt-0.5" />}
                title="Alamat"
                details={["Jl. Kenaiban no. 54 karawaci tangerang"]}
              />
              <ContactInfo
                icon={<Phone className="h-5 w-5 text-green-500 mt-0.5" />}
                title="Telepon"
                details={["+62 812 3456 7890"]}
              />
              <ContactInfo
                icon={<Clock className="h-5 w-5 text-green-500 mt-0.5" />}
                title="Jam Buka"
                details={["Senin - Sabtu: 08.00 - 20.00", "Minggu: 09.00 - 18.00"]}
              />
            </div>
            <Button className="mt-6" size="lg">
              Hubungi Kami
            </Button>
          </div>
          <div className="h-[300px] sm:h-[400px] rounded-xl overflow-hidden border shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126920.29279809868!2d106.7588014!3d-6.2295712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x5371bf0fdad786a2!2sJakarta%20Selatan%2C%20Kota%20Jakarta%20Selatan%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sid!2sid!4v1715553851!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Toko Buah"
              className="w-full h-full"
              aria-label="Peta lokasi toko buah kami di Jakarta Selatan"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  )
}

interface ContactInfoProps {
  icon: React.ReactNode
  title: string
  details: string[]
}

function ContactInfo({ icon, title, details }: ContactInfoProps) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <h3 className="font-semibold">{title}</h3>
        {details.map((detail, index) => (
          <p key={index} className="text-muted-foreground">
            {detail}
          </p>
        ))}
      </div>
    </div>
  )
}