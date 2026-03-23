"use client";
import { Invoice } from "@/types/admin";
import cohortimage from "@/assets/cohort-logo.png";

interface PrintableInvoiceProps {
    invoice: Invoice;
}

export function PrintableInvoice({ invoice }: PrintableInvoiceProps) {
    const today = new Date().toLocaleDateString(undefined, { dateStyle: 'long' });
    const formattedAmount = Number(invoice.amount).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
    });
    
    // Dynamic Location Resolution
    const workspaceObj = (invoice as any).workspaceId;
    const rawWorkspaceName = invoice.workspaceName || "";
    
    // Check keywords in order of priority
    let locationInfo = workspaceObj?.location || "Kondapur";
    if (rawWorkspaceName.toLowerCase().includes("raidurgam")) locationInfo = "Raidurgam";
    else if (rawWorkspaceName.toLowerCase().includes("madhapur")) locationInfo = "Madhapur";
    else if (rawWorkspaceName.toLowerCase().includes("kondapur")) locationInfo = "Kondapur";

    // Address Mapping
    const address = locationInfo.includes("Raidurgam")
        ? "Techno-1, Khajaguda X Road, Rai Durg, Hyderabad, Telangana - 500104"
        : locationInfo.includes("Kondapur") 
        ? "Kothaguda, Kondapur Main Road, Hyderabad, Telangana - 500084" 
        : locationInfo.includes("Madhapur")
        ? "Hitech City, Image Gardens Road, Hyderabad, Telangana - 500081"
        : `${locationInfo}, Hyderabad, Telangana`;

    return (
        <div 
            id={`invoice-print-${invoice._id || invoice.id}`} 
            className="bg-white text-slate-800 w-[210mm] h-[297mm] mx-auto hidden print:flex print:flex-col shadow-none print:shadow-none font-sans leading-tight border-none box-border overflow-hidden"
            style={{ 
                printColorAdjust: 'exact', 
                WebkitPrintColorAdjust: 'exact',
                padding: '12mm' 
            }}
        >
            {/* Header Content */}
            <div className="flex justify-between items-start border-b-[3px] border-primary pb-6 mb-8">
                <div className="space-y-2">
                    <img src={cohortimage.src} alt="Cohort Logo" className="w-[170px] h-auto" />
                    <div className="space-y-0.5 mt-3">
                        <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-1">Official Provider Center</p>
                        <p className="text-sm font-bold text-slate-900">{locationInfo} Center</p>
                        <p className="text-[11px] text-slate-500 font-medium max-w-[280px] leading-tight">{address}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">GSTIN: 36ABCDE1234F1Z5</p>
                    </div>
                </div>
                
                <div className="text-right flex flex-col items-end">
                    <div className="bg-primary text-white px-7 py-2.5 rounded-xl mb-4 shadow-lg">
                        <h1 className="text-2xl font-black italic tracking-tighter">TAX INVOICE</h1>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Document Ref</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight">{invoice.invoiceNumber || "INV-GEN-01"}</p>
                    </div>
                    <div className="mt-4 flex gap-6">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Issue Date</span>
                            <span className="text-xs font-bold text-slate-700 font-mono tracking-tighter">{invoice.date || (invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : today)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Transaction</span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>{invoice.status}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Entity Block */}
            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-50">
                <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                    <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Bill Information:
                    </h4>
                    <p className="text-lg font-black text-slate-900 leading-tight mb-1">{invoice.customerName}</p>
                    <p className="text-[12px] font-medium text-slate-500">{invoice.customerEmail}</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-3 underline decoration-primary/20">Ref: #{invoice._id?.toString().slice(-12).toUpperCase()}</p>
                </div>

                <div className="bg-primary/[0.02] p-5 rounded-[1.5rem] border border-primary/5 text-right">
                    <h4 className="text-[9px] font-black uppercase text-primary/70 tracking-widest mb-3 flex items-center justify-end gap-2 text-right">
                        Space Utilization: <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </h4>
                    <p className="text-lg font-black text-primary italic uppercase leading-tight mb-1">{invoice.workspaceName}</p>
                    <p className="text-[12px] font-bold text-slate-600">Site: {locationInfo} Hub</p>
                    <p className="text-[8px] font-bold text-slate-300 mt-3 uppercase">Billing Month: {invoice.billingMonth || "Current Booking"}</p>
                </div>
            </div>

            {/* Billable Content */}
            <div className="mb-8 rounded-[2rem] overflow-hidden border border-slate-200">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest">
                            <th className="px-6 py-4 text-left">Services Provision Description</th>
                            <th className="px-4 py-4 text-center w-20">Qty</th>
                            <th className="px-6 py-4 text-right">Line Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td className="px-6 py-8">
                                <p className="font-black text-slate-900 text-base mb-1">{invoice.workspaceName} Access</p>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic max-w-sm">
                                    Comprehensive infrastructure access at the {locationInfo} center hub. Includes ecosystem membership, utility access, and connectivity.
                                </p>
                            </td>
                            <td className="px-4 py-8 text-center font-bold text-slate-400 text-base underline decoration-slate-200 decoration-2">01</td>
                            <td className="px-6 py-8 text-right font-black text-slate-900 text-xl">{formattedAmount}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Total Summary */}
            <div className="flex justify-between items-start mb-auto">
                <div className="w-[280px] p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 italic">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Terms & Reminders</p>
                    <p className="text-[10px] text-slate-500 leading-snug font-medium">
                        This document acknowledges transaction finality. All payments must be cleared before the subscription start date. Computer generated, no signature needed.
                    </p>
                </div>

                <div className="w-[320px] space-y-3 pt-3">
                    <div className="flex justify-between px-3 text-sm font-bold text-slate-500 tracking-tight">
                        <span>Gross Subtotal</span>
                        <span>{formattedAmount}</span>
                    </div>
                    <div className="flex justify-between px-3 text-sm font-bold text-slate-500 tracking-tight">
                        <span>Central GST (0%)</span>
                        <span>₹0.00</span>
                    </div>
                    <div className="pt-4">
                        <div className="bg-slate-900 text-white rounded-[2rem] p-6 flex justify-between items-center shadow-xl">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60 mb-0.5">Final Amount Due</p>
                                <p className="text-[10px] font-bold opacity-80 italic">Amount in INR</p>
                            </div>
                            <p className="text-3xl font-black tracking-tighter italic leading-none">{formattedAmount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Official Footing */}
            <div className="flex justify-between items-end border-t border-slate-50 pt-8 mt-12 pb-2">
                <div className="space-y-4">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-300 italic">Digitally Verified by Cohort System</p>
                        <p className="text-[9px] font-black uppercase text-slate-200">Transaction ID: {invoice._id?.toString().slice(-8).toUpperCase()}X99</p>
                    </div>
                    <div className="flex items-center gap-2 bg-primary/[0.04] w-fit px-3 py-1 rounded-lg border border-primary/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">Authorized Document</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block">
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Receipt Ref</p>
                        <p className="text-[10px] font-black text-slate-700 italic">{invoice.paymentMethod || "Digital Transfer"}</p>
                    </div>
                </div>
            </div>

            {/* Brand Bottom */}
            <div className="flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] py-4 bg-white">
                <span>WWW.COHORTWORK.COM</span>
                <div className="flex items-center gap-10">
                    <span className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-primary/20" />
                        HYDERABAD CENTER
                    </span>
                    <span className="text-primary/40">PAGE 1 / 1</span>
                </div>
            </div>
        </div>
    );
}
