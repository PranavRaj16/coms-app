"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination-custom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, User as UserIcon, Mail, Phone, Building, Calendar, Clock, Loader2, Briefcase } from "lucide-react";

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

interface BookingsTableProps {
    bookings: BookingRequest[];
    onUpdateStatus: (id: string, status: string) => void;
    updatingRequestId: string | null;
    currentPage: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
}

export function BookingsTable({
    bookings,
    onUpdateStatus,
    updatingRequestId,
    currentPage,
    onPageChange,
    itemsPerPage
}: BookingsTableProps) {
    const paginatedBookings = bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft border-none">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Client Details</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Workspace</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Duration / Start</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedBookings.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <Calendar className="w-8 h-8 opacity-20" />
                                    <p className="font-medium">No booking requests found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedBookings.map((booking) => (
                            <BookingRow key={booking._id} booking={booking} onUpdateStatus={onUpdateStatus} isUpdating={updatingRequestId === booking._id} />
                        ))
                    )}
                </TableBody>
            </Table>
            <TablePagination
                totalItems={bookings.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}

function BookingRow({ booking, onUpdateStatus, isUpdating }: { booking: BookingRequest, onUpdateStatus: (id: string, status: string) => void, isUpdating: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <TableRow
                className={`group cursor-pointer transition-all duration-300 ${isExpanded ? 'bg-primary/5 hover:bg-primary/5' : 'hover:bg-muted/40'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <TableCell>
                    <div className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-primary/20 text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{booking.fullName}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{booking.email}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <span className="text-sm font-semibold text-primary/80">
                        {booking.workspaceName}
                    </span>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{booking.duration}</span>
                        <span className="text-[10px] text-muted-foreground">
                            Starts: {new Date(booking.startDate).toLocaleDateString()}
                        </span>
                    </div>
                </TableCell>
                <TableCell>
                    <Badge
                        variant="secondary"
                        className={`rounded-full font-black uppercase text-[8px] tracking-[0.1em] px-3 py-0.5 border-none shadow-sm ${booking.status === "Awaiting Payment" ? "bg-amber-100 text-amber-700 shadow-amber-200/50" :
                            booking.status === "Confirmed" ? "bg-emerald-100 text-emerald-700 shadow-emerald-200/50" :
                                "bg-rose-100 text-rose-700 shadow-rose-200/50"
                            }`}
                    >
                        {booking.status}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 rounded-xl font-bold text-xs" onClick={(e) => e.stopPropagation()} disabled={isUpdating}>
                                {isUpdating ? <><Loader2 className="w-3 h-3 animate-spin mr-2" /> Working...</> : "Update Status"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(booking._id!, "Awaiting Payment"); }}>
                                Awaiting Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(booking._id!, "Confirmed"); }}>
                                Confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(booking._id!, "Cancelled"); }}>
                                Cancelled
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow className="bg-primary/[0.02] hover:bg-primary/[0.02] border-none">
                    <TableCell colSpan={6} className="p-0">
                        <div className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-background/50 p-6 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Booking Essentials</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Building className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{booking.workspaceName}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{booking.duration}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">Planned Start: {new Date(booking.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Requester Information</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{booking.fullName}</span>
                                                </div>
                                                {booking.firmName && (
                                                    <div className="flex items-center gap-3">
                                                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm font-bold">{booking.firmName}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{booking.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{booking.contactNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Received {new Date(booking.createdAt).toLocaleString()}</span>
                                    <Badge variant="outline" className="text-[10px] font-black text-muted-foreground uppercase">REQ-ID: {booking._id?.slice(-8).toUpperCase()}</Badge>
                                </div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}
