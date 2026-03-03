import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import WorkspacePreview from "@/components/landing/WorkspacePreview";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <WorkspacePreview />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;



