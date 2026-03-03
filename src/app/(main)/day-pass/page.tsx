"use client";
import DayPassSection from "@/components/landing/DayPassSection";
import { QrCode } from "lucide-react";
import { motion } from "framer-motion";

const DayPass = () => {
    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop"
                        alt="Cohort Workspace"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" />
                </div>
                <div className="relative text-center px-4 z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground backdrop-blur-md mb-6"
                    >
                        <QrCode className="w-5 h-5 text-primary" />
                        <span className="text-sm font-black uppercase tracking-[0.2em]">Guest Access</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter"
                    >
                        DAY <span className="text-primary italic">PASS</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed"
                    >
                        Unlock a world of productivity. Get your complimentary access pass to explore any of our premium centers.
                    </motion.p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
            </section>

            <main className="-mt-20 relative z-20 pb-20">
                <DayPassSection />
            </main>

        </div>
    );
};

export default DayPass;




