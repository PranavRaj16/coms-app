"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Building2,
    Mail,
    Phone,
    User,
    Briefcase,
    Users,
    Calendar,
    Clock,
    MessageSquare,
    AlertCircle,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { submitQuoteRequest } from "@/lib/api";
import { DateTimePicker } from "@/components/ui/date-time-picker";

const GetQuote = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        workEmail: "",
        contactNumber: "",
        firmName: "",
        firmType: "",
        requiredWorkspace: "",
        capacity: 1,
        startDate: "",
        duration: "1 Months",
        additionalRequirements: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { [key: string]: string } = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.workEmail.trim()) {
            newErrors.workEmail = "Work email is required";
        } else if (!validateEmail(formData.workEmail)) {
            newErrors.workEmail = "Invalid email format";
        }
        if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required";
        if (!formData.firmName.trim()) newErrors.firmName = "Firm name is required";
        if (!formData.firmType) newErrors.firmType = "Please select firm type";
        if (!formData.requiredWorkspace) newErrors.requiredWorkspace = "Please select workspace";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please correct the errors in the form");
            return;
        }

        setIsSubmitting(true);
        try {
            await submitQuoteRequest(formData);
            toast.success("Quote request sent successfully! We'll get back to you soon.");
            setFormData({
                fullName: "",
                workEmail: "",
                contactNumber: "",
                firmName: "",
                firmType: "",
                requiredWorkspace: "",
                capacity: 1,
                startDate: "",
                duration: "1 Months",
                additionalRequirements: ""
            });
            setErrors({});
        } catch (error: any) {
            toast.error("Failed to send request: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-24 pb-16">
                <div className="section-container max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-12 space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Get Your <span className="text-gradient">Custom Quote</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Tell us about your workspace needs and our team will prepare a personalized plan for your business.
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="card-elevated p-8 md:p-12 glass shadow-soft-lg">
                        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Personal Info Group */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Personal Information
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                placeholder="Enter your full name"
                                                className={`pl-10 ${errors.fullName ? "border-destructive ring-destructive/20" : ""}`}
                                                value={formData.fullName}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, fullName: e.target.value });
                                                    if (errors.fullName) setErrors({ ...errors, fullName: "" });
                                                }}
                                            />
                                        </div>
                                        {errors.fullName && (
                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <AlertCircle className="w-3 h-3" /> {errors.fullName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Work Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                type="email"
                                                placeholder="email@company.com"
                                                className={`pl-10 ${errors.workEmail ? "border-destructive ring-destructive/20" : ""}`}
                                                value={formData.workEmail}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, workEmail: e.target.value });
                                                    if (errors.workEmail) setErrors({ ...errors, workEmail: "" });
                                                }}
                                            />
                                        </div>
                                        {errors.workEmail && (
                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <AlertCircle className="w-3 h-3" /> {errors.workEmail}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Contact Number</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                placeholder="+91 00000 00000"
                                                className={`pl-10 ${errors.contactNumber ? "border-destructive ring-destructive/20" : ""}`}
                                                value={formData.contactNumber}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, contactNumber: e.target.value });
                                                    if (errors.contactNumber) setErrors({ ...errors, contactNumber: "" });
                                                }}
                                            />
                                        </div>
                                        {errors.contactNumber && (
                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <AlertCircle className="w-3 h-3" /> {errors.contactNumber}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Business Info Group */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                                        <Briefcase className="w-5 h-5 text-primary" />
                                        Business Details
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Firm Name</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                placeholder="Company Name"
                                                className={`pl-10 ${errors.firmName ? "border-destructive ring-destructive/20" : ""}`}
                                                value={formData.firmName}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, firmName: e.target.value });
                                                    if (errors.firmName) setErrors({ ...errors, firmName: "" });
                                                }}
                                            />
                                        </div>
                                        {errors.firmName && (
                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <AlertCircle className="w-3 h-3" /> {errors.firmName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Firm Type</label>
                                        <Select
                                            value={formData.firmType}
                                            onValueChange={(val) => {
                                                setFormData({ ...formData, firmType: val });
                                                if (errors.firmType) setErrors({ ...errors, firmType: "" });
                                            }}
                                        >
                                            <SelectTrigger className={errors.firmType ? "border-destructive ring-destructive/20" : ""}>
                                                <SelectValue placeholder="Select business type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="startup">Startup</SelectItem>
                                                <SelectItem value="enterprise">Enterprise</SelectItem>
                                                <SelectItem value="agency">Agency</SelectItem>
                                                <SelectItem value="freelance">Freelancer</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.firmType && (
                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <AlertCircle className="w-3 h-3" /> {errors.firmType}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Required Workspace</label>
                                        <Select
                                            value={formData.requiredWorkspace}
                                            onValueChange={(val) => {
                                                setFormData({ ...formData, requiredWorkspace: val });
                                                if (errors.requiredWorkspace) setErrors({ ...errors, requiredWorkspace: "" });
                                            }}
                                        >
                                            <SelectTrigger className={errors.requiredWorkspace ? "border-destructive ring-destructive/20" : ""}>
                                                <SelectValue placeholder="Which space do you need?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="dedicated">Dedicated Workspace</SelectItem>
                                                <SelectItem value="open">Open Workstation</SelectItem>
                                                <SelectItem value="boardroom">Board Room</SelectItem>
                                                <SelectItem value="event">Event Space</SelectItem>
                                                <SelectItem value="private">Private Office</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.requiredWorkspace && (
                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <AlertCircle className="w-3 h-3" /> {errors.requiredWorkspace}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Requirement Details Group */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary" />
                                        Seating Capacity
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="Number of people"
                                        min="1"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Planning to start
                                    </label>
                                    <DateTimePicker
                                        date={formData.startDate ? new Date(formData.startDate + 'T00:00:00') : undefined}
                                        setDate={(date) => {
                                            if (date) {
                                                const y = date.getFullYear();
                                                const m = String(date.getMonth() + 1).padStart(2, '0');
                                                const d = String(date.getDate()).padStart(2, '0');
                                                setFormData({ ...formData, startDate: `${y}-${m}-${d}` });
                                            } else {
                                                setFormData({ ...formData, startDate: "" });
                                            }
                                        }}
                                        showTime={false}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        Duration
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="e.g. 6"
                                            className="w-24 h-10 rounded-xl"
                                            value={formData.duration.includes(" ") ? formData.duration.split(" ")[0] : ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const parts = formData.duration.split(" ");
                                                const unit = parts.length > 1 ? parts[1] : (parts[0] || "Months");
                                                setFormData({ ...formData, duration: `${val} ${unit}` });
                                            }}
                                        />
                                        <Select
                                            value={formData.duration.includes(" ") ? formData.duration.split(" ")[1] : (formData.duration || "Months")}
                                            onValueChange={(val) => {
                                                const num = formData.duration.includes(" ") ? formData.duration.split(" ")[0] : (formData.duration && !isNaN(Number(formData.duration)) ? formData.duration : "1");
                                                setFormData({ ...formData, duration: `${num} ${val}` });
                                            }}
                                        >
                                            <SelectTrigger className="flex-1 h-10 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Hours">Hours</SelectItem>
                                                <SelectItem value="Days">Days</SelectItem>
                                                <SelectItem value="Weeks">Weeks</SelectItem>
                                                <SelectItem value="Months">Months</SelectItem>
                                                <SelectItem value="Years">Years</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Comments Group */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-primary" />
                                    Additional Requirements / Comments
                                </label>
                                <Textarea
                                    placeholder="Tell us more about your specific needs or any special requests..."
                                    className="min-h-[120px] resize-none"
                                    value={formData.additionalRequirements}
                                    onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    size="xl"
                                    className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</> : "Submit Quote Request"}
                                </Button>
                                <p className="text-center text-xs text-muted-foreground mt-4">
                                    By submitting this form, you agree to our privacy policy and terms of service.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GetQuote;




