import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Paintbrush, Sparkles, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import customizedImage from "@/assets/customized-workspace.png";

const CustomizedWorkspace = () => {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-background">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] opacity-30" />

      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Tailored Solutions</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Need a <span className="text-gradient">Customized</span> <br />
                Workspace Architecture?
              </h2>
              <p className="text-lg text-muted-foreground font-medium max-w-xl">
                We design and build bespoke office environments that mirror your brand identify and functional requirements. From ergonomic workstations to private executive cabins.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 shadow-sm border border-border/50">
                  <Paintbrush className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Bespoke Design</h4>
                  <p className="text-sm text-muted-foreground mt-1">Interiors tailored to your brand's aesthetic and core culture.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 shadow-sm border border-border/50">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Flexible Scale</h4>
                  <p className="text-sm text-muted-foreground mt-1">Scale your workspace as your organization grows and evolves.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button size="xl" className="rounded-2xl gap-2 font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" asChild>
                <Link href="/get-quote">
                  Get a Customized Quote
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-[2rem] overflow-hidden shadow-2xl group border-[12px] border-secondary/50">
              <img
                src={customizedImage.src}
                alt="Modern Customized Workspace"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
              
              {/* Floating Card */}
              <div className="absolute bottom-8 left-8 right-8 p-6 glass rounded-2xl border border-white/20 shadow-2xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground uppercase tracking-widest">Enterprise Ready</p>
                    <p className="text-xs text-muted-foreground">Certified premium materials & infrastructure</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full -z-10 animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-accent/10 rounded-3xl -z-10 rotate-12" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomizedWorkspace;
