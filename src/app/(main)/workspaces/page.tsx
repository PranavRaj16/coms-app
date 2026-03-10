"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    MapPin,
    Users,
    Filter,
    X,
    ChevronDown,
    LayoutGrid,
    List,
    ArrowRight,
    Building2,
    ShieldCheck,
    Clock
} from "lucide-react";
import Link from "next/link"; import { } from "next/navigation";
import { useEffect } from "react";
import { fetchWorkspaces } from "@/lib/api";
import { workspaces as initialWorkspaces, Workspace as WorkspaceType } from "@/data/workspaces";
import { toast } from "sonner";
import { DEFAULT_WORKSPACE_IMAGE } from "@/lib/constants";

const Workspaces = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("All Locations");
    const [selectedType, setSelectedType] = useState("All Types");
    const [availabilityFilter, setAvailabilityFilter] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadWorkspaces = async () => {
            try {
                const data = await fetchWorkspaces();
                setWorkspaces(data);
            } catch (error: any) {
                console.error("Failed to fetch workspaces:", error);
                toast.error("Failed to load workspaces. Using fallback data.");
                setWorkspaces(initialWorkspaces);
            } finally {
                setIsLoading(false);
            }
        };
        loadWorkspaces();
    }, []);

    const locations = useMemo(() => {
        const uniqueLocations = Array.from(new Set(workspaces.map(ws => ws.location)));
        return ["All Locations", ...uniqueLocations.filter(Boolean)];
    }, [workspaces]);

    const types = useMemo(() => {
        const uniqueTypes = Array.from(new Set(workspaces.map(ws => ws.type)));
        return ["All Types", ...uniqueTypes.filter(Boolean)];
    }, [workspaces]);

    const filteredWorkspaces = useMemo(() => {
        return workspaces.filter(ws => {
            const matchesSearch = ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ws.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLocation = selectedLocation === "All Locations" || ws.location === selectedLocation;
            const matchesType = selectedType === "All Types" || ws.type === selectedType;

            const isAllotted = !!ws.allottedTo;
            const matchesAvailability = availabilityFilter === "All" ||
                (availabilityFilter === "Available" && !isAllotted) ||
                (availabilityFilter === "Unavailable" && isAllotted);

            return matchesSearch && matchesLocation && matchesType && matchesAvailability;
        }).sort((a, b) => {
            const now = new Date();
            const getPriority = (ws: any) => {
                const allotmentStart = ws.allotmentStart ? new Date(ws.allotmentStart) : null;
                const isUnavailable = !!ws.allottedTo && (!allotmentStart || now >= allotmentStart);
                const isPreBooked = !!ws.allottedTo && allotmentStart && now < allotmentStart;
                
                if (isUnavailable) return 2;
                if (isPreBooked) return 1;
                return 0;
            };

            const aPriority = getPriority(a);
            const bPriority = getPriority(b);

            if (aPriority !== bPriority) return aPriority - bPriority;
            
            // Secondary sort: Featured first
            if (a.featured !== b.featured) return a.featured ? -1 : 1;
            
            return 0;
        });
    }, [searchTerm, selectedLocation, selectedType, availabilityFilter, workspaces]);

    return (
        <div className="bg-background">
            {/* Hero / Search Header */}
            <section className="pt-32 pb-16 bg-primary/5 border-b border-primary/10">
                <div className="section-container">
                    <div className="max-w-3xl space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                            Find Your <span className="text-primary">Ideal Workspace</span>
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Explore our diverse range of professional spaces across prime locations.
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="mt-8 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search by name or location..."
                                className="pl-10 h-12 rounded-xl border-primary/10 bg-card shadow-soft-lg transition-all focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-12 rounded-xl flex gap-2 border-primary/10 bg-card shadow-soft"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                            </Button>
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {isFilterOpen && (
                        <div className="mt-4 p-6 glass rounded-2xl border border-primary/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Location</label>
                                <div className="flex flex-wrap gap-2">
                                    {locations.map(loc => (
                                        <button
                                            key={loc}
                                            onClick={() => setSelectedLocation(loc)}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedLocation === loc
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                }`}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Space Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {types.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedType === type
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Availability</label>
                                <div className="flex flex-wrap gap-2">
                                    {["All", "Available", "Unavailable"].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setAvailabilityFilter(status)}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${availabilityFilter === status
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-end justify-end pt-4 border-t border-primary/5 mt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedLocation("All Locations");
                                        setSelectedType("All Types");
                                        setAvailabilityFilter("All");
                                        setSearchTerm("");
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Clear All Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Results Section */}
            <main className="section-container py-16">
                <div className="flex items-center justify-between mb-8">
                    <p className="text-muted-foreground">
                        {isLoading ? (
                            "Loading workspaces..."
                        ) : (
                            <>Showing <span className="font-semibold text-foreground">{filteredWorkspaces.length}</span> results</>
                        )}
                    </p>
                    <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                        <button className="p-1.5 rounded-md bg-card shadow-sm text-primary"><LayoutGrid className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-md text-muted-foreground hover:bg-card/50"><List className="w-4 h-4" /></button>
                    </div>
                </div>

                {filteredWorkspaces.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredWorkspaces.map((ws) => {
                            const now = new Date();
                            const allotmentStart = ws.allotmentStart ? new Date(ws.allotmentStart) : null;
                            const isUnavailable = !!ws.allottedTo && (!allotmentStart || now >= allotmentStart);
                            const availableUntil = !!ws.allottedTo && allotmentStart && now < allotmentStart ? allotmentStart : null;

                            return (
                                <div key={ws._id || ws.id} className={`card-elevated group overflow-hidden flex flex-col h-full transition-all duration-500 ${isUnavailable ? 'grayscale opacity-80' : ''}`}>
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={ws.image || DEFAULT_WORKSPACE_IMAGE}
                                            alt={ws.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        {ws.featured && !isUnavailable && (
                                            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-lg">
                                                Featured
                                            </div>
                                        )}
                                        {isUnavailable && (
                                            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-destructive text-white text-[10px] font-black uppercase tracking-[0.1em] shadow-xl animate-pulse flex items-center gap-1.5 ring-4 ring-destructive/20">
                                                <Clock className="w-3 h-3" />
                                                Unavailable
                                            </div>
                                        )}
                                        {availableUntil && (
                                            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.1em] shadow-xl flex items-center gap-1.5 ring-4 ring-amber-500/20">
                                                <Clock className="w-3 h-3" />
                                                Available Until {new Date(availableUntil.getTime() - 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 right-4 animate-fade-in opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" className="rounded-full shadow-lg" asChild>
                                                <Link href={`/workspaces/${ws._id || ws.id}`}>View Details</Link>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-primary uppercase tracking-widest">{ws.type}</span>
                                            <span className="text-sm font-semibold text-foreground">
                                                {ws.price && Number(ws.price) > 0
                                                    ? `₹${Number(ws.price).toLocaleString('en-IN')} / month`
                                                    : "Contact for Pricing"}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                            {ws.name}
                                        </h3>

                                        {isUnavailable && (
                                            <div className="mb-4 bg-destructive/10 border border-destructive/20 p-3 rounded-xl flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-destructive">Booked Until</span>
                                                    <span className="text-xs font-bold text-destructive">
                                                        {ws.unavailableUntil ? new Date(ws.unavailableUntil).toLocaleString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : "Further Notice"}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {ws.type === "Dedicated Workspace" && ws.features && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {ws.features.hasConferenceHall && (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/20 text-[10px] font-black uppercase tracking-wider text-primary">
                                                        <Building2 className="w-3 h-3" />
                                                        Conf. Hall {ws.features.conferenceHallSeats ? `(${ws.features.conferenceHallSeats})` : ""}
                                                    </div>
                                                )}
                                                {ws.features.hasCabin && (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/20 text-[10px] font-black uppercase tracking-wider text-primary">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Private Cabin {ws.features.cabinSeats ? `(${ws.features.cabinSeats})` : ""}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-3 mb-6 font-medium">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                {ws.location}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="w-4 h-4 text-primary" />
                                                {ws.capacity}
                                            </div>
                                            {/* Amenities */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {ws.amenities?.map((amenity: string) => (
                                                    <span key={amenity} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                                                        {amenity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            variant={isUnavailable ? "outline" : "default"}
                                            className="w-full mt-auto group/btn transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            asChild
                                        >
                                            <Link href={`/workspaces/${ws._id || ws.id}`}>
                                                {isUnavailable ? "View Details" : "Book Now"}
                                                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 space-y-4">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <Search className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold">No workspaces found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Adjust your search or filters to find exactly what you're looking for.
                        </p>
                        <Button variant="outline" onClick={() => {
                            setSelectedLocation("All Locations");
                            setSelectedType("All Types");
                            setSearchTerm("");
                        }}>
                            Reset all filters
                        </Button>
                    </div>
                )}
            </main>

        </div>
    );
};

export default Workspaces;




