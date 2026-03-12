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
    CheckCircle2
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
            const saved = localStorage.getItem("viewedNotifications");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("viewedNotifications", JSON.stringify(viewedNotifications));
    }, [viewedNotifications]);

    const markAsRead = useCallback((notifId: string, type: string) => {
        const uniqueId = `${type}-${notifId}`;
        if (!viewedNotifications.includes(uniqueId)) {
            setViewedNotifications(prev => [...prev, uniqueId]);
        }
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

            console.log("Allotting workspace:", selectedWorkspace, "to user:", allotValue);

            const updatedWorkspace = await updateWorkspaceApi(selectedWorkspace, {
                allottedTo: allotValue,
                allotmentStart: allotValue ? (allotmentStartDate || null) : null,
                unavailableUntil: allotValue ? (unavailableUntilDate || null) : null
            });

            // Re-fetch or update local state
            setWorkspaces(workspaces.map(ws => (ws._id === selectedWorkspace || (ws.id && ws.id.toString() === selectedWorkspace)) ? updatedWorkspace : ws));
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
            const { allottedTo, ...payload } = editingWorkspace;
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

    const filteredUsers = users.filter((user) => {
        const matchesSearch = (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesStatus = userStatusFilter === "all" || user.status === userStatusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredWorkspaces = workspaces.filter((ws) =>
        (ws.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (ws.location?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

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
                    <p className="text-muted-foreground animate-pulse font-medium">Loading admin console...</p>
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
                                        tooltip="Dashboard"
                                        className="group-data-[collapsible=icon]:justify-center"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        <span className="group-data-[collapsible=icon]:hidden">Dashboard Overview</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "users"}
                                        onClick={() => setCurrentView("users")}
                                        tooltip="User Management"
                                        className="group-data-[collapsible=icon]:justify-center"
                                    >
                                        <UsersIcon className="w-5 h-5" />
                                        <span className="group-data-[collapsible=icon]:hidden">User Management</span>
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
                                        <span className="group-data-[collapsible=icon]:hidden">Contact Inquiries</span>
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
                                        <span className="group-data-[collapsible=icon]:hidden">Financial Statements</span>
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
                                        <span className="group-data-[collapsible=icon]:hidden">Issued Day Passes</span>
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
                                        <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
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
                                <Button variant="ghost" size="icon" className="relative w-9 h-9 transition-all active:scale-95 group">
                                    <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary ring-2 ring-background pointer-events-none" />
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 rounded-2xl overflow-hidden glass border-border/50 shadow-2xl" align="end">
                                <div className="p-4 border-b border-border/50 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Notifications Center</h4>
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
                                    >
                                        View Active Requests Center
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6 md:p-8 space-y-8">
                    {currentView === "dashboard" && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="card-elevated p-6 space-y-4 glass">
                                        <div className="flex items-center justify-between">
                                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                                            <p className="text-2xl font-bold">{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                <RecentUsersTable
                                    users={(Array.isArray(users) ? users : [])}
                                    currentPage={tablePages.recentUsers}
                                    onPageChange={(page) => setTablePages({ ...tablePages, recentUsers: page })}
                                    itemsPerPage={5}
                                />
                                <div className="card-elevated p-6 glass space-y-4">
                                    <h3 className="text-lg font-bold">Quick Actions</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="outline" className="h-24 flex-col gap-2 rounded-2xl border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary transition-all" onClick={() => setCurrentView("workspaces")}>
                                            <Plus className="w-6 h-6" />
                                            Create Workspace
                                        </Button>
                                        <Button variant="outline" className="h-24 flex-col gap-2 rounded-2xl border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary transition-all" onClick={() => {
                                            setCurrentView("users");
                                            setIsUserDialogOpen(true);
                                        }}>
                                            <UserPlus className="w-6 h-6" />
                                            Add Member
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-24 flex-col gap-2 rounded-2xl border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary transition-all relative overflow-hidden group"
                                            onClick={handleGenerateInvoices}
                                            disabled={isGeneratingInvoices}
                                        >
                                            {isGeneratingInvoices ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            )}
                                            <span className="text-center">Generate Invoices</span>
                                            {isGeneratingInvoices && (
                                                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {currentView === "invoices" && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
                                        <CreditCard className="w-8 h-8 text-primary" />
                                        Financial Statements
                                    </h2>
                                    <p className="text-muted-foreground font-medium text-sm mt-1">Audit and track ecosystem revenue streams.</p>
                                </div>                                <div className="flex items-center gap-3">
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

                            <InvoicesTable
                                invoices={invoices}
                                currentPage={tablePages.invoices}
                                onPageChange={(page) => setTablePages({ ...tablePages, invoices: page })}
                                itemsPerPage={ITEMS_PER_PAGE}
                            />
                        </div>
                    )}

                    {currentView === "users" && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <h2 className="text-2xl font-bold">User Management</h2>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search users..."
                                            className="pl-9 h-10 rounded-xl"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20">
                                                <UserPlus className="w-4 h-4" />
                                                Add User
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px] rounded-2xl max-h-[90vh] overflow-y-auto">
                                            <form onSubmit={handleCreateUser} noValidate>
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl">Register New User</DialogTitle>
                                                    <DialogDescription>
                                                        Create a new account manually. Default role is Member.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-5 py-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="user-name">Full Name</Label>
                                                        <div className="relative">
                                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                id="user-name"
                                                                placeholder="Pranav Raj"
                                                                className={`pl-9 ${userErrors.name ? "border-destructive ring-destructive/20" : ""}`}
                                                                value={newUserData.name}
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
                                                    <div className="space-y-2">
                                                        <Label htmlFor="user-email">Email Address</Label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                id="user-email"
                                                                type="email"
                                                                placeholder="pranav@example.com"
                                                                className={`pl-9 ${userErrors.email ? "border-destructive ring-destructive/20" : ""}`}
                                                                value={newUserData.email}
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
                                                        <div className="space-y-2">
                                                            <Label htmlFor="user-password">Password</Label>
                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    id="user-password"
                                                                    type="password"
                                                                    placeholder="••••••••"
                                                                    className={`pl-9 ${userErrors.password ? "border-destructive ring-destructive/20" : ""}`}
                                                                    value={newUserData.password}
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
                                                        <div className="space-y-2">
                                                            <Label htmlFor="user-mobile">Mobile Number</Label>
                                                            <div className="relative">
                                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    id="user-mobile"
                                                                    placeholder="+91 98765 43210"
                                                                    className="pl-9"
                                                                    value={newUserData.mobile}
                                                                    onChange={(e) => setNewUserData({ ...newUserData, mobile: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="user-org">Organization / Company</Label>
                                                        <div className="relative">
                                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                id="user-org"
                                                                placeholder="e.g. Cohort Creative"
                                                                className="pl-9"
                                                                value={newUserData.organization}
                                                                onChange={(e) => setNewUserData({ ...newUserData, organization: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30 mt-2">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-sm font-semibold">Admin Access</Label>
                                                            <p className="text-xs text-muted-foreground">Grant administrative privileges to this user</p>
                                                        </div>
                                                        <Select
                                                            value={newUserData.role}
                                                            onValueChange={(val: any) => setNewUserData({ ...newUserData, role: val })}
                                                        >
                                                            <SelectTrigger className="w-[120px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Member">Member</SelectItem>
                                                                <SelectItem value="Admin">Admin</SelectItem>
                                                                <SelectItem value="Authenticator">Authenticator</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)} disabled={isLoadingUser}>Cancel</Button>
                                                    <Button type="submit" disabled={isLoadingUser}>
                                                        {isLoadingUser ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Account"}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className={`rounded-xl h-10 w-10 ${userStatusFilter !== 'all' ? 'border-primary bg-primary/5 text-primary' : ''}`}>
                                                <Filter className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl w-48 border-border/50 glass">
                                            <div className="p-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 px-2">Filter by Status</p>
                                                <DropdownMenuItem
                                                    onClick={() => setUserStatusFilter("all")}
                                                    className={`rounded-lg cursor-pointer ${userStatusFilter === 'all' ? 'bg-primary/10 text-primary font-bold' : ''}`}
                                                >
                                                    All Members
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setUserStatusFilter("Active")}
                                                    className={`rounded-lg cursor-pointer ${userStatusFilter === 'Active' ? 'bg-emerald-500/10 text-emerald-600 font-bold' : ''}`}
                                                >
                                                    Active
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setUserStatusFilter("Inactive")}
                                                    className={`rounded-lg cursor-pointer ${userStatusFilter === 'Inactive' ? 'bg-destructive/10 text-destructive font-bold' : ''}`}
                                                >
                                                    Inactive
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setUserStatusFilter("Pending")}
                                                    className={`rounded-lg cursor-pointer ${userStatusFilter === 'Pending' ? 'bg-amber-500/10 text-amber-600 font-bold' : ''}`}
                                                >
                                                    Pending
                                                </DropdownMenuItem>
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
                                <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                                    <div className="bg-gradient-to-br from-primary/10 via-background to-background p-8">
                                        <form onSubmit={handleUpdateUser} className="space-y-6" noValidate>
                                            <DialogHeader>
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                                    <UserIcon className="w-6 h-6 text-primary" />
                                                </div>
                                                <DialogTitle className="text-3xl font-black tracking-tight">Edit Member</DialogTitle>
                                                <DialogDescription className="text-base font-medium text-muted-foreground/80">
                                                    Refine profile details for <span className="text-foreground font-bold">{editingUser?.name}</span>
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="grid gap-5 py-2">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Full Identity</Label>
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
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Digital Mail</Label>
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
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Contact Number</Label>
                                                    <Input
                                                        placeholder="+91 98765 43210"
                                                        className="rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold"
                                                        value={editingUser?.mobile || ""}
                                                        onChange={(e) => editingUser && setEditingUser({ ...editingUser, mobile: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Affiliation / Startup</Label>
                                                    <Input
                                                        className="rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold"
                                                        value={editingUser?.organization || ""}
                                                        onChange={(e) => editingUser && setEditingUser({ ...editingUser, organization: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Access Level</Label>
                                                        <div className="mt-1.5">
                                                            <Select
                                                                value={editingUser?.role}
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
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Account Sync</Label>
                                                        <div className="mt-1.5">
                                                            <Select
                                                                value={editingUser?.status}
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
                                                    {isLoadingUser ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Profile"}
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
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black tracking-tight">Revoke Access?</h3>
                                            <p className="text-muted-foreground font-medium">This action will permanently remove this member from the network. This cannot be undone.</p>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                variant="destructive"
                                                onClick={confirmDeleteUser}
                                                className="w-full h-14 rounded-2xl font-black shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                disabled={isLoadingDelete}
                                            >
                                                {isLoadingDelete ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Confirm Deletion"}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setIsDeleteUserDialogOpen(false)}
                                                className="w-full h-14 rounded-2xl font-bold"
                                                disabled={isLoadingDelete}
                                            >
                                                Keep Member
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
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search workspaces..."
                                            className="pl-9 h-10 rounded-xl"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
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
                                                                    value={newWorkspace.name}
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
                                                                    value={newWorkspace.location}
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
                                                                    value={newWorkspace.floor}
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
                                                                    value={newWorkspace.capacity}
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
                                                        <Label htmlFor="type">Workspace Classification</Label>
                                                        <Input
                                                            id="type"
                                                            list="existing-types"
                                                            placeholder="e.g. Private Suite"
                                                            className={workspaceErrors.type ? "border-destructive ring-destructive/20" : ""}
                                                            value={newWorkspace.type}
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
                                                            {Array.from(new Set(workspaces.map(ws => ws.location))).map(loc => (
                                                                <option key={loc} value={loc} />
                                                            ))}
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
                                                                value={newWorkspace.price}
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

                                                    {newWorkspace.type === "Dedicated Workspace" && (
                                                        <div className="space-y-6 p-5 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
                                                            <div className="flex items-center justify-between">
                                                                <Label className="text-primary font-black uppercase tracking-widest text-[10px]">Workspace Architecture</Label>
                                                                <Badge variant="outline" className="bg-background text-primary border-primary/20 text-[10px] uppercase font-black">Capacity: {newWorkspace.capacity}</Badge>
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
                                onAllot={(wsId, userId) => {
                                    setSelectedWorkspace(wsId);
                                    const ws = workspaces.find(w => w._id === wsId || (w.id && w.id.toString() === wsId));
                                    setSelectedUserForAllotment(userId || "none");
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
                                                            Unavailable Until
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
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Full Name</Label>
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
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Geography</Label>
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
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Elevation</Label>
                                                        <Input
                                                            className="rounded-2xl h-12 bg-background/50 border-border/50 focus:ring-primary/20 transition-all font-bold"
                                                            value={editingWorkspace?.floor || ""}
                                                            onChange={(e) => editingWorkspace && setEditingWorkspace({ ...editingWorkspace, floor: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Architecture / Type</Label>
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
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Price Configuration (₹/mo)</Label>
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
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Crowd Limit</Label>
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
                                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Curated Amenities</Label>
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
                                                        Push
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

                                            {editingWorkspace?.type === "Dedicated Workspace" && (
                                                <div className="space-y-6 p-5 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-primary font-black uppercase tracking-widest text-[10px]">Workspace Architecture</Label>
                                                        <Badge variant="outline" className="bg-background text-primary border-primary/20 text-[10px] uppercase font-black">Capacity: {editingWorkspace?.capacity}</Badge>
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
                                            <h3 className="text-2xl font-black tracking-tight">Remove Space?</h3>
                                            <p className="text-muted-foreground font-medium">You are about to delete this workspace from your portfolio. All current allotments will be lost.</p>
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
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder={`Search ${requestSubView}...`}
                                        className="pl-9 h-10 rounded-xl"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {requestSubView === "quotes" && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <QuotesTable
                                        quotes={quotes.filter(q =>
                                            (q.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                            (q.requiredWorkspace?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                            (q.workEmail?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                                        )}
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
                                        bookings={bookings.filter(b =>
                                            (b.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                            (b.workspaceName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                            (b.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                                        )}
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
                                        visits={(Array.isArray(visitRequests) ? visitRequests : []).filter(v =>
                                            (v.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                            (v.workspaceName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                            (v.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                                        )}
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
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search messages..."
                                        className="pl-9 h-10 rounded-xl"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <ContactsTable
                                contacts={contactRequests.filter(c =>
                                    (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                    (c.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                    (c.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                                )}
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
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search visitors or codes..."
                                            className="pl-9 h-10 rounded-xl"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DayPassesTable
                                passes={dayPasses.filter(p =>
                                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    p.passCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (p.email || "").toLowerCase().includes(searchTerm.toLowerCase())
                                )}
                                currentPage={tablePages.dayPasses}
                                onPageChange={(page) => setTablePages({ ...tablePages, dayPasses: page })}
                                itemsPerPage={ITEMS_PER_PAGE}
                            />
                        </div>
                    )}

                    {currentView === "profile" && userInfo && (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-3xl font-black tracking-tight">Account Profile</h2>
                                <p className="text-muted-foreground font-medium">Manage your administrative identity and security settings.</p>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="card-elevated glass p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center font-black text-white text-4xl shadow-2xl relative z-10">
                                            {userInfo.name.split(" ").map((n: string) => n[0]).join("")}
                                        </div>
                                        <div className="space-y-2 relative z-10">
                                            <h3 className="text-2xl font-black italic">{userInfo.name}</h3>
                                            <Badge className="bg-primary/10 text-primary border-none px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-black">
                                                {userInfo.role}
                                            </Badge>
                                        </div>
                                        <div className="w-full pt-6 border-t border-border/50 space-y-4">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground font-bold uppercase tracking-tighter">Profile Completion</span>
                                                <span className="font-black text-primary">85%</span>
                                            </div>
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-elevated glass p-6 space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Access</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase">Status</span>
                                                    <span className="text-xs font-bold">Verified Admin</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                                                <Lock className="w-4 h-4 text-amber-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-amber-600 uppercase">Security</span>
                                                    <span className="text-xs font-bold">2FA Enabled</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-6">
                                    <div className="card-elevated glass p-8 space-y-8">
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                    <Building2 className="w-3 h-3" /> Core Information
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    {isEditingProfile ? (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
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
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="rounded-xl font-bold h-8 px-4"
                                                                onClick={async () => {
                                                                    await handleUpdateProfileInfo();
                                                                    setIsEditingProfile(false);
                                                                }}
                                                                disabled={isUpdatingProfile}
                                                            >
                                                                {isUpdatingProfile ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save Changes"}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-xl text-primary hover:bg-primary/5 hover:text-primary"
                                                            onClick={() => setIsEditingProfile(true)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Full Name</Label>
                                                    {isEditingProfile ? (
                                                        <Input
                                                            className="rounded-xl bg-muted/30 border-border/50 font-bold"
                                                            value={editProfileData.name}
                                                            onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
                                                        />
                                                    ) : (
                                                        <p className="font-bold text-foreground italic px-1 h-9 flex items-center">{userInfo?.name || "N/A"}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Email Address</Label>
                                                    {isEditingProfile ? (
                                                        <Input
                                                            className="rounded-xl bg-muted/30 border-border/50 font-bold"
                                                            value={editProfileData.email}
                                                            onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                                                        />
                                                    ) : (
                                                        <p className="font-bold text-foreground italic px-1 h-9 flex items-center">{userInfo?.email || "N/A"}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Organization</Label>
                                                    {isEditingProfile ? (
                                                        <Input
                                                            className="rounded-xl bg-muted/30 border-border/50 font-bold"
                                                            value={editProfileData.organization}
                                                            onChange={(e) => setEditProfileData({ ...editProfileData, organization: e.target.value })}
                                                        />
                                                    ) : (
                                                        <p className="font-bold text-foreground italic px-1 h-9 flex items-center">{userInfo?.organization || "COMS HQ"}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Mobile Number</Label>
                                                    {isEditingProfile ? (
                                                        <Input
                                                            className="rounded-xl bg-muted/30 border-border/50 font-bold"
                                                            value={editProfileData.mobile}
                                                            onChange={(e) => setEditProfileData({ ...editProfileData, mobile: e.target.value })}
                                                        />
                                                    ) : (
                                                        <p className="font-bold text-foreground italic px-1 h-9 flex items-center">{userInfo?.mobile || "Not Provided"}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-border/50">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> History & Persistence
                                            </h4>
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center transition-colors group-hover:bg-primary/10">
                                                        <Calendar className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Joined Date</span>
                                                        <span className="text-sm font-bold">{userInfo.joinedDate || "Feb 10, 2026"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center transition-colors group-hover:bg-primary/10">
                                                        <TrendingUp className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Last Activity</span>
                                                        <span className="text-sm font-bold">Just Now</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-border/50">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                    <KeyRound className="w-3 h-3" /> Security & Access
                                                </h4>

                                                <Dialog open={isSecurityModalOpen} onOpenChange={setIsSecurityModalOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="rounded-xl font-bold bg-primary/5 border-primary/20 text-primary hover:bg-primary/10">
                                                            Update Credentials
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="rounded-3xl border-border/50 glass max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-xl font-black">Security Credentials</DialogTitle>
                                                            <DialogDescription className="text-sm font-medium text-muted-foreground">
                                                                Update your administrative authentication keys for enhanced ecosystem security.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <form className="space-y-4 pt-4" onSubmit={(e) => {
                                                            e.preventDefault();
                                                            handlePasswordChange();
                                                        }} noValidate>
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="oldPassword" title="Current Password" className="text-xs font-bold uppercase tracking-wider">Current Password</Label>
                                                                    <Input
                                                                        id="oldPassword"
                                                                        type="password"
                                                                        placeholder="••••••••"
                                                                        className={`rounded-xl bg-muted/50 border-border/50 focus:border-primary transition-all ${securityErrors.oldPassword ? "border-destructive ring-destructive/20" : ""}`}
                                                                        value={passwordData.oldPassword}
                                                                        onChange={(e) => {
                                                                            setPasswordData({ ...passwordData, oldPassword: e.target.value });
                                                                            if (securityErrors.oldPassword) setSecurityErrors({ ...securityErrors, oldPassword: "" });
                                                                        }}
                                                                    />
                                                                    {securityErrors.oldPassword && (
                                                                        <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                            <AlertCircle className="w-3 h-3" /> {securityErrors.oldPassword}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="newPassword" title="New Secure Password" className="text-xs font-bold uppercase tracking-wider">New Password</Label>
                                                                    <Input
                                                                        id="newPassword"
                                                                        type="password"
                                                                        placeholder="••••••••"
                                                                        className={`rounded-xl bg-muted/50 border-border/50 focus:border-primary transition-all ${securityErrors.newPassword ? "border-destructive ring-destructive/20" : ""}`}
                                                                        value={passwordData.newPassword}
                                                                        onChange={(e) => {
                                                                            setPasswordData({ ...passwordData, newPassword: e.target.value });
                                                                            if (securityErrors.newPassword) setSecurityErrors({ ...securityErrors, newPassword: "" });
                                                                        }}
                                                                    />
                                                                    {securityErrors.newPassword && (
                                                                        <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                            <AlertCircle className="w-3 h-3" /> {securityErrors.newPassword}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="confirmPassword" title="Confirm New Password" className="text-xs font-bold uppercase tracking-wider">Confirm New Password</Label>
                                                                    <Input
                                                                        id="confirmPassword"
                                                                        type="password"
                                                                        placeholder="••••••••"
                                                                        className={`rounded-xl bg-muted/50 border-border/50 focus:border-primary transition-all ${securityErrors.confirmPassword ? "border-destructive ring-destructive/20" : ""}`}
                                                                        value={passwordData.confirmPassword}
                                                                        onChange={(e) => {
                                                                            setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                                                                            if (securityErrors.confirmPassword) setSecurityErrors({ ...securityErrors, confirmPassword: "" });
                                                                        }}
                                                                    />
                                                                    {securityErrors.confirmPassword && (
                                                                        <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                            <AlertCircle className="w-3 h-3" /> {securityErrors.confirmPassword}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <DialogFooter className="pt-4">
                                                                <Button
                                                                    type="submit"
                                                                    disabled={isChangingPassword}
                                                                    className="w-full rounded-xl font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                                >
                                                                    {isChangingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Apply Security Protocol"}
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
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
                                            ? new Date(user.lastActive).toLocaleDateString() 
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
    onAllot,
    onEdit,
    onDelete,
    currentPage,
    onPageChange,
    itemsPerPage
}: {
    workspaces: Workspace[],
    users: User[],
    onAllot: (wsId: string, userId: string | null) => void,
    onEdit: (ws: Workspace) => void,
    onDelete: (id: string) => void,
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
                    {paginatedWorkspaces.map((ws, i) => {
                        if (!ws) return null;
                        const allottedUser = typeof ws.allottedTo === 'object' ? ws.allottedTo : null;

                        return (
                            <TableRow key={ws._id || ws.id || i} className="hover:bg-muted/20 transition-colors">
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
                                    {allottedUser ? (
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
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem onClick={() => onAllot((ws._id || (ws.id ? ws.id.toString() : "")), allottedUser?._id || null)}>
                                                {allottedUser ? "Change Allotment" : "Allot to User"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(ws)}>Edit Details</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(ws._id || (ws.id ? ws.id.toString() : ""))}>Delete Space</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
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




