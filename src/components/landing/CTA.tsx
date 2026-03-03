import Link from "next/link"; 
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="section-container">
        <div className="relative hero-gradient rounded-3xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          {/* Floating elements */}
          <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-primary-foreground/10 animate-float" />
          <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-accent/20 animate-float" style={{ animationDelay: '2s' }} />

          <div className="relative px-6 py-16 lg:px-16 lg:py-24 text-center">
            {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm text-primary-foreground/90">
                Start your free trial today
              </span>
            </div> */}

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 max-w-3xl mx-auto">
              Ready to Transform Your Workspace Experience?
            </h2>

            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of companies who have already discovered the future of
              flexible workspace management. Get started in minutes.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="xl" variant="heroSecondary" asChild>
                <Link href="/workspaces">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button size="xl" variant="heroOutline" asChild>
                <Link href="/contact">
                  Talk to Sales
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;





