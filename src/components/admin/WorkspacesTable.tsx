"use client";
import { useState } from "react";
import { Workspace } from "@/data/workspaces";
import { User } from "@/data/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination-custom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MapPin, Users as UsersIcon, ChevronDown, ChevronUp, MoreHorizontal, User as UserIcon, Calendar, Clock, Loader2, CircleX, Building } from "lucide-react";

interface BookingRequest {
    _id?: string;
    workspaceId: string;
    workspaceName: string;
    fullName: string;
    email: string;
    contactNumber: string;
    firmName?: string;
    duration: string;
    startDate: string;
    status: string;
    createdAt: string;
    seatCount?: number;
    endDate?: string;
}

interface WorkspacesTableProps {
    workspaces: Workspace[];
    users: User[];
    bookings: BookingRequest[];
    onAllot: (wsId: string, userId: string | null) => void;
    onEdit: (ws: Workspace) => void;
    onDelete: (id: string) => void;
    onUnallotBooking: (booking: BookingRequest) => void;
    updatingRequestId: string | null;
    currentPage: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
}

export function WorkspacesTable({
    workspaces,
    users,
    bookings,
    onAllot,
    onEdit,
    onDelete,
    onUnallotBooking,
    updatingRequestId,
    currentPage,
    onPageChange,
    itemsPerPage
}: WorkspacesTableProps) {
    const paginatedWorkspaces = workspaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Workspace Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Allotted To</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedWorkspaces.map((ws, i) => (
                        <WorkspaceRow
                            key={ws._id || ws.id || i}
                            ws={ws}
                            bookings={bookings}
                            onAllot={onAllot}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onUnallotBooking={onUnallotBooking}
                            updatingBookingId={updatingRequestId}
                        />
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                totalItems={workspaces.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}

const WorkspaceRow = ({
    ws,
    bookings,
    onAllot,
    onEdit,
    onDelete,
    onUnallotBooking,
    updatingBookingId
}: {
    ws: Workspace,
    bookings: BookingRequest[],
    onAllot: (wsId: string, userId: string | null) => void,
    onEdit: (ws: Workspace) => void,
    onDelete: (id: string) => void,
    onUnallotBooking: (booking: BookingRequest) => void,
    updatingBookingId: string | null
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!ws) return null;
    const allottedUser = typeof ws.allottedTo === 'object' ? ws.allottedTo : null;

    const confirmedBookings = bookings.filter(b =>
        String(b.workspaceId) === String(ws._id || ws.id) &&
        (b.status === "Confirmed" || b.status === "Awaiting Payment")
    );

    const occupiedSeats = confirmedBookings.reduce((sum, b) => sum + (b.seatCount || 1), 0);
    const availableSeats = ws.type === "Open WorkStation" ? Math.max(0, (ws.totalSeats || 0) - occupiedSeats) : (ws.allottedTo ? 0 : 1);

    return (
        <>
            <TableRow
                className={`hover:bg-muted/20 transition-colors cursor-pointer ${isExpanded ? 'bg-primary/5' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <TableCell>
                    <div className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </TableCell>
                <TableCell className="font-semibold">{ws.name}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{ws.location}</span>
                    </div>
                </TableCell>
                <TableCell className="text-sm">{ws.floor || "N/A"}</TableCell>
                <TableCell>
                    <Badge variant="secondary" className="rounded-full font-medium">
                        {ws.type}
                    </Badge>
                </TableCell>
                <TableCell className="text-sm">{ws.capacity}</TableCell>
                <TableCell>
                    {ws.type === "Open WorkStation" ? (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                                <UsersIcon className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-black text-primary">
                                    {confirmedBookings.length} People
                                </span>
                            </div>
                            <div className="w-full bg-muted/50 rounded-full h-1 overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${Math.min(100, Math.max(0, (((ws.totalSeats || 0) - availableSeats) / (ws.totalSeats || 1)) * 100))}%` }}
                                />
                            </div>
                        </div>
                    ) : allottedUser ? (
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-primary">{allottedUser.name}</span>
                            <span className="text-[10px] text-muted-foreground">{allottedUser.email}</span>
                        </div>
                    ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground opacity-50 border-dashed">
                            Unallotted
                        </Badge>
                    )}
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAllot((ws._id || (ws.id ? ws.id.toString() : "")), (allottedUser as any)?._id || null); }}>
                                {allottedUser ? "Change Allotment" : "Allot to User"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(ws); }}>Edit Details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(ws._id || (ws.id ? ws.id.toString() : "")); }}>Delete Space</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow className="bg-primary/[0.02] hover:bg-primary/[0.02] border-none">
                    <TableCell colSpan={8} className="p-0">
                        <div className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-background/50 p-6 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                                {ws.type === "Open WorkStation" ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center">
                                                    <UsersIcon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black tracking-tight">Utilisation Overview</h4>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Real-time seat distribution</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col items-end px-3 py-1.5 rounded-2xl border border-primary/10 bg-primary/[0.02]">
                                                    <span className="text-[9px] font-black text-primary/40 uppercase tracking-tighter">Current Occupancy</span>
                                                    <span className="text-xs font-black text-primary">{confirmedBookings.length} {confirmedBookings.length === 1 ? 'Booking' : 'Bookings'}</span>
                                                </div>
                                                <div className="flex flex-col items-end px-3 py-1.5 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02]">
                                                    <span className="text-[9px] font-black text-emerald-600/40 uppercase tracking-tighter">Vacancy Status</span>
                                                    <span className="text-xs font-black text-emerald-600">{availableSeats} {availableSeats === 1 ? "Seat" : "Seats"} Ready</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent my-4" />

                                        {confirmedBookings.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {confirmedBookings.map((booking) => (
                                                    <div key={booking._id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                            <UserIcon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <span className="text-sm font-bold truncate tracking-tight">{booking.fullName}</span>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <div className="flex items-center gap-1 text-[9px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">
                                                                    <Calendar className="w-2.5 h-2.5" />
                                                                    {new Date(booking.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                                </div>
                                                                <span className="text-[9px] text-muted-foreground/50">→</span>
                                                                <div className="flex items-center gap-1 text-[9px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">
                                                                    <Clock className="w-2.5 h-2.5" />
                                                                    {booking.endDate ? new Date(booking.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "Notice"}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-1.5">
                                                                <span className="text-[10px] text-primary/80 font-black tracking-widest">{booking.seatCount || 1} {(booking.seatCount || 1) === 1 ? 'SEAT' : 'SEATS'}</span>
                                                                <span className="text-[9px] text-emerald-600 font-black bg-emerald-500/10 px-1.5 rounded-full">ACTIVE</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center justify-center shrink-0 transition-colors"
                                                            disabled={updatingBookingId === (booking._id || (booking as any).id)}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onUnallotBooking(booking);
                                                            }}
                                                        >
                                                            {updatingBookingId === (booking._id || (booking as any).id) ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <CircleX className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center text-muted-foreground italic text-sm bg-muted/10 rounded-2xl border border-dashed">
                                                No active seat bookings found for this workstation.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Space Metadata</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Building className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{ws.type}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{ws.location}, {ws.floor}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <UsersIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">Capacity: {ws.capacity}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {allottedUser ? (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Allotment Details</h4>
                                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                                                            {(allottedUser as any).name[0]}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-foreground italic">{(allottedUser as any).name}</span>
                                                            <span className="text-xs text-muted-foreground font-medium">{(allottedUser as any).email}</span>
                                                        </div>
                                                    </div>
                                                    {ws.allotmentStart && (
                                                        <div className="mt-4 pt-4 border-t border-primary/10 flex items-center gap-2 text-[10px] font-black text-primary/70 uppercase">
                                                            <Calendar className="w-3 h-3" /> Allotted: {new Date(ws.allotmentStart).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center p-8 bg-muted/10 rounded-2xl border border-dashed">
                                                <p className="text-muted-foreground font-bold italic text-sm">Space currently unallotted</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};
