"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination-custom";
import { FileText, MoreHorizontal } from "lucide-react";

import { Invoice } from "@/types/admin";

interface InvoicesTableProps {
    invoices: Invoice[];
    currentPage: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
}

export function InvoicesTable({
    invoices,
    currentPage,
    onPageChange,
    itemsPerPage
}: InvoicesTableProps) {
    const paginatedInvoices = invoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-muted/20 border-none transition-colors">
                            <TableCell className="font-mono text-xs font-bold text-primary">{invoice.id}</TableCell>
                            <TableCell className="font-semibold text-sm">{invoice.customerName}</TableCell>
                            <TableCell className="font-black text-sm">{invoice.amount}</TableCell>
                            <TableCell>
                                <Badge
                                    className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase ${invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' :
                                        invoice.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' :
                                            'bg-destructive/10 text-destructive'
                                        }`}
                                >
                                    {invoice.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-xs font-medium text-muted-foreground">{invoice.date}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5 transition-colors">
                                    <FileText className="w-4 h-4 text-primary" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {paginatedInvoices.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic font-medium">
                                No invoices found matching the current criteria.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <TablePagination
                totalItems={invoices.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}
