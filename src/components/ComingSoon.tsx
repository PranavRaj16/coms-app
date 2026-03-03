import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket } from "lucide-react";

export default function ComingSoon({ title }: { title: string }) {
    return (
        <div className="min-h-[70vh] flex items-center justify-center pt-20">
            <div className="text-center space-y-6 max-w-2xl px-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Rocket className="w-10 h-10 text-primary animate-bounce" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                    {title} is <span className="text-primary">Coming Soon</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    We're working hard to bring you the best experience for {title.toLowerCase()}.
                    Stay tuned for something amazing!
                </p>
                <div className="pt-8">
                    <Button variant="outline" asChild size="lg" className="rounded-full">
                        <Link href="/" className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
