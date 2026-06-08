import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { NosotrosSection } from '@/components/landing/NosotrosSection';
import { ServiciosSection } from '@/components/landing/ServiciosSection';
import { ProductosSection } from '@/components/landing/ProductosSection';
import { ProcesoSection } from '@/components/landing/ProcesoSection';
import { TecnologiasSection } from '@/components/landing/TecnologiasSection';
import { ContactoSection } from '@/components/landing/ContactoSection';
import { Footer } from '@/components/landing/Footer';
import { ChatBot } from '@/components/landing/ChatBot';

export default function LandingPage() {
  return (
    <main className="bg-cream">
      <Navbar />
      <HeroSection />
      <NosotrosSection />
      <ServiciosSection />
      <ProductosSection />
      <ProcesoSection />
      <TecnologiasSection />
      <ContactoSection />
      <Footer />
      <ChatBot />
    </main>
  );
}
