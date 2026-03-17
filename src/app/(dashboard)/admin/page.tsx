"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link"; import { useRouter } from "next/navigation";
import {
    Users as UsersIcon,
    LayoutDashboard,
    Settings,
    LogOut,
    Search,
    Filter,
    Trash2,
    MoreHorizontal,
    CircleCheck,
    CircleX,
    Clock,
    Briefcase,
    TrendingUp,
    UserPlus,
    ShieldCheck,
    Bell,
    Plus,
    Building2,
    MapPin,
    Layers,
    Mail,
    Lock,
    Phone,
    User as UserIcon,
    X,
    MessageSquare,
    ClipboardList,
    ChevronDown,
    ChevronUp,
    Calendar,
    Building,
    KeyRound,
    AlertCircle,
    Image as ImageIcon,
    Upload,
    Loader2,
    QrCode,
    Pencil,
    CreditCard,
    FileText,
    CheckCircle2,
    RotateCcw,
    Zap
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarInset,
    SidebarTrigger
} from "@/components/ui/sidebar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { users as initialUsers, User } from "@/data/users";
import { workspaces as initialWorkspaces, Workspace } from "@/data/workspaces";
import cohortimage from "@/assets/cohort-logo.png";
import { TablePagination } from "@/components/ui/table-pagination-custom";
import { format } from "date-fns";
import { toast } from "sonner";

import {
    fetchWorkspaces,
    fetchUsers,
    createWorkspace as createWorkspaceApi,
    updateWorkspace as updateWorkspaceApi,
    deleteWorkspace as deleteWorkspaceApi,
    createUser as createUserApi,
    updateUser as updateUserApi,
    deleteUser as deleteUserApi,
    fetchDashboardStats,
    fetchQuoteRequests,
    fetchContactRequests,
    updateContactRequest,
    updateQuoteRequest,
    fetchUserProfile,
    updateProfile,
    uploadWorkspaceImages,
    fetchBookingRequests,
    updateBookingRequest as updateBookingRequestApi,
    submitBookingRequest,
    fetchVisitRequests,
    updateVisitRequest as updateVisitRequestApi,
    fetchDayPasses,
    generateMonthlyInvoices,
    resetMonthlyInvoices,
    fetchInvoices
} from "@/lib/api";

import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { DEFAULT_WORKSPACE_IMAGE } from "@/lib/constants";

type View = "dashboard" | "users" | "workspaces" | "requests" | "contacts" | "daypasses" | "profile" | "invoices";


interface ContactRequest {
    _id?: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status?: string;
    createdAt: string;
}

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

interface VisitRequest {
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

interface DayPassRequest {
    _id?: string;
    name: string;
    email: string;
    contact: string;
    purpose: string;
    visitDate: string;
    passCode: string;
    status: string;
    createdAt: string;
}




const AdminDashboard = () => {
    const router = useRouter();
    const [currentView, setCurrentView] = useState<View>("dashboard");
    const [requestSubView, setRequestSubView] = useState<"quotes" | "bookings" | "visits">("quotes");
    const [searchTerm, setSearchTerm] = useState("");
    const [userStatusFilter, setUserStatusFilter] = useState<string>("all");
    const [workspaceTypeFilter, setWorkspaceTypeFilter] = useState<string>("all");
    const [workspaceStatusFilter, setWorkspaceStatusFilter] = useState<string>("all");
    const [workspaceLocationFilter, setWorkspaceLocationFilter] = useState<string>("all");
    const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>("all");
    const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
    const [visitStatusFilter, setVisitStatusFilter] = useState<string>("all");
    const [contactStatusFilter, setContactStatusFilter] = useState<string>("all");
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all");
    const [dayPassStatusFilter, setDayPassStatusFilter] = useState<string>("all");
    const [users, setUsers] = useState<User[]>([]);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
    const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
    const [bookings, setBookings] = useState<BookingRequest[]>([]);
    const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
    const [dayPasses, setDayPasses] = useState<DayPassRequest[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isGeneratingInvoices, setIsGeneratingInvoices] = useState(false);
    const [isResettingInvoices, setIsResettingInvoices] = useState(false);
    const [isAdminLoading, setIsAdminLoading] = useState(true);
    const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
    const [bookingToUnallot, setBookingToUnallot] = useState<BookingRequest | null>(null);
    const [isUnallotConfirmDialogOpen, setIsUnallotConfirmDialogOpen] = useState(false);
    const [allottedSeats, setAllottedSeats] = useState(1);

    const [userInfo, setUserInfo] = useState<any>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [editProfileData, setEditProfileData] = useState({
        name: "",
        email: "",
        organization: "",
        mobile: ""
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        activeMembers: 0,
        newQuoteRequests: 0,
        newBookingRequests: 0,
        newVisitRequests: 0,
        revenueGrowth: "+12.5%"
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [userErrors, setUserErrors] = useState<{ [key: string]: string }>({});
    const [workspaceErrors, setWorkspaceErrors] = useState<{ [key: string]: string }>({});
    const [securityErrors, setSecurityErrors] = useState<{ [key: string]: string }>({});
    const [editUserErrors, setEditUserErrors] = useState<{ [key: string]: string }>({});
    const [editWorkspaceErrors, setEditWorkspaceErrors] = useState<{ [key: string]: string }>({});

    // Pagination state
    const [tablePages, setTablePages] = useState({
        users: 1,
        workspaces: 1,
        quotes: 1,
        bookings: 1,
        visits: 1,
        contacts: 1,
        dayPasses: 1,
        invoices: 1,
        recentUsers: 1
    });
    const ITEMS_PER_PAGE = 8;

    // Image upload states
    const [workspaceImages, setWorkspaceImages] = useState<File[]>([]);
    const [editingWorkspaceImages, setEditingWorkspaceImages] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);
    const [isLoadingAllotment, setIsLoadingAllotment] = useState(false);
    const [viewedNotifications, setViewedNotifications] = useState<string[]>(() => {
        try {
            const userInfo = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || "{}") : {};
            const saved = typeof window !== 'undefined' ? localStorage.getItem("viewedNotifications") : null;
            return userInfo.viewedNotifications || (saved ? JSON.parse(saved) : []);
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("viewedNotifications", JSON.stringify(viewedNotifications));
    }, [viewedNotifications]);

    const notifications = useMemo(() => {
        const allNotifications = [
            ...(Array.isArray(quotes) ? quotes.map(q => ({
                id: q._id || "",
                type: 'Quote',
                title: 'New Quote Request',
                subtitle: q.fullName,
                date: q.createdAt,
                status: q.status,
                icon: UserPlus,
                color: 'text-amber-500',
                isRead: viewedNotifications.includes(`Quote-${q._id}`)
            })) : []),
            ...(Array.isArray(bookings) ? bookings.map(b => ({
                id: b._id || "",
                type: 'Booking',
                title: 'New Booking Request',
                subtitle: b.fullName,
                date: b.createdAt,
                status: b.status,
                icon: Calendar,
                color: 'text-indigo-500',
                isRead: viewedNotifications.includes(`Booking-${b._id}`)
            })) : []),
            ...(Array.isArray(visitRequests) ? visitRequests.map(v => ({
                id: v._id || "",
                type: 'Visit',
                title: 'New Visit Request',
                subtitle: v.fullName,
                date: v.createdAt,
                status: v.status,
                icon: Clock,
                color: 'text-blue-500',
                isRead: viewedNotifications.includes(`Visit-${v._id}`)
            })) : []),
            ...(Array.isArray(contactRequests) ? contactRequests.map(c => ({
                id: c._id || "",
                type: 'Contact',
                title: 'New Contact Inquiry',
                subtitle: c.name,
                date: c.createdAt,
                status: c.status,
                icon: MessageSquare,
                color: 'text-emerald-500',
                isRead: viewedNotifications.includes(`Contact-${c._id}`)
            })) : [])
        ];

        return allNotifications
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 15); // Show last 15 notifications
    }, [quotes, bookings, visitRequests, contactRequests, viewedNotifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const pendingCount = notifications.filter(n => n.status === 'Pending').length;

    const markAsRead = useCallback(async (notifId: string, type: string) => {
        const uniqueId = `${type}-${notifId}`;
        if (!viewedNotifications.includes(uniqueId)) {
            const updated = [...viewedNotifications, uniqueId];
            setViewedNotifications(updated);
            try {
                await updateProfile({ viewedNotifications: updated });
            } catch (error) {
                console.error("Failed to sync notification status:", error);
            }
        }
    }, [viewedNotifications]);

    const markAllAsRead = useCallback(async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => `${n.type}-${n.id}`);
        if (unreadIds.length === 0) return;

        const updated = [...new Set([...viewedNotifications, ...unreadIds])];
        setViewedNotifications(updated);
        try {
            await updateProfile({ viewedNotifications: updated });
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    }, [notifications, viewedNotifications]);

    const handlePasswordChange = async () => {
        const newErrors: { [key: string]: string } = {};
        if (!passwordData.oldPassword) newErrors.oldPassword = "Current password is required";
        if (!passwordData.newPassword) {
            newErrors.newPassword = "New password is required";
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters";
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setSecurityErrors(newErrors);
            return;
        }

        setIsChangingPassword(true);
        try {
            await updateProfile({
                password: passwordData.newPassword,
                oldPassword: passwordData.oldPassword
            });
            toast.success("Security credentials updated successfully");
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setSecurityErrors({});
            setIsSecurityModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleUpdateProfileInfo = async () => {
        setIsUpdatingProfile(true);
        try {
            const updated = await updateProfile(editProfileData);
            setUserInfo(updated);
            const sessionData = JSON.parse(localStorage.getItem("userInfo") || "{}");
            localStorage.setItem("userInfo", JSON.stringify({ ...sessionData, ...updated }));
            toast.success("Admin profile updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        setUserInfo(null);
        toast.success("Logged out successfully");
        router.push("/login");
    };

    const fetchUsersList = async () => {
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast.error("Failed to load users");
            setUsers(initialUsers);
        }
    };

    const fetchWorkspacesList = async () => {
        try {
            const data = await fetchWorkspaces();
            setWorkspaces(data);
        } catch (error) {
            console.error("Failed to fetch workspaces:", error);
            toast.error("Failed to load workspaces");
            setWorkspaces(initialWorkspaces);
        }
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const loadData = useCallback(async (isAutoRefresh = false) => {
        try {
            const [wsData, userData, statsData, quotesData, contactsData, bookingsData, visitsData, dayPassesData, invoicesData, freshProfile] = await Promise.all([
                fetchWorkspaces().catch(() => []),
                fetchUsers().catch(() => []),
                fetchDashboardStats().catch(() => ({ totalUsers: 0, activeMembers: 0, newQuoteRequests: 0, newBookingRequests: 0, newVisitRequests: 0, revenueGrowth: "+0%" })),
                fetchQuoteRequests().catch(err => {
                    console.error("Failed to fetch quotes:", err);
                    return [];
                }),
                fetchContactRequests().catch(err => {
                    console.error("Failed to fetch contacts:", err);
                    return [];
                }),
                fetchBookingRequests().catch(err => {
                    console.error("Failed to fetch bookings:", err);
                    return [];
                }),
                fetchVisitRequests().catch(err => {
                    console.error("Failed to fetch visits:", err);
                    return [];
                }),
                fetchDayPasses().catch(err => {
                    console.error("Failed to fetch day passes:", err);
                    return [];
                }),
                fetchInvoices().catch(err => {
                    console.error("Failed to fetch invoices:", err);
                    return [];
                }),
                fetchUserProfile().catch(err => {
                    console.error("Failed to fetch fresh profile:", err);
                    return null;
                })
            ]);


            if (freshProfile) {
                setUserInfo(freshProfile);
                setEditProfileData({
                    name: freshProfile.name || "",
                    email: freshProfile.email || "",
                    organization: freshProfile.organization || "",
                    mobile: freshProfile.mobile || ""
                });
                const sessionData = JSON.parse(localStorage.getItem("userInfo") || "{}");
                localStorage.setItem("userInfo", JSON.stringify({ ...sessionData, ...freshProfile }));
            }

            setWorkspaces(wsData);
            setUsers(userData);
            setDashboardStats(statsData);
            setQuotes(quotesData);
            setContactRequests(contactsData);
            setBookings(bookingsData);
            setVisitRequests(visitsData);
            setDayPasses(dayPassesData);
            setInvoices(invoicesData);

            if (freshProfile?.viewedNotifications) {
                setViewedNotifications(freshProfile.viewedNotifications);
            }

        } catch (error: any) {
            console.error("Failed to fetch dashboard data:", error);
            if (!isAutoRefresh) {
                toast.error("Failed to load dashboard data");
                setWorkspaces(initialWorkspaces);
                setUsers(initialUsers);
            }
        } finally {
            if (!isAutoRefresh) setIsAdminLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("userInfo");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        const user = JSON.parse(storedUser);
        setUserInfo(user);
        if (user.role !== "Admin") {
            router.push("/");
            return;
        }

        loadData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            loadData(true);
        }, 30000);

        // Refresh on window focus
        const onFocus = () => loadData(true);
        window.addEventListener('focus', onFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', onFocus);
        };
    }, [router, loadData, currentView]);


    // New Workspace Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newWorkspace, setNewWorkspace] = useState<Partial<Workspace>>({
        name: "",
        location: "",
        floor: "",
        type: "",
        capacity: "",
        amenities: [],
        features: {
            hasConferenceHall: false,
            hasCabin: false,
            workstationSeats: 0,
            conferenceHallSeats: 0,
            cabinSeats: 0
        }
    });
    const [amenityInput, setAmenityInput] = useState("");
    const [editAmenityInput, setEditAmenityInput] = useState("");

    // New User Form State
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({
        name: "",
        email: "",
        password: "",
        mobile: "",
        organization: "",
        role: "Member" as "Member" | "Admin"
    });

    // Allotment State
    const [isAllotDialogOpen, setIsAllotDialogOpen] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
    const [selectedUserForAllotment, setSelectedUserForAllotment] = useState<string>("");
    const [unavailableUntilDate, setUnavailableUntilDate] = useState<string>("");
    const [allotmentStartDate, setAllotmentStartDate] = useState<string>("");

    // Editing State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
    const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
    const [isEditWorkspaceDialogOpen, setIsEditWorkspaceDialogOpen] = useState(false);

    // Deletion State
    const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
    const [isDeleteWorkspaceDialogOpen, setIsDeleteWorkspaceDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Auto-calculate capacity for new workspace
    useEffect(() => {
        if (newWorkspace.type === "Dedicated Workspace" && newWorkspace.features) {
            const { workstationSeats = 0, conferenceHallSeats = 0, cabinSeats = 0, hasConferenceHall, hasCabin } = newWorkspace.features;
            const total = Number(workstationSeats) +
                (hasConferenceHall ? Number(conferenceHallSeats) : 0) +
                (hasCabin ? Number(cabinSeats) : 0);

            if (total > 0) {
                setNewWorkspace(prev => ({
                    ...prev,
                    capacity: `${total} people`
                }));
            }
        }
    }, [
        newWorkspace.features?.workstationSeats,
        newWorkspace.features?.conferenceHallSeats,
        newWorkspace.features?.cabinSeats,
        newWorkspace.features?.hasConferenceHall,
        newWorkspace.features?.hasCabin,
        newWorkspace.type
    ]);

    // Auto-calculate capacity for editing workspace
    useEffect(() => {
        if (editingWorkspace?.type === "Dedicated Workspace" && editingWorkspace.features) {
            const { workstationSeats = 0, conferenceHallSeats = 0, cabinSeats = 0, hasConferenceHall, hasCabin } = editingWorkspace.features;
            const total = Number(workstationSeats) +
                (hasConferenceHall ? Number(conferenceHallSeats) : 0) +
                (hasCabin ? Number(cabinSeats) : 0);

            if (editingWorkspace.capacity !== `${total} people`) {
                setEditingWorkspace(prev => prev ? {
                    ...prev,
                    capacity: `${total} people`
                } : null);
            }
        }
    }, [
        editingWorkspace?.features?.workstationSeats,
        editingWorkspace?.features?.conferenceHallSeats,
        editingWorkspace?.features?.cabinSeats,
        editingWorkspace?.features?.hasConferenceHall,
        editingWorkspace?.features?.hasCabin,
        editingWorkspace?.type
    ]);

    const addAmenity = (isEdit: boolean = false) => {
        if (isEdit) {
            if (!editAmenityInput.trim() || !editingWorkspace) return;
            setEditingWorkspace({
                ...editingWorkspace,
                amenities: [...(editingWorkspace.amenities || []), editAmenityInput.trim()]
            });
            setEditAmenityInput("");
        } else {
            if (!amenityInput.trim()) return;
            setNewWorkspace({
                ...newWorkspace,
                amenities: [...(newWorkspace.amenities || []), amenityInput.trim()]
            });
            setAmenityInput("");
        }
    };

    const removeAmenity = (index: number, isEdit: boolean = false) => {
        if (isEdit) {
            if (!editingWorkspace) return;
            const newAmenities = [...(editingWorkspace.amenities || [])];
            newAmenities.splice(index, 1);
            setEditingWorkspace({ ...editingWorkspace, amenities: newAmenities });
        } else {
            const newAmenities = [...(newWorkspace.amenities || [])];
            newAmenities.splice(index, 1);
            setNewWorkspace({ ...newWorkspace, amenities: newAmenities });
        }
    };

    const handleAllotWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWorkspace) {
            toast.error("No workspace selected for allotment");
            return;
        }
        setIsLoadingAllotment(true);
        try {
            const allotValue = selectedUserForAllotment === "none" ? null : (selectedUserForAllotment || null);

            // Check for timeline conflicts if we are assigning to a new user
            const currentWS = workspaces.find(w => w._id === selectedWorkspace || (w.id && w.id.toString() === selectedWorkspace));
            if (allotValue && currentWS?.allottedTo) {
                const currentAllotteeId = typeof currentWS.allottedTo === 'string' ? currentWS.allottedTo : (currentWS.allottedTo as any)?._id;

                if (currentAllotteeId && currentAllotteeId !== allotValue) {
                    // Check if the current allottee is an Admin (placeholder for guest bookings).
                    // If so, skip the conflict check — Admin was only a temporary placeholder
                    // and should be freely reassigned to the actual user.
                    const currentAllotteeUser = users.find(u => u._id === currentAllotteeId || (u as any).id === currentAllotteeId);
                    const isAdminPlaceholder = (currentAllotteeUser as any)?.role === 'Admin';

                    if (!isAdminPlaceholder) {
                        const existingStart = currentWS.allotmentStart ? new Date(currentWS.allotmentStart) : null;
                        const existingEnd = currentWS.unavailableUntil ? new Date(currentWS.unavailableUntil) : null;
                        const newStart = allotmentStartDate ? new Date(allotmentStartDate) : new Date();
                        const newEnd = unavailableUntilDate ? new Date(unavailableUntilDate) : null;

                        if (existingStart && (newEnd === null || newEnd >= existingStart) && (existingEnd === null || newStart <= existingEnd)) {
                            toast.error("Schedule Conflict: This workspace is already allocated to another user during an overlapping period. Please clear the existing allotment first if you wish to overwrite it.");
                            setIsLoadingAllotment(false);
                            return;
                        }
                    }
                }
            }

            console.log("Allotting workspace:", selectedWorkspace, "to user:", allotValue);

            if (currentWS?.type === "Open WorkStation" && allotValue) {
                const userObj = users.find(u => u._id === allotValue);
                if (!userObj) throw new Error("Selected user not found");

                // For Open Workstation, we create a CONFIRMED booking request
                const duration = "1 Month"; // Default for direct allotment
                await submitBookingRequest({
                    workspaceId: selectedWorkspace,
                    workspaceName: currentWS.name,
                    fullName: userObj.name,
                    email: userObj.email,
                    contactNumber: userObj.mobile || "0000000000",
                    duration: duration,
                    startDate: allotmentStartDate || new Date().toISOString(),
                    endDate: unavailableUntilDate || null,
                    seatCount: allottedSeats,
                    paymentMethod: "Pay Later",
                    status: "Confirmed"
                });
            } else {
                const updatedWorkspace = await updateWorkspaceApi(selectedWorkspace, {
                    allottedTo: allotValue,
                    allotmentStart: allotValue ? (allotmentStartDate || null) : null,
                    unavailableUntil: allotValue ? (unavailableUntilDate || null) : null
                });
                // Re-fetch or update local state
                setWorkspaces(workspaces.map(ws => (ws._id === selectedWorkspace || (ws.id && ws.id.toString() === selectedWorkspace)) ? updatedWorkspace : ws));
            }

            await loadData(); // Ensure UI gets populated user data
            setIsAllotDialogOpen(false);
            toast.success("Workspace allotment updated successfully!");
        } catch (error: any) {
            console.error("Allotment error:", error);
            toast.error("Failed to allot workspace: " + (error.message || "Unknown error"));
        } finally {
            setIsLoadingAllotment(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { [key: string]: string } = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!newUserData.name.trim()) newErrors.name = "Name is required";
        if (!newUserData.email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(newUserData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!newUserData.password) {
            newErrors.password = "Password is required";
        } else if (newUserData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (Object.keys(newErrors).length > 0) {
            setUserErrors(newErrors);
            return;
        }

        setIsLoadingUser(true);
        try {
            const createdUser = await createUserApi(newUserData);
            setUsers([createdUser, ...users]);
            setIsUserDialogOpen(false);
            setUserErrors({});
            toast.success(`User "${createdUser.name}" created successfully!`);
            // Reset form
            setNewUserData({
                name: "",
                email: "",
                password: "",
                mobile: "",
                organization: "",
                role: "Member"
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to create user");
        } finally {
            setIsLoadingUser(false);
        }
    };

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { [key: string]: string } = {};
        if (!newWorkspace.name?.trim()) newErrors.name = "Workspace name is required";
        if (!newWorkspace.location?.trim()) newErrors.location = "Location is required";
        if (!newWorkspace.floor?.trim()) newErrors.floor = "Floor is required";
        if (!newWorkspace.capacity?.trim()) newErrors.capacity = "Capacity is required";
        if (!newWorkspace.type?.trim()) newErrors.type = "Type is required";
        if (newWorkspace.price === undefined || newWorkspace.price === "") newErrors.price = "Price is required";

        if (Object.keys(newErrors).length > 0) {
            setWorkspaceErrors(newErrors);
            return;
        }

        setIsLoadingWorkspace(true);
        try {
            const workspaceData = {
                name: newWorkspace.name || "New Workspace",
                location: newWorkspace.location || "",
                floor: newWorkspace.floor,
                type: newWorkspace.type || "Dedicated Workspace",
                capacity: newWorkspace.capacity || "0 people",
                amenities: newWorkspace.amenities || [],
                image: DEFAULT_WORKSPACE_IMAGE,
                featured: false,
                price: Number(newWorkspace.price) || 0,
                totalSeats: (newWorkspace.type === "Open WorkStation") ? (Number(newWorkspace.features?.workstationSeats) || 0) : 0,
                availableSeats: (newWorkspace.type === "Open WorkStation") ? (Number(newWorkspace.features?.workstationSeats) || 0) : 0,
                features: {
                    ...newWorkspace.features,
                    workstationSeats: Number(newWorkspace.features?.workstationSeats) || 0,
                    conferenceHallSeats: Number(newWorkspace.features?.conferenceHallSeats) || 0,
                    cabinSeats: Number(newWorkspace.features?.cabinSeats) || 0
                }
            };

            const createdWorkspace = await createWorkspaceApi(workspaceData);

            // Upload images if any
            if (workspaceImages.length > 0) {
                const formData = new FormData();
                workspaceImages.forEach(file => formData.append('images', file));
                await uploadWorkspaceImages((createdWorkspace._id || createdWorkspace.id || '').toString(), formData);
                // Re-fetch to get updated images
                const finalWorkspaces = await fetchWorkspaces();
                setWorkspaces(finalWorkspaces);
            } else {
                setWorkspaces([createdWorkspace, ...workspaces]);
            }

            setIsDialogOpen(false);
            setWorkspaceErrors({});
            setWorkspaceImages([]);
            toast.success(`Workspace "${createdWorkspace.name}" created successfully!`);
            // Reset form
            setNewWorkspace({
                name: "",
                location: "",
                floor: "",
                type: "",
                capacity: "",
                amenities: [],
                features: {
                    hasConferenceHall: false,
                    hasCabin: false,
                    workstationSeats: 0,
                    conferenceHallSeats: 0,
                    cabinSeats: 0
                }
            });
            setAmenityInput("");
            setEditAmenityInput("");
        } catch (error: any) {
            toast.error(error.message || "Failed to create workspace");
        } finally {
            setIsLoadingWorkspace(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        const newErrors: { [key: string]: string } = {};
        if (!editingUser.name.trim()) newErrors.name = "Full name is required";
        if (!editingUser.email.trim()) {
            newErrors.email = "Email address is required";
        } else if (!validateEmail(editingUser.email)) {
            newErrors.email = "Invalid email format";
        }

        if (Object.keys(newErrors).length > 0) {
            setEditUserErrors(newErrors);
            return;
        }
        setIsLoadingUser(true);
        try {
            await updateUserApi(editingUser._id!, editingUser);
            toast.success("User updated successfully");
            setIsEditUserDialogOpen(false);
            setEditUserErrors({});
            fetchUsersList();
        } catch (err: any) {
            toast.error(err.message || "Failed to update user");
        } finally {
            setIsLoadingUser(false);
        }
    };

    const handleUpdateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingWorkspace) return;

        const newErrors: { [key: string]: string } = {};
        if (!editingWorkspace.name.trim()) newErrors.name = "Name is required";
        if (!editingWorkspace.location.trim()) newErrors.location = "Location is required";
        if (!editingWorkspace.type.trim()) newErrors.type = "Type is required";
        if (editingWorkspace.price === undefined || editingWorkspace.price === "") newErrors.price = "Price is required";

        if (Object.keys(newErrors).length > 0) {
            setEditWorkspaceErrors(newErrors);
            return;
        }

        setIsLoadingWorkspace(true);
        try {
            // Create a sanitized payload excluding populated fields that shouldn't be updated directly
            const { allottedTo, ...payload }: any = editingWorkspace;

            if (payload.type === "Open WorkStation") {
                const oldTotal = payload.totalSeats || 0;
                const newTotal = Number(payload.features?.workstationSeats) || 0;
                const difference = newTotal - oldTotal;

                payload.totalSeats = newTotal;
                payload.availableSeats = (payload.availableSeats || 0) + difference;
            }

            await updateWorkspaceApi(editingWorkspace._id!, payload);

            // Upload new images if any
            if (editingWorkspaceImages.length > 0) {
                const formData = new FormData();
                editingWorkspaceImages.forEach(file => formData.append('images', file));
                await uploadWorkspaceImages(editingWorkspace._id!, formData);
            }

            toast.success("Workspace updated successfully");
            setIsEditWorkspaceDialogOpen(false);
            setEditWorkspaceErrors({});
            setEditingWorkspaceImages([]);
            fetchWorkspacesList();
        } catch (err: any) {
            toast.error(err.message || "Failed to update workspace");
        } finally {
            setIsLoadingWorkspace(false);
        }
    };

    const handleDeleteUser = (id: string) => {
        setItemToDelete(id);
        setIsDeleteUserDialogOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!itemToDelete) return;
        setIsLoadingDelete(true);
        try {
            await deleteUserApi(itemToDelete);
            setUsers(users.filter(u => u._id !== itemToDelete));
            setIsDeleteUserDialogOpen(false);
            setItemToDelete(null);
            toast.success("User deleted successfully!");
        } catch (error: any) {
            toast.error("Failed to delete user: " + error.message);
        } finally {
            setIsLoadingDelete(false);
        }
    };

    const handleDeleteWorkspace = (id: string) => {
        setItemToDelete(id);
        setIsDeleteWorkspaceDialogOpen(true);
    };

    const confirmDeleteWorkspace = async () => {
        if (!itemToDelete) return;
        setIsLoadingDelete(true);
        try {
            await deleteWorkspaceApi(itemToDelete);
            setWorkspaces(workspaces.filter(ws => ws._id !== itemToDelete));
            setIsDeleteWorkspaceDialogOpen(false);
            setItemToDelete(null);
            toast.success("Workspace deleted successfully!");
        } catch (error: any) {
            toast.error("Failed to delete workspace: " + error.message);
        } finally {
            setIsLoadingDelete(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch = (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            const matchesStatus = userStatusFilter === "all" || user.status === userStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [users, searchTerm, userStatusFilter]);

    const filteredWorkspaces = useMemo(() => {
        return workspaces.filter((ws) => {
            const matchesSearch = (ws.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (ws.location?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            const matchesType = workspaceTypeFilter === "all" || ws.type === workspaceTypeFilter;
            const matchesLocation = workspaceLocationFilter === "all" || ws.location === workspaceLocationFilter;

            const now = new Date();
            const allotmentStart = ws.allotmentStart ? new Date(ws.allotmentStart) : null;
            const isUnavailable = !!ws.allottedTo && (!allotmentStart || now >= allotmentStart);
            const status = isUnavailable ? "unavailable" : "available";
            const matchesStatus = workspaceStatusFilter === "all" || status === workspaceStatusFilter;

            return matchesSearch && matchesType && matchesStatus && matchesLocation;
        });
    }, [workspaces, searchTerm, workspaceTypeFilter, workspaceLocationFilter, workspaceStatusFilter]);

    const filteredQuotes = useMemo(() => {
        return (Array.isArray(quotes) ? quotes : []).filter(q => {
            const matchesSearch = (q.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (q.requiredWorkspace?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (q.workEmail?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            const matchesStatus = quoteStatusFilter === "all" || q.status === quoteStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [quotes, searchTerm, quoteStatusFilter]);

    const filteredBookings = useMemo(() => {
        return (Array.isArray(bookings) ? bookings : []).filter(b => {
            const matchesSearch = (b.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (b.workspaceName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (b.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            const matchesStatus = bookingStatusFilter === "all" || b.status === bookingStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [bookings, searchTerm, bookingStatusFilter]);

    const filteredVisits = useMemo(() => {
        return (Array.isArray(visitRequests) ? visitRequests : []).filter(v => {
            const matchesSearch = (v.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (v.workspaceName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (v.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            const matchesStatus = visitStatusFilter === "all" || v.status === visitStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [visitRequests, searchTerm, visitStatusFilter]);

    const filteredContacts = useMemo(() => {
        return (Array.isArray(contactRequests) ? contactRequests : []).filter(c => {
            const matchesSearch = (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (c.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (c.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            const matchesStatus = contactStatusFilter === "all" || c.status === contactStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [contactRequests, searchTerm, contactStatusFilter]);

    const filteredInvoices = useMemo(() => {
        return (Array.isArray(invoices) ? invoices : []).filter(inv => {
            const matchesSearch = (inv.customerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (inv.customerEmail?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (inv.invoiceNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (inv.workspaceName?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            const matchesStatus = invoiceStatusFilter === "all" || inv.status === invoiceStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchTerm, invoiceStatusFilter]);

    const filteredDayPasses = useMemo(() => {
        return (Array.isArray(dayPasses) ? dayPasses : []).filter(p => {
            const matchesSearch = (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (p.passCode?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (p.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            const matchesStatus = dayPassStatusFilter === "all" || p.status === dayPassStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [dayPasses, searchTerm, dayPassStatusFilter]);

    const stats = [
        { label: "Total Users", value: (dashboardStats.totalUsers ?? 0).toString(), icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Active Members", value: (dashboardStats.activeMembers ?? 0).toString(), icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "New Quotes", value: (dashboardStats.newQuoteRequests ?? 0).toString(), icon: UserPlus, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "New Bookings", value: (dashboardStats.newBookingRequests ?? 0).toString(), icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    ];

    const handleGenerateInvoices = async () => {
        setIsGeneratingInvoices(true);
        try {
            const data = await generateMonthlyInvoices();
            toast.success(data.message || "Monthly invoices generated successfully!");
            // Refresh data
            loadData();
        } catch (error: any) {
            toast.error("Failed to generate invoices: " + error.message);
        } finally {
            setIsGeneratingInvoices(false);
        }
    };

    const handleResetInvoices = async () => {
        if (!confirm("Are you sure you want to clear all recurring invoices for the current month? This will allow you to generate them again.")) return;

        setIsResettingInvoices(true);
        try {
            const data = await resetMonthlyInvoices();
            toast.success(data.message || "Monthly invoices cleared successfully!");
            // Refresh data
            loadData();
        } catch (error: any) {
            toast.error("Failed to clear invoices: " + error.message);
        } finally {
            setIsResettingInvoices(false);
        }
    };

    if (isAdminLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse font-medium">Loading console...</p>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <Sidebar collapsible="offcanvas" className="shadow-xl">
                <SidebarHeader className="p-4 transition-all duration-300 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <img src={cohortimage.src} alt="Logo" className="w-52 rounded-full transition-all duration-300 group-data-[collapsible=icon]:w-8" />
                    </Link>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "dashboard"}
                                        onClick={() => setCurrentView("dashboard")}
                                        tooltip="Overview"
                                        className="group-data-[collapsible=icon]:justify-center"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        <span className="group-data-[collapsible=icon]:hidden">Overview</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "users"}
                                        onClick={() => setCurrentView("users")}
                                        tooltip="Users"
                                        className="group-data-[collapsible=icon]:justify-center"
                                    >
                                         <UsersIcon className="w-5 h-5" />
                                         <span className="group-data-[collapsible=icon]:hidden">Users</span>
                                     </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "workspaces"}
                                        onClick={() => setCurrentView("workspaces")}
                                        tooltip="Workspaces"
                                        className="group-data-[collapsible=icon]:justify-center"
                                    >
                                        <Briefcase className="w-5 h-5" />
                                        <span className="group-data-[collapsible=icon]:hidden">Workspaces</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "requests"}
                                        onClick={() => setCurrentView("requests")}
                                        tooltip="Requests"
                                        className="group-data-[collapsible=icon]:justify-center"
                                    >
                                        <ClipboardList className="w-5 h-5" />
                                        <span className="group-data-[collapsible=icon]:hidden">Requests</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "contacts"}
                                        onClick={() => setCurrentView("contacts")}
                                        tooltip="Contacts"
                                        className="group-data-[collapsible=icon]:justify-center"
                                    >
                                         <MessageSquare className="w-5 h-5" />
                                         <span className="group-data-[collapsible=icon]:hidden">Messages</span>
                                     </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "invoices"}
                                        onClick={() => setCurrentView("invoices")}
                                        tooltip="Invoices"
                                        className="group-data-[collapsible=icon]:justify-center"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        <span className="group-data-[collapsible=icon]:hidden">Invoices</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "daypasses"}
                                        onClick={() => setCurrentView("daypasses")}
                                        tooltip="Day Passes"
                                        className="group-data-[collapsible=icon]:justify-center"
                                    >
                                         <QrCode className="w-5 h-5" />
                                         <span className="group-data-[collapsible=icon]:hidden">Passes</span>
                                     </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "profile"}
                                        onClick={() => setCurrentView("profile")}
                                        tooltip="My Profile"
                                        className="group-data-[collapsible=icon]:justify-center"
                                    >
                                        <UserIcon className="w-5 h-5" />
                                        <span className="group-data-[collapsible=icon]:hidden">My Profile</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>

                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup className="mt-auto border-t border-border/50 pt-4">
                        <SidebarGroupContent>
                            {userInfo && (
                                <div className="bg-muted/50 p-2 rounded-2xl mb-2 mx-1 border border-border/50 flex items-center transition-all duration-300 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:justify-center">
                                    <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
                                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs shadow-inner shrink-0 transition-transform group-hover:scale-105">
                                            {userInfo.name ? userInfo.name.split(" ").map((n: string) => n[0]).join("") : "U"}
                                        </div>
                                        <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                                            <span className="font-bold text-sm truncate">{userInfo.name || "Admin"}</span>
                                            <span className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-tight">{userInfo.role || "Administrator"}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        onClick={handleLogout}
                                        className="w-full justify-start text-destructive hover:bg-destructive/10 rounded-xl transition-all font-semibold h-11 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                                    >
                                         <LogOut className="w-5 h-5 mr-3 group-data-[collapsible=icon]:mr-0" />
                                         <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                                     </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            {/* Main Content */}
            <SidebarInset className="flex-1 flex flex-col min-w-0 bg-background overflow-x-hidden">
                <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger />
                        <h1 className="text-xl font-bold lg:text-2xl capitalize">{currentView}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="relative w-9 h-9 transition-all active:scale-95 group"
                                    onClick={markAllAsRead}
                                >
                                    <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary ring-2 ring-background pointer-events-none" />
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 rounded-2xl overflow-hidden glass border-border/50 shadow-2xl" align="end">
                                <div className="p-4 border-b border-border/50 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Notifications</h4>
                                            <button 
                                                onClick={markAllAsRead}
                                                className="text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors text-left mt-1 underline underline-offset-2"
                                            >
                                                Mark all as read
                                            </button>
                                        </div>
                                        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] uppercase font-black bg-primary/10 border-primary/20 text-primary">
                                            {pendingCount} Pending
                                        </Badge>
                                    </div>
                                </div>
                                <ScrollArea className="h-[400px]">
                                    {notifications.length > 0 ? (
                                        <div className="flex flex-col">
                                            {notifications.map((notif) => (
                                                <button
                                                    key={`${notif.type}-${notif.id}`}
                                                    className={`flex items-start gap-4 p-4 hover:bg-muted/50 border-b border-border/50 last:border-0 transition-all text-left w-full group ${notif.isRead ? 'opacity-60' : 'bg-primary/5'}`}
                                                    onClick={() => {
                                                        markAsRead(notif.id, notif.type);
                                                        if (notif.type === 'Contact') setCurrentView('contacts');
                                                        else {
                                                            setCurrentView('requests');
                                                            if (notif.type === 'Quote') setRequestSubView('quotes');
                                                            if (notif.type === 'Booking') setRequestSubView('bookings');
                                                            if (notif.type === 'Visit') setRequestSubView('visits');
                                                        }
                                                    }}
                                                >
                                                    <div className={`mt-1 p-2 rounded-xl bg-muted/50 ${notif.color} group-hover:scale-110 transition-transform`}>
                                                        <notif.icon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                                                                <p className="text-[11px] font-black text-foreground uppercase tracking-tight truncate">{notif.title}</p>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap px-1">
                                                                {formatDistanceToNow(new Date(notif.date), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-bold text-muted-foreground truncate italic">{notif.subtitle}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant={notif.status === 'Pending' ? 'destructive' : 'secondary'} className="text-[8px] h-4 px-1.5 rounded-sm uppercase font-black">
                                                                {notif.status}
                                                            </Badge>
                                                            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">• {notif.type}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center text-muted-foreground">
                                            <div className="p-4 rounded-full bg-muted/30 mb-4 ring-1 ring-border/50">
                                                <Bell className="w-8 h-8 opacity-20" />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-widest opacity-40">No new incoming requests</p>
                                        </div>
                                    )}
                                </ScrollArea>
                                <div className="p-2 border-t border-border/50 bg-muted/10">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 hover:text-primary transition-all h-10 rounded-xl"
                                        onClick={() => setCurrentView('requests')}
                                    >                                         View Active Requests
                                     </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6 md:p-8 space-y-8">
                    {currentView === "dashboard" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Dashboard Header */}
                            <div className="flex flex-col gap-1">                                 <h2 className="text-3xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                     Overview
                                 </h2>
                                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">System overview and stats</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: "Total Users", value: dashboardStats.totalUsers ?? 0, icon: UsersIcon, color: "blue", trend: "+12.5%", description: "Registered users in the system" },
                                    { label: "Active Members", value: dashboardStats.activeMembers ?? 0, icon: ShieldCheck, color: "emerald", trend: "+5.2%", description: "Members with active status" },
                                    { label: "Quote Requests", value: dashboardStats.newQuoteRequests ?? 0, icon: UserPlus, color: "amber", trend: "Pending", description: "New requests for workspace quotes" },
                                    { label: "Bookings", value: dashboardStats.newBookingRequests ?? 0, icon: Calendar, color: "violet", trend: "Active", description: "Confirmed space bookings" }
                                ].map((stat) => (
                                    <div key={stat.label} className="group/stat card-elevated p-6 glass relative overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
                                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover/stat:bg-${stat.color}-500/10 transition-all duration-700`} />

                                        <div className="flex items-start justify-between relative z-10">
                                            <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover/stat:rotate-6 transition-transform duration-500`}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[10px] font-black uppercase tracking-wider text-${stat.color}-500 bg-${stat.color}-500/10 px-2 py-0.5 rounded-full`}>
                                                    {stat.trend}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-8 space-y-1 relative z-10">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-3xl font-black italic tracking-tighter">{stat.value.toLocaleString()}</p>
                                                <span className="text-[10px] font-bold text-muted-foreground/40">units</span>
                                            </div>
                                            <p className="text-[9px] font-medium text-muted-foreground italic pt-2 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300">
                                                {stat.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-8">
                                    <RecentUsersTable
                                        users={(Array.isArray(users) ? users : [])}
                                        currentPage={tablePages.recentUsers}
                                        onPageChange={(page) => setTablePages({ ...tablePages, recentUsers: page })}
                                        itemsPerPage={5}
                                    />
                                </div>

                                <div className="lg:col-span-4 space-y-6">
                                    <div className="card-elevated p-8 glass relative overflow-hidden group/actions">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

                                        <div className="flex items-center justify-between mb-8">                                             <div>
                                                 <h3 className="text-lg font-black italic tracking-tight">Quick Operations</h3>
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Common Actions</p>
                                             </div>
                                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                                <Zap className="w-5 h-5 text-primary animate-pulse" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                { label: "Add Workspace", sub: "Create a new workspace entry", icon: Plus, action: () => setCurrentView("workspaces"), color: "bg-slate-900", text: "text-white" },
                                                { label: "Add User", sub: "Register a new user account", icon: UserPlus, action: () => { setCurrentView("users"); setIsUserDialogOpen(true); }, color: "bg-primary/5 shadow-sm", text: "text-foreground" },
                                                { label: "Generate Invoices", sub: "Create monthly invoices for members", icon: FileText, action: handleGenerateInvoices, loading: isGeneratingInvoices, color: "bg-primary/5 shadow-sm", text: "text-foreground" }
                                            ].map((action, idx) => (
                                                <Button
                                                    key={idx}
                                                    variant="ghost"
                                                    className={`h-auto p-4 flex items-center gap-4 ${action.color} border border-transparent hover:border-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group/btn rounded-2xl relative overflow-hidden`}
                                                    onClick={action.action}
                                                    disabled={action.loading}
                                                >
                                                    <div className={`w-12 h-12 rounded-xl ${action.text === 'text-white' ? 'bg-white/10' : 'bg-primary/10'} flex items-center justify-center shrink-0 shadow-inner group-hover/btn:scale-110 transition-transform`}>
                                                        {action.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <action.icon className={`w-5 h-5 ${action.text === 'text-white' ? 'text-white' : 'text-primary'}`} />}
                                                    </div>
                                                    <div className="flex flex-col items-start overflow-hidden">
                                                        <span className={`text-sm font-black italic tracking-tight ${action.text}`}>{action.label}</span>
                                                        <span className={`text-[10px] font-medium opacity-60 truncate ${action.text}`}>{action.sub}</span>
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 ml-auto -rotate-90 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all ${action.text}`} />
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* System Health Card */}
                                    <div className="card-elevated p-6 glass border-emerald-500/10 bg-emerald-500/[0.02]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">System Status: 99.9%</span>
                                        </div>
                                        <div className="mt-4 h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[99.9%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentView === "invoices" && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
                                        <CreditCard className="w-8 h-8 text-primary" />
                                        Invoices
                                    </h2>
                                    <p className="text-muted-foreground font-medium text-sm mt-1">Audit and track ecosystem revenue streams.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={handleResetInvoices}
                                        disabled={isResettingInvoices}
                                        className="rounded-2xl gap-2 font-bold border-destructive/20 text-destructive hover:bg-destructive/10 h-12 px-6"
                                    >
                                        {isResettingInvoices ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Trash2 className="w-5 h-5" />
                                                Reset Current Month
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleGenerateInvoices}
                                        disabled={isGeneratingInvoices}
                                        className="rounded-2xl gap-2 font-black shadow-xl shadow-primary/20 h-12 px-6"
                                    >
                                        {isGeneratingInvoices ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <QrCode className="w-5 h-5" />
                                                Generate All
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 bg-muted/20 p-4 rounded-2xl border border-border/50">
                                <div className="relative flex-1 min-w-[300px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by invoice #, client or workspace..."
                                        className="h-12 pl-12 rounded-xl bg-background border-border/50 focus:border-primary/20 transition-all font-bold"
                                        value={searchTerm || ""}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                                    <SelectTrigger className="w-[160px] h-12 rounded-xl bg-background border-border/50 font-bold">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder="All Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="Paid">Paid</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Overdue">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <InvoicesTable
                                invoices={filteredInvoices}
                                currentPage={tablePages.invoices}
                                onPageChange={(page) => setTablePages({ ...tablePages, invoices: page })}
                                itemsPerPage={ITEMS_PER_PAGE}
                            />
                        </div>
                    )}
                    {currentView === "users" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                <div>                                     <h2 className="text-3xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 flex items-center gap-4">
                                         <UsersIcon className="w-8 h-8 text-primary" />
                                         Users
                                     </h2>
                                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mt-1">Member Directory</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                    <div className="relative flex-1 min-w-[280px]">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <Input
                                            placeholder="Search by name or email..."
                                            className="h-14 pl-12 pr-4 rounded-2xl bg-muted/20 border-primary/5 focus:border-primary/20 focus:bg-background transition-all font-bold placeholder:font-medium placeholder:text-muted-foreground/40 shadow-inner"
                                            value={searchTerm || ""}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                                        <SelectTrigger className="w-[160px] h-14 rounded-2xl bg-muted/20 border-primary/5 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-4 h-4 text-muted-foreground" />
                                                <SelectValue placeholder="All Status" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <div className="flex items-center gap-3">
                                        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="h-14 px-8 rounded-2xl gap-3 font-black bg-slate-900 text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group">
                                                    <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                    Add User
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-border/40 p-0 overflow-hidden glass shadow-2xl">
                                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-indigo-500 to-violet-600" />
                                                <form onSubmit={handleCreateUser} noValidate className="p-8 sm:p-10 space-y-8">
                                                    <DialogHeader>                                                         <DialogTitle className="text-3xl font-black italic tracking-tight">Add Member</DialogTitle>
                                                         <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                             Enter details to create a new account.
                                                         </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-6">
                                                        <div className="space-y-2 group">
                                                            <Label htmlFor="user-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">Full Name</Label>
                                                            <div className="relative">
                                                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    id="user-name"
                                                                    placeholder="Pranav Raj"
                                                                    className={`h-12 pl-11 rounded-xl bg-muted/50 border-primary/5 focus:border-primary/20 transition-all font-bold ${userErrors.name ? "border-destructive ring-destructive/20" : ""}`}
                                                                    value={newUserData.name || ""}
                                                                    onChange={(e) => {
                                                                        setNewUserData({ ...newUserData, name: e.target.value });
                                                                        if (userErrors.name) setUserErrors({ ...userErrors, name: "" });
                                                                    }}
                                                                />
                                                            </div>
                                                            {userErrors.name && (
                                                                <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                    <AlertCircle className="w-3 h-3" /> {userErrors.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2 group">
                                                            <Label htmlFor="user-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">Email Address</Label>
                                                            <div className="relative">
                                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    id="user-email"
                                                                    type="email"
                                                                    placeholder="pranav@example.com"
                                                                    className={`h-12 pl-11 rounded-xl bg-muted/50 border-primary/5 focus:border-primary/20 transition-all font-bold ${userErrors.email ? "border-destructive ring-destructive/20" : ""}`}
                                                                    value={newUserData.email || ""}
                                                                    onChange={(e) => {
                                                                        setNewUserData({ ...newUserData, email: e.target.value });
                                                                        if (userErrors.email) setUserErrors({ ...userErrors, email: "" });
                                                                    }}
                                                                />
                                                            </div>
                                                            {userErrors.email && (
                                                                <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                    <AlertCircle className="w-3 h-3" /> {userErrors.email}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2 group">
                                                                <Label htmlFor="user-password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">Password</Label>
                                                                <div className="relative">
                                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                    <Input
                                                                        id="user-password"
                                                                        type="password"
                                                                        placeholder="••••••••"
                                                                        className={`h-12 pl-11 rounded-xl bg-muted/50 border-primary/5 focus:border-primary/20 transition-all font-bold ${userErrors.password ? "border-destructive ring-destructive/20" : ""}`}
                                                                        value={newUserData.password || ""}
                                                                        onChange={(e) => {
                                                                            setNewUserData({ ...newUserData, password: e.target.value });
                                                                            if (userErrors.password) setUserErrors({ ...userErrors, password: "" });
                                                                        }}
                                                                    />
                                                                </div>
                                                                {userErrors.password && (
                                                                    <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                        <AlertCircle className="w-3 h-3" /> {userErrors.password}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2 group">
                                                            <Label htmlFor="user-mobile" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">Mobile Number</Label>
                                                            <div className="relative">
                                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    id="user-mobile"
                                                                    placeholder="+91 98765 43210"
                                                                    className="h-12 pl-11 rounded-xl bg-muted/50 border-primary/5 focus:border-primary/20 transition-all font-bold"
                                                                    value={newUserData.mobile || ""}
                                                                    onChange={(e) => setNewUserData({ ...newUserData, mobile: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                        <div className="space-y-2 group">
                                                            <Label htmlFor="user-org" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">Organization</Label>
                                                            <div className="relative">
                                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    id="user-org"
                                                                    placeholder="e.g. Cohort Creative"
                                                                    className="h-12 pl-11 rounded-xl bg-muted/50 border-primary/5 focus:border-primary/20 transition-all font-bold"
                                                                    value={newUserData.organization || ""}
                                                                    onChange={(e) => setNewUserData({ ...newUserData, organization: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between p-6 rounded-2xl bg-primary/5 border border-primary/10">
                                                            <div className="space-y-1">
                                                                 <Label className="text-xs font-black italic tracking-tight">Role</Label>
                                                                 <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">Select access level</p>
                                                            </div>
                                                            <Select
                                                                value={newUserData.role}
                                                                onValueChange={(val: any) => setNewUserData({ ...newUserData, role: val })}
                                                            >
                                                                <SelectTrigger className="w-[140px] h-10 rounded-xl bg-background shadow-sm border-primary/5">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl border-border/40">
                                                                    <SelectItem value="Member">Member</SelectItem>
                                                                    <SelectItem value="Admin">Admin</SelectItem>
                                                                    <SelectItem value="Authenticator">Authenticator</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <DialogFooter className="gap-3">
                                                        <Button type="button" variant="ghost" className="h-12 rounded-xl font-bold" onClick={() => setIsUserDialogOpen(false)} disabled={isLoadingUser}>Cancel</Button>
                                                        <Button type="submit" className="h-12 px-8 rounded-xl font-black bg-primary shadow-lg shadow-primary/20" disabled={isLoadingUser}>
                                                            {isLoadingUser ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Working...</> : "Add User"}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>

                            <UsersTable
                                users={filteredUsers}
                                onEdit={(user) => {
                                    setEditingUser(user);
                                    setIsEditUserDialogOpen(true);
                                }}
                                onDelete={handleDeleteUser}
                                currentPage={tablePages.users}
                                onPageChange={(page) => setTablePages({ ...tablePages, users: page })}
                                itemsPerPage={ITEMS_PER_PAGE}
                            />

                            {/* Edit User Profile Modal */}
                            <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
                                <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-border/40 p-0 overflow-hidden glass shadow-2xl">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-indigo-500 to-violet-600" />
                                    <div className="p-8 sm:p-10">
                                        <form onSubmit={handleUpdateUser} className="space-y-6" noValidate>
                                            <DialogHeader>
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                                    <UserIcon className="w-6 h-6 text-primary" />
                                                </div>
                                                 <DialogTitle className="text-3xl font-black italic tracking-tight">Update Member</DialogTitle>
                                                 <DialogDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Edit details for: <span className="text-primary font-black italic">{editingUser?.name}</span></DialogDescription>
                                            </DialogHeader>

                                            <div className="grid gap-5 py-2">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Full Name</Label>
                                                    <Input
                                                        className={`rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold ${editUserErrors.name ? "border-destructive ring-destructive/20" : ""}`}
                                                        value={editingUser?.name || ""}
                                                        onChange={(e) => {
                                                            editingUser && setEditingUser({ ...editingUser, name: e.target.value });
                                                            if (editUserErrors.name) setEditUserErrors({ ...editUserErrors, name: "" });
                                                        }}
                                                    />
                                                    {editUserErrors.name && (
                                                        <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            <AlertCircle className="w-3 h-3" /> {editUserErrors.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Email Address</Label>
                                                    <Input
                                                        type="email"
                                                        className={`rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold ${editUserErrors.email ? "border-destructive ring-destructive/20" : ""}`}
                                                        value={editingUser?.email || ""}
                                                        onChange={(e) => {
                                                            editingUser && setEditingUser({ ...editingUser, email: e.target.value });
                                                            if (editUserErrors.email) setEditUserErrors({ ...editUserErrors, email: "" });
                                                        }}
                                                    />
                                                    {editUserErrors.email && (
                                                        <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            <AlertCircle className="w-3 h-3" /> {editUserErrors.email}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Mobile Number</Label>
                                                    <Input
                                                        placeholder="+91 98765 43210"
                                                        className="rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold"
                                                        value={editingUser?.mobile || ""}
                                                        onChange={(e) => editingUser && setEditingUser({ ...editingUser, mobile: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                     <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Organization</Label>
                                                    <Input
                                                        className="rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold"
                                                        value={editingUser?.organization || ""}
                                                        onChange={(e) => editingUser && setEditingUser({ ...editingUser, organization: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">User Role</Label>
                                                        <div className="mt-1.5">
                                                            <Select
                                                                value={editingUser?.role || "Member"}
                                                                onValueChange={(val: any) => editingUser && setEditingUser({ ...editingUser, role: val })}
                                                            >
                                                                <SelectTrigger className="rounded-2xl h-12 bg-background/50 border-border/50 font-bold"><SelectValue /></SelectTrigger>
                                                                <SelectContent className="rounded-2xl border-border/50 shadow-xl">
                                                                    <SelectItem value="Member" className="rounded-xl my-1">Member</SelectItem>
                                                                    <SelectItem value="Admin" className="rounded-xl my-1">Admin</SelectItem>
                                                                    <SelectItem value="Manager" className="rounded-xl my-1">Manager</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                         <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Status</Label>
                                                        <div className="mt-1.5">
                                                            <Select
                                                                value={editingUser?.status || "Active"}
                                                                onValueChange={(val: any) => editingUser && setEditingUser({ ...editingUser, status: val })}
                                                            >
                                                                <SelectTrigger className="rounded-2xl h-12 bg-background/50 border-border/50 font-bold"><SelectValue /></SelectTrigger>
                                                                <SelectContent className="rounded-2xl border-border/50 shadow-xl">
                                                                    <SelectItem value="Active" className="rounded-xl my-1">Active</SelectItem>
                                                                    <SelectItem value="Inactive" className="rounded-xl my-1">Inactive</SelectItem>
                                                                    <SelectItem value="Pending" className="rounded-xl my-1">Pending</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <DialogFooter className="pt-4 gap-3">
                                                <Button type="button" variant="ghost" onClick={() => setIsEditUserDialogOpen(false)} className="rounded-2xl h-12 font-bold px-6" disabled={isLoadingUser}>Discard</Button>
                                                <Button type="submit" className="rounded-2xl h-12 px-10 font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={isLoadingUser}>
                                                    {isLoadingUser ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Delete User Confirmation Modal */}
                            <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
                                <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                                    <div className="p-8 text-center space-y-6 bg-gradient-to-b from-destructive/5 to-background">
                                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto ring-8 ring-destructive/5">
                                            <CircleX className="w-10 h-10 text-destructive" />
                                        </div>
                                        <DialogHeader className="space-y-2">
                                             <DialogTitle className="text-2xl font-black tracking-tight text-center">Delete Member?</DialogTitle>
                                             <DialogDescription className="text-muted-foreground font-medium text-center">
                                                 This action will permanently remove this user from the system.
                                             </DialogDescription>
                                         </DialogHeader>
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                variant="destructive"
                                                onClick={confirmDeleteUser}
                                                className="w-full h-14 rounded-2xl font-black shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                disabled={isLoadingDelete}
                                            >
                                                {isLoadingDelete ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete Account"}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setIsDeleteUserDialogOpen(false)}
                                                className="w-full h-14 rounded-2xl font-bold"
                                                disabled={isLoadingDelete}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                        </div>
                    )}

                    {currentView === "workspaces" && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <h2 className="text-2xl font-bold">Workspace Portfolio</h2>
                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                                    <div className="relative flex-1 sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search workspaces..."
                                            className="pl-9 h-10 rounded-xl"
                                            value={searchTerm || ""}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Select value={workspaceLocationFilter} onValueChange={setWorkspaceLocationFilter}>
                                            <SelectTrigger className="w-[140px] h-10 rounded-xl">
                                                <SelectValue placeholder="Location" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Locations</SelectItem>
                                                {Array.from(new Set(workspaces.map(ws => ws.location))).filter(Boolean).map(loc => (
                                                    <SelectItem key={loc} value={loc || ""}>{loc}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select value={workspaceTypeFilter} onValueChange={setWorkspaceTypeFilter}>
                                            <SelectTrigger className="w-[140px] h-10 rounded-xl">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                {Array.from(new Set(workspaces.map(ws => ws.type))).filter(Boolean).map(type => (
                                                    <SelectItem key={type} value={type || ""}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select value={workspaceStatusFilter} onValueChange={setWorkspaceStatusFilter}>
                                            <SelectTrigger className="w-[140px] h-10 rounded-xl">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="unavailable">Unavailable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20">
                                                <Plus className="w-4 h-4" />
                                                Add Workspace
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[550px] rounded-2xl max-h-[90vh] overflow-y-auto">
                                            <form onSubmit={handleCreateWorkspace} noValidate>
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl">Create New Workspace</DialogTitle>
                                                    <DialogDescription>
                                                        Add a new space to your portfolio. Fill in the details below.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-6 py-6">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="name">Workspace Name</Label>
                                                            <div className="relative">
                                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    id="name"
                                                                    placeholder="e.g. Neon Suite"
                                                                    className={`pl-9 ${workspaceErrors.name ? "border-destructive ring-destructive/20" : ""}`}
                                                                    value={newWorkspace.name || ""}
                                                                    onChange={(e) => {
                                                                        setNewWorkspace({ ...newWorkspace, name: e.target.value });
                                                                        if (workspaceErrors.name) setWorkspaceErrors({ ...workspaceErrors, name: "" });
                                                                    }}
                                                                />
                                                            </div>
                                                            {workspaceErrors.name && (
                                                                <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                    <AlertCircle className="w-3 h-3" /> {workspaceErrors.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="location">Location / Area</Label>
                                                            <div className="relative">
                                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    id="location"
                                                                    list="existing-locations"
                                                                    placeholder="e.g. Gachibowli"
                                                                    className={`pl-9 ${workspaceErrors.location ? "border-destructive ring-destructive/20" : ""}`}
                                                                    value={newWorkspace.location || ""}
                                                                    onChange={(e) => {
                                                                        setNewWorkspace({ ...newWorkspace, location: e.target.value });
                                                                        if (workspaceErrors.location) setWorkspaceErrors({ ...workspaceErrors, location: "" });
                                                                    }}
                                                                />
                                                            </div>
                                                            {workspaceErrors.location && (
                                                                <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                    <AlertCircle className="w-3 h-3" /> {workspaceErrors.location}
                                                                </p>
                                                            )}
                                                            <datalist id="existing-locations">
                                                                {Array.from(new Set(workspaces.map(ws => ws.location))).map(loc => (
                                                                    <option key={loc} value={loc} />
                                                                ))}
                                                            </datalist>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="floor">Floor Level</Label>
                                                            <div className="relative">
                                                                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    id="floor"
                                                                    placeholder="e.g. 5th Floor"
                                                                    className={`pl-9 ${workspaceErrors.floor ? "border-destructive ring-destructive/20" : ""}`}
                                                                    value={newWorkspace.floor || ""}
                                                                    onChange={(e) => {
                                                                        setNewWorkspace({ ...newWorkspace, floor: e.target.value });
                                                                        if (workspaceErrors.floor) setWorkspaceErrors({ ...workspaceErrors, floor: "" });
                                                                    }}
                                                                />
                                                            </div>
                                                            {workspaceErrors.floor && (
                                                                <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                    <AlertCircle className="w-3 h-3" /> {workspaceErrors.floor}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="capacity">Seating Capacity</Label>
                                                            <div className="relative">
                                                                <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    id="capacity"
                                                                    placeholder="e.g. 10 people"
                                                                    className={`pl-9 ${workspaceErrors.capacity ? "border-destructive ring-destructive/20" : ""}`}
                                                                    value={newWorkspace.capacity || ""}
                                                                    onChange={(e) => {
                                                                        setNewWorkspace({ ...newWorkspace, capacity: e.target.value });
                                                                        if (workspaceErrors.capacity) setWorkspaceErrors({ ...workspaceErrors, capacity: "" });
                                                                    }}
                                                                />
                                                            </div>
                                                            {workspaceErrors.capacity && (
                                                                <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                    <AlertCircle className="w-3 h-3" /> {workspaceErrors.capacity}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="type">Workspace Type</Label>
                                                        <Input
                                                            id="type"
                                                            list="existing-types"
                                                            placeholder="e.g. Private Suite"
                                                            className={workspaceErrors.type ? "border-destructive ring-destructive/20" : ""}
                                                            value={newWorkspace.type || ""}
                                                            onChange={(e) => {
                                                                setNewWorkspace({ ...newWorkspace, type: e.target.value });
                                                                if (workspaceErrors.type) setWorkspaceErrors({ ...workspaceErrors, type: "" });
                                                            }}
                                                        />
                                                        {workspaceErrors.type && (
                                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                <AlertCircle className="w-3 h-3" /> {workspaceErrors.type}
                                                            </p>
                                                        )}
                                                        <datalist id="existing-types">
                                                            {Array.from(new Set(workspaces.map(ws => ws.type))).map(type => (
                                                                <option key={type} value={type} />
                                                            ))}
                                                        </datalist>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="price">Monthly Price (₹)</Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                                                            <Input
                                                                id="price"
                                                                type="number"
                                                                placeholder="0"
                                                                className={`pl-8 ${workspaceErrors.price ? "border-destructive ring-destructive/20" : ""}`}
                                                                value={newWorkspace.price || ""}
                                                                onChange={(e) => {
                                                                    setNewWorkspace({ ...newWorkspace, price: e.target.value });
                                                                    if (workspaceErrors.price) setWorkspaceErrors({ ...workspaceErrors, price: "" });
                                                                }}
                                                            />
                                                        </div>
                                                        {workspaceErrors.price && (
                                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                <AlertCircle className="w-3 h-3" /> {workspaceErrors.price}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label>Workspace Gallery (Max 3 Images)</Label>
                                                        <div
                                                            className="border-2 border-dashed border-border/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer group"
                                                            onClick={() => document.getElementById('create-images-input')?.click()}
                                                        >
                                                            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                                <Upload className="w-6 h-6 text-primary" />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-sm font-bold">Click to upload images</p>
                                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">PNG, JPG up to 5MB each</p>
                                                            </div>
                                                            <input
                                                                id="create-images-input"
                                                                type="file"
                                                                multiple
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const files = Array.from(e.target.files || []);
                                                                    if (workspaceImages.length + files.length > 3) {
                                                                        toast.error("Maximum 3 images allowed per workspace");
                                                                        return;
                                                                    }
                                                                    setWorkspaceImages([...workspaceImages, ...files]);
                                                                }}
                                                            />
                                                        </div>

                                                        {workspaceImages.length > 0 && (
                                                            <div className="grid grid-cols-3 gap-3">
                                                                {workspaceImages.map((file, index) => (
                                                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-border/50">
                                                                        <img
                                                                            src={URL.createObjectURL(file)}
                                                                            alt="preview"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const newImages = [...workspaceImages];
                                                                                newImages.splice(index, 1);
                                                                                setWorkspaceImages(newImages);
                                                                            }}
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label>Manage Amenities</Label>
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    placeholder="Add an amenity"
                                                                    className="pl-9"
                                                                    value={amenityInput}
                                                                    onChange={(e) => setAmenityInput(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            addAmenity(false);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                onClick={() => addAmenity(false)}
                                                            >
                                                                Add
                                                            </Button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-xl bg-muted/30 border border-border/50">
                                                            {newWorkspace.amenities?.length === 0 && (
                                                                <span className="text-xs text-muted-foreground">No amenities added yet.</span>
                                                            )}
                                                            {newWorkspace.amenities?.map((amenity, index) => (
                                                                <div key={index} className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border/50 text-xs font-black text-foreground shadow-sm transition-all hover:border-primary/30">
                                                                    {amenity}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeAmenity(index, false)}
                                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {(newWorkspace.type === "Dedicated Workspace" || newWorkspace.type === "Open WorkStation") && (
                                                        <div className="space-y-6 p-5 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
                                                            <div className="flex items-center justify-between">
                                                                <Label className="text-primary font-black uppercase tracking-widest text-[10px]">{newWorkspace.type === "Open WorkStation" ? "Capacity Configuration" : "Workspace Architecture"}</Label>
                                                                <Badge variant="outline" className="bg-background text-primary border-primary/20 text-[10px] uppercase font-black">
                                                                    {newWorkspace.type === "Open WorkStation" ? `Total Seats: ${newWorkspace.features?.workstationSeats || 0}` : `Capacity: ${newWorkspace.capacity}`}
                                                                </Badge>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-[11px] font-bold text-muted-foreground ml-1">Workstation Seats</Label>
                                                                    <Input
                                                                        type="number"
                                                                        className="rounded-xl h-10"
                                                                        placeholder="e.g. 20"
                                                                        value={newWorkspace.features?.workstationSeats || 0}
                                                                        onChange={(e) => setNewWorkspace({
                                                                            ...newWorkspace,
                                                                            features: { ...newWorkspace.features!, workstationSeats: parseInt(e.target.value) || 0 }
                                                                        })}
                                                                    />
                                                                </div>

                                                                {newWorkspace.type !== "Open WorkStation" && (
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-3 p-3 rounded-xl bg-background border border-border/50">
                                                                            <div className="flex items-center space-x-2">
                                                                                <Checkbox
                                                                                    id="conference"
                                                                                    checked={newWorkspace.features?.hasConferenceHall}
                                                                                    onCheckedChange={(checked) =>
                                                                                        setNewWorkspace({
                                                                                            ...newWorkspace,
                                                                                            features: {
                                                                                                ...newWorkspace.features!,
                                                                                                hasConferenceHall: !!checked,
                                                                                                conferenceHallSeats: checked ? (newWorkspace.features?.conferenceHallSeats || 0) : 0
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                />
                                                                                <Label htmlFor="conference" className="text-sm font-bold cursor-pointer">Conf. Hall</Label>
                                                                            </div>
                                                                            {newWorkspace.features?.hasConferenceHall && (
                                                                                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                                    <Label className="text-[9px] font-black uppercase text-muted-foreground/60">Seats</Label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        className="h-8 text-xs rounded-lg"
                                                                                        value={newWorkspace.features?.conferenceHallSeats || 0}
                                                                                        onChange={(e) => setNewWorkspace({
                                                                                            ...newWorkspace,
                                                                                            features: { ...newWorkspace.features!, conferenceHallSeats: parseInt(e.target.value) || 0 }
                                                                                        })}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div className="space-y-3 p-3 rounded-xl bg-background border border-border/50">
                                                                            <div className="flex items-center space-x-2">
                                                                                <Checkbox
                                                                                    id="cabin"
                                                                                    checked={newWorkspace.features?.hasCabin}
                                                                                    onCheckedChange={(checked) =>
                                                                                        setNewWorkspace({
                                                                                            ...newWorkspace,
                                                                                            features: {
                                                                                                ...newWorkspace.features!,
                                                                                                hasCabin: !!checked,
                                                                                                cabinSeats: checked ? (newWorkspace.features?.cabinSeats || 0) : 0
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                />
                                                                                <Label htmlFor="cabin" className="text-sm font-bold cursor-pointer">Private Cabin</Label>
                                                                            </div>
                                                                            {newWorkspace.features?.hasCabin && (
                                                                                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                                    <Label className="text-[9px] font-black uppercase text-muted-foreground/60">Seats</Label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        className="h-8 text-xs rounded-lg"
                                                                                        value={newWorkspace.features?.cabinSeats || 0}
                                                                                        onChange={(e) => setNewWorkspace({
                                                                                            ...newWorkspace,
                                                                                            features: { ...newWorkspace.features!, cabinSeats: parseInt(e.target.value) || 0 }
                                                                                        })}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl" disabled={isLoadingWorkspace}>Cancel</Button>
                                                    <Button type="submit" className="rounded-xl px-8 font-bold" disabled={isLoadingWorkspace}>
                                                        {isLoadingWorkspace ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Space"}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                            <WorkspacesTable
                                workspaces={filteredWorkspaces}
                                users={users}
                                bookings={bookings}
                                onAllot={(wsId, userId) => {
                                    setSelectedWorkspace(wsId);
                                    const ws = workspaces.find(w => w._id === wsId || (w.id && w.id.toString() === wsId));
                                    setSelectedUserForAllotment(userId || "none");
                                    setAllottedSeats(1);
                                    if (ws?.unavailableUntil) {
                                        const date = new Date(ws.unavailableUntil);
                                        const formatted = date.toISOString().slice(0, 16);
                                        setUnavailableUntilDate(formatted);
                                    } else {
                                        setUnavailableUntilDate("");
                                    }
                                    if (ws?.allotmentStart) {
                                        const date = new Date(ws.allotmentStart);
                                        const formatted = date.toISOString().slice(0, 16);
                                        setAllotmentStartDate(formatted);
                                    } else {
                                        setAllotmentStartDate("");
                                    }
                                    setIsAllotDialogOpen(true);
                                }}
                                onEdit={(ws) => {
                                    setEditingWorkspace(ws);
                                    setIsEditWorkspaceDialogOpen(true);
                                }}
                                onDelete={handleDeleteWorkspace}
                                onUnallotBooking={(booking) => {
                                    setBookingToUnallot(booking);
                                    setIsUnallotConfirmDialogOpen(true);
                                }}
                                updatingRequestId={updatingRequestId}
                                currentPage={tablePages.workspaces}
                                onPageChange={(page) => setTablePages({ ...tablePages, workspaces: page })}
                                itemsPerPage={ITEMS_PER_PAGE}
                            />

                            <Dialog open={isAllotDialogOpen} onOpenChange={setIsAllotDialogOpen}>
                                <DialogContent className="sm:max-w-[400px] rounded-2xl max-h-[90vh] overflow-y-auto">
                                    <form onSubmit={handleAllotWorkspace} noValidate>
                                        <DialogHeader>
                                            <DialogTitle>Allot Workspace</DialogTitle>
                                            <DialogDescription>
                                                Select a user to allot this workspace to, or clear to unallot.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-6 space-y-4">
                                            <div className="space-y-2">
                                                <Label>Select User</Label>
                                                <Select
                                                    value={selectedUserForAllotment}
                                                    onValueChange={setSelectedUserForAllotment}
                                                >
                                                    <SelectTrigger className="rounded-xl h-11">
                                                        <SelectValue placeholder="Unallotted" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-[300px] overflow-y-auto">
                                                        <SelectItem value="none">No User (Clear Allotment)</SelectItem>
                                                        {users.map((u) => (
                                                            <SelectItem key={u._id} value={u._id!}>
                                                                {u.name} ({u.email})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {selectedUserForAllotment !== "none" && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    {workspaces.find(w => w._id === selectedWorkspace || (w.id && w.id.toString() === selectedWorkspace))?.type === "Open WorkStation" && (
                                                        <div className="space-y-2">
                                                            <Label className="text-primary font-bold flex items-center gap-2">
                                                                <UsersIcon className="w-4 h-4" />
                                                                Number of Seats
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={workspaces.find(w => w._id === selectedWorkspace || (w.id && w.id.toString() === selectedWorkspace))?.availableSeats || 25}
                                                                value={allottedSeats}
                                                                onChange={(e) => setAllottedSeats(Number(e.target.value))}
                                                                className="border-primary/20 focus:ring-primary/10 rounded-xl"
                                                            />
                                                            <p className="text-[10px] text-muted-foreground italic">
                                                                Available: {workspaces.find(w => w._id === selectedWorkspace || (w.id && w.id.toString() === selectedWorkspace))?.availableSeats || 0} seats
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="space-y-2">
                                                        <Label className="text-primary font-bold flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            Start Date
                                                        </Label>
                                                        <DateTimePicker
                                                            date={allotmentStartDate ? new Date(allotmentStartDate) : undefined}
                                                            setDate={(date) => {
                                                                if (date) {
                                                                    const y = date.getFullYear();
                                                                    const mo = String(date.getMonth() + 1).padStart(2, '0');
                                                                    const d = String(date.getDate()).padStart(2, '0');
                                                                    const h = String(date.getHours()).padStart(2, '0');
                                                                    const mi = String(date.getMinutes()).padStart(2, '0');
                                                                    setAllotmentStartDate(`${y}-${mo}-${d}T${h}:${mi}`);
                                                                } else {
                                                                    setAllotmentStartDate("");
                                                                }
                                                            }}
                                                            showTime={true}
                                                            className="border-primary/20 focus:ring-primary/10"
                                                        />
                                                        <p className="text-[10px] text-muted-foreground italic">
                                                            Mention when this booking starts.
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-destructive font-bold flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            End Date
                                                        </Label>
                                                        <DateTimePicker
                                                            date={unavailableUntilDate ? new Date(unavailableUntilDate) : undefined}
                                                            setDate={(date) => {
                                                                if (date) {
                                                                    const y = date.getFullYear();
                                                                    const mo = String(date.getMonth() + 1).padStart(2, '0');
                                                                    const d = String(date.getDate()).padStart(2, '0');
                                                                    const h = String(date.getHours()).padStart(2, '0');
                                                                    const mi = String(date.getMinutes()).padStart(2, '0');
                                                                    setUnavailableUntilDate(`${y}-${mo}-${d}T${h}:${mi}`);
                                                                } else {
                                                                    setUnavailableUntilDate("");
                                                                }
                                                            }}
                                                            showTime={true}
                                                            className="border-destructive/20 focus:ring-destructive/10"
                                                            placeholder="Indefinite / Further Notice"
                                                        />
                                                        <p className="text-[10px] text-muted-foreground italic">
                                                            Mention when this booking ends. Leave empty for "Further Notice".
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsAllotDialogOpen(false)} disabled={isLoadingAllotment}>Cancel</Button>
                                            <Button type="submit" disabled={isLoadingAllotment}>
                                                {isLoadingAllotment ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Allotment"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>

                            {/* Edit Workspace Modal */}
                            <Dialog open={isEditWorkspaceDialogOpen} onOpenChange={setIsEditWorkspaceDialogOpen}>
                                <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                                    <div className="bg-gradient-to-br from-primary/10 via-background to-background p-8">
                                        <form onSubmit={handleUpdateWorkspace} className="space-y-6" noValidate>
                                            <DialogHeader>
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                                    <Building2 className="w-6 h-6 text-primary" />
                                                </div>
                                                <DialogTitle className="text-3xl font-black tracking-tight">Edit Space</DialogTitle>
                                                <DialogDescription className="text-base font-medium text-muted-foreground/80">
                                                    Update physical configuration for <span className="text-foreground font-bold">{editingWorkspace?.name}</span>
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="grid gap-5 py-2">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Workspace Name</Label>
                                                    <Input
                                                        className={`rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold ${editWorkspaceErrors.name ? "border-destructive ring-destructive/20" : ""}`}
                                                        value={editingWorkspace?.name || ""}
                                                        onChange={(e) => {
                                                            editingWorkspace && setEditingWorkspace({ ...editingWorkspace, name: e.target.value });
                                                            if (editWorkspaceErrors.name) setEditWorkspaceErrors({ ...editWorkspaceErrors, name: "" });
                                                        }}
                                                    />
                                                    {editWorkspaceErrors.name && (
                                                        <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            <AlertCircle className="w-3 h-3" /> {editWorkspaceErrors.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Location</Label>
                                                        <Input
                                                            className={`rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold pl-3 ${editWorkspaceErrors.location ? "border-destructive ring-destructive/20" : ""}`}
                                                            list="edit-existing-locations"
                                                            value={editingWorkspace?.location || ""}
                                                            onChange={(e) => {
                                                                editingWorkspace && setEditingWorkspace({ ...editingWorkspace, location: e.target.value });
                                                                if (editWorkspaceErrors.location) setEditWorkspaceErrors({ ...editWorkspaceErrors, location: "" });
                                                            }}
                                                        />
                                                        {editWorkspaceErrors.location && (
                                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                <AlertCircle className="w-3 h-3" /> {editWorkspaceErrors.location}
                                                            </p>
                                                        )}
                                                        <datalist id="edit-existing-locations">
                                                            {Array.from(new Set(workspaces.map(ws => ws.location))).map(loc => (
                                                                <option key={loc} value={loc} />
                                                            ))}
                                                        </datalist>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Floor Level</Label>
                                                        <Input
                                                            className="rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold"
                                                            value={editingWorkspace?.floor || ""}
                                                            onChange={(e) => editingWorkspace && setEditingWorkspace({ ...editingWorkspace, floor: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Workspace Type</Label>
                                                        <Input
                                                            className={`rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold pl-3 mt-1.5 ${editWorkspaceErrors.type ? "border-destructive ring-destructive/20" : ""}`}
                                                            list="edit-existing-types"
                                                            value={editingWorkspace?.type || ""}
                                                            onChange={(e) => {
                                                                editingWorkspace && setEditingWorkspace({ ...editingWorkspace, type: e.target.value });
                                                                if (editWorkspaceErrors.type) setEditWorkspaceErrors({ ...editWorkspaceErrors, type: "" });
                                                            }}
                                                        />
                                                        {editWorkspaceErrors.type && (
                                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                <AlertCircle className="w-3 h-3" /> {editWorkspaceErrors.type}
                                                            </p>
                                                        )}
                                                        <datalist id="edit-existing-types">
                                                            {Array.from(new Set(workspaces.map(ws => ws.type))).map(type => (
                                                                <option key={type} value={type} />
                                                            ))}
                                                        </datalist>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Monthly Price (₹)</Label>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                                                            <Input
                                                                type="number"
                                                                className={`rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold pl-10 ${editWorkspaceErrors.price ? "border-destructive ring-destructive/20" : ""}`}
                                                                value={editingWorkspace?.price || ""}
                                                                onChange={(e) => {
                                                                    editingWorkspace && setEditingWorkspace({ ...editingWorkspace, price: e.target.value });
                                                                    if (editWorkspaceErrors.price) setEditWorkspaceErrors({ ...editWorkspaceErrors, price: "" });
                                                                }}
                                                            />
                                                        </div>
                                                        {editWorkspaceErrors.price && (
                                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                <AlertCircle className="w-3 h-3" /> {editWorkspaceErrors.price}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Seating Capacity</Label>
                                                        <Input
                                                            className="rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold"
                                                            value={editingWorkspace?.capacity || ""}
                                                            onChange={(e) => editingWorkspace && setEditingWorkspace({ ...editingWorkspace, capacity: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Workspace Gallery (Max 3 Images)</Label>

                                                {/* Preview existing images */}
                                                {editingWorkspace?.images && editingWorkspace.images.length > 0 && (
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {editingWorkspace.images.map((url, index) => (
                                                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-border/50">
                                                                <img
                                                                    src={url}
                                                                    alt={`Workspace ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onClick={() => {
                                                                        if (!editingWorkspace) return;
                                                                        const newImages = [...(editingWorkspace.images || [])];
                                                                        newImages.splice(index, 1);
                                                                        setEditingWorkspace({ ...editingWorkspace, images: newImages });
                                                                    }}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div
                                                    className="border-2 border-dashed border-border/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer group"
                                                    onClick={() => document.getElementById('edit-images-input')?.click()}
                                                >
                                                    <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                        <Upload className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs font-bold">Add more images</p>
                                                    </div>
                                                    <input
                                                        id="edit-images-input"
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files || []);
                                                            const currentCount = (editingWorkspace?.images?.length || 0) + editingWorkspaceImages.length;
                                                            if (currentCount + files.length > 3) {
                                                                toast.error("Maximum 3 images allowed per workspace");
                                                                return;
                                                            }
                                                            setEditingWorkspaceImages([...editingWorkspaceImages, ...files]);
                                                        }}
                                                    />
                                                </div>

                                                {/* Preview newly selected images */}
                                                {editingWorkspaceImages.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">New Images to Upload:</p>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {editingWorkspaceImages.map((file, index) => (
                                                                <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden group border border-primary/20 bg-primary/5">
                                                                    <img
                                                                        src={URL.createObjectURL(file)}
                                                                        alt="preview"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => {
                                                                            const newImages = [...editingWorkspaceImages];
                                                                            newImages.splice(index, 1);
                                                                            setEditingWorkspaceImages(newImages);
                                                                        }}
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Amenities</Label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Define a new amenity..."
                                                            className="rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold pl-9"
                                                            value={editAmenityInput}
                                                            onChange={(e) => setEditAmenityInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    addAmenity(true);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        className="rounded-2xl h-12 px-6 font-bold"
                                                        variant="secondary"
                                                        onClick={() => addAmenity(true)}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-muted/20 border border-border/30 min-h-[60px]">
                                                    {(!editingWorkspace?.amenities || editingWorkspace.amenities.length === 0) && (
                                                        <span className="text-sm text-muted-foreground/60 italic m-auto">No amenities defined for this space yet.</span>
                                                    )}
                                                    {editingWorkspace?.amenities?.map((amenity, index) => (
                                                        <div key={index} className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border/50 text-xs font-black text-foreground shadow-sm transition-all hover:border-primary/30">
                                                            {amenity}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAmenity(index, true)}
                                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {(editingWorkspace?.type === "Dedicated Workspace" || editingWorkspace?.type === "Open WorkStation") && (
                                                <div className="space-y-6 p-5 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-primary font-black uppercase tracking-widest text-[10px]">{editingWorkspace?.type === "Open WorkStation" ? "Capacity Configuration" : "Workspace Architecture"}</Label>
                                                        <Badge variant="outline" className="bg-background text-primary border-primary/20 text-[10px] uppercase font-black">
                                                            {editingWorkspace?.type === "Open WorkStation" ? `Total Seats: ${editingWorkspace?.features?.workstationSeats || 0}` : `Capacity: ${editingWorkspace?.capacity}`}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[11px] font-bold text-muted-foreground ml-1">Workstation Seats</Label>
                                                            <Input
                                                                type="number"
                                                                className="rounded-xl h-10 bg-background/50"
                                                                placeholder="e.g. 20"
                                                                value={editingWorkspace?.features?.workstationSeats || 0}
                                                                onChange={(e) => editingWorkspace && setEditingWorkspace({
                                                                    ...editingWorkspace,
                                                                    features: { ...editingWorkspace.features!, workstationSeats: parseInt(e.target.value) || 0 }
                                                                })}
                                                            />
                                                        </div>

                                                        {editingWorkspace?.type !== "Open WorkStation" && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-3 p-3 rounded-xl bg-background/50 border border-border/50">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id="edit-conference"
                                                                            checked={editingWorkspace?.features?.hasConferenceHall}
                                                                            onCheckedChange={(checked) =>
                                                                                editingWorkspace && setEditingWorkspace({
                                                                                    ...editingWorkspace,
                                                                                    features: {
                                                                                        ...editingWorkspace.features!,
                                                                                        hasConferenceHall: !!checked,
                                                                                        conferenceHallSeats: checked ? (editingWorkspace.features?.conferenceHallSeats || 0) : 0
                                                                                    }
                                                                                })
                                                                            }
                                                                        />
                                                                        <Label htmlFor="edit-conference" className="text-sm font-bold cursor-pointer">Conf. Hall</Label>
                                                                    </div>
                                                                    {editingWorkspace?.features?.hasConferenceHall && (
                                                                        <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                            <Label className="text-[9px] font-black uppercase text-muted-foreground/60">Seats</Label>
                                                                            <Input
                                                                                type="number"
                                                                                className="h-8 text-xs rounded-lg"
                                                                                value={editingWorkspace?.features?.conferenceHallSeats || 0}
                                                                                onChange={(e) => editingWorkspace && setEditingWorkspace({
                                                                                    ...editingWorkspace,
                                                                                    features: { ...editingWorkspace.features!, conferenceHallSeats: parseInt(e.target.value) || 0 }
                                                                                })}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-3 p-3 rounded-xl bg-background/50 border border-border/50">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id="edit-cabin"
                                                                            checked={editingWorkspace?.features?.hasCabin}
                                                                            onCheckedChange={(checked) =>
                                                                                editingWorkspace && setEditingWorkspace({
                                                                                    ...editingWorkspace,
                                                                                    features: {
                                                                                        ...editingWorkspace.features!,
                                                                                        hasCabin: !!checked,
                                                                                        cabinSeats: checked ? (editingWorkspace.features?.cabinSeats || 0) : 0
                                                                                    }
                                                                                })
                                                                            }
                                                                        />
                                                                        <Label htmlFor="edit-cabin" className="text-sm font-bold cursor-pointer">Private Cabin</Label>
                                                                    </div>
                                                                    {editingWorkspace?.features?.hasCabin && (
                                                                        <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                            <Label className="text-[9px] font-black uppercase text-muted-foreground/60">Seats</Label>
                                                                            <Input
                                                                                type="number"
                                                                                className="h-8 text-xs rounded-lg"
                                                                                value={editingWorkspace?.features?.cabinSeats || 0}
                                                                                onChange={(e) => editingWorkspace && setEditingWorkspace({
                                                                                    ...editingWorkspace,
                                                                                    features: { ...editingWorkspace.features!, cabinSeats: parseInt(e.target.value) || 0 }
                                                                                })}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <DialogFooter className="pt-4 gap-3">
                                                <Button type="button" variant="ghost" onClick={() => setIsEditWorkspaceDialogOpen(false)} className="rounded-2xl h-12 font-bold px-6" disabled={isLoadingWorkspace}>Discard</Button>
                                                <Button type="submit" className="rounded-2xl h-12 px-10 font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={isLoadingWorkspace}>
                                                    {isLoadingWorkspace ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Space"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Delete Workspace Confirmation Modal */}

                            <Dialog open={isDeleteWorkspaceDialogOpen} onOpenChange={setIsDeleteWorkspaceDialogOpen}>
                                <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                                    <div className="p-8 text-center space-y-6 bg-gradient-to-b from-destructive/5 to-background">
                                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto ring-8 ring-destructive/5">
                                            <Building2 className="w-10 h-10 text-destructive" />
                                        </div>
                                        <div className="space-y-2">
                                            <DialogTitle className="text-2xl font-black tracking-tight">Remove Space?</DialogTitle>
                                            <DialogDescription className="text-muted-foreground font-medium">You are about to delete this workspace from your portfolio. All current allotments will be lost.</DialogDescription>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                variant="destructive"
                                                onClick={confirmDeleteWorkspace}
                                                className="w-full h-14 rounded-2xl font-black shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                disabled={isLoadingDelete}
                                            >
                                                {isLoadingDelete ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Permanently Delete"}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setIsDeleteWorkspaceDialogOpen(false)}
                                                className="w-full h-14 rounded-2xl font-bold"
                                                disabled={isLoadingDelete}
                                            >
                                                Keep Space
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}

                    {currentView === "requests" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
                                <div className="flex items-center p-1 bg-muted/50 rounded-2xl border border-border/50">
                                    <Button
                                        variant={requestSubView === "quotes" ? "default" : "ghost"}
                                        onClick={() => setRequestSubView("quotes")}
                                        className={`rounded-xl px-6 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${requestSubView === "quotes" ? "shadow-lg shadow-primary/20" : "hover:bg-primary/10 hover:text-primary"}`}
                                    >
                                        Quote Requests
                                        {dashboardStats.newQuoteRequests > 0 && (
                                            <Badge className="ml-2 bg-primary-foreground text-primary hover:bg-primary-foreground">
                                                {dashboardStats.newQuoteRequests}
                                            </Badge>
                                        )}
                                    </Button>
                                    <Button
                                        variant={requestSubView === "bookings" ? "default" : "ghost"}
                                        onClick={() => setRequestSubView("bookings")}
                                        className={`rounded-xl px-6 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${requestSubView === "bookings" ? "shadow-lg shadow-primary/20" : "hover:bg-primary/10 hover:text-primary"}`}
                                    >
                                        Booking Requests
                                        {dashboardStats.newBookingRequests > 0 && (
                                            <Badge className="ml-2 bg-primary-foreground text-primary hover:bg-primary-foreground">
                                                {dashboardStats.newBookingRequests}
                                            </Badge>
                                        )}
                                    </Button>
                                    <Button
                                        variant={requestSubView === "visits" ? "default" : "ghost"}
                                        onClick={() => setRequestSubView("visits")}
                                        className={`rounded-xl px-6 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${requestSubView === "visits" ? "shadow-lg shadow-primary/20" : "hover:bg-primary/10 hover:text-primary"}`}
                                    >
                                        Visit Requests
                                        {dashboardStats.newVisitRequests > 0 && (
                                            <Badge className="ml-2 bg-primary-foreground text-primary hover:bg-primary-foreground">
                                                {dashboardStats.newVisitRequests}
                                            </Badge>
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-3 flex-1 sm:justify-end">
                                    <div className="relative w-full sm:max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder={`Search ${requestSubView}...`}
                                            className="pl-9 h-12 rounded-xl bg-background border-border/50"
                                            value={searchTerm || ""}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Select
                                        value={requestSubView === "quotes" ? quoteStatusFilter : requestSubView === "bookings" ? bookingStatusFilter : visitStatusFilter}
                                        onValueChange={requestSubView === "quotes" ? setQuoteStatusFilter : requestSubView === "bookings" ? setBookingStatusFilter : setVisitStatusFilter}
                                    >
                                        <SelectTrigger className="w-[140px] h-12 rounded-xl bg-background border-border/50 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-4 h-4" />
                                                <SelectValue placeholder="Status" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            {requestSubView === "quotes" ? (
                                                <>
                                                    <SelectItem value="Approved">Approved</SelectItem>
                                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                                </>
                                            ) : (
                                                <>
                                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {requestSubView === "quotes" && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <QuotesTable
                                        quotes={filteredQuotes}
                                        onUpdateStatus={async (id, status) => {
                                            setUpdatingRequestId(id);
                                            try {
                                                const res = await updateQuoteRequest(id, status);
                                                toast.success(`Quote status updated to ${status}`);
                                                setQuotes(quotes.map(q => q._id === id ? { ...q, status } : q));
                                                const statsData = await fetchDashboardStats();
                                                setDashboardStats(statsData);
                                            } catch (err: any) {
                                                toast.error(`Failed to update status: ${err.message}`);
                                            } finally {
                                                setUpdatingRequestId(null);
                                            }
                                        }}
                                        updatingRequestId={updatingRequestId}
                                        currentPage={tablePages.quotes}
                                        onPageChange={(page) => setTablePages({ ...tablePages, quotes: page })}
                                        itemsPerPage={ITEMS_PER_PAGE}
                                    />
                                </div>
                            )}

                            {requestSubView === "bookings" && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <BookingsTable
                                        bookings={filteredBookings}
                                        onUpdateStatus={async (id, status) => {
                                            setUpdatingRequestId(id);
                                            try {
                                                await updateBookingRequestApi(id, status);
                                                toast.success(`Booking status updated to ${status}`);
                                                setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
                                                const statsData = await fetchDashboardStats();
                                                setDashboardStats(statsData);
                                            } catch (err: any) {
                                                toast.error(`Failed to update status: ${err.message}`);
                                            } finally {
                                                setUpdatingRequestId(null);
                                            }
                                        }}
                                        updatingRequestId={updatingRequestId}
                                        currentPage={tablePages.bookings}
                                        onPageChange={(page) => setTablePages({ ...tablePages, bookings: page })}
                                        itemsPerPage={ITEMS_PER_PAGE}
                                    />
                                </div>
                            )}

                            {requestSubView === "visits" && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <VisitsTable
                                        visits={filteredVisits}
                                        onUpdateStatus={async (id, status) => {
                                            setUpdatingRequestId(id);
                                            try {
                                                await updateVisitRequestApi(id, status);
                                                toast.success(`Visit status updated to ${status}`);
                                                setVisitRequests(visitRequests.map(v => v._id === id ? { ...v, status } : v));
                                                const statsData = await fetchDashboardStats();
                                                setDashboardStats(statsData);
                                            } catch (err: any) {
                                                toast.error(`Failed to update status: ${err.message}`);
                                            } finally {
                                                setUpdatingRequestId(null);
                                            }
                                        }}
                                        updatingRequestId={updatingRequestId}
                                        currentPage={tablePages.visits}
                                        onPageChange={(page) => setTablePages({ ...tablePages, visits: page })}
                                        itemsPerPage={ITEMS_PER_PAGE}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {currentView === "contacts" && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <h2 className="text-2xl font-bold">Contact Inquiries</h2>
                                <div className="flex items-center gap-3 flex-1 sm:justify-end">
                                    <div className="relative w-full sm:max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search messages..."
                                            className="pl-9 h-12 rounded-xl bg-background border-border/50"
                                            value={searchTerm || ""}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Select value={contactStatusFilter} onValueChange={setContactStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-12 rounded-xl bg-background border-border/50 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-4 h-4" />
                                                <SelectValue placeholder="Status" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Reviewed">Reviewed</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <ContactsTable
                                contacts={filteredContacts}
                                onUpdateStatus={async (id, status) => {
                                    setUpdatingRequestId(id);
                                    try {
                                        await updateContactRequest(id, status);
                                        toast.success(`Inquiry status updated to ${status}`);
                                        setContactRequests(contactRequests.map(c => c._id === id ? { ...c, status } : c));
                                        // Refresh stats
                                        const statsData = await fetchDashboardStats();
                                        setDashboardStats(statsData);
                                    } catch (err: any) {
                                        toast.error(`Failed to update status: ${err.message}`);
                                    } finally {
                                        setUpdatingRequestId(null);
                                    }
                                }}
                                updatingRequestId={updatingRequestId}
                                currentPage={tablePages.contacts}
                                onPageChange={(page) => setTablePages({ ...tablePages, contacts: page })}
                                itemsPerPage={ITEMS_PER_PAGE}
                            />
                        </div>
                    )}

                    {currentView === "daypasses" && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <h2 className="text-2xl font-bold">Issued Day Passes</h2>
                                <div className="flex items-center gap-3 flex-1 sm:justify-end">
                                    <div className="relative w-full sm:max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search visitors or codes..."
                                            className="pl-9 h-12 rounded-xl bg-background border-border/50"
                                            value={searchTerm || ""}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Select value={dayPassStatusFilter} onValueChange={setDayPassStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-12 rounded-xl bg-background border-border/50 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-4 h-4" />
                                                <SelectValue placeholder="Status" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Used">Used</SelectItem>
                                            <SelectItem value="Expired">Expired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DayPassesTable
                                passes={filteredDayPasses}
                                currentPage={tablePages.dayPasses}
                                onPageChange={(page) => setTablePages({ ...tablePages, dayPasses: page })}
                                itemsPerPage={ITEMS_PER_PAGE}
                            />
                        </div>
                    )}

                    {currentView === "profile" && userInfo && (
                        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 relative overflow-hidden pb-10">
                            {/* Decorative Background Elements */}
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
                            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />

                            <div className="flex flex-col gap-3 relative z-10 text-center sm:text-left">
                                 <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-violet-600">My Profile</h1>
                                 <div className="flex items-center justify-center sm:justify-start gap-3">
                                     <div className="h-px w-8 bg-primary/40 hidden sm:block" />
                                     <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs">Account Settings</p>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-12 gap-8 relative z-10">
                                {/* Left Column: Identity Card */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="card-elevated glass p-8 flex flex-col items-center text-center space-y-8 relative overflow-hidden group/card shadow-2xl border-primary/5">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover/card:bg-primary/10 transition-colors duration-700" />
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full -ml-12 -mb-12 blur-2xl opacity-50" />

                                        <div className="relative">
                                            <div className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-primary via-indigo-600 to-violet-600 flex items-center justify-center font-black text-white text-5xl shadow-[0_20px_50px_rgba(var(--primary),0.3)] relative z-10 group-hover/card:rotate-3 group-hover/card:scale-105 transition-all duration-700">
                                                {userInfo.name.split(" ").map((n: string) => n[0]).join("")}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-emerald-500 border-[6px] border-card rounded-2xl shadow-xl flex items-center justify-center z-20 animate-in zoom-in duration-500 delay-300">
                                                <ShieldCheck className="w-6 h-6 text-white" />
                                            </div>
                                        </div>

                                        <div className="space-y-3 relative z-10 w-full">
                                            <h3 className="text-3xl font-black italic tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">{userInfo.name}</h3>
                                            <div className="flex flex-col items-center gap-3">
                                                <Badge className="bg-primary/10 text-primary border-primary/20 px-5 py-1.5 rounded-xl uppercase tracking-[0.2em] text-[10px] font-black shadow-sm">
                                                    {userInfo.role}
                                                </Badge>
                                                <div className="flex items-center gap-2">
                                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Account Active</span>
                                                 </div>
                                            </div>
                                        </div>

                                        <div className="w-full pt-8 border-t border-primary/10 space-y-5 relative z-10">
                                            <div className="flex justify-between items-center px-1">
                                                 <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Status</span>
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">Admin Access</span>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-[10px] px-1">
                                                    <span className="text-muted-foreground font-black uppercase tracking-[0.2em] opacity-80">System Health</span>
                                                    <span className="font-black text-primary italic">94.8%</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-primary/5 rounded-full overflow-hidden p-0.5 border border-primary/10">
                                                    <div className="h-full bg-gradient-to-r from-primary via-indigo-500 to-violet-500 w-[94.8%] rounded-full shadow-[0_0_15px_rgba(var(--primary),0.4)]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-elevated glass p-6 space-y-6 border-primary/5 shadow-xl">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Permissions</h4>
                                            <div className="w-2 h-2 rounded-full bg-primary/20 animate-ping" />
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { icon: ShieldCheck, label: "Access Level", value: "Level 4 Active", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                                { icon: Lock, label: "Security Status", value: "Protected", color: "text-amber-500", bg: "bg-amber-500/10" },
                                                { icon: Briefcase, label: "Workspace Control", value: "Full Access", color: "text-blue-500", bg: "bg-blue-500/10" }
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-3.5 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 hover:bg-muted/30 transition-all duration-300 group/item cursor-default">
                                                    <div className={`w-11 h-11 rounded-2xl ${item.bg} flex items-center justify-center transition-all group-hover/item:rotate-6 group-hover/item:shadow-lg shadow-inner`}>
                                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mb-1.5">{item.label}</span>
                                                        <span className="text-xs font-black tracking-tight">{item.value}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Details & Security */}
                                <div className="lg:col-span-8 space-y-8">
                                    <div className="card-elevated glass p-8 sm:p-10 space-y-12">
                                        {/* Core Information Section */}
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                         <h4 className="text-base font-black italic tracking-tight">Account Information</h4>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Your account information</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {isEditingProfile ? (
                                                        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl animate-in fade-in slide-in-from-right-4 duration-300">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-9 px-4 rounded-xl font-bold text-muted-foreground hover:text-foreground transition-all"
                                                                onClick={() => {
                                                                    setIsEditingProfile(false);
                                                                    setEditProfileData({
                                                                        name: userInfo.name || "",
                                                                        email: userInfo.email || "",
                                                                        organization: userInfo.organization || "",
                                                                        mobile: userInfo.mobile || ""
                                                                    });
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-9 px-6 rounded-xl font-black bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                                onClick={async () => {
                                                                    await handleUpdateProfileInfo();
                                                                    setIsEditingProfile(false);
                                                                }}
                                                                disabled={isUpdatingProfile}
                                                            >
                                                                {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            className="h-10 px-6 rounded-2xl font-black bg-background border-2 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 group/edit"
                                                            onClick={() => setIsEditingProfile(true)}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5 mr-2 group-hover:rotate-12 transition-transform" />
                                                             Update Profile
                                                         </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-8">
                                                {[
                                                    { label: "Full Name", key: "name", value: userInfo?.name, icon: UserIcon },
                                                    { label: "Email Address", key: "email", value: userInfo?.email, icon: Mail },
                                                    { label: "Organization", key: "organization", value: userInfo?.organization || "COMS HQ", icon: Building2 },
                                                    { label: "Mobile Number", key: "mobile", value: userInfo?.mobile || "Not Provided", icon: Phone }
                                                ].map((field) => (
                                                    <div key={field.key} className="space-y-3 group/field">
                                                        <Label className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-[0.2em] ml-1 flex items-center gap-2 group-focus-within/field:text-primary transition-all duration-300">
                                                            <field.icon className="w-3 h-3 transition-transform group-focus-within/field:scale-110" /> {field.label}
                                                        </Label>
                                                        {isEditingProfile ? (
                                                            <Input
                                                                className="h-12 rounded-2xl bg-muted/20 border-primary/10 focus:border-primary/40 focus:bg-background transition-all font-bold px-4 hover:bg-muted/30 shadow-inner"
                                                                value={editProfileData[field.key as keyof typeof editProfileData] || ""}
                                                                onChange={(e) => setEditProfileData({ ...editProfileData, [field.key]: e.target.value })}
                                                            />
                                                        ) : (
                                                            <div className="h-12 flex items-center px-4 rounded-2xl bg-muted/10 border border-transparent font-black italic text-foreground tracking-tight group-hover/field:bg-muted/20 transition-all duration-300">
                                                                {field.value || "N/A"}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* History & Persistence */}
                                        <div className="pt-12 border-t border-primary/10">
                                            <div className="flex items-center justify-between mb-8">
                                                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                                     <Clock className="w-3.5 h-3.5" /> Activity Overview
                                                 </h4>
                                                <div className="h-px flex-1 bg-gradient-to-r from-primary/10 to-transparent ml-6" />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-muted/20 border border-transparent hover:border-primary/20 transition-all duration-500 group/stat shadow-soft">
                                                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover/stat:-rotate-6 transition-transform duration-500">
                                                        <Calendar className="w-8 h-8 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mb-2.5">Member Since</span>
                                                        <span className="text-xl font-black italic tracking-tighter text-foreground/90">{userInfo.joinedDate || "Feb 10, 2026"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-muted/20 border border-emerald-500/20 transition-all duration-500 group/stat shadow-soft">
                                                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover/stat:rotate-6 transition-transform duration-500">
                                                        <TrendingUp className="w-8 h-8 text-emerald-500" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mb-2.5">Last Active</span>
                                                        <span className="text-xl font-black text-emerald-600 italic tracking-tighter">
                                                            {userInfo?.lastActive
                                                                ? (!isNaN(new Date(userInfo.lastActive).getTime())
                                                                    ? formatDistanceToNow(new Date(userInfo.lastActive), { addSuffix: true })
                                                                    : userInfo.lastActive)
                                                                : "Online Now"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Security & Authentication */}
                                        <div className="pt-12 border-t border-primary/10">
                                            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-900 shadow-2xl relative overflow-hidden group/security">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover/security:bg-primary/20 transition-colors duration-700" />
                                                <div className="flex items-center gap-6 relative z-10">
                                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner group-hover/security:scale-110 transition-transform duration-500">
                                                        <KeyRound className="w-8 h-8 text-amber-400" />
                                                    </div>
                                                     <div>
                                                         <h4 className="text-xl font-black italic tracking-tight text-white">Security</h4>
                                                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Update your password</p>
                                                     </div>
                                                </div>

                                                <Dialog open={isSecurityModalOpen} onOpenChange={setIsSecurityModalOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button className="h-14 px-10 rounded-2xl font-black bg-white text-slate-900 hover:bg-slate-100 shadow-xl transition-all hover:scale-[1.05] active:scale-[0.98] group/btn relative z-10">
                                                            <RotateCcw className="w-4 h-4 mr-3 group-hover/btn:rotate-180 transition-transform duration-700" />
                                                             Update Password
                                                         </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="rounded-[2.5rem] border-border/50 overflow-hidden max-w-lg p-0 bg-background shadow-2xl">
                                                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-primary to-violet-600" />
                                                        <div className="p-10 space-y-8">
                                                            <div className="space-y-2">
                                                                 <DialogTitle className="text-3xl font-black italic tracking-tight">Update Password</DialogTitle>
                                                                 <DialogDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Change your account password</DialogDescription>
                                                            </div>

                                                            <form className="space-y-6" onSubmit={(e) => {
                                                                e.preventDefault();
                                                                handlePasswordChange();
                                                            }} noValidate>
                                                                <div className="space-y-5">
                                                                    <div className="space-y-2 group">
                                                                        <Label htmlFor="oldPassword" title="Current Password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-amber-600 transition-colors">Current Password</Label>
                                                                        <Input
                                                                            id="oldPassword"
                                                                            type="password"
                                                                            placeholder="Enter current password"
                                                                            className={`rounded-xl bg-muted/50 border-border/50 focus:border-amber-500 transition-all h-12 ${securityErrors.oldPassword ? "border-destructive ring-destructive/20" : ""}`}
                                                                            value={passwordData.oldPassword || ""}
                                                                            onChange={(e) => {
                                                                                setPasswordData({ ...passwordData, oldPassword: e.target.value });
                                                                                if (securityErrors.oldPassword) setSecurityErrors({ ...securityErrors, oldPassword: "" });
                                                                            }}
                                                                        />
                                                                        {securityErrors.oldPassword && (
                                                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                                                <AlertCircle className="w-3 h-3" /> {securityErrors.oldPassword}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="h-px bg-border/50 w-full my-2" />
                                                                    <div className="space-y-2 group">
                                                                        <Label htmlFor="newPassword" title="New Password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-amber-600 transition-colors">New Password</Label>
                                                                        <Input
                                                                            id="newPassword"
                                                                            type="password"
                                                                            placeholder="Enter new secure password"
                                                                            className={`rounded-xl bg-muted/50 border-border/50 focus:border-amber-500 transition-all h-12 ${securityErrors.newPassword ? "border-destructive ring-destructive/20" : ""}`}
                                                                            value={passwordData.newPassword || ""}
                                                                            onChange={(e) => {
                                                                                setPasswordData({ ...passwordData, newPassword: e.target.value });
                                                                                if (securityErrors.newPassword) setSecurityErrors({ ...securityErrors, newPassword: "" });
                                                                            }}
                                                                        />
                                                                        {securityErrors.newPassword && (
                                                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                                                <AlertCircle className="w-3 h-3" /> {securityErrors.newPassword}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-2 group">
                                                                        <Label htmlFor="confirmPassword" title="Confirm New Password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-amber-600 transition-colors">Confirm New Password</Label>
                                                                        <Input
                                                                            id="confirmPassword"
                                                                            type="password"
                                                                            placeholder="Confirm new password"
                                                                            className={`rounded-xl bg-muted/50 border-border/50 focus:border-amber-500 transition-all h-12 ${securityErrors.confirmPassword ? "border-destructive ring-destructive/20" : ""}`}
                                                                            value={passwordData.confirmPassword || ""}
                                                                            onChange={(e) => {
                                                                                setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                                                                                if (securityErrors.confirmPassword) setSecurityErrors({ ...securityErrors, confirmPassword: "" });
                                                                            }}
                                                                        />
                                                                        {securityErrors.confirmPassword && (
                                                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                                                <AlertCircle className="w-3 h-3" /> {securityErrors.confirmPassword}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <DialogFooter className="pt-4">
                                                                    <Button
                                                                        type="submit"
                                                                        disabled={isChangingPassword}
                                                                        className="w-full h-14 rounded-2xl font-black bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                                    >
                                                                        {isChangingPassword ? (
                                                                            <><Loader2 className="w-5 h-5 animate-spin mr-3" />Updating...</>
                                                                        ) : "Update Password"}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </form>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Unallot Seat Confirmation Modal */}
                <Dialog open={isUnallotConfirmDialogOpen} onOpenChange={setIsUnallotConfirmDialogOpen}>
                    <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                        <div className="p-8 text-center space-y-6 bg-gradient-to-b from-destructive/5 to-background">
                            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto ring-8 ring-destructive/5">
                                <CircleX className="w-10 h-10 text-destructive" />
                            </div>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tight text-center">Release Seats?</DialogTitle>
                                <DialogDescription className="text-muted-foreground font-medium text-sm text-center">
                                    Are you sure you want to unallot <span className="text-foreground font-bold">{bookingToUnallot?.fullName}</span> and release <span className="text-foreground font-bold">{bookingToUnallot?.seatCount || 1} {(bookingToUnallot?.seatCount || 1) === 1 ? 'seat' : 'seats'}</span>?
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="destructive"
                                    onClick={async () => {
                                        if (bookingToUnallot) {
                                            const bId = bookingToUnallot._id || (bookingToUnallot as any).id;
                                            setIsUnallotConfirmDialogOpen(false);
                                            setUpdatingRequestId(bId);
                                            try {
                                                await updateBookingRequestApi(bId, "Cancelled");
                                                toast.success("Booking cancelled and seats released");
                                                setBookings(bookings.map(b => (b._id === bId || (b as any).id === bId) ? { ...b, status: "Cancelled" } : b));
                                                const wsData = await fetchWorkspaces();
                                                setWorkspaces(wsData);
                                                const statsData = await fetchDashboardStats();
                                                setDashboardStats(statsData);
                                            } catch (err: any) {
                                                toast.error(`Failed to unallot: ${err.message}`);
                                            } finally {
                                                setUpdatingRequestId(null);
                                                setBookingToUnallot(null);
                                            }
                                        }
                                    }}
                                    className="w-full h-14 rounded-2xl font-black shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    disabled={!!updatingRequestId}
                                >
                                    {updatingRequestId ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Confirm Release"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setIsUnallotConfirmDialogOpen(false);
                                        setBookingToUnallot(null);
                                    }}
                                    className="w-full h-14 rounded-2xl font-bold"
                                    disabled={!!updatingRequestId}
                                >
                                    Keep Booking
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </SidebarInset >
        </SidebarProvider >
    );
};

function RecentUsersTable({ users, currentPage, onPageChange, itemsPerPage }: {
    users: User[],
    currentPage: number,
    onPageChange: (page: number) => void,
    itemsPerPage: number
}) {
    const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft">
            <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                <h3 className="font-bold">Recent Users</h3>
                <Button variant="link" size="sm" className="text-xs">View All</Button>
            </div>
            <Table>
                <TableBody>
                    {paginatedUsers.map((user) => (
                        <TableRow key={user._id || user.id} className="hover:bg-muted/10 border-none">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">
                                        {(user.name || "U").split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-xs">{user.name}</span>
                                        <span className="text-[10px] text-muted-foreground">{user.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge variant="outline" className="text-[10px] h-5 rounded-full px-2">{user.status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                totalItems={users.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}

function UsersTable({
    users,
    onEdit,
    onDelete,
    currentPage,
    onPageChange,
    itemsPerPage
}: {
    users: User[],
    onEdit: (user: User) => void,
    onDelete: (id: string) => void,
    currentPage: number,
    onPageChange: (page: number) => void,
    itemsPerPage: number
}) {
    const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="w-[250px]">User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedUsers.map((user) => (
                        <TableRow key={user._id || user.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground/70">
                                        {(user.name || "U").split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold">{user.mobile || user.contactNumber || "N/A"}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">{(user.mobile || user.contactNumber) ? "Mobile" : "No Contact"}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs font-medium italic text-primary/80">{user.organization || "Private Member"}</span>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="rounded-lg text-[10px] font-black uppercase tracking-wider">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' :
                                        user.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' :
                                            'bg-destructive/10 text-destructive'
                                        }`}
                                >
                                    {user.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs font-medium">
                                    {user.joinedDate
                                        ? (!isNaN(new Date(user.joinedDate).getTime())
                                            ? new Date(user.joinedDate).toLocaleDateString()
                                            : user.joinedDate)
                                        : "N/A"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs font-medium italic text-muted-foreground">
                                    {user.lastActive
                                        ? (!isNaN(new Date(user.lastActive).getTime())
                                            ? formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })
                                            : user.lastActive)
                                        : "Never"}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/5" onClick={() => onEdit(user)}>
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/5" onClick={() => onDelete(user._id || user.id!)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {paginatedUsers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground italic font-medium">
                                No members detected in this selection.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <TablePagination
                totalItems={users.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}

function WorkspacesTable({
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
}: {
    workspaces: Workspace[],
    users: User[],
    bookings: BookingRequest[],
    onAllot: (wsId: string, userId: string | null) => void,
    onEdit: (ws: Workspace) => void,
    onDelete: (id: string) => void,
    onUnallotBooking: (booking: BookingRequest) => void,
    updatingRequestId: string | null,
    currentPage: number,
    onPageChange: (page: number) => void,
    itemsPerPage: number
}) {
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAllot((ws._id || (ws.id ? ws.id.toString() : "")), allottedUser?._id || null); }}>
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
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
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
                                                        </Button>
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
                                                            {allottedUser.name[0]}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-foreground italic">{allottedUser.name}</span>
                                                            <span className="text-xs text-muted-foreground font-medium">{allottedUser.email}</span>
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

function QuotesTable({
    quotes,
    onUpdateStatus,
    updatingRequestId,
    currentPage,
    onPageChange,
    itemsPerPage
}: {
    quotes: QuoteRequest[],
    onUpdateStatus: (id: string, status: string) => void,
    updatingRequestId: string | null,
    currentPage: number,
    onPageChange: (page: number) => void,
    itemsPerPage: number
}) {
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
                        paginatedQuotes.map((quote) => (
                            <QuoteRow key={quote._id} quote={quote} onUpdateStatus={onUpdateStatus} isUpdating={updatingRequestId === quote._id} />
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
                            {/* Contact Details Card */}
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

                            {/* Inquiry Details Card */}
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

                            {/* Additional Info Card */}
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

function ContactsTable({
    contacts,
    onUpdateStatus,
    updatingRequestId,
    currentPage,
    onPageChange,
    itemsPerPage
}: {
    contacts: ContactRequest[],
    onUpdateStatus: (id: string, status: string) => void,
    updatingRequestId: string | null,
    currentPage: number,
    onPageChange: (page: number) => void,
    itemsPerPage: number
}) {
    const paginatedContacts = contacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Sender</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Subject</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Received On</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedContacts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <MessageSquare className="w-8 h-8 opacity-20" />
                                    <p className="font-medium">No contact inquiries found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedContacts.map((contact) => (
                            <ContactRow key={contact._id} contact={contact} onUpdateStatus={onUpdateStatus} isUpdating={updatingRequestId === contact._id} />
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

const ContactRow = ({ contact, onUpdateStatus, isUpdating }: { contact: ContactRequest, onUpdateStatus: (id: string, status: string) => void, isUpdating: boolean }) => {
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
                        <span className="font-bold text-sm text-foreground">{contact.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{contact.email}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <span className="text-sm font-semibold text-primary/80 line-clamp-1 truncate max-w-[200px]">
                        {contact.subject}
                    </span>
                </TableCell>
                <TableCell>
                    <span className="text-xs font-semibold text-muted-foreground">
                        {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                    </span>
                </TableCell>
                <TableCell>
                    <Badge
                        variant="secondary"
                        className={`rounded-full font-black uppercase text-[8px] tracking-[0.1em] px-3 py-0.5 border-none shadow-sm ${contact.status === "Pending" || !contact.status ? "bg-amber-100 text-amber-700 shadow-amber-200/50" :
                            contact.status === "Reviewed" ? "bg-blue-100 text-blue-700 shadow-blue-200/50" :
                                "bg-emerald-100 text-emerald-700 shadow-emerald-200/50"
                            }`}
                    >
                        {contact.status || "Pending"}
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(contact._id!, "Pending"); }}>
                                Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(contact._id!, "Reviewed"); }}>
                                Reviewed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(contact._id!, "Completed"); }}>
                                Completed
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
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Subject Header</h4>
                                        <p className="text-lg font-bold text-foreground leading-tight">{contact.subject}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-black text-muted-foreground">
                                        EXT-ID: {contact._id?.slice(-8).toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Message Body</h4>
                                    <div className="bg-muted/10 p-4 rounded-xl border border-dashed border-muted-foreground/20">
                                        <p className="text-xs text-foreground/80 leading-relaxed font-medium break-words whitespace-pre-wrap">
                                            {contact.message}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6 pt-6 border-t border-border/50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold">{contact.email}</span>
                                    </div>
                                    {contact.phone && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold">{contact.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold">
                                            {new Date(contact.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •
                                            {new Date(contact.createdAt).toLocaleDateString()}
                                        </span>
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

function BookingsTable({
    bookings,
    onUpdateStatus,
    updatingRequestId,
    currentPage,
    onPageChange,
    itemsPerPage
}: {
    bookings: BookingRequest[],
    onUpdateStatus: (id: string, status: string) => void,
    updatingRequestId: string | null,
    currentPage: number,
    onPageChange: (page: number) => void,
    itemsPerPage: number
}) {
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
                        className={`rounded-full font-black uppercase text-[8px] tracking-[0.1em] px-3 py-0.5 border-none shadow-sm ${booking.status === "Pending" ? "bg-amber-100 text-amber-700 shadow-amber-200/50" :
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(booking._id!, "Pending"); }}>
                                Pending
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

function VisitsTable({
    visits,
    onUpdateStatus,
    updatingRequestId,
    currentPage,
    onPageChange,
    itemsPerPage
}: {
    visits: VisitRequest[],
    onUpdateStatus: (id: string, status: string) => void,
    updatingRequestId: string | null,
    currentPage: number,
    onPageChange: (page: number) => void,
    itemsPerPage: number
}) {
    const paginatedVisits = visits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft border-none">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Visitor</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Workspace</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Visit Date</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedVisits.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <Calendar className="w-8 h-8 opacity-20" />
                                    <p className="font-medium">No visit requests found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedVisits.map((visit) => (
                            <VisitRow key={visit._id} visit={visit} onUpdateStatus={onUpdateStatus} isUpdating={updatingRequestId === visit._id} />
                        ))
                    )}
                </TableBody>
            </Table>
            <TablePagination
                totalItems={visits.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}

function VisitRow({ visit, onUpdateStatus, isUpdating }: { visit: VisitRequest, onUpdateStatus: (id: string, status: string) => void, isUpdating: boolean }) {
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
                        <span className="font-bold text-sm text-foreground">{visit.fullName}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{visit.email}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <span className="text-sm font-semibold text-primary/80">
                        {visit.workspaceName}
                    </span>
                </TableCell>
                <TableCell>
                    <span className="text-xs font-bold text-foreground">
                        {new Date(visit.visitDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                </TableCell>
                <TableCell>
                    <Badge
                        variant="secondary"
                        className={`rounded-full font-black uppercase text-[8px] tracking-[0.1em] px-3 py-0.5 border-none shadow-sm ${visit.status === "Pending" ? "bg-amber-100 text-amber-700 shadow-amber-200/50" :
                            visit.status === "Confirmed" ? "bg-blue-100 text-blue-700 shadow-blue-200/50" :
                                visit.status === "Completed" ? "bg-emerald-100 text-emerald-700 shadow-emerald-200/50" :
                                    "bg-rose-100 text-rose-700 shadow-rose-200/50"
                            }`}
                    >
                        {visit.status}
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(visit._id!, "Pending"); }}>
                                Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(visit._id!, "Confirmed"); }}>
                                Confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(visit._id!, "Completed"); }}>
                                Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(visit._id!, "Cancelled"); }}>
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
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Visit Details</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Building className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{visit.workspaceName}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">Planned Visit: {new Date(visit.visitDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Visitor Information</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{visit.fullName}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{visit.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{visit.contactNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Requested {new Date(visit.createdAt).toLocaleString()}</span>
                                    <Badge variant="outline" className="text-[10px] font-black text-muted-foreground uppercase">VST-ID: {visit._id?.slice(-8).toUpperCase()}</Badge>
                                </div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

function DayPassesTable({
    passes,
    currentPage,
    onPageChange,
    itemsPerPage
}: {
    passes: DayPassRequest[],
    currentPage: number,
    onPageChange: (page: number) => void,
    itemsPerPage: number
}) {
    const paginatedPasses = passes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Visitor Name</TableHead>
                        <TableHead>Visit Date</TableHead>
                        <TableHead>Pass Code</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedPasses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-bold">No day passes issued yet.</TableCell>
                        </TableRow>
                    ) : (
                        paginatedPasses.map((pass) => (
                            <DayPassRow key={pass._id} pass={pass} />
                        ))
                    )}
                </TableBody>
            </Table>
            <TablePagination
                totalItems={passes.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}

function DayPassRow({ pass }: { pass: DayPassRequest }) {
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
                        <span className="font-bold text-sm text-foreground">{pass.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{pass.email}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <span className="text-xs font-bold text-foreground">
                        {new Date(pass.visitDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className="font-black text-[10px] uppercase tracking-wider text-primary bg-primary/5 border-primary/20">
                        {pass.passCode}
                    </Badge>
                </TableCell>
                <TableCell>
                    <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px] block">
                        {pass.purpose}
                    </span>
                </TableCell>
                <TableCell>
                    <Badge
                        variant="secondary"
                        className={`rounded-full font-black uppercase text-[8px] tracking-[0.1em] px-3 py-0.5 border-none shadow-sm ${pass.status === "Pending" ? "bg-amber-100 text-amber-700 shadow-amber-200/50" :
                            pass.status === "Used" ? "bg-emerald-100 text-emerald-700 shadow-emerald-200/50" :
                                "bg-rose-100 text-rose-700 shadow-rose-200/50"
                            }`}
                    >
                        {pass.status}
                    </Badge>
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
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Visitor Details</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{pass.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{pass.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{pass.contact}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Visit Information</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">Visit Date: {new Date(pass.visitDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Purpose of Visit</span>
                                                        <p className="text-sm font-bold italic">"{pass.purpose}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Issued {new Date(pass.createdAt).toLocaleString()}</span>
                                    <Badge variant="outline" className="text-[10px] font-black text-muted-foreground uppercase">PASS-ID: {pass._id?.slice(-8).toUpperCase()}</Badge>
                                </div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

function InvoicesTable({
    invoices,
    currentPage,
    onPageChange,
    itemsPerPage
}: {
    invoices: any[],
    currentPage: number,
    onPageChange: (page: number) => void,
    itemsPerPage: number
}) {
    const paginatedInvoices = invoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft border-none">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Invoice ID</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Client Info</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Workspace</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Period / Due</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Amount</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedInvoices.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <FileText className="w-8 h-8 opacity-20" />
                                    <p className="font-medium">No invoices found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedInvoices.map((inv) => (
                            <InvoiceRow key={inv._id} invoice={inv} />
                        ))
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

function InvoiceRow({ invoice }: { invoice: any }) {
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
                        <span className="font-mono font-bold text-xs text-primary">{invoice.invoiceNumber}</span>
                        {invoice.type === 'recurring' && (
                            <Badge className="w-fit mt-1 px-1.5 py-0 rounded-sm bg-violet-500/10 text-violet-600 text-[8px] font-black uppercase border-none">Recurring</Badge>
                        )}
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{invoice.customerName}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{invoice.customerEmail}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <span className="text-sm font-semibold text-primary/80">
                        {invoice.workspaceName}
                    </span>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">
                            {invoice.billingMonth ?
                                new Date(invoice.billingMonth + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) :
                                new Date(invoice.createdAt).toLocaleDateString()
                            }
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                    </div>
                </TableCell>
                <TableCell>
                    <span className="text-sm font-black text-foreground">₹{(invoice.amount || 0).toLocaleString()}</span>
                </TableCell>
                <TableCell>
                    <Badge
                        variant="secondary"
                        className={`rounded-full font-black uppercase text-[8px] tracking-[0.1em] px-3 py-0.5 border-none shadow-sm ${invoice.status === "Paid" ? "bg-emerald-100 text-emerald-700 shadow-emerald-200/50" :
                            invoice.status === "Pending" ? "bg-amber-100 text-amber-700 shadow-amber-200/50" :
                                "bg-rose-100 text-rose-700 shadow-rose-200/50"
                            }`}
                    >
                        {invoice.status}
                    </Badge>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow className="bg-primary/[0.02] hover:bg-primary/[0.02] border-none">
                    <TableCell colSpan={7} className="p-0">
                        <div className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-background/50 p-6 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Billing Context</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Building className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{invoice.workspaceName}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{invoice.paymentMethod}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">Generated: {new Date(invoice.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Recipient Information</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{invoice.customerName}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{invoice.customerEmail}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {invoice.status === 'Paid' && invoice.paidDate && (
                                    <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span className="text-xs font-bold text-emerald-700 uppercase">Paid on {new Date(invoice.paidDate).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

export default AdminDashboard;




