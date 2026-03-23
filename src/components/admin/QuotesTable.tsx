"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination-custom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, User as UserIcon, Mail, Phone, Users as UsersIcon, Calendar, MessageSquare, Building, Loader2, ClipboardList } from "lucide-react";

interface QuoteRequest {
    _id?: string;
    fullName: string;
    workEmail: string;
    requiredWorkspace: string;
    additionalRequirements?: string;
    status: string;
    createdAt: string;
    contactNumber: string;
    firmName: string;
    firmType: string;
    capacity: number;
    startDate: string;
    duration: string;
}

interface QuotesTableProps {
    quotes: QuoteRequest[];
    onUpdateStatus: (id: string, status: string) => void;
    updatingRequestId: string | null;
    currentPage: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
}

export function QuotesTable({
    quotes,
    onUpdateStatus,
    updatingRequestId,
    currentPage,
    onPageChange,
    itemsPerPage
}: QuotesTableProps) {
    const paginatedQuotes = quotes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Customer</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Workspace</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Requested On</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedQuotes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <ClipboardList className="w-8 h-8 opacity-20" />
                                    <p className="font-medium">No quote requests found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedQuotes.map((quote, index) => (
                            <QuoteRow key={quote._id || (quote as any).id || index} quote={quote} onUpdateStatus={onUpdateStatus} isUpdating={updatingRequestId === quote._id} />
                        ))
                    )}
                </TableBody>
            </Table>
            <TablePagination
                totalItems={quotes.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}

const QuoteRow = ({ quote, onUpdateStatus, isUpdating }: { quote: QuoteRequest, onUpdateStatus: (id: string, status: string) => void, isUpdating: boolean }) => {
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
                        <span className="font-bold text-sm text-foreground">{quote.fullName}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{quote.firmName}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-background text-primary border-primary/20 font-bold text-[10px] px-2">
                            {quote.requiredWorkspace}
                        </Badge>
                    </div>
                </TableCell>
                <TableCell>
                    <span className="text-xs font-semibold text-muted-foreground">
                        {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                    </span>
                </TableCell>
                <TableCell>
                    <Badge
                        variant="default"
                        className={`rounded-full font-black uppercase text-[8px] tracking-[0.1em] px-3 py-0.5 border-none shadow-sm ${quote.status === "Pending" ? "bg-amber-100 text-amber-700 shadow-amber-200/50" :
                            quote.status === "Reviewed" ? "bg-blue-100 text-blue-700 shadow-blue-200/50" :
                                "bg-emerald-100 text-emerald-700 shadow-emerald-200/50"
                            }`}
                    >
                        {quote.status}
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(quote._id!, "Pending"); }}>
                                Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(quote._id!, "Reviewed"); }}>
                                Reviewed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(quote._id!, "Completed"); }}>
                                Completed
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow className="bg-primary/[0.02] hover:bg-primary/[0.02] border-none">
                    <TableCell colSpan={6} className="p-0">
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                    <UserIcon className="w-3 h-3" /> Contact Details
                                </h4>
                                <div className="space-y-3 bg-background/50 p-4 rounded-2xl border border-primary/10 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Work Email</span>
                                            <span className="text-sm font-bold truncate max-w-[180px]">{quote.workEmail}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Phone Number</span>
                                            <span className="text-sm font-bold">{quote.contactNumber}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                    <Building className="w-3 h-3" /> Space Requirements
                                </h4>
                                <div className="space-y-3 bg-background/50 p-4 rounded-2xl border border-primary/10 shadow-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Capacity</span>
                                            <span className="text-sm font-bold flex items-center gap-1">
                                                <UsersIcon className="w-3 h-3 text-primary" /> {quote.capacity} Pax
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Duration</span>
                                            <span className="text-sm font-bold"> {quote.duration}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col pt-1">
                                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Planning to Start</span>
                                        <span className="text-sm font-bold flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            {quote.startDate ? new Date(quote.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                    <MessageSquare className="w-3 h-3" /> Additional Notes
                                </h4>
                                <div className="bg-background/50 p-3 rounded-2xl border border-primary/10 shadow-sm flex flex-col">
                                    <p className="text-[11px] text-muted-foreground leading-relaxed italic break-words whitespace-pre-wrap">
                                        {quote.additionalRequirements ? `"${quote.additionalRequirements}"` : "No special requirements or additional notes provided by the customer."}
                                    </p>
                                    <div className="mt-auto pt-4 flex gap-2">
                                        <Badge variant="outline" className="text-[9px] font-black bg-primary/5 text-primary border-primary/10">
                                            {quote.firmType}
                                        </Badge>
                                        <Badge variant="outline" className="text-[9px] font-black bg-muted text-muted-foreground border-muted-foreground/10">
                                            Ref: {quote._id?.slice(-6).toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};
