"use client";
import { Mail, Phone, MapPin, Send, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import heroImage from "@/assets/hero-office.jpg";
import { useState } from "react";
import { submitContactRequest } from "@/lib/api";
import { toast } from "sonner";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        if (!formData.subject.trim()) newErrors.subject = "Subject is required";
        if (!formData.message.trim()) newErrors.message = "Message cannot be empty";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            await submitContactRequest(formData);
            toast.success("Message sent successfully!");
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        } catch (error: any) {
            toast.error("Failed to send message: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="bg-primary/5 py-24 border-b border-primary/10">

                <div className="section-container text-center space-y-4">

                    <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                        GET IN <span className="text-primary">TOUCH</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        We’d love to hear from you! Whether you have questions or want to explore our services,
                        our team is here to assist you with any inquiries.
                    </p>
                </div>
            </section>

            <main className="section-container py-20">
                <div className="grid lg:grid-cols-2 gap-16">

                    {/* Contact Info Col */}
                    <div className="space-y-12 animate-fade-in">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-foreground">Contact Information</h2>
                            <p className="text-muted-foreground text-lg">
                                Reach out to us through any of these channels or visit our offices.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {/* Address Cards */}
                            <div className="glass p-6 rounded-2xl flex gap-4 border border-primary/10 hover:shadow-soft transition-all">
                                <MapPin className="w-10 h-10 text-primary shrink-0" />
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Kondapur Office</h3>
                                    <p className="text-muted-foreground">
                                        2/91/20, BP Raju Marg, Laxmi Cyber City, Whitefields, Kondapur, Telangana-500081
                                    </p>
                                </div>
                            </div>

                            <div className="glass p-6 rounded-2xl flex gap-4 border border-primary/10 hover:shadow-soft transition-all">
                                <MapPin className="w-10 h-10 text-primary shrink-0" />
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Raidurgam Office</h3>
                                    <p className="text-muted-foreground">
                                        Techno-1, Khajaguda X Road, Rai Durg, Hyderabad, Telangana-500104
                                    </p>
                                </div>
                            </div>

                            <div className="glass p-6 rounded-2xl flex gap-4 border border-primary/10 hover:shadow-soft transition-all">
                                <MapPin className="w-10 h-10 text-primary shrink-0" />
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Secunderabad Office</h3>
                                    <p className="text-muted-foreground">
                                        Gandhi Nagar, Nehru Nagar Colony, West Marredpally, Secunderabad, Telangana-500003
                                    </p>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="glass p-6 rounded-2xl flex gap-4 border border-primary/10 hover:shadow-soft transition-all">
                                    <Phone className="w-8 h-8 text-primary shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Call Us</h3>
                                        <p className="text-muted-foreground">8688151905</p>
                                        <p className="text-muted-foreground">9032251905</p>
                                    </div>
                                </div>
                                <div className="glass p-6 rounded-2xl flex gap-4 border border-primary/10 hover:shadow-soft transition-all">
                                    <Mail className="w-8 h-8 text-primary shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Email Us</h3>
                                        <p className="text-muted-foreground">info@cohortworks.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Col */}
                    <div className="animate-fade-in-up">
                        <div className="bg-card rounded-3xl shadow-soft-lg p-8 md:p-12 border border-border">
                            <h2 className="text-3xl font-bold mb-8 text-foreground">Send a Message</h2>
                            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold ml-1">Your Name</label>
                                        <Input
                                            placeholder="John Doe"
                                            className={`rounded-xl border-primary/10 focus:ring-primary/20 ${errors.name ? "border-destructive ring-destructive/20" : ""}`}
                                            value={formData.name}
                                            onChange={(e) => {
                                                setFormData({ ...formData, name: e.target.value });
                                                if (errors.name) setErrors({ ...errors, name: "" });
                                            }}
                                        />
                                        {errors.name && (
                                            <p className="text-destructive text-xs mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <AlertCircle className="w-3 h-3" /> {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold ml-1">Email Address</label>
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            className={`rounded-xl border-primary/10 focus:ring-primary/20 ${errors.email ? "border-destructive ring-destructive/20" : ""}`}
                                            value={formData.email}
                                            onChange={(e) => {
                                                setFormData({ ...formData, email: e.target.value });
                                                if (errors.email) setErrors({ ...errors, email: "" });
                                            }}
                                        />
                                        {errors.email && (
                                            <p className="text-destructive text-xs mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <AlertCircle className="w-3 h-3" /> {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold ml-1">Phone Number</label>
                                        <Input
                                            type="tel"
                                            placeholder="+91 86881 51905"
                                            className={`rounded-xl border-primary/10 focus:ring-primary/20 ${errors.phone ? "border-destructive ring-destructive/20" : ""}`}
                                            value={formData.phone}
                                            onChange={(e) => {
                                                setFormData({ ...formData, phone: e.target.value });
                                                if (errors.phone) setErrors({ ...errors, phone: "" });
                                            }}
                                        />
                                        {errors.phone && (
                                            <p className="text-destructive text-xs mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <AlertCircle className="w-3 h-3" /> {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold ml-1">Subject</label>
                                        <Input
                                            placeholder="Inquiry about workspaces"
                                            className={`rounded-xl border-primary/10 focus:ring-primary/20 ${errors.subject ? "border-destructive ring-destructive/20" : ""}`}
                                            value={formData.subject}
                                            onChange={(e) => {
                                                setFormData({ ...formData, subject: e.target.value });
                                                if (errors.subject) setErrors({ ...errors, subject: "" });
                                            }}
                                        />
                                        {errors.subject && (
                                            <p className="text-destructive text-xs mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <AlertCircle className="w-3 h-3" /> {errors.subject}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Your Message</label>
                                    <Textarea
                                        placeholder="Tell us how we can help..."
                                        className={`rounded-2xl min-h-[150px] border-primary/10 focus:ring-primary/20 ${errors.message ? "border-destructive ring-destructive/20" : ""}`}
                                        value={formData.message}
                                        onChange={(e) => {
                                            setFormData({ ...formData, message: e.target.value });
                                            if (errors.message) setErrors({ ...errors, message: "" });
                                        }}
                                    />
                                    {errors.message && (
                                        <p className="text-destructive text-xs mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <AlertCircle className="w-3 h-3" /> {errors.message}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    size="xl"
                                    className="w-full rounded-xl gap-2 text-lg shadow-lg hover:shadow-primary/20 transition-all"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</> : <><Send className="mr-2 h-5 w-5" /> Send Message</>}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
};

export default Contact;




