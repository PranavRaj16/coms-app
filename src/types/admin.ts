import { User } from "@/data/users";
import { Workspace } from "@/data/workspaces";

export interface DashboardStats {
    activeMembers: number;
    upcomingVisits: number;
    totalRevenue: string;
    occupancyRate: string;
    activeBookings: number;
    newQuoteRequests: number;
    newBookingRequests: number;
    newVisitRequests: number;
    revenueGrowth: number;
    memberGrowth: number;
    occupancyGrowth: number;
    pendingDayPasses: number;
    newContacts: number;
}

export interface QuoteRequest {
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

export interface BookingRequest {
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

export interface VisitRequest {
    _id?: string;
    workspaceId: string;
    workspaceName: string;
    fullName: string;
    email: string;
    contactNumber: string;
    visitDate: string;
    status: string;
    createdAt: string;
}

export interface DayPassRequest {
    _id?: string;
    name?: string;
    fullName?: string;
    email: string;
    contact?: string;
    contactNumber?: string;
    purpose: string;
    visitDate: string;
    passCode: string;
    status: string;
    createdAt: string;
}

export interface ContactRequest {
    _id?: string;
    fullName: string;
    email: string;
    contactNumber?: string;
    subject: string;
    message: string;
    status?: string;
    createdAt: string;
}

export interface Invoice {
    _id?: string;
    id: string;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    workspaceName: string;
    amount: string | number;
    status: "Paid" | "Pending" | "Overdue" | "Draft" | "Cancelled";
    date: string;
    createdAt?: string;
    dueDate?: string;
    paymentMethod?: string;
    billingMonth?: string;
    type?: string;
    location?: string;
}
