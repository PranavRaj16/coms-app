"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination-custom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, MoreHorizontal, Printer, Building, CreditCard, Calendar, ChevronDown, ChevronUp, Clock, Download, Eye, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Invoice } from "@/types/admin";
import { PrintableInvoice } from "./PrintableInvoice";

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
        <div className="card-elevated overflow-hidden glass shadow-soft border-none">
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    html, body {
                        width: 210mm;
                        height: 297mm;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #printable-invoice-container, #printable-invoice-container * {
                        visibility: visible;
                    }
                    #printable-invoice-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        height: 297mm;
                        margin: 0;
                        padding: 0;
                        background: white;
                        display: flex;
                        justify-content: center;
                    }
                }
            `}</style>
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Invoice Info</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Customer</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Amount</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedInvoices.map((invoice, index) => (
                        <InvoiceRow key={invoice._id || invoice.id || index} invoice={invoice} />
                    ))}
                    {paginatedInvoices.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-64 text-center py-12 text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <FileText className="w-8 h-8 opacity-20" />
                                    <p className="font-medium">No invoices found matching the current criteria.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : null}
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

function InvoiceRow({ invoice }: { invoice: Invoice }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
    };

    const handlePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        const invoiceId = invoice._id || invoice.id;
        const userInfo = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
        const token = userInfo ? JSON.parse(userInfo).token : '';
        window.open(`/api/requests/invoices/${invoiceId}/download?token=${token}&preview=true`, '_blank');
    };

    return (
        <>
            <TableRow
                className={`group cursor-pointer transition-all duration-300 ${isExpanded ? 'bg-primary/5 hover:bg-primary/5' : 'hover:bg-muted/40'} border-border/50`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <TableCell>
                    <div className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-primary/20 text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-black text-xs text-primary tracking-tighter uppercase">{invoice.invoiceNumber || "INV-NEW"}</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">{invoice._id || invoice.id}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{invoice.customerName}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{invoice.customerEmail}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <span className="font-black text-sm text-foreground">₹{invoice.amount}</span>
                </TableCell>
                <TableCell>
                    <Badge
                        variant="secondary"
                        className={`rounded-full font-black uppercase text-[8px] tracking-[0.1em] px-3 py-0.5 border-none shadow-sm ${invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 shadow-emerald-200/50' :
                            invoice.status === 'Pending' ? 'bg-amber-100 text-amber-700 shadow-amber-200/50' :
                                'bg-rose-100 text-rose-700 shadow-rose-200/50'
                            }`}
                    >
                        {invoice.status}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-2 px-2 items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary transition-all duration-300 group/preview"
                            onClick={handlePreview}
                            title="View & Download Invoice"
                        >
                            <Eye className="w-4 h-4 group-hover/preview:scale-110 transition-transform" />
                        </Button>

                        {invoice.status === 'Pending' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl hover:bg-emerald-50 text-emerald-600 transition-all duration-300 group/pay"
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                        const { payInvoice } = await import('@/lib/api');
                                        await payInvoice(invoice._id || invoice.id);
                                        toast.success(`Invoice ${invoice.invoiceNumber} marked as Paid. Confirmation email sent.`);
                                        if (typeof window !== 'undefined') window.dispatchEvent(new Event('focus')); // Trigger refresh
                                    } catch (err: any) {
                                        toast.error(err.message || "Failed to mark as paid");
                                    }
                                }}
                                title="Mark as Paid"
                            >
                                <CheckCircle2 className="w-4 h-4 group-hover/pay:scale-110 transition-transform" />
                            </Button>
                        )}
                    </div>
                </TableCell>
            </TableRow>

            {isExpanded && (
                <TableRow className="bg-primary/[0.02] hover:bg-primary/[0.02] border-none shadow-inner">
                    <TableCell colSpan={6} className="p-0">
                        <div className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-background/50 p-6 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                                <div className="grid md:grid-cols-3 gap-8">
                                    {/* Workspace Details */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                            <Building className="w-3 h-3" /> Space Details
                                        </h4>
                                        <div className="space-y-3 bg-white/50 p-4 rounded-2xl border border-primary/5">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Workspace</span>
                                                <span className="text-sm font-black text-primary italic uppercase">{invoice.workspaceName}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Billing Cycle</span>
                                                <span className="text-xs font-bold text-foreground">{invoice.billingMonth || "N/A"}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Plan Type</span>
                                                <Badge variant="outline" className="w-fit text-[9px] font-black bg-primary/5 text-primary border-primary/10 rounded-md">
                                                    {invoice.type?.toUpperCase() || "BOOKING"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                            <CreditCard className="w-3 h-3" /> Financial Meta
                                        </h4>
                                        <div className="space-y-3 bg-white/50 p-4 rounded-2xl border border-primary/5">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Payment Method</span>
                                                <span className="text-sm font-bold text-foreground">{invoice.paymentMethod || "Direct Payment"}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Invoice Summary</span>
                                                <div className="space-y-1 mt-1">
                                                    {(() => {
                                                        const amountValue = Number(invoice.amount) || 0;
                                                        const isGSTIncluded = !!invoice.isGSTIncluded;
                                                        const subtotalValue = invoice.subtotal || (isGSTIncluded ? Math.round(amountValue / 1.18) : amountValue);
                                                        const gstValue = invoice.gstAmount || (isGSTIncluded ? amountValue - subtotalValue : 0);
                                                        const parkingAmount = Number(invoice.carParkingAmount) || 0;
                                                        const workspaceAmount = subtotalValue - parkingAmount;

                                                        return (
                                                            <div className="space-y-1.5">
                                                                <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                                                                    <span>Workspace Fee:</span>
                                                                    <span className="font-bold text-foreground">₹{workspaceAmount.toLocaleString('en-IN')}</span>
                                                                </div>
                                                                {parkingAmount > 0 && (
                                                                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                                                                        <span>Parking Fee:</span>
                                                                        <span className="font-bold text-foreground">₹{parkingAmount.toLocaleString('en-IN')}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between text-[11px] font-black text-slate-400 pt-1 border-t border-slate-100">
                                                                    <span>Subtotal (Net):</span>
                                                                    <span>₹{subtotalValue.toLocaleString('en-IN')}</span>
                                                                </div>
                                                                {isGSTIncluded && (
                                                                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                                                                        <span>GST (18%):</span>
                                                                        <span className="font-bold text-foreground">₹{gstValue.toLocaleString('en-IN')}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between text-[13px] font-black text-primary pt-2 border-t-2 border-primary/5">
                                                                    <span>{invoice.status === 'Paid' ? 'Total Paid:' : 'Total Due:'}</span>
                                                                    <span>₹{amountValue.toLocaleString('en-IN')}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline - Simplified */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                            <Clock className="w-3 h-3" /> Issuance Meta
                                        </h4>
                                        <div className="space-y-3 bg-white/50 p-4 rounded-2xl border border-primary/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Issued On</span>
                                                    <span className="text-xs font-black italic">{invoice.date || (invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A')}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 opacity-60">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">System ID</span>
                                                    <span className="text-[10px] font-mono">{invoice._id?.toString().slice(-12).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}

            {isPrinting && (
                <TableRow className="pointer-events-none border-none">
                    <TableCell colSpan={6} className="p-0 border-none">
                        <div id="printable-invoice-container" className="fixed inset-0 z-[9999] bg-white">
                            <PrintableInvoice invoice={invoice} />
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}
