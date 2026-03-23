"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination-custom";
import { Loader2, MessageSquare, Mail, Phone, Clock } from "lucide-react";
import { ContactRequest } from "@/types/admin";

interface ContactsTableProps {
    contacts: ContactRequest[];
    onUpdateStatus: (id: string, status: string) => void;
    updatingRequestId: string | null;
    currentPage: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
}

export function ContactsTable({
    contacts,
    onUpdateStatus,
    updatingRequestId,
    currentPage,
    onPageChange,
    itemsPerPage
}: ContactsTableProps) {
    const paginatedContacts = contacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft border-none">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Requester</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Inquiry</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedContacts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <MessageSquare className="w-8 h-8 opacity-20" />
                                    <p className="font-medium">No contact messages found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedContacts.map((contact, index) => (
                            <TableRow key={contact._id || (contact as any).id || index} className="hover:bg-muted/40 transition-colors">
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-sm text-foreground">{contact.fullName}</span>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            <Mail className="w-3 h-3" /> {contact.email}
                                        </div>
                                        {contact.contactNumber && (
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                <Phone className="w-3 h-3" /> {contact.contactNumber}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 max-w-[400px]">
                                        <span className="text-xs font-black text-primary/80 uppercase tracking-tight">{contact.subject}</span>
                                        <p className="text-xs text-muted-foreground line-clamp-2 italic">"{contact.message}"</p>
                                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60 mt-1">
                                            <Clock className="w-2.5 h-2.5" />
                                            {new Date(contact.createdAt!).toLocaleString()}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={`rounded-full font-black uppercase text-[8px] tracking-[0.1em] px-3 py-0.5 border-none shadow-sm ${contact.status === "New" ? "bg-amber-100 text-amber-700 shadow-amber-200/50" :
                                            contact.status === "In Progress" ? "bg-blue-100 text-blue-700 shadow-blue-200/50" :
                                                "bg-emerald-100 text-emerald-700 shadow-emerald-200/50"
                                            }`}
                                    >
                                        {contact.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 rounded-xl font-bold text-xs"
                                        onClick={() => onUpdateStatus(contact._id!, contact.status === "Completed" ? "In Progress" : "Completed")}
                                        disabled={updatingRequestId === contact._id}
                                    >
                                        {updatingRequestId === contact._id ? (
                                            <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                        ) : (
                                            contact.status === "Completed" ? "Reopen" : "Mark Done"
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            <TablePagination
                totalItems={contacts.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}
