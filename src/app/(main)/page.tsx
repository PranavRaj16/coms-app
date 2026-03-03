"use client";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import WorkspacePreview from "@/components/landing/WorkspacePreview";
import CTA from "@/components/landing/CTA";

export default function Home() {
  return (
    <main className="bg-background">
      <Hero />
      <Features />
      <WorkspacePreview />
      <CTA />
    </main>
  );
}






