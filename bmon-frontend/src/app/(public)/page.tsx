import { Navbar } from '@/components/layout/Navbar';
import { IntroGate, introScript } from '@/components/landing/IntroGate';
import { HeroSection } from '@/components/landing/HeroSection';
import { NosotrosSection } from '@/components/landing/NosotrosSection';
import { ServiciosSection } from '@/components/landing/ServiciosSection';
import { SistemasShowcase } from '@/components/SistemasShowcase';
import { ProductosSection } from '@/components/landing/ProductosSection';
import { ProcesoSection } from '@/components/landing/ProcesoSection';
import { TecnologiasSection } from '@/components/landing/TecnologiasSection';
import { ContactoSection } from '@/components/landing/ContactoSection';
import { Footer } from '@/components/landing/Footer';
import { ChatBot } from '@/components/landing/ChatBot';

export default function LandingPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: introScript }} />
      <IntroGate>
        <main className="bg-cream overflow-x-clip">
          <Navbar />
          <HeroSection />
          <NosotrosSection />
          <ServiciosSection />
          <SistemasShowcase />
          <ProductosSection />
          <ProcesoSection />
          <TecnologiasSection />
          <ContactoSection />
          <Footer />
          <ChatBot />
        </main>
      </IntroGate>
    </>
  );
}
