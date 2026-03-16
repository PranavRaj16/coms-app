import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Wifi, Coffee, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchWorkspaces } from "@/lib/api";
import { workspaces as initialWorkspaces } from "@/data/workspaces";

const WorkspacePreview = () => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await fetchWorkspaces();
        // Take first 4 workspaces for the preview
                // Sort workspaces: Fully Available > Pre-booked > Unavailable
                  const sortedData = [...data].sort((a, b) => {
                    const now = new Date();
                    const getPriority = (ws: any) => {
                      const start = ws.allotmentStart ? new Date(ws.allotmentStart) : null;
                      const isUnavailable = ws.type === "Open WorkStation" 
                        ? (ws.availableSeats !== undefined ? ws.availableSeats <= 0 : false)
                        : !!ws.allottedTo && (!start || now >= start);
                      const isPreBooked = ws.type !== "Open WorkStation" && !!ws.allottedTo && start && now < start;
                      if (isUnavailable) return 2;
                      if (isPreBooked) return 1;
                      return 0;
                    };
                    const aPriority = getPriority(a);
                    const bPriority = getPriority(b);
                    if (aPriority !== bPriority) return aPriority - bPriority;
                    if (a.featured !== b.featured) return a.featured ? -1 : 1;
                    return 0;
                  });
                setWorkspaces(sortedData.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch workspaces for preview:", error);
        setWorkspaces(initialWorkspaces.slice(0, 4));
      } finally {
        setIsLoading(false);
      }
    };
    loadWorkspaces();
  }, []);
  return (
    <section className="py-20 lg:py-28">
      <div className="section-container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Featured Spaces
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Browse Available Workspaces
            </h2>
          </div>
          <Button variant="outline" size="lg" asChild>
            <Link href="/workspaces">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Workspaces Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Skeleton Loading State
            [...Array(4)].map((_, i) => (
              <div key={i} className="card-elevated overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </div>
            ))
          ) : (
            workspaces.map((workspace) => {
              const now = new Date();
              const allotmentStart = workspace.allotmentStart ? new Date(workspace.allotmentStart) : null;
              const isUnavailable = workspace.type === "Open WorkStation" 
                ? (workspace.availableSeats !== undefined ? workspace.availableSeats <= 0 : false)
                : !!workspace.allottedTo && (!allotmentStart || now >= allotmentStart);
              const availableUntil = !!workspace.allottedTo && allotmentStart && now < allotmentStart ? allotmentStart : null;

              return (
                <div
                  key={workspace._id || workspace.id}
                  className={`card-elevated overflow-hidden group flex flex-col h-full transition-all duration-500 ${isUnavailable ? 'grayscale opacity-80' : ''}`}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden shrink-0">
                    <img
                      src={workspace.image}
                      alt={workspace.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {workspace.featured && !isUnavailable && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                        Featured
                      </span>
                    )}
                    {isUnavailable && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-destructive text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg ring-2 ring-destructive/20 animate-pulse">
                        <Clock className="w-2.5 h-2.5" />
                        {workspace.type === "Open WorkStation" && workspace.availableSeats !== undefined && workspace.availableSeats <= 0 ? "Fully Booked" : "Unavailable"}
                      </div>
                    )}
                    {availableUntil && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg ring-2 ring-amber-500/20">
                        <Clock className="w-2.5 h-2.5" />
                        Available Until {new Date(availableUntil.getTime() - 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {workspace.name}
                    </h3>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {workspace.location}
                      </p>
                      <span className="text-[10px] font-bold text-primary">
                        {workspace.price && Number(workspace.price) > 0
                          ? `₹${Number(workspace.price).toLocaleString('en-IN')} / mo`
                          : "Contact for Price"}
                      </span>
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Users className="w-4 h-4" />
                      <span>
                        {workspace.type === "Open WorkStation" 
                          ? `${workspace.availableSeats ?? 0} / ${workspace.totalSeats ?? 0} Seats Available` 
                          : workspace.capacity}
                      </span>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {workspace.amenities?.map((amenity: string) => (
                        <span
                          key={amenity}
                          className="px-2 py-1 rounded-md bg-primary/10 text-[10px] font-medium text-primary border border-primary/20"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <Button variant={isUnavailable ? "outline" : "default"} size="sm" className="w-full mt-auto transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
                      <Link href={`/workspaces/${workspace._id || workspace.id}`}>
                        {isUnavailable ? "View Details" : "Book Now"}
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default WorkspacePreview;





