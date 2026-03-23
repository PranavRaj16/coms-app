"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination-custom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, Ticket } from "lucide-react";
import { DayPassRequest } from "@/types/admin";

interface DayPassesTableProps {
    dayPasses: DayPassRequest[];
    onUpdateStatus: (id: string, status: string) => void;
    updatingRequestId: string | null;
    currentPage: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
}

export function DayPassesTable({
    dayPasses,
    onUpdateStatus,
    updatingRequestId,
    currentPage,
    onPageChange,
    itemsPerPage
}: DayPassesTableProps) {
    const paginatedDayPasses = dayPasses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft border-none">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Visitor</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Contact</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Pass Date</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedDayPasses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <Ticket className="w-8 h-8 opacity-20" />
                                    <p className="font-medium">No day pass requests found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedDayPasses.map((pass, index) => (
                            <TableRow key={pass._id || (pass as any).id || index} className="hover:bg-muted/40 transition-colors">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-foreground">{pass.name || pass.fullName || "Guest"}</span>
                                        <span className="text-[10px] text-muted-foreground font-medium">{pass.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-semibold">{pass.contact || pass.contactNumber || "N/A"}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-bold text-foreground">
                                        {new Date(pass.visitDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={`rounded-full font-black uppercase text-[8px] tracking-[0.1em] px-3 py-0.5 border-none shadow-sm ${pass.status === "Pending" ? "bg-amber-100 text-amber-700 shadow-amber-200/50" :
                                            pass.status === "Approved" ? "bg-blue-100 text-blue-700 shadow-blue-200/50" :
                                                pass.status === "Used" ? "bg-emerald-100 text-emerald-700 shadow-emerald-200/50" :
                                                    "bg-rose-100 text-rose-700 shadow-rose-200/50"
                                            }`}
                                    >
                                        {pass.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 rounded-xl font-bold text-xs" disabled={updatingRequestId === pass._id}>
                                                {updatingRequestId === pass._id ? <><Loader2 className="w-3 h-3 animate-spin mr-2" /> Working...</> : "Update Status"}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem onClick={() => onUpdateStatus(pass._id!, "Pending")}>Pending</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onUpdateStatus(pass._id!, "Approved")}>Approved</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onUpdateStatus(pass._id!, "Used")}>Used</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onUpdateStatus(pass._id!, "Cancelled")}>Cancelled</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            <TablePagination
                totalItems={dayPasses.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}
