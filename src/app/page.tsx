import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { VisualRail } from "@/components/sections/VisualRail";
import { Services } from "@/components/sections/Services";
import { Offers } from "@/components/sections/Offers";
import { About } from "@/components/sections/About";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { Calculator } from "@/components/sections/Calculator";
import { LeadMagnet } from "@/components/sections/LeadMagnet";
import { Simulator } from "@/components/sections/Simulator";
import { Insights } from "@/components/sections/Insights";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ScrollTop } from "@/components/ui/ScrollTop";
import { StickyCTA } from "@/components/ui/StickyCTA";
import { ScrollAIBackground } from "@/components/three/ScrollAIBackground";
import { MicroInteractions } from "@/components/effects/MicroInteractions";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AltivoxAi",
    url: "https://www.altivoxai.es",
    logo: "https://www.altivoxai.es/favicon.png",
    email: "info@altivoxai.es",
    description:
      "Agencia de IA para pymes: chatbots, automatización de leads y agentes conversacionales.",
    areaServed: "ES",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ScrollAIBackground />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <VisualRail />
        <Services />
        <Offers />
        <About />
        <CaseStudies />
        <Calculator />
        <LeadMagnet />
        <Simulator />
        <Insights />
        <Testimonials />
        <Faq />
        <FinalCTA />
        <Contact />
      </main>
      <Footer />
      <StickyCTA />
      <ChatWidget />
      <ScrollTop />
      <MicroInteractions />
    </>
  );
}
