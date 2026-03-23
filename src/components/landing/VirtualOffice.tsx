"use client";
import { Mail, Phone, MapPin, CheckCircle2, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import virtualOfficeImage from "@/assets/virtual-office.png";

const VirtualOffice = () => {
    return (
        <section className="py-24 bg-primary/[0.02] border-y border-primary/5">
            <div className="section-container">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Visual */}
                    <div className="relative order-1 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="absolute inset-0 bg-primary/10 rounded-[4rem] blur-[80px] opacity-40 -ml-20 -mb-20" />
                        <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/80 ring-1 ring-primary/10">
                            <img
                                src={virtualOfficeImage.src}
                                alt="Virtual Office Ambience"
                                className="w-full h-full object-cover grayscale-[0.1] hover:grayscale-0 transition-all duration-1000 scale-100 hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-12">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/30 ring-2 ring-white/20">
                                        <Building2 className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white font-black italic text-2xl tracking-tighter">Prestigious Corporate Identity</p>
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Harness Global Hub Standards</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Float Badge */}
                        <div className="absolute -top-8 -left-8 bg-white/90 backdrop-blur-md p-5 rounded-[2.5rem] shadow-2xl border border-primary/20 animate-bounce duration-[4000ms] hidden md:flex items-center gap-4 hover:scale-110 transition-transform">
                            <div className="relative">
                                <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse" />
                                <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 leading-none mb-1">Live Registration</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60 leading-none">Global Coverage Hub</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="space-y-8 order-2 animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="space-y-4">
                            <Badge variant="outline" className="text-primary font-black uppercase tracking-[0.2em] border-primary/20 bg-primary/5 px-4 py-1 rounded-full">
                                Virtual Presence
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                Establish Your Business Presence Anywhere with <span className="text-primary italic underline decoration-primary/20">Virtual Offices</span>
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                                Enhance your corporate image without the overhead of a physical space. Cohort Virtual Offices provide you with a prestigious business address, mail handling, and professional support services.
                            </p>
                        </div>

                        <div className="pt-4">
                            <Link href="/contact" className="inline-block">
                                <Button size="xl" className="rounded-2xl px-10 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group h-16 text-lg font-black bg-primary">
                                    Contact Us <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VirtualOffice;
