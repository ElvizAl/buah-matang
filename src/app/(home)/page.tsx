import ContactSection from "@/components/sections/contact-section";
import { FeaturedProducts } from "@/components/sections/featured-products";
import HeroSection from "@/components/sections/hero-section";
import TestimonialSection from "@/components/sections/testimonial-card";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedProducts />
      <TestimonialSection />
      <ContactSection />
    </div>
  );
}