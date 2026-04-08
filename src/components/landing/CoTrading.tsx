"use client";
import { TrendingUp, Monitor, Zap, Users, GraduationCap, Coffee, ArrowRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import coTradingImage from "@/assets/co-trading.png";

const CoTrading = () => {
    const amenities = [
        { icon: Monitor, text: "Multi-Screen Workstations" },
        { icon: Zap, text: "High-Speed Internet & Power Backup" },
        { icon: TrendingUp, text: "Live Market Access" },
        { icon: Users, text: "Collaborative Trading Community" },
        { icon: GraduationCap, text: "Expert Mentorship Sessions" },
        { icon: Coffee, text: "Premium Refreshments & AC" },
    ];

    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="section-container">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Left: Content */}
                    <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="space-y-6">
                            <Badge variant="outline" className="text-primary font-black uppercase tracking-[0.2em] border-primary/20 bg-primary/5 px-4 py-1.5 rounded-full shadow-sm">
                                Premium Trading Hub
                            </Badge>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1]">
                                Master the Markets in our <span className="text-primary italic underline decoration-primary/20">Co-Trading Spaces</span>
                            </h2>
                            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl font-medium">
                                A collaborative trading platform built for Stock Market and FOREX professionals. Be part of a dynamic ecosystem to learn, strategize, and execute trades in real time.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {amenities.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 group">
                                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    </div>
                                    <span className="text-sm font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 flex flex-col sm:flex-row gap-4">
                            <Link href="/contact">
                                <Button size="xl" className="w-full sm:w-auto rounded-2xl px-12 shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-[0.95] transition-all group h-16 text-lg font-black bg-primary">
                                    Book Your Desk <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/workspaces">
                                <Button variant="outline" size="xl" className="w-full sm:w-auto rounded-2xl px-10 h-16 text-lg font-black border-2 border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                    View Spaces
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right: Visual */}
                    <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
                        <div className="absolute inset-0 bg-primary/20 rounded-[4rem] blur-[100px] opacity-30 -mr-20 -mt-20 scale-110" />
                        <div className="relative aspect-square rounded-[3.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border-8 border-white ring-1 ring-primary/10">
                            <img
                                src={coTradingImage.src}
                                alt="Professional Co-Trading Setup"
                                className="w-full h-full object-cover transition-all duration-1000 scale-100 hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-12">
                                <div className="flex items-center gap-6 backdrop-blur-md bg-white/10 p-6 rounded-3xl border border-white/20 w-full">
                                    <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/40">
                                        <BarChart3 className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white font-black italic text-2xl tracking-tighter">Real-Time Execution</p>
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Professional Grade Infrastructure</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Metric */}
                        <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-primary/10 hidden md:block animate-in zoom-in duration-1000 delay-500">
                            <div className="flex items-center gap-6">
                                <div className="space-y-1">
                                    <p className="text-4xl font-black italic text-primary tracking-tighter">99.9%</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Uptime Guaranteed</p>
                                </div>
                                <div className="w-px h-12 bg-border/50" />
                                <div className="space-y-1">
                                    <p className="text-4xl font-black italic text-emerald-500 tracking-tighter">Live</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Market Insights</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CoTrading;
