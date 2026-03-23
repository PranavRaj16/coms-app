"use client";
import dynamic from "next/dynamic";
import Hero from "@/components/landing/Hero";

// Lazy load components that are below the fold
const Features = dynamic(() => import("@/components/landing/Features"), {
  loading: () => <div className="h-96 animate-pulse bg-muted" />,
});
const WorkspacePreview = dynamic(() => import("@/components/landing/WorkspacePreview"), {
  loading: () => <div className="h-96 animate-pulse bg-muted" />,
});
const CustomizedWorkspace = dynamic(() => import("@/components/landing/CustomizedWorkspace"), {
  loading: () => <div className="h-96 animate-pulse bg-muted" />,
});
const CTA = dynamic(() => import("@/components/landing/CTA"), {
  loading: () => <div className="h-64 animate-pulse bg-muted" />,
});

export default function Home() {
  return (
    <main className="bg-background">
      <Hero />
      <Features />
      <WorkspacePreview />
      <CustomizedWorkspace />
      <CTA />
    </main>
  );
}






