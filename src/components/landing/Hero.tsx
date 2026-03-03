import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-office.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage.src}
          alt="Modern office workspace"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 image-overlay" />
      </div>

      {/* Content */}
      <div className="relative section-container pt-20 pb-16">
        <div className="max-w-3xl">
          {/* Badge */}
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-primary-foreground/90">
              Trusted by 500+ companies worldwide
            </span>
          </div> */}

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-in-up">
            Find Your Perfect{" "}
            <span className="relative">
              Workspace
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
              >
                <path
                  d="M2 10C50 2 150 2 198 10"
                  stroke="hsl(var(--accent))"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            Today
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8 max-w-2xl animate-fade-in-delay-1">
            Discover and manage premium office spaces effortlessly. Whether you're an
            admin looking to optimize resources or a professional seeking the ideal
            environment — we've got you covered.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 animate-fade-in-delay-2">
            <Button size="xl" variant="hero" asChild>
              <Link href="/workspaces">
                Browse Workspaces
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button size="xl" variant="heroOutline" asChild>
              <Link href="/login">
                <Play className="w-5 h-5 mr-1" />
                Login
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-primary-foreground/20 animate-fade-in-delay-3">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                50+
              </div>
              <div className="text-sm text-primary-foreground/70 mt-1">
                Premium Locations
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                10k+
              </div>
              <div className="text-sm text-primary-foreground/70 mt-1">
                Happy Members
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                99%
              </div>
              <div className="text-sm text-primary-foreground/70 mt-1">
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;





