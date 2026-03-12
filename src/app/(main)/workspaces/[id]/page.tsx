"use client";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import { workspaces as initialWorkspaces } from "@/data/workspaces";
import { useEffect, useState } from "react";
import { fetchWorkspaceById, submitBookingRequest, submitVisitRequest } from "@/lib/api";
import { Workspace as WorkspaceType } from "@/data/workspaces";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Users,
    Wifi,
    Coffee,
    Clock,
    Shield,
    ArrowLeft,
    CheckCircle2,
    Waves,
    Building,
    Zap,
    Image as ImageIcon,
    X,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Calendar as CalendarIcon,
    Loader2,
    AlertCircle
} from "lucide-react";
import NotFound from "@/components/NotFound";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DEFAULT_WORKSPACE_IMAGE } from "@/lib/constants";

const WorkspaceDetails = () => {
    const params = useParams();
    const id = String(params?.id ?? '');
    const [workspace, setWorkspace] = useState<WorkspaceType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Booking Modal State
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingData, setBookingData] = useState({
        name: "",
        contact: "",
        email: "",
        firmName: "",
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) as Date | undefined,
        paymentMethod: "Pay Now",
        startDate: new Date() as Date | undefined
    });

    const [isVisitOpen, setIsVisitOpen] = useState(false);
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
    const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);

    const estimatedTotal = useMemo(() => {
        if (!workspace || !bookingData.startDate || !bookingData.endDate) return 0;
        
        const diffTime = Math.abs(bookingData.endDate.getTime() - bookingData.startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        const price = Number(workspace.price) || 0;
        // Calculate based on daily rate (monthly / 30.44)
        const dailyRate = price / 30.44;
        
        return Math.ceil(dailyRate * diffDays);
    }, [workspace, bookingData.startDate, bookingData.endDate]);
    const [visitData, setVisitData] = useState({
        name: "",
        contact: "",
        email: "",
        visitDate: undefined as Date | undefined
    });

    const [bookingErrors, setBookingErrors] = useState<{ [key: string]: string }>({});
    const [visitErrors, setVisitErrors] = useState<{ [key: string]: string }>({});

    const validateBookingForm = () => {
        const errors: { [key: string]: string } = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!bookingData.name.trim()) errors.name = "Full name is required";
        if (!bookingData.email.trim()) {
            errors.email = "Email is required";
        } else if (!emailRegex.test(bookingData.email)) {
            errors.email = "Invalid email format";
        }
        if (!bookingData.contact.trim()) errors.contact = "Contact number is required";
        if (!bookingData.startDate) errors.startDate = "Start date is required";
        if (!bookingData.endDate) errors.endDate = "End date is required";

        setBookingErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateVisitForm = () => {
        const errors: { [key: string]: string } = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!visitData.name.trim()) errors.name = "Full name is required";
        if (!visitData.email.trim()) {
            errors.email = "Email is required";
        } else if (!emailRegex.test(visitData.email)) {
            errors.email = "Invalid email format";
        }
        if (!visitData.contact.trim()) errors.contact = "Contact number is required";
        if (!visitData.visitDate) errors.visitDate = "Visit date is required";

        setVisitErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateBookingForm()) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        setIsSubmittingBooking(true);

        const calcDuration = () => {
            if (!bookingData.startDate || !bookingData.endDate) return "N/A";
            const diffTime = Math.abs(bookingData.endDate.getTime() - bookingData.startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
            return `${diffDays} Days`;
        };

        try {
            const payload = {
                workspaceId: id,
                workspaceName: workspace?.name,
                fullName: bookingData.name,
                email: bookingData.email,
                contactNumber: bookingData.contact,
                firmName: bookingData.firmName,
                duration: calcDuration(),
                paymentMethod: bookingData.paymentMethod,
                startDate: bookingData.startDate ? (() => {
                    const d = bookingData.startDate;
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                })() : undefined
            };

            await submitBookingRequest(payload);

            toast.success("Booking request submitted successfully! Admin will contact you soon.");
            setIsBookingOpen(false);
            setBookingData({
                name: "",
                contact: "",
                email: "",
                firmName: "",
                endDate: undefined,
                paymentMethod: "Pay Now",
                startDate: undefined
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to submit booking request");
        } finally {
            setIsSubmittingBooking(false);
        }
    };

    const handleVisitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateVisitForm()) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        setIsSubmittingVisit(true);
        try {
            const payload = {
                workspaceId: id,
                workspaceName: workspace?.name,
                fullName: visitData.name,
                email: visitData.email,
                contactNumber: visitData.contact,
                visitDate: visitData.visitDate ? (() => {
                    const d = visitData.visitDate;
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                })() : undefined
            };

            await submitVisitRequest(payload);

            toast.success("Visit request scheduled successfully!");
            setIsVisitOpen(false);
            setVisitData({
                name: "",
                contact: "",
                email: "",
                visitDate: undefined
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to schedule visit");
        } finally {
            setIsSubmittingVisit(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: value }));
    };

    const allImages = workspace ? [(workspace.image || DEFAULT_WORKSPACE_IMAGE), ...(workspace.images?.filter(img => img && img !== workspace.image) || [])] : [];

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setIsLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        document.body.style.overflow = 'unset';
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, allImages.length]);

    useEffect(() => {
        const loadWorkspace = async () => {
            if (!id) return;
            try {
                const data = await fetchWorkspaceById(id);
                setWorkspace(data);
            } catch (error: any) {
                console.error("Failed to fetch workspace:", error);
                // Fallback to static data for demo if it matches numeric id
                const staticWs = initialWorkspaces.find(ws => ws.id === Number(id));
                if (staticWs) {
                    setWorkspace(staticWs as any);
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadWorkspace();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-xl font-bold">Loading workspace...</p>
            </div>
        );
    }

    if (!workspace) {
        return <NotFound />;
    }

    const now = new Date();
    const allotmentStart = workspace.allotmentStart ? new Date(workspace.allotmentStart) : null;
    const isUnavailable = !!workspace.allottedTo && (!allotmentStart || now >= allotmentStart);
    const availableUntil = !!workspace.allottedTo && allotmentStart && now < allotmentStart ? allotmentStart : null;

    const iconMap: Record<string, any> = {
        "High-speed WiFi": <Wifi className="w-5 h-5" />,
        "Coffee Bar": <Coffee className="w-5 h-5" />,
        "24/7 Access": <Clock className="w-5 h-5" />,
        "Presentation Room": <Zap className="w-5 h-5" />,
        "Smart Board": <Zap className="w-5 h-5" />,
        "AV Equipment": <Zap className="w-5 h-5" />,
        "Catering Available": <Coffee className="w-5 h-5" />,
        "Parking": <Shield className="w-5 h-5" />,
        "Private Entry": <Shield className="w-5 h-5" />,
        "Printer Access": <CheckCircle2 className="w-5 h-5" />,
        "Natural Light": <Zap className="w-5 h-5" />,
        "Studio Backgrounds": <Waves className="w-5 h-5" />,
        "WiFi": <Wifi className="w-5 h-5" />,
        "Coffee": <Coffee className="w-5 h-5" />,
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-28 pb-16">
                <div className="section-container">
                    {/* Back Button */}
                    <Link
                        href="/workspaces"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Workspaces
                    </Link>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Left Column: Image and Details */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[600px]">
                                <div
                                    className={`${allImages.length > 1 ? 'md:col-span-3' : 'md:col-span-4'} relative rounded-[32px] overflow-hidden shadow-2xl h-full group cursor-zoom-in`}
                                    onClick={() => openLightbox(0)}
                                >
                                    <img
                                        src={workspace.image || DEFAULT_WORKSPACE_IMAGE}
                                        alt={workspace.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-bottom p-8 md:p-12 transition-opacity group-hover:opacity-90">
                                        <div className="mt-auto w-full">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                                    <span className="px-4 py-1.5 rounded-full bg-primary/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                                                        {workspace.type}
                                                    </span>
                                                    {workspace.featured && !isUnavailable && (
                                                        <span className="px-4 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                                                            Featured
                                                        </span>
                                                    )}
                                                    {isUnavailable && (
                                                        <div className="px-4 py-1.5 rounded-full bg-destructive/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-2 ring-2 ring-destructive/20 animate-pulse">
                                                            <Clock className="w-3 h-3" />
                                                            Unavailable
                                                        </div>
                                                    )}
                                                    {availableUntil && (
                                                        <div className="px-4 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-2 ring-2 ring-amber-500/20">
                                                            <Clock className="w-3 h-3" />
                                                            Available Until {new Date(availableUntil.getTime() - 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                                    <Maximize2 className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-2xl">
                                                {workspace.name}
                                            </h1>
                                            <div className="flex items-center gap-2 text-white/80 font-bold text-sm">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                {workspace.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {allImages.length > 1 && (
                                    <div className="hidden md:flex flex-col gap-4">
                                        {allImages.slice(1, 3).map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="flex-1 relative rounded-[24px] overflow-hidden shadow-lg border border-white/10 group cursor-zoom-in group/item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openLightbox(idx + 1);
                                                }}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`${workspace.name} gallery ${idx}`}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transform scale-75 group-hover/item:scale-100 transition-transform">
                                                        <Zap className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {allImages.length === 2 && (
                                            <div className="flex-1 relative rounded-[24px] overflow-hidden bg-muted/20 border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-muted-foreground/40 italic text-[10px] p-4 text-center">
                                                <ImageIcon className="w-6 h-6 mb-2 opacity-20" />
                                                Additional views arriving soon
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-6 items-center border-b pb-6 border-border">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <span className="font-medium">{workspace.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        <span className="font-medium">Up to {workspace.capacity}</span>
                                    </div>
                                    {workspace.floor && (
                                        <div className="flex items-center gap-2">
                                            <Building className="w-5 h-5 text-primary" />
                                            <span className="font-medium">{workspace.floor}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold">About this space</h2>
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        {workspace.description || "Beautiful and professional workspace designed for maximum productivity and comfort. Perfect for focused work or collaborative team sessions."}
                                    </p>
                                </div>

                                {workspace.type === "Dedicated Workspace" && workspace.features && (
                                    <div className="space-y-4 p-8 rounded-3xl bg-gradient-to-br from-primary/5 via-background to-background border border-primary/10 shadow-inner">
                                        <h2 className="text-xl font-black uppercase tracking-widest text-primary/80">Configuration</h2>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-primary/20 shadow-lg shadow-primary/5 ring-4 ring-primary/5 transition-transform hover:scale-[1.02]">
                                                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-bold">{workspace.features.workstationSeats || 0} Workstations</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Core Area</span>
                                                </div>
                                            </div>
                                            {workspace.features.hasConferenceHall && (
                                                <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-primary/20 shadow-lg shadow-primary/5 ring-4 ring-primary/5 transition-transform hover:scale-[1.02]">
                                                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
                                                        <Building className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-bold">Conf. Hall ({workspace.features.conferenceHallSeats || 0} Seats)</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Included in Plan</span>
                                                    </div>
                                                </div>
                                            )}
                                            {workspace.features.hasCabin && (
                                                <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-primary/20 shadow-lg shadow-primary/5 ring-4 ring-primary/5 transition-transform hover:scale-[1.02]">
                                                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
                                                        <Shield className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-bold">Private Cabin ({workspace.features.cabinSeats || 0} Seats)</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Included in Plan</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold">What's included</h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {workspace.amenities?.map((amenity: string) => (
                                            <div key={amenity} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-sm">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                    {iconMap[amenity] || <CheckCircle2 className="w-5 h-5" />}
                                                </div>
                                                <span className="font-medium">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Booking Card */}
                        <div className="space-y-6">
                            <div className="sticky top-28 p-8 rounded-3xl bg-card border border-border shadow-2xl space-y-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Pricing</p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {workspace.price && Number(workspace.price) > 0
                                            ? `₹${Number(workspace.price).toLocaleString('en-IN')} / month`
                                            : "Contact for Pricing"}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {isUnavailable && (
                                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-destructive font-black text-[10px] uppercase tracking-widest">
                                                <Clock className="w-4 h-4" />
                                                Currently Booked
                                            </div>
                                            <p className="text-xs font-bold text-destructive/80">
                                                This space is currently occupied and unavailable for immediate booking.
                                            </p>
                                        </div>
                                    )}

                                    {availableUntil && (
                                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest">
                                                <Clock className="w-4 h-4" />
                                                Upcoming Booking
                                            </div>
                                            <p className="text-xs font-bold text-amber-700/80">
                                                Available for use until {new Date(availableUntil.getTime() - 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        size="lg"
                                        className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20"
                                        onClick={() => setIsBookingOpen(true)}
                                    >
                                        Book Now
                                    </Button>

                                    <Button variant="outline" size="lg" className="w-full h-14 rounded-xl text-lg font-bold" onClick={() => setIsVisitOpen(true)}>
                                        Schedule a Visit
                                    </Button>
                                </div>

                                <p className="text-center text-xs text-muted-foreground">
                                    No hidden charges. Instant confirmation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Book {workspace.name}</DialogTitle>
                        <DialogDescription>
                            Enter your details below to request a booking for this workspace.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBookingSubmit} className="space-y-6 mt-4" noValidate>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    className={bookingErrors.name ? "border-destructive ring-destructive/20" : ""}
                                    value={bookingData.name}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        if (bookingErrors.name) setBookingErrors({ ...bookingErrors, name: "" });
                                    }}
                                />
                                {bookingErrors.name && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {bookingErrors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact">Contact Number</Label>
                                    <Input
                                        id="contact"
                                        name="contact"
                                        placeholder="+91 9876..."
                                        className={bookingErrors.contact ? "border-destructive ring-destructive/20" : ""}
                                        value={bookingData.contact}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            if (bookingErrors.contact) setBookingErrors({ ...bookingErrors, contact: "" });
                                        }}
                                    />
                                    {bookingErrors.contact && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {bookingErrors.contact}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        className={bookingErrors.email ? "border-destructive ring-destructive/20" : ""}
                                        value={bookingData.email}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            if (bookingErrors.email) setBookingErrors({ ...bookingErrors, email: "" });
                                        }}
                                    />
                                    {bookingErrors.email && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {bookingErrors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="firmName">Firm/Company Name</Label>
                                <Input
                                    id="firmName"
                                    name="firmName"
                                    placeholder="Acme Inc."
                                    value={bookingData.firmName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 flex flex-col">
                                    <Label className="mb-2">Start Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-12 rounded-xl",
                                                    !bookingData.startDate && "text-muted-foreground",
                                                    bookingErrors.startDate && "border-destructive ring-destructive/20"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {bookingData.startDate ? format(bookingData.startDate, "PP") : <span>Start date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 z-[200]">
                                            <Calendar
                                                mode="single"
                                                selected={bookingData.startDate}
                                                onSelect={(date) => {
                                                    setBookingData(prev => ({ ...prev, startDate: date, endDate: date && prev.endDate && date > prev.endDate ? undefined : prev.endDate }));
                                                    if (bookingErrors.startDate) setBookingErrors({ ...bookingErrors, startDate: "" });
                                                }}
                                                disabled={(date) => {
                                                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                                    const isAfterAllotment = availableUntil ? date >= availableUntil : false;
                                                    return isPast || isAfterAllotment;
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {bookingErrors.startDate && <p className="text-destructive text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {bookingErrors.startDate}</p>}
                                </div>

                                <div className="space-y-2 flex flex-col">
                                    <Label className="mb-2">End Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-12 rounded-xl",
                                                    !bookingData.endDate && "text-muted-foreground",
                                                    bookingErrors.endDate && "border-destructive ring-destructive/20"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {bookingData.endDate ? format(bookingData.endDate, "PP") : <span>End date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 z-[200]">
                                            <Calendar
                                                mode="single"
                                                selected={bookingData.endDate}
                                                onSelect={(date) => {
                                                    setBookingData(prev => ({ ...prev, endDate: date }));
                                                    if (bookingErrors.endDate) setBookingErrors({ ...bookingErrors, endDate: "" });
                                                }}
                                                disabled={(date) => {
                                                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                                    const isBeforeStart = bookingData.startDate ? date < bookingData.startDate : false;
                                                    const isAfterAllotment = availableUntil ? date >= availableUntil : false;
                                                    return isPast || isBeforeStart || isAfterAllotment;
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {bookingErrors.endDate && <p className="text-destructive text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {bookingErrors.endDate}</p>}
                                </div>
                            </div>

                            {bookingData.startDate && bookingData.endDate && (
                                <div className="space-y-3">
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between animate-in fade-in zoom-in-95">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Duration</p>
                                            <p className="text-sm font-bold flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5" />
                                                {(() => {
                                                    const diffTime = Math.abs(bookingData.endDate.getTime() - bookingData.startDate.getTime());
                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                                    return `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
                                                })()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Estimated Total</p>
                                            <p className="text-xl font-black text-primary italic">₹{estimatedTotal.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setIsBookingOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmittingBooking}>
                                {isSubmittingBooking ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : "Pay Now"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isVisitOpen} onOpenChange={setIsVisitOpen}>
                <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Schedule a Visit to {workspace.name}</DialogTitle>
                        <DialogDescription>
                            Enter your details below to coordinate a visit to this workspace.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleVisitSubmit} className="space-y-6 mt-4" noValidate>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="vname">Full Name</Label>
                                <Input
                                    id="vname"
                                    placeholder="John Doe"
                                    className={visitErrors.name ? "border-destructive ring-destructive/20" : ""}
                                    value={visitData.name}
                                    onChange={(e) => {
                                        setVisitData(prev => ({ ...prev, name: e.target.value }));
                                        if (visitErrors.name) setVisitErrors({ ...visitErrors, name: "" });
                                    }}
                                />
                                {visitErrors.name && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {visitErrors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vcontact">Contact Number</Label>
                                    <Input
                                        id="vcontact"
                                        placeholder="+91 9876..."
                                        className={visitErrors.contact ? "border-destructive ring-destructive/20" : ""}
                                        value={visitData.contact}
                                        onChange={(e) => {
                                            setVisitData(prev => ({ ...prev, contact: e.target.value }));
                                            if (visitErrors.contact) setVisitErrors({ ...visitErrors, contact: "" });
                                        }}
                                    />
                                    {visitErrors.contact && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {visitErrors.contact}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vemail">Email Address</Label>
                                    <Input
                                        id="vemail"
                                        type="email"
                                        placeholder="john@example.com"
                                        className={visitErrors.email ? "border-destructive ring-destructive/20" : ""}
                                        value={visitData.email}
                                        onChange={(e) => {
                                            setVisitData(prev => ({ ...prev, email: e.target.value }));
                                            if (visitErrors.email) setVisitErrors({ ...visitErrors, email: "" });
                                        }}
                                    />
                                    {visitErrors.email && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {visitErrors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label className="mb-2">Planning to Visit on</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !visitData.visitDate && "text-muted-foreground",
                                                visitErrors.visitDate && "border-destructive ring-destructive/20"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {visitData.visitDate ? format(visitData.visitDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-[200]">
                                        <Calendar
                                            mode="single"
                                            selected={visitData.visitDate}
                                            onSelect={(date) => {
                                                setVisitData(prev => ({ ...prev, visitDate: date }));
                                                if (visitErrors.visitDate) setVisitErrors({ ...visitErrors, visitDate: "" });
                                            }}
                                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {visitErrors.visitDate && <p className="text-destructive text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {visitErrors.visitDate}</p>}
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setIsVisitOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmittingVisit}>
                                {isSubmittingVisit ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Scheduling...
                                    </>
                                ) : "Schedule Visit"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Lightbox / Gallery View */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300"
                    onClick={closeLightbox}
                >
                    <button
                        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[110]"
                        onClick={closeLightbox}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center px-4 md:px-20 py-20">
                        {allImages.length > 1 && (
                            <>
                                <button
                                    className="absolute left-6 p-4 rounded-full bg-white/5 text-white hover:bg-white/15 transition-all hidden md:block"
                                    onClick={prevImage}
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    className="absolute right-6 p-4 rounded-full bg-white/5 text-white hover:bg-white/15 transition-all hidden md:block"
                                    onClick={nextImage}
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}

                        <div
                            className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-[-40px] left-0 text-white/70 font-bold text-sm tracking-widest uppercase">
                                {workspace.name} • {currentImageIndex + 1} / {allImages.length}
                            </div>
                            <img
                                src={allImages[currentImageIndex]}
                                alt="Workspace View"
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl ring-1 ring-white/20 select-none"
                            />

                            <div className="absolute bottom-[-60px] flex gap-2">
                                {allImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-primary w-8' : 'bg-white/30'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(idx);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceDetails;
