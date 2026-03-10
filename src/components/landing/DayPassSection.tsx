import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MessageSquare, QrCode, CheckCircle2, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { submitDayPass } from "@/lib/api";
import { DateTimePicker } from "@/components/ui/date-time-picker";

const DayPassSection = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact: "",
        purpose: "",
        visitDate: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await submitDayPass(formData);
            setIsSubmitted(true);
            toast.success("Day Pass Requested!", {
                description: "Your pass with QR code has been sent to your email."
            });
        } catch (error: any) {
            toast.error("Failed to request day pass", {
                description: error.message || "Please try again later."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="py-12 relative overflow-hidden">
            <div className="container px-4 mx-auto relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4"
                        >
                            <QrCode className="w-3 h-3" />
                            Visitor Registration
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-foreground"
                        >
                            Claim Your <span className="text-primary italic">Complimentary</span> Pass
                        </motion.h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Information Side */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div className="glass p-8 rounded-3xl border-border/50">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                    Why Visit Us?
                                </h3>
                                <ul className="space-y-4">
                                    {[
                                        "Explore flexible workspace options",
                                        "Meet our vibrant community of creators",
                                        "Check out our premium amenities",
                                        "Experience our curated workflow environment"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-3 h-3 text-primary" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-8 rounded-3xl bg-primary text-primary-foreground relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <QrCode className="w-32 h-32" />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-lg font-black mb-2 uppercase tracking-tight">Instant Pass Generation</h4>
                                    <p className="text-primary-foreground/80 text-sm font-medium leading-relaxed">
                                        Fill in your details and receive a digital pass with a unique QR code directly in your inbox.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Form Side */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <AnimatePresence mode="wait">
                                {!isSubmitted ? (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="glass p-8 rounded-[2rem] border-primary/20 shadow-2xl relative"
                                    >
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest ml-1">Full Name</Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            id="name"
                                                            placeholder="John Doe"
                                                            className="pl-9 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="contact" className="text-[10px] font-black uppercase tracking-widest ml-1">Contact Number</Label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            id="contact"
                                                            placeholder="+91 98765 43210"
                                                            className="pl-9 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                                                            value={formData.contact}
                                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest ml-1">Email Address</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="john@example.com"
                                                        className="pl-9 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="visitDate" className="text-[10px] font-black uppercase tracking-widest ml-1">Preferred Date of Visit</Label>
                                                <div className="relative">
                                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <DateTimePicker
                                                        date={formData.visitDate ? new Date(formData.visitDate + 'T00:00:00') : undefined}
                                                        setDate={(date) => {
                                                            if (date) {
                                                                const y = date.getFullYear();
                                                                const m = String(date.getMonth() + 1).padStart(2, '0');
                                                                const d = String(date.getDate()).padStart(2, '0');
                                                                setFormData({ ...formData, visitDate: `${y}-${m}-${d}` });
                                                            } else {
                                                                setFormData({ ...formData, visitDate: "" });
                                                            }
                                                        }}
                                                        showTime={false}
                                                        className="pl-9 bg-background/50 focus:bg-background border-border/50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="purpose" className="text-[10px] font-black uppercase tracking-widest ml-1">Purpose of Visit</Label>
                                                <div className="relative">
                                                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                    <Textarea
                                                        id="purpose"
                                                        placeholder="Tell us what you're looking for..."
                                                        className="pl-9 min-h-[100px] rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                                                        value={formData.purpose}
                                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    "Request Day Pass"
                                                )}
                                            </Button>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass p-12 rounded-[2rem] border-primary/20 text-center space-y-6 flex flex-col items-center justify-center min-h-[500px]"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                            <CheckCircle2 className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-3xl font-black tracking-tight">All Set!</h3>
                                        <p className="text-muted-foreground font-bold">
                                            Your Day Pass has been generated and sent to <span className="text-primary">{formData.email}</span>. Please check your inbox (and spam folder) for the PDF attachment.
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="rounded-xl font-bold h-12"
                                            onClick={() => setIsSubmitted(false)}
                                        >
                                            Request another pass
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DayPassSection;





