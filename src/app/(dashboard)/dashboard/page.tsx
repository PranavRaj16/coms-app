"use client";
import { useState, useEffect, useCallback, useMemo, Fragment, Suspense } from "react";
import Link from "next/link"; import { useRouter, useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Building2,
    MapPin,
    Layers,
    Mail,
    Clock,
    Phone,
    User as UserIcon,
    Bell,
    MessageSquare,
    ExternalLink,
    Map,
    Calendar,
    TrendingUp,
    ShieldCheck,
    KeyRound,
    CheckCircle2,
    AlertCircle,
    Lock as LockIcon,
    ArrowBigUp,
    Send,
    MessageCircle,
    Trash2,
    Heart,
    CornerDownRight,
    CalendarCheck,
    Sparkles,
    Ticket,
    ArrowRight,
    ArrowLeft,
    Pencil,
    X,
    Loader2,
    ChevronDown,
    ChevronUp,
    Globe,
    Wifi,
    Activity,
    Share2,
    Zap,
    MessageSquareMore,
    Coffee,
    Trophy,
    FileText,
    Search,
    Filter,
    Download,
    Printer,
    Eye
} from "lucide-react";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import cohortimage from "@/assets/cohort-logo.png";
import { fetchMyWorkspace, fetchUpcomingWorkspace, fetchCommunityMembers, updateProfile, fetchPosts, createPost as createPostApi, upvotePost, addComment, deletePost as deletePostApi, upvoteComment, addReply, deleteComment as deleteCommentApi, fetchUserProfile, fetchWorkspaces, submitQuoteRequest, fetchQuoteRequests, submitBookingRequest, fetchBookingRequests, fetchVisitRequests, fetchInvoices, payInvoice, deleteReply, fetchAgreements } from "@/lib/api";
import { Workspace } from "@/data/workspaces";
import { DEFAULT_WORKSPACE_IMAGE } from "@/lib/constants";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateTimePicker } from "@/components/ui/date-time-picker";



interface Reply {
    _id?: string;
    user: string;
    userName: string;
    text: string;
    createdAt: string;
}

interface Comment {
    _id: string;
    user: string;
    userName: string;
    text: string;
    upvotes: string[];
    replies: Reply[];
    createdAt: string;
}

interface Post {
    _id: string;
    author: string;
    authorName: string;
    content: string;
    upvotes: string[];
    comments: Comment[];
    createdAt: string;
}

type View = "dashboard" | "community" | "profile" | "workspace-details" | "bookings" | "agreements";

const UserDashboard = () => {
    const isAuth = (idOrObj: any, currentUserId: any) => {
        const id = idOrObj?._id || idOrObj;
        return id?.toString() === (currentUserId?._id || currentUserId)?.toString();
    };
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentView = ((searchParams?.get("view") ?? '') as View) || "dashboard";
    const selectedWorkspaceId = searchParams?.get("workspaceId") ?? null;

    const [userInfo, setUserInfo] = useState<any>(null);
    const [myWorkspaces, setMyWorkspaces] = useState<Workspace[]>([]);
    const [upcomingWorkspaces, setUpcomingWorkspaces] = useState<Workspace[]>([]);
    const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>([]);

    // Compute selected workspace from ID in URL
    const selectedWorkspace = selectedWorkspaceId ? (
        allWorkspaces.find(ws => String(ws._id || ws.id) === selectedWorkspaceId) ||
        myWorkspaces.find(ws => String(ws._id || ws.id) === selectedWorkspaceId) ||
        upcomingWorkspaces.find(ws => String(ws._id || ws.id) === selectedWorkspaceId)
    ) : null;

    const changeView = (view: View, workspaceId?: string) => {
        const params = new URLSearchParams(searchParams?.toString() ?? '');
        params.set("view", view);
        if (workspaceId) {
            params.set("workspaceId", workspaceId);
        } else {
            params.delete("workspaceId");
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const [community, setCommunity] = useState<any[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [communityTab, setCommunityTab] = useState<"stories" | "members">("stories");
    const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
    const [newPostContent, setNewPostContent] = useState("");
    const [membersSearch, setMembersSearch] = useState("");
    const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");

    const trendingTopics = useMemo(() => {
        const hashtags: { [key: string]: number } = {};
        posts.forEach(post => {
            const matches = post.content.match(/#[a-z0-9_]+/gi);
            if (matches) {
                const uniqueInPost = new Set(matches.map(m => m.toLowerCase()));
                uniqueInPost.forEach(tag => {
                    hashtags[tag] = (hashtags[tag] || 0) + 1;
                });
            }
        });

        return Object.entries(hashtags)
            .map(([topic, count]) => ({
                topic: topic.charAt(0).toUpperCase() + topic.slice(1),
                topicRaw: topic,
                posts: count
            }))
            .sort((a, b) => b.posts - a.posts)
            .slice(0, 10);
    }, [posts]);
    const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
    const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
    const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCommentDeleteDialogOpen, setIsCommentDeleteDialogOpen] = useState(false);
    const [isReplyDeleteDialogOpen, setIsReplyDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [commentToDelete, setCommentToDelete] = useState<{ postId: string, commentId: string } | null>(null);
    const [replyToDelete, setReplyToDelete] = useState<{ postId: string, commentId: string, replyId: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [isDeletingPost, setIsDeletingPost] = useState(false);
    const [isDeletingComment, setIsDeletingComment] = useState(false);
    const [isDeletingReply, setIsDeletingReply] = useState(false);
    const [submittingCommentPostId, setSubmittingCommentPostId] = useState<string | null>(null);
    const [submittingReplyCommentId, setSubmittingReplyCommentId] = useState<string | null>(null);
    const [isRequestingWorkspace, setIsRequestingWorkspace] = useState(false);
    const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [agreements, setAgreements] = useState<any[]>([]);
    const [isRequesting, setIsRequesting] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [editProfileData, setEditProfileData] = useState({
        name: "",
        email: "",
        organization: "",
        mobile: ""
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Filters and Search State
    const [workspaceSearch, setWorkspaceSearch] = useState("");
    const [workspaceTypeFilter, setWorkspaceTypeFilter] = useState("All");
    const [locationFilter, setLocationFilter] = useState("All");
    const [requestSearch, setRequestSearch] = useState("");
    const [requestStatusFilter, setRequestStatusFilter] = useState("All");
    const [requestTypeFilter, setRequestTypeFilter] = useState("All");
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("All");

    const workspaceTypes = useMemo(() => {
        const types = new Set(allWorkspaces.map(ws => ws.type));
        return ["All", ...Array.from(types)];
    }, [allWorkspaces]);

    const locations = useMemo(() => {
        const locs = new Set(allWorkspaces.map(ws => ws.location));
        return ["All", ...Array.from(locs)];
    }, [allWorkspaces]);

    const filteredWorkspaces = useMemo(() => {
        return allWorkspaces.filter(ws => {
            const matchesSearch = !workspaceSearch ||
                ws.name.toLowerCase().includes(workspaceSearch.toLowerCase()) ||
                ws.type.toLowerCase().includes(workspaceSearch.toLowerCase()) ||
                ws.location.toLowerCase().includes(workspaceSearch.toLowerCase());
            const matchesType = workspaceTypeFilter === "All" || ws.type === workspaceTypeFilter;
            const matchesLocation = locationFilter === "All" || ws.location === locationFilter;
            return matchesSearch && matchesType && matchesLocation;
        });
    }, [allWorkspaces, workspaceSearch, workspaceTypeFilter, locationFilter]);

    const filteredRequests = useMemo(() => {
        return myRequests.filter(req => {
            const matchesSearch = !requestSearch ||
                req.requiredWorkspace?.toLowerCase().includes(requestSearch.toLowerCase()) ||
                req.status?.toLowerCase().includes(requestSearch.toLowerCase());
            const matchesStatus = requestStatusFilter === "All" || req.status === requestStatusFilter;
            const matchesType = requestTypeFilter === "All" || req.type === requestTypeFilter.toLowerCase();
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [myRequests, requestSearch, requestStatusFilter, requestTypeFilter]);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            return invoiceStatusFilter === "All" || inv.status === invoiceStatusFilter;
        });
    }, [invoices, invoiceStatusFilter]);

    const formatDisplayDate = (date: any) => {
        if (!date) return "N/A";
        const d = new Date(date);
        if (isNaN(d.getTime())) return date;
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getEndDate = (startDate: any, duration: string) => {
        if (!startDate || !duration) return "N/A";
        try {
            const date = new Date(startDate);
            const parts = duration.split(" ");
            const num = parseFloat(parts[0]);
            const unit = parts[1]?.toLowerCase() || "months";

            if (unit.startsWith('month')) date.setMonth(date.getMonth() + Math.ceil(num));
            else if (unit.startsWith('year')) date.setFullYear(date.getFullYear() + Math.ceil(num));
            else if (unit.startsWith('week')) date.setDate(date.getDate() + Math.ceil(num * 7));
            else if (unit.startsWith('day')) date.setDate(date.getDate() + Math.ceil(num));
            else if (unit.startsWith('hour')) date.setHours(date.getHours() + Math.ceil(num));

            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return "Invalid Date";
        }
    };

    const handlePayInvoice = async (invoiceId: string) => {
        setPayingInvoiceId(invoiceId);
        try {
            await payInvoice(invoiceId);
            toast.success("Invoice paid successfully");
            await loadDashboardData(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to pay invoice");
        } finally {
            setPayingInvoiceId(null);
        }
    };

    // Member Contact Modal State
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    // Booking Modal State
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedWorkspaceToBook, setSelectedWorkspaceToBook] = useState<Workspace | null>(null);
    const [bookingParams, setBookingParams] = useState({
        startDate: "",
        endDate: "",
        duration: "1 Months",
        paymentMethod: "Pay Now",
        seatCount: 1
    });

    // Dynamic duration calculation
    useEffect(() => {
        if (bookingParams.startDate && bookingParams.endDate) {
            const start = new Date(bookingParams.startDate);
            const end = new Date(bookingParams.endDate);

            if (end > start) {
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let durationStr = "";
                if (diffDays >= 365) {
                    const years = (diffDays / 365).toFixed(1);
                    durationStr = `${years} Years`;
                } else if (diffDays >= 30) {
                    const months = (diffDays / 30.44).toFixed(1);
                    durationStr = `${months} Months`;
                } else if (diffDays >= 7) {
                    const weeks = (diffDays / 7).toFixed(1);
                    durationStr = `${weeks} Weeks`;
                } else {
                    durationStr = `${diffDays} Days`;
                }

                setBookingParams(prev => ({ ...prev, duration: durationStr }));
            } else {
                setBookingParams(prev => ({ ...prev, duration: "0 Days" }));
            }
        }
    }, [bookingParams.startDate, bookingParams.endDate]);

    // Password change state
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [securityErrors, setSecurityErrors] = useState<{ [key: string]: string }>({});

    // Notifications state
    const [viewedNotifications, setViewedNotifications] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem("userViewedNotifications");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("userViewedNotifications", JSON.stringify(viewedNotifications));
    }, [viewedNotifications]);

    const estimatedTotal = useMemo(() => {
        if (!selectedWorkspaceToBook) return 0;
        const parts = bookingParams.duration.split(" ");
        const num = parseFloat(parts[0]) || 0;
        const unit = parts[1]?.toLowerCase() || 'months';
        const price = Number(selectedWorkspaceToBook.price) || 0;
        const isOpenWorkstation = selectedWorkspaceToBook.type === "Open WorkStation";
        const seatFactor = isOpenWorkstation ? bookingParams.seatCount : 1;

        let factor = 0;
        if (unit.startsWith('year')) factor = 12;
        else if (unit.startsWith('month')) factor = 1;
        else if (unit.startsWith('week')) factor = 1 / 4.34;
        else if (unit.startsWith('day')) factor = 1 / 30.44;
        else if (unit.startsWith('hour')) factor = 1 / (30.44 * 24);

        return Math.ceil(price * factor * num * seatFactor);
    }, [selectedWorkspaceToBook, bookingParams.duration, bookingParams.seatCount]);

    const [expandedInv, setExpandedInv] = useState<string | null>(null);

    const markAsRead = useCallback((id: string) => {
        if (!viewedNotifications.includes(id)) {
            setViewedNotifications(prev => [...prev, id]);
        }
    }, [viewedNotifications]);

    const userNotifications = useMemo(() => {
        if (!userInfo) return [];

        const allNotifs: any[] = [];

        // 1. New posts from others (within last 48 hours for example)
        posts.forEach(post => {
            if (post.author !== userInfo._id && post.author !== userInfo.id) {
                allNotifs.push({
                    id: `post-${post._id}`,
                    type: 'post',
                    title: 'New Community Story',
                    subtitle: `${post.authorName} shared a new story`,
                    date: post.createdAt,
                    icon: Sparkles,
                    color: 'text-amber-500',
                    isRead: viewedNotifications.includes(`post-${post._id}`),
                    targetPostId: post._id
                });
            }

            // 2. Comments on MY posts
            if (post.author === userInfo._id || post.author === userInfo.id) {
                post.comments.forEach(comment => {
                    if (comment.user !== userInfo._id && comment.user !== userInfo.id) {
                        allNotifs.push({
                            id: `comment-${comment._id}`,
                            type: 'comment',
                            title: 'New Comment',
                            subtitle: `${comment.userName} commented on your story`,
                            date: comment.createdAt,
                            icon: MessageCircle,
                            color: 'text-primary',
                            isRead: viewedNotifications.includes(`comment-${comment._id}`),
                            targetPostId: post._id
                        });
                    }
                });
            }
        });

        return allNotifs
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 15);
    }, [posts, userInfo, viewedNotifications]);

    const markAllAsRead = useCallback(() => {
        const unreadIds = userNotifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length > 0) {
            setViewedNotifications(prev => {
                const newIds = [...prev];
                unreadIds.forEach(id => {
                    if (!newIds.includes(id)) newIds.push(id);
                });
                return newIds;
            });
            toast.success("All notifications marked as read");
        }
    }, [userNotifications]);

    const unreadCount = userNotifications.filter(n => !n.isRead).length;

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
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const loadDashboardData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const [wsData, upcomingWsData, allWsData, communityData, postsData, freshProfile, quotesData, bookingsData, visitsData, invoicesData, agreementsData] = await Promise.all([
                fetchMyWorkspace().catch(() => null),
                fetchUpcomingWorkspace().catch(() => null),
                fetchWorkspaces().catch(() => []),
                fetchCommunityMembers().catch(() => []),
                fetchPosts().catch(() => []),
                fetchUserProfile().catch(() => null),
                fetchQuoteRequests().catch(() => []),
                fetchBookingRequests().catch(() => []),
                fetchVisitRequests().catch(() => []),
                fetchInvoices().catch(() => []),
                fetchAgreements().catch(() => [])
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

            setMyWorkspaces(Array.isArray(wsData) ? wsData : (wsData ? [wsData] : []));
            setUpcomingWorkspaces(Array.isArray(upcomingWsData) ? upcomingWsData : (upcomingWsData ? [upcomingWsData] : []));
            setAllWorkspaces(Array.isArray(allWsData) ? [...allWsData].sort((a, b) => {
                const now = new Date();
                const startA = a.allotmentStart ? new Date(a.allotmentStart) : null;
                const isUnavA = a.type === "Open WorkStation"
                    ? (a.availableSeats !== undefined ? a.availableSeats <= 0 : false)
                    : !!a.allottedTo && (!startA || now >= startA);

                const startB = b.allotmentStart ? new Date(b.allotmentStart) : null;
                const isUnavB = b.type === "Open WorkStation"
                    ? (b.availableSeats !== undefined ? b.availableSeats <= 0 : false)
                    : !!b.allottedTo && (!startB || now >= startB);

                if (isUnavA !== isUnavB) return isUnavA ? 1 : -1;
                if (a.featured !== b.featured) return a.featured ? -1 : 1;
                return 0;
            }) : []);
            setCommunity(communityData);
            setPosts(postsData);
            setInvoices(invoicesData);
            setAgreements(Array.isArray(agreementsData) ? agreementsData : []);
            const combinedRequests = [
                ...quotesData.map((q: any) => ({ ...q, type: 'quote', email: q.workEmail })),
                ...bookingsData.map((b: any) => ({ ...b, type: 'booking', requiredWorkspace: b.workspaceName })),
                ...visitsData.map((v: any) => ({ ...v, type: 'visit', requiredWorkspace: v.workspaceName || 'Site Visit' }))
            ];

            setMyRequests(combinedRequests.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        } catch (error: any) {
            console.error("Error loading dashboard:", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const userStr = localStorage.getItem("userInfo");
        if (!userStr) {
            router.push("/login");
            return;
        }
        const user = JSON.parse(userStr);
        setUserInfo(user);

        loadDashboardData();

        // Auto-refresh every 30 seconds to keep data live
        const interval = setInterval(() => {
            loadDashboardData(false);
        }, 30000);

        // Refresh on window focus to ensure data is fresh when user returns
        const onFocus = () => loadDashboardData(false);
        window.addEventListener('focus', onFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', onFocus);
        };
    }, [router, loadDashboardData, searchParams]);

    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        toast.success("Successfully logged out");
        router.push("/login");
    };

    const handleCreatePost = async () => {
        setIsPosting(true);
        try {
            const post = await createPostApi({
                content: newPostContent,
                authorName: userInfo?.name || userInfo?.email || "Anonymous Member"
            });
            setPosts([post, ...posts]);
            setNewPostContent("");
            toast.success("Post shared with community!");
        } catch (error: any) {
            toast.error(error.message || "Failed to post");
        } finally {
            setIsPosting(false);
        }
    };

    const handleUpvotePost = async (postId: string) => {
        try {
            const updatedPost = await upvotePost(postId);
            setPosts(posts.map(p => p._id === postId ? updatedPost : p));
        } catch (error: any) {
            toast.error("Failed to vibe with post");
        }
    };

    const handleAddComment = async (postId: string) => {
        const text = commentTexts[postId];
        if (!text?.trim()) return;

        setSubmittingCommentPostId(postId);
        try {
            const updatedPost = await addComment(postId, {
                text,
                userName: userInfo.name
            });
            setPosts(posts.map(p => p._id === postId ? updatedPost : p));
            setCommentTexts({ ...commentTexts, [postId]: "" });
            toast.success("Comment added!");
        } catch (error: any) {
            toast.error(error.message || "Failed to add comment");
        } finally {
            setSubmittingCommentPostId(null);
        }
    };

    const handleDeletePost = (postId: string) => {
        setPostToDelete(postId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;
        try {
            await deletePostApi(postToDelete);
            setPosts(posts.filter(p => p._id !== postToDelete));
            toast.success("Story removed");
        } catch (error: any) {
            toast.error("Failed to delete post");
        } finally {
            setIsDeleteDialogOpen(false);
            setPostToDelete(null);
        }
    };

    const handleUpvoteComment = async (postId: string, commentId: string) => {
        try {
            const updatedPost = await upvoteComment(postId, commentId);
            setPosts(posts.map(p => p._id === postId ? updatedPost : p));
        } catch (error: any) {
            toast.error("Failed to like comment");
        }
    };

    const handleAddReply = async (postId: string, commentId: string) => {
        const text = replyTexts[commentId];
        if (!text?.trim()) return;

        setSubmittingReplyCommentId(commentId);
        try {
            const updatedPost = await addReply(postId, commentId, {
                text,
                userName: userInfo.name
            });
            setPosts(posts.map(p => p._id === postId ? updatedPost : p));
            setReplyTexts({ ...replyTexts, [commentId]: "" });
            setActiveReplyBox(null);
            toast.success("Reply added!");
        } catch (error: any) {
            toast.error(error.message || "Failed to add reply");
        } finally {
            setSubmittingReplyCommentId(null);
        }
    };

    const handleDeleteComment = (postId: string, commentId: string) => {
        setCommentToDelete({ postId, commentId });
        setIsCommentDeleteDialogOpen(true);
    };

    const confirmCommentDelete = async () => {
        if (!commentToDelete) return;
        try {
            const updatedPost = await deleteCommentApi(commentToDelete.postId, commentToDelete.commentId);
            setPosts(posts.map(p => p._id === commentToDelete.postId ? updatedPost : p));
            toast.success("Comment removed");
        } catch (error: any) {
            toast.error("Failed to delete comment");
        } finally {
            setIsCommentDeleteDialogOpen(false);
            setCommentToDelete(null);
        }
    };

    const confirmReplyDelete = async () => {
        if (!replyToDelete) return;
        try {
            const updatedPost = await deleteReply(replyToDelete.postId, replyToDelete.commentId, replyToDelete.replyId);
            setPosts(posts.map(p => p._id === replyToDelete.postId ? updatedPost : p));
            toast.success("Reply removed");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete reply");
        } finally {
            setIsReplyDeleteDialogOpen(false);
            setReplyToDelete(null);
        }
    };

    const handleRequestWorkspace = async (workspace: Workspace) => {
        // Set default dates: today to one month from today
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        const formatDate = (date: Date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        setBookingParams({
            startDate: formatDate(today),
            endDate: formatDate(nextMonth),
            duration: "1.0 Months",
            paymentMethod: "Pay Now",
            seatCount: 1
        });

        setIsRequestingWorkspace(true);
        try {
            setSelectedWorkspaceToBook(workspace);
            setIsBookingModalOpen(true);
        } finally {
            setIsRequestingWorkspace(false);
        }
    };

    const handleConfirmedBooking = async () => {
        if (!selectedWorkspaceToBook) return;
        if (!bookingParams.startDate) {
            toast.error("Please select a start date");
            return;
        }
        if (!bookingParams.endDate) {
            toast.error("Please select an end date");
            return;
        }

        const allotmentStart = selectedWorkspaceToBook.allotmentStart ? new Date(selectedWorkspaceToBook.allotmentStart) : null;
        if (selectedWorkspaceToBook.allottedTo && allotmentStart && new Date() < allotmentStart) {
            const requestedStart = new Date(bookingParams.startDate);
            const requestedEnd = new Date(bookingParams.endDate);

            if (requestedStart >= allotmentStart) {
                toast.error(`This workspace is reserved from ${allotmentStart.toLocaleDateString()}. Please select an earlier date or a different workspace.`);
                return;
            }

            if (requestedEnd > allotmentStart) {
                toast.error(`Your request exceeds the availability of this space (Reserved from ${allotmentStart.toLocaleDateString()}). Please select an earlier end date.`);
                return;
            }
        }

        setIsRequesting(true);
        try {
            const requestData = {
                workspaceId: selectedWorkspaceToBook._id || (selectedWorkspaceToBook as any).id,
                workspaceName: selectedWorkspaceToBook.name,
                fullName: userInfo.name,
                email: userInfo.email,
                contactNumber: userInfo.mobile || userInfo.contactNumber || "",
                firmName: userInfo.organization || "",
                duration: bookingParams.duration,
                startDate: new Date(bookingParams.startDate),
                endDate: new Date(bookingParams.endDate),
                paymentMethod: (bookingParams as any).paymentMethod || "Pay Now",
                status: 'Awaiting Payment',
                seatCount: selectedWorkspaceToBook.type === "Open WorkStation" ? bookingParams.seatCount : 1
            };

            await (submitBookingRequest as any)(requestData);
            toast.success(`Booking request for ${selectedWorkspaceToBook.name} submitted successfully!`);
            setIsBookingModalOpen(false);

            // Refresh all dashboard data
            await loadDashboardData(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to submit request");
        } finally {
            setIsRequesting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse font-medium">Preparing your workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <Sidebar collapsible="offcanvas" className="shadow-xl">
                <SidebarHeader className="p-6 transition-all duration-300 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <img src={cohortimage.src} alt="Logo" className="w-52 rounded-full transition-all duration-300 group-data-[collapsible=icon]:w-8" />
                    </Link>
                </SidebarHeader>

                <SidebarContent className="px-3">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 px-3 pb-2 group-data-[collapsible=icon]:hidden">
                            Main Menu
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "dashboard"}
                                        onClick={() => changeView("dashboard")}
                                        className={`rounded-xl h-11 px-3 mb-1 transition-all ${currentView === "dashboard" ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-primary/5"} group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2`}
                                    >
                                        <LayoutDashboard className="w-5 h-5 mr-3 group-data-[collapsible=icon]:mr-0" />
                                        <span className="font-semibold group-data-[collapsible=icon]:hidden">My Workspace</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "community"}
                                        onClick={() => changeView("community")}
                                        className={`rounded-xl h-11 px-3 mb-1 transition-all ${currentView === "community" ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-primary/5"} group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2`}
                                    >
                                        <Users className="w-5 h-5 mr-3 group-data-[collapsible=icon]:mr-0" />
                                        <span className="font-semibold group-data-[collapsible=icon]:hidden">Community</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "bookings"}
                                        onClick={() => changeView("bookings")}
                                        className={`rounded-xl h-11 px-3 mb-1 transition-all ${currentView === "bookings" ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-primary/5"} group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2`}
                                    >
                                        <CalendarCheck className="w-5 h-5 mr-3 group-data-[collapsible=icon]:mr-0" />
                                        <span className="font-semibold group-data-[collapsible=icon]:hidden">My Bookings</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "agreements"}
                                        onClick={() => changeView("agreements")}
                                        className={`rounded-xl h-11 px-3 mb-1 transition-all ${currentView === "agreements" ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-primary/5"} group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2`}
                                    >
                                        <FileText className="w-5 h-5 mr-3 group-data-[collapsible=icon]:mr-0" />
                                        <span className="font-semibold group-data-[collapsible=icon]:hidden">My Agreement</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup className="mt-4">
                        <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 px-3 pb-2 group-data-[collapsible=icon]:hidden">
                            Settings
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={currentView === "profile"}
                                        onClick={() => changeView("profile")}
                                        className={`rounded-xl h-11 px-3 mb-1 transition-all ${currentView === "profile" ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-primary/5"} group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2`}
                                    >
                                        <UserIcon className="w-5 h-5 mr-3 group-data-[collapsible=icon]:mr-0" />
                                        <span className="font-semibold group-data-[collapsible=icon]:hidden">My Profile</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup className="mt-auto border-t border-border/50 pt-4">
                        <SidebarGroupContent>
                            <div className="bg-muted/50 p-2 rounded-2xl mb-2 mx-1 border border-border/50 flex items-center transition-all duration-300 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:justify-center">
                                <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
                                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs shadow-inner shrink-0 transition-transform group-hover:scale-105">
                                        {(userInfo?.name || "U").split(" ").map((n: string) => n[0]).join("")}
                                    </div>
                                    <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                                        <span className="font-bold text-sm truncate">{userInfo?.name}</span>
                                        <span className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-tight">{userInfo?.role}</span>
                                    </div>
                                </div>
                            </div>
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

            <SidebarInset className="flex flex-col flex-1 overflow-hidden overflow-x-hidden bg-muted/30">
                <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger />
                        <div className="h-4 w-px bg-border/60 mx-2" />
                        <h1 className="text-xl font-bold tracking-tight capitalize">
                            {currentView === "dashboard" ? "Workplace Portal" :
                                currentView === "workspace-details" ? "Space Configuration" :
                                    currentView === "bookings" ? "My Bookings" :
                                        currentView}
                        </h1>
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
                                        <div className="flex flex-col">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Activity Center</h4>
                                            {unreadCount > 0 ? (
                                                <span className="text-[9px] font-bold text-muted-foreground mt-0.5">{unreadCount} unread alerts</span>
                                            ) : (
                                                <span className="text-[9px] font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> All Clear
                                                </span>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all border border-primary/20"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAllAsRead();
                                                }}
                                            >
                                                Mark All Read
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <ScrollArea className="h-[400px]">
                                    {userNotifications.length > 0 ? (
                                        <div className="flex flex-col">
                                            {userNotifications.map((notif: any) => (
                                                <button
                                                    key={notif.id}
                                                    className={`flex items-start gap-4 p-4 hover:bg-muted/50 border-b border-border/50 last:border-0 transition-all text-left w-full group ${notif.isRead ? 'bg-transparent' : 'bg-primary/5'}`}
                                                    onClick={() => {
                                                        markAsRead(notif.id);
                                                        changeView("community");
                                                    }}
                                                >
                                                    <div className={`mt-1 p-2 rounded-xl transition-transform group-hover:scale-110 ${notif.isRead ? 'bg-muted/50 text-muted-foreground' : `bg-primary/10 ${notif.color}`}`}>
                                                        <notif.icon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse" />}
                                                                <p className={`text-[11px] font-black uppercase tracking-tight truncate ${notif.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>{notif.title}</p>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap px-1">
                                                                {formatDistanceToNow(new Date(notif.date), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className={`text-xs font-bold truncate italic ${notif.isRead ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>{notif.subtitle}</p>
                                                        <div className="flex items-center gap-2 mt-2">
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
                                            <p className="text-xs font-black uppercase tracking-widest opacity-40">No new activity</p>
                                        </div>
                                    )}
                                </ScrollArea>
                                <div className="p-2 border-t border-border/50 bg-muted/10">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 hover:text-primary transition-all h-10 rounded-xl"
                                        onClick={() => changeView("community")}
                                    >
                                        View Community Feed
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 space-y-8 animate-fade-in custom-scrollbar">
                    {currentView === "dashboard" && (
                        <div className="space-y-10 max-w-6xl mx-auto">
                            {/* Welcome Header */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                                <div className="space-y-2">
                                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight italic">
                                        Welcome back, <span className="text-primary">{userInfo?.name?.split(" ")[0]}!</span>
                                    </h2>
                                    <p className="text-muted-foreground font-medium flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                                        <Sparkles className="w-4 h-4 sm:w-5 h-5 text-primary animate-pulse" />
                                        Here's what's happening in your COMS ecosystem today.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-2xl sm:rounded-[2rem] border border-border/50 shadow-sm pr-4 sm:pr-6 w-fit">
                                    <div className="w-10 h-10 sm:w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-inner">
                                        <Clock className="w-5 h-5 sm:w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Portal Time</span>
                                        <span className="text-sm font-black italic">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                {[
                                    { label: "My Spaces", value: myWorkspaces.length > 0 ? `${myWorkspaces.length} Active` : "None", icon: Building2, color: "text-primary", bg: "bg-primary/10", activeBg: "group-hover:bg-primary" },
                                    { label: "Open Requests", value: myRequests.filter(r => r.status === 'Pending').length, icon: Ticket, color: "text-amber-500", bg: "bg-amber-500/10", activeBg: "group-hover:bg-amber-500" },
                                    { label: "Pending Dues", value: invoices.filter(i => i.status === 'Pending').length, icon: Calendar, color: "text-rose-500", bg: "bg-rose-500/10", activeBg: "group-hover:bg-rose-500" },
                                    { label: "Neighbor Hub", value: community.length + " Members", icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10", activeBg: "group-hover:bg-indigo-500" }
                                ].map((stat, i) => (
                                    <div key={i} className="group p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-card border border-border/50 shadow-soft hover:shadow-xl transition-all duration-300 cursor-default">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 transition-all duration-500 ${stat.activeBg} group-hover:text-white group-hover:rotate-12`}>
                                            <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{stat.label}</p>
                                        <h4 className="text-xl sm:text-2xl font-black italic truncate">{stat.value}</h4>
                                    </div>
                                ))}
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                <div className="lg:col-span-2 space-y-8">
                                    {myWorkspaces.length > 0 || upcomingWorkspaces.length > 0 ? (
                                        <div className="space-y-8">
                                            {myWorkspaces.map((ws: Workspace) => (
                                                <div key={String(ws._id || ws.id)} className="relative group overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-border/50 shadow-2xl transition-all hover:shadow-primary/10">
                                                    <div className="aspect-video sm:aspect-[21/10] w-full relative">
                                                        <img
                                                            src={ws.image || DEFAULT_WORKSPACE_IMAGE}
                                                            alt={ws.name}
                                                            className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                                        <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 text-white">
                                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                                                <Badge className="bg-primary/90 backdrop-blur-md text-white border-none px-3 sm:px-4 py-1 sm:py-1.5 font-black uppercase tracking-widest text-[9px] sm:text-[10px]">Active Workplace</Badge>
                                                                <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-500/30">
                                                                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-400">Secured</span>
                                                                </div>
                                                            </div>
                                                            <h2 className="text-3xl sm:text-4xl font-black lg:text-5xl italic tracking-tight mb-2">{ws.name}</h2>
                                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-[10px] sm:text-sm font-bold uppercase tracking-widest bg-white/5 backdrop-blur-sm w-fit px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-white/10">
                                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                                    <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary" />
                                                                    {ws.location}
                                                                </div>
                                                                <div className="hidden sm:block w-px h-4 bg-white/20" />
                                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                                    <Layers className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary" />
                                                                    {ws.floor}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-card p-6 sm:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Plan Type</p>
                                                            <div className="font-bold text-lg flex items-center gap-2">
                                                                <Building2 className="w-4 h-4 text-primary" />
                                                                {ws.type}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">
                                                                {ws.type === "Open WorkStation" ? "My Booking" : "Capacity"}
                                                            </p>
                                                            <div className="font-bold text-lg flex items-center gap-2">
                                                                <Users className="w-4 h-4 text-primary" />
                                                                {ws.type === "Open WorkStation" ? (
                                                                    <div className="flex flex-col">
                                                                        <div className="flex items-baseline gap-1.5">
                                                                            <span className="text-primary text-2xl font-black italic">{(ws as any).bookedSeats || 1}</span>
                                                                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">Seats Secured</span>
                                                                        </div>
                                                                        <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-tighter mt-1">
                                                                            {ws.availableSeats ?? 0} available in hub
                                                                        </p>
                                                                    </div>
                                                                ) : ws.capacity}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Membership</p>
                                                            <div className="font-bold text-lg flex items-center gap-2 text-emerald-600">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                Premium
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                                                            <Button
                                                                size="lg"
                                                                className="w-full sm:w-auto rounded-xl sm:rounded-2xl gap-2 font-black italic shadow-xl shadow-primary/20 group/btn transition-all hover:scale-[1.05]"
                                                                onClick={() => changeView("workspace-details", String(ws._id || ws.id))}
                                                            >
                                                                Space HUB <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {upcomingWorkspaces.map((ws: Workspace) => {
                                                const daysUntilActive = ws.allotmentStart
                                                    ? Math.max(0, Math.ceil((new Date(ws.allotmentStart).getTime() - Date.now()) / 86400000))
                                                    : null;

                                                return (
                                                    <div key={String(ws._id || ws.id)} className="relative group overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-border/50 shadow-2xl transition-all hover:shadow-primary/10">
                                                        <div className="aspect-video sm:aspect-[21/10] w-full relative">
                                                            <img
                                                                src={ws.image || DEFAULT_WORKSPACE_IMAGE}
                                                                alt={ws.name}
                                                                className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                                            <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 text-white">
                                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                                                    <Badge className="bg-amber-500 text-black border-none px-3 py-1 font-black uppercase tracking-widest text-[10px] animate-pulse">
                                                                        ⏳ Pre-Booked
                                                                    </Badge>
                                                                    <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-md px-2.5 sm:px-3 py-1.5 sm:py-1.5 rounded-full border border-amber-500/30">
                                                                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-amber-500 animate-pulse" />
                                                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-400">Reserved</span>
                                                                    </div>
                                                                    {ws.allotmentStart && new Date(ws.allotmentStart) > new Date() && (
                                                                        <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-md px-2.5 sm:px-3 py-1.5 sm:py-1.5 rounded-full border border-amber-500/30">
                                                                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                                                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-400">Available Until {new Date(new Date(ws.allotmentStart).getTime() - 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <h2 className="text-3xl sm:text-4xl font-black lg:text-5xl italic tracking-tight mb-2">{ws.name}</h2>
                                                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-[10px] sm:text-sm font-bold uppercase tracking-widest bg-white/5 backdrop-blur-sm w-fit px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-white/10">
                                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                                        <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary" />
                                                                        {ws.location}
                                                                    </div>
                                                                    <div className="hidden sm:block w-px h-4 bg-white/20" />
                                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                                        <Layers className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary" />
                                                                        {ws.floor}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-card p-6 sm:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Plan Type</p>
                                                                <div className="font-bold text-lg flex items-center gap-2">
                                                                    <Building2 className="w-4 h-4 text-primary" />
                                                                    {ws.type}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">
                                                                    {ws.type === "Open WorkStation" ? "My Booking" : "Capacity"}
                                                                </p>
                                                                <div className="font-bold text-lg flex items-center gap-2">
                                                                    <Users className="w-4 h-4 text-primary" />
                                                                    {ws.type === "Open WorkStation" ? (
                                                                        <div className="flex flex-col">
                                                                            <div className="flex items-baseline gap-1.5">
                                                                                <span className="text-primary text-2xl font-black italic">{(ws as any).bookedSeats || 1}</span>
                                                                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">Seats Secured</span>
                                                                            </div>
                                                                            <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-tighter mt-1">
                                                                                {ws.availableSeats ?? 0} available in hub
                                                                            </p>
                                                                        </div>
                                                                    ) : ws.capacity}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] uppercase tracking-widest text-amber-600 font-black">Starts On</p>
                                                                <div className="flex flex-col">
                                                                    <div className="font-bold text-lg flex items-center gap-2">
                                                                        <Calendar className="w-4 h-4 text-amber-500" />
                                                                        {ws.allotmentStart
                                                                            ? new Date(ws.allotmentStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                                                            : 'Scheduled'}
                                                                    </div>
                                                                    {daysUntilActive !== null && (
                                                                        <p className="text-[9px] text-amber-600/80 font-black uppercase tracking-widest mt-1">
                                                                            {daysUntilActive} Days Left
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                                                                <Button
                                                                    size="lg"
                                                                    className="w-full sm:w-auto rounded-xl sm:rounded-2xl gap-2 font-black italic shadow-xl shadow-primary/20 group/btn transition-all hover:scale-[1.05]"
                                                                    onClick={() => changeView("workspace-details", String(ws._id || ws.id))}
                                                                >
                                                                    Space HUB <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="bg-card rounded-2xl sm:rounded-[3rem] p-8 sm:p-16 text-center border border-border/50 shadow-xl space-y-6 sm:space-y-8 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 -rotate-12 transition-transform group-hover:scale-110 duration-700">
                                                <Building2 className="w-48 sm:w-64 h-48 sm:h-64" />
                                            </div>
                                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary/5 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto ring-1 ring-primary/20 mb-4 transition-transform group-hover:rotate-6">
                                                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                                            </div>
                                            <div className="space-y-4 relative z-10">
                                                <h3 className="text-2xl sm:text-4xl font-black italic tracking-tight">Ready to find your desk?</h3>
                                                <p className="text-muted-foreground max-w-md mx-auto font-medium text-sm sm:text-lg leading-relaxed px-4">
                                                    You haven't been assigned a primary workspace yet. Experience premium infrastructure designed for your peak performance.
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 relative z-10 w-full max-w-sm mx-auto sm:max-w-none">
                                                <Button size="lg" className="w-full sm:w-auto rounded-xl sm:rounded-2xl px-10 font-black italic shadow-2xl shadow-primary/20 h-14" onClick={() => changeView("bookings")}>
                                                    Explore Spaces
                                                </Button>
                                                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl sm:rounded-2xl px-10 font-black h-14" asChild>
                                                    <Link href="/contact">Chat with Admin</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent Activity Mini-Feed */}
                                    <div className="bg-card rounded-2xl sm:rounded-[2.5rem] border border-border/50 shadow-soft p-6 sm:p-10 space-y-6 sm:space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                                    <TrendingUp className="w-4 h-4 sm:w-5 h-5" />
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-black italic">Recent Activity</h3>
                                            </div>
                                            <Button variant="ghost" className="h-8 sm:h-10 rounded-xl text-primary font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-primary/5" onClick={() => changeView("community")}>
                                                View All
                                            </Button>
                                        </div>
                                        <div className="space-y-6">
                                            {posts.slice(0, 3).map((post, i) => (
                                                <div key={i} className="flex gap-6 items-start group">
                                                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                                        {(post.authorName || "C").split(" ").map((n: string) => n[0]).join("")}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-black text-sm">{post.authorName} <span className="text-muted-foreground font-medium ml-1">posted a story</span></h4>
                                                            <span className="text-[10px] font-bold text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-1 font-medium italic">"{post.content}"</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {posts.length === 0 && (
                                                <p className="text-center py-8 text-muted-foreground italic font-medium">No community activity yet. Be the first to post!</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">

                                    {/* Dynamic Ad/CTA Card */}
                                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white rounded-2xl sm:rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110 duration-700">
                                            <TrendingUp className="w-32 h-32 rotate-12" />
                                        </div>
                                        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />

                                        <div className="relative z-10 space-y-6">
                                            <Badge className="bg-white/10 text-white border-white/20 font-black text-[9px] uppercase tracking-widest">Growth Engine</Badge>
                                            <div className="space-y-3">
                                                <h3 className="text-2xl font-black italic leading-tight">Scale Your Vision.</h3>
                                                <p className="text-sm text-slate-400 font-medium leading-relaxed">Upgrade to a private office suite as your team grows. Dedicated infrastructure for serious expansion.</p>
                                            </div>
                                            <Button
                                                size="lg"
                                                className="w-full bg-primary hover:bg-primary/90 text-white border-none rounded-2xl font-black italic shadow-2xl shadow-primary/40 h-14"
                                                onClick={() => changeView("bookings")}
                                            >
                                                View Premium Tiers
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentView === "workspace-details" && selectedWorkspace && (
                        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid lg:grid-cols-5 gap-8">
                                {/* Left Column: Image & Primary Info */}
                                <div className="lg:col-span-3 space-y-6">
                                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl group border border-border/50">
                                        <img
                                            src={selectedWorkspace.image || DEFAULT_WORKSPACE_IMAGE}
                                            alt={selectedWorkspace.name}
                                            className="w-full aspect-video object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between text-white">
                                            <div>
                                                <h2 className="text-3xl font-black">{selectedWorkspace.name}</h2>
                                                <p className="flex items-center gap-2 opacity-80 text-sm font-medium mt-1">
                                                    <MapPin className="w-4 h-4" /> {selectedWorkspace.location} • {selectedWorkspace.floor}
                                                </p>
                                            </div>
                                            <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-4 py-1.5 rounded-xl font-bold">
                                                ID: #{selectedWorkspace._id?.substring(0, 6).toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="bg-card rounded-[2rem] p-8 border border-border/50 shadow-soft">
                                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                            <Layers className="w-5 h-5 text-primary" /> Space Breakdown
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 transition-all hover:bg-muted/50">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Type</p>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-primary" />
                                                    <p className="font-bold text-foreground">{selectedWorkspace.type}</p>
                                                </div>
                                            </div>
                                            <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 transition-all hover:bg-muted/50">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">
                                                    {selectedWorkspace.type === "Open WorkStation" ? "Capacity" : "Workstations"}
                                                </p>
                                                <div className="font-bold text-foreground flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-primary shrink-0" />
                                                    {selectedWorkspace.type === "Open WorkStation"
                                                        ? (
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className="text-primary text-2xl font-black italic leading-none">{selectedWorkspace.availableSeats ?? 0}</span>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">/ {selectedWorkspace.totalSeats ?? 0}</span>
                                                                    <span className="text-[8px] text-primary/60 font-black uppercase tracking-tighter leading-none mt-1">Seats Available</span>
                                                                </div>
                                                            </div>
                                                        )
                                                        : <span className="text-lg">{selectedWorkspace.features?.workstationSeats || "0"} Seats</span>}
                                                </div>
                                            </div>
                                            {selectedWorkspace.features?.hasConferenceHall && (
                                                <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 transition-all hover:bg-muted/50">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Conference</p>
                                                    <p className="font-bold text-foreground">{selectedWorkspace.features?.conferenceHallSeats || "Managed"} Seats</p>
                                                </div>
                                            )}
                                            {selectedWorkspace.features?.hasCabin && (
                                                <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 transition-all hover:bg-muted/50">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Cabins</p>
                                                    <p className="font-bold text-foreground">{selectedWorkspace.features?.cabinSeats || "Managed"} Units</p>
                                                </div>
                                            )}
                                            <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 transition-all hover:bg-muted/50">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">
                                                    {selectedWorkspace.type === "Open WorkStation" ? "Total Setup" : "Max Load"}
                                                </p>
                                                <div className="font-bold text-foreground flex items-center gap-2">
                                                    <Layers className="w-4 h-4 text-primary" />
                                                    <p>
                                                        {selectedWorkspace.type === "Open WorkStation"
                                                            ? `${selectedWorkspace.totalSeats ?? 0} Seats`
                                                            : selectedWorkspace.capacity}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Amenities & Period */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-card rounded-[2rem] p-8 border border-border/50 shadow-soft h-full">
                                        <div className="space-y-8">
                                            {(myWorkspaces.some(ws => String(ws._id || ws.id) === String(selectedWorkspace?._id || selectedWorkspace?.id)) ||
                                                upcomingWorkspaces.some(ws => String(ws._id || ws.id) === String(selectedWorkspace?._id || selectedWorkspace?.id))) ? (
                                                <div>
                                                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                                        <Clock className="w-5 h-5 text-primary" /> Booking Period
                                                    </h3>
                                                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                                                        <p className="text-sm font-bold text-primary">Status: Active Subscription</p>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            Enjoy uninterrupted access to your premium office suite.
                                                            {selectedWorkspace.unavailableUntil ? (
                                                                <span className="block mt-2 font-black text-foreground">
                                                                    Subscription Valid Till: {new Date(selectedWorkspace.unavailableUntil).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                                </span>
                                                            ) : (
                                                                <span className="block mt-2 font-black text-foreground">Renewed Monthly via Corporate Billing</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                                        <Sparkles className="w-5 h-5 text-primary" /> Availability
                                                    </h3>
                                                    <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                                                        <p className="text-sm font-bold text-emerald-600">Status: {selectedWorkspace.allottedTo ? 'Currently Occupied' : 'Available for Booking'}</p>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            This premium workspace is currently {selectedWorkspace.allottedTo ? 'in use' : 'open for new members'}.
                                                            Contact support for custom configurations.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                                    <ShieldCheck className="w-5 h-5 text-primary" /> Included Amenities
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedWorkspace.amenities?.map((amenity, i) => (
                                                        <Badge key={i} variant="secondary" className="bg-background border border-border/50 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                                                            {amenity}
                                                        </Badge>
                                                    ))}
                                                    {(!selectedWorkspace.amenities || selectedWorkspace.amenities.length === 0) && (
                                                        <p className="text-sm text-muted-foreground italic">Standard utility package included.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-4 space-y-3">
                                                {selectedWorkspace && !myWorkspaces.some(ws => String(ws._id || ws.id) === String(selectedWorkspace?._id || selectedWorkspace?.id)) && !selectedWorkspace.allottedTo && (
                                                    <Button
                                                        className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                        onClick={() => handleRequestWorkspace(selectedWorkspace)}
                                                        disabled={isRequestingWorkspace}
                                                    >
                                                        {isRequestingWorkspace ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                        Request Booking
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-12 rounded-xl font-bold"
                                                    onClick={() => {
                                                        const isMySpace = selectedWorkspace && (
                                                            myWorkspaces.some(ws => String(ws._id || ws.id) === String(selectedWorkspace._id || selectedWorkspace.id)) ||
                                                            upcomingWorkspaces.some(ws => String(ws._id || ws.id) === String(selectedWorkspace._id || selectedWorkspace.id))
                                                        );
                                                        changeView(isMySpace ? "dashboard" : "bookings");
                                                    }}
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentView === "community" && (
                        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Page Header */}
                            <div className="relative rounded-[2rem] overflow-hidden border border-border/50">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/5" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.08),transparent_60%)]" />
                                <div className="relative px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30">
                                                <Users className="w-4.5 h-4.5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Ecosystem Network</span>
                                        </div>
                                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Community Hub</h2>
                                        <p className="text-muted-foreground text-sm font-medium max-w-lg leading-relaxed">
                                            Connect with <span className="text-foreground font-semibold">fellow innovators</span>, share stories, and grow together within the COMS network.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-center px-5 py-3 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/50">
                                            <p className="text-2xl font-black text-primary">{community.length}</p>
                                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Members</p>
                                        </div>
                                        <div className="text-center px-5 py-3 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/50">
                                            <p className="text-2xl font-black text-emerald-500">{posts.length}</p>
                                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Stories</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Tabs value={communityTab} onValueChange={(val: any) => setCommunityTab(val)} className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <TabsList className="bg-muted/40 p-1 rounded-xl border border-border/40 h-10">
                                        <TabsTrigger
                                            value="stories"
                                            className="rounded-lg px-5 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
                                        >
                                            Stories
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="members"
                                            className="rounded-lg px-5 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
                                        >
                                            Members
                                        </TabsTrigger>
                                    </TabsList>
                                    {activeHashtag && (
                                        <button
                                            onClick={() => setActiveHashtag(null)}
                                            className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-all"
                                        >
                                            <X className="w-3 h-3" /> {activeHashtag}
                                        </button>
                                    )}
                                </div>

                                <TabsContent value="stories" className="space-y-0 mt-0 border-none p-0 focus-visible:outline-none">
                                    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                                        <div className="space-y-5">
                                            {/* Create Post Box */}
                                            <div className="bg-card rounded-2xl p-5 border border-border/60 shadow-sm">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-white text-sm shadow-md shrink-0">
                                                        {(userInfo?.name || "U")[0]}
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <textarea
                                                            placeholder={`Share something with the community, ${userInfo?.name?.split(' ')[0] || 'there'}...`}
                                                            className="w-full bg-muted/30 rounded-xl border border-border/50 focus:border-primary/30 focus:ring-0 text-sm font-medium placeholder:text-muted-foreground/50 resize-none min-h-[90px] p-3 outline-none transition-all"
                                                            value={newPostContent}
                                                            onChange={(e) => setNewPostContent(e.target.value)}
                                                        />
                                                        <div className="flex items-center justify-end">
                                                            <Button
                                                                onClick={handleCreatePost}
                                                                disabled={isPosting || !newPostContent.trim()}
                                                                size="sm"
                                                                className="rounded-xl font-bold text-xs px-5 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all"
                                                            >
                                                                {isPosting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Send className="w-3 h-3 mr-1.5" />Post</>}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Posts Feed */}
                                            <div className="space-y-4">
                                                {posts.length === 0 ? (
                                                    <div className="bg-card rounded-2xl p-16 text-center space-y-4 border border-border/50 border-dashed">
                                                        <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto text-muted-foreground">
                                                            <MessageSquare className="w-8 h-8" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold">No stories yet</h3>
                                                            <p className="text-muted-foreground text-sm mt-1">Be the first to share something with the community.</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    posts
                                                        .filter(p => !activeHashtag || p.content.toLowerCase().includes(activeHashtag.toLowerCase()))
                                                        .map(post => (
                                                            <div key={post._id} className="bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group/card">
                                                                <div className="p-5 space-y-4">
                                                                    {/* Post Header */}
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="relative">
                                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary text-sm">
                                                                                    {post.authorName ? post.authorName[0] : "U"}
                                                                                </div>
                                                                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-sm leading-tight">{post.authorName}</p>
                                                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                                    <Clock className="w-2.5 h-2.5" />
                                                                                    {new Date(post.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        {isAuth(post.author, userInfo?._id) && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 rounded-lg text-muted-foreground opacity-0 group-hover/card:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                                                                                onClick={() => { setPostToDelete(post._id); setIsDeleteDialogOpen(true); }}
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </Button>
                                                                        )}
                                                                    </div>

                                                                    {/* Post Content */}
                                                                    <p className="text-sm leading-relaxed text-foreground/90">
                                                                        {post.content.split(' ').map((word: string, wi: number) =>
                                                                            word.startsWith('#') ? (
                                                                                <button key={wi} className="text-primary font-semibold hover:underline" onClick={() => setActiveHashtag(activeHashtag === word ? null : word)}>{word} </button>
                                                                            ) : <span key={wi}>{word} </span>
                                                                        )}
                                                                    </p>

                                                                    {/* Actions */}
                                                                    <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className={`rounded-lg h-8 px-3 text-xs font-semibold gap-1.5 transition-all ${post.upvotes.includes(userInfo?._id)
                                                                                ? "bg-primary/10 text-primary"
                                                                                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                                                                }`}
                                                                            onClick={() => handleUpvotePost(post._id)}
                                                                        >
                                                                            <Zap className={`w-3.5 h-3.5 ${post.upvotes.includes(userInfo?._id) ? "fill-current" : ""}`} />
                                                                            {post.upvotes.length > 0 && post.upvotes.length} Vibe
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="rounded-lg h-8 px-3 text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                                                                        >
                                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                                            {post.comments.length > 0 && post.comments.length} Reply
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all ml-auto"
                                                                            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/community?post=${post._id}`); toast.success("Link copied!"); }}
                                                                        >
                                                                            <Share2 className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                    </div>

                                                                    {/* Comments */}
                                                                    {post.comments.length > 0 && (
                                                                        <div className="space-y-3 pt-3 border-t border-border/30">
                                                                            {post.comments.map(comment => (
                                                                                <div key={comment._id} className="flex gap-3 group/comment">
                                                                                    <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                                                                        {comment.userName ? comment.userName[0] : "U"}
                                                                                    </div>
                                                                                    <div className="flex-1 bg-muted/30 rounded-xl p-3 space-y-1">
                                                                                        <div className="flex items-center justify-between">
                                                                                            <span className="text-xs font-bold">{comment.userName}</span>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                                                                {isAuth(comment.user, userInfo?._id) && (
                                                                                                    <button className="opacity-0 group-hover/comment:opacity-100 text-muted-foreground hover:text-destructive transition-all" onClick={() => { setCommentToDelete({ postId: post._id, commentId: comment._id }); setIsCommentDeleteDialogOpen(true); }}>
                                                                                                        <Trash2 className="w-3 h-3" />
                                                                                                    </button>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                        <p className="text-xs text-muted-foreground leading-relaxed">{comment.text}</p>
                                                                                        <div className="flex items-center gap-3 pt-1">
                                                                                            <button className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors" onClick={() => setActiveReplyBox(activeReplyBox === comment._id ? null : comment._id)}>Reply</button>
                                                                                        </div>
                                                                                        {activeReplyBox === comment._id && (
                                                                                            <div className="flex gap-2 pt-2">
                                                                                                <Input
                                                                                                    placeholder="Write a reply..."
                                                                                                    className="text-xs h-8 rounded-lg bg-background border-border/50"
                                                                                                    value={replyTexts[comment._id] || ""}
                                                                                                    onChange={(e) => setReplyTexts({ ...replyTexts, [comment._id]: e.target.value })}
                                                                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddReply(post._id, comment._id)}
                                                                                                />
                                                                                                <Button size="icon" className="h-8 w-8 rounded-lg shrink-0" onClick={() => handleAddReply(post._id, comment._id)} disabled={submittingReplyCommentId === comment._id || !replyTexts[comment._id]?.trim()}>
                                                                                                    {submittingReplyCommentId === comment._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                                                                                </Button>
                                                                                            </div>
                                                                                        )}
                                                                                        {comment.replies && comment.replies.length > 0 && (
                                                                                            <div className="pt-2 space-y-2 pl-3 border-l-2 border-border/20">
                                                                                                {comment.replies.map((reply: any) => (
                                                                                                    <div key={reply._id} className="flex gap-2 group/reply">
                                                                                                        <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">{reply.userName?.[0] || "U"}</div>
                                                                                                        <div className="flex-1">
                                                                                                            <div className="flex items-center justify-between">
                                                                                                                <p className="text-[10px] font-bold">{reply.userName}</p>
                                                                                                                {isAuth(reply.user, userInfo?._id) && (
                                                                                                                    <button
                                                                                                                        className="opacity-0 group-hover/reply:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                                                                                                        onClick={() => { setReplyToDelete({ postId: post._id, commentId: comment._id, replyId: reply._id }); setIsReplyDeleteDialogOpen(true); }}
                                                                                                                    >
                                                                                                                        <Trash2 className="w-3 h-3" />
                                                                                                                    </button>
                                                                                                                )}
                                                                                                            </div>
                                                                                                            <p className="text-[10px] text-muted-foreground">{reply.text || reply.content}</p>

                                                                                                            {/* Sub-replies rendering */}
                                                                                                            {reply.replies && reply.replies.length > 0 && (
                                                                                                                <div className="mt-2 space-y-2 pl-2 border-l border-border/20">
                                                                                                                    {reply.replies.map((subReply: any) => (
                                                                                                                        <div key={subReply._id} className="flex gap-2 group/subreply">
                                                                                                                            <div className="w-5 h-5 rounded-md bg-muted/70 flex items-center justify-center font-bold text-[8px] shrink-0 mt-0.5">{subReply.userName?.[0] || "U"}</div>
                                                                                                                            <div className="flex-1">
                                                                                                                                <div className="flex items-center justify-between">
                                                                                                                                    <p className="text-[9px] font-bold">{subReply.userName}</p>
                                                                                                                                    {isAuth(subReply.user, userInfo?._id) && (
                                                                                                                                        <button
                                                                                                                                            className="opacity-0 group-hover/subreply:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                                                                                                                            onClick={() => { setReplyToDelete({ postId: post._id, commentId: comment._id, replyId: subReply._id }); setIsReplyDeleteDialogOpen(true); }}
                                                                                                                                        >
                                                                                                                                            <Trash2 className="w-2.5 h-2.5" />
                                                                                                                                        </button>
                                                                                                                                    )}
                                                                                                                                </div>
                                                                                                                                <p className="text-[9px] text-muted-foreground">{subReply.text || subReply.content}</p>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    ))}
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Add Comment */}
                                                                    <div className="flex gap-2 items-center">
                                                                        <Input
                                                                            placeholder="Add a comment..."
                                                                            className="text-xs h-9 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                                                                            value={commentTexts[post._id] || ""}
                                                                            onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                                                                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                                                        />
                                                                        <Button size="icon" className="h-9 w-9 rounded-xl shrink-0" onClick={() => handleAddComment(post._id)} disabled={submittingCommentPostId === post._id || !commentTexts[post._id]?.trim()}>
                                                                            {submittingCommentPostId === post._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Sidebar */}
                                        <div className="space-y-5">
                                            {/* Community Stats */}
                                            <div className="bg-card rounded-2xl p-5 border border-border/60 shadow-sm space-y-4">
                                                <h3 className="text-sm font-bold">Community Pulse</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Live</p>
                                                        </div>
                                                        <p className="text-2xl font-black text-primary">{community.length}</p>
                                                        <p className="text-[9px] text-muted-foreground">members active</p>
                                                    </div>
                                                    <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/10">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <div className="flex items-end gap-0.5 h-3">
                                                                {[40, 70, 45, 90, 65].map((h, i) => <div key={i} className="w-0.5 bg-emerald-500/40 rounded-full" style={{ height: `${h}%` }} />)}
                                                            </div>
                                                        </div>
                                                        <p className="text-2xl font-black text-emerald-600">{posts.length}</p>
                                                        <p className="text-[9px] text-muted-foreground">stories shared</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Trending Tags */}
                                            <div className="bg-card rounded-2xl p-5 border border-border/60 shadow-sm space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                                    <h3 className="text-sm font-bold">Trending</h3>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {["#Innovation", "#Networking", "#Design", "#Tech", "#Growth"].map((tag) => (
                                                        <button
                                                            key={tag}
                                                            onClick={() => setActiveHashtag(activeHashtag === tag ? null : tag)}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${activeHashtag === tag
                                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                                : "bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                                                }`}
                                                        >
                                                            {tag}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Elite Networking CTA */}
                                            <div className="rounded-2xl overflow-hidden relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950" />
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
                                                <div className="relative p-5 space-y-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                                                        <Trophy className="w-5 h-5 text-amber-400" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <h4 className="text-white font-bold text-base">Elite Network</h4>
                                                        <p className="text-indigo-200/70 text-xs leading-relaxed">Connect with top professionals and industry leaders in the neighborhood.</p>
                                                    </div>
                                                    <Button
                                                        className="w-full bg-white text-indigo-950 hover:bg-white/90 rounded-xl font-bold text-xs h-9 transition-all hover:scale-[1.02]"
                                                        onClick={() => setCommunityTab("members")}
                                                    >
                                                        Explore Members <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="members" className="space-y-8 mt-0 border-none p-0 focus-visible:outline-none">
                                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8 pb-4 border-b border-border/10">
                                        <div className="relative w-full sm:max-w-md group">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <Input
                                                placeholder="Search members by name or role..."
                                                className="bg-muted/20 border-border/50 rounded-2xl pl-12 h-12 focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all font-medium"
                                                value={membersSearch}
                                                onChange={(e) => setMembersSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {community.filter(m =>
                                            (m.user?.name?.toLowerCase().includes(membersSearch.toLowerCase()) || m.user?.role?.toLowerCase().includes(membersSearch.toLowerCase())) &&
                                            (selectedRoleFilter === "All" || m.user?.role?.toLowerCase().includes(selectedRoleFilter.slice(0, -1).toLowerCase()))
                                        ).length === 0 ? (
                                            <div className="col-span-full card-elevated glass rounded-[2.5rem] p-24 text-center space-y-6 border border-dashed border-border/50">
                                                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground animate-pulse">
                                                    <Users className="w-10 h-10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-black italic">No matches found</h3>
                                                    <p className="text-muted-foreground text-sm font-medium">Try adjusting your search or filters to find what you're looking for.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            community
                                                .filter(m =>
                                                    (m.user?.name?.toLowerCase().includes(membersSearch.toLowerCase()) || m.user?.role?.toLowerCase().includes(membersSearch.toLowerCase())) &&
                                                    (selectedRoleFilter === "All" || m.user?.role?.toLowerCase().includes(selectedRoleFilter.slice(0, -1).toLowerCase()))
                                                )
                                                .map((member, i) => (
                                                    <div key={i} className="bg-card glass rounded-[2.5rem] p-8 space-y-8 flex flex-col group/member hover:shadow-2xl hover:scale-[1.02] transition-all duration-700 border border-border/50 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover/member:bg-primary/10 transition-colors" />

                                                        <div className="flex items-center gap-5 relative z-10">
                                                            <div className="relative group/avatar">
                                                                <div className={`w-24 h-24 rounded-[2rem] ${[
                                                                    'bg-gradient-to-tr from-primary/30 via-primary/10 to-accent/10',
                                                                    'bg-gradient-to-tr from-violet-500/30 via-violet-500/10 to-indigo-500/10',
                                                                    'bg-gradient-to-tr from-emerald-500/30 via-emerald-500/10 to-teal-500/10',
                                                                    'bg-gradient-to-tr from-rose-500/30 via-rose-500/10 to-orange-500/10',
                                                                    'bg-gradient-to-tr from-amber-500/30 via-amber-500/10 to-yellow-500/10',
                                                                    'bg-gradient-to-tr from-blue-500/30 via-blue-500/10 to-cyan-500/10',
                                                                ][i % 6]} flex items-center justify-center font-black text-primary text-3xl shadow-xl group-hover/member:rotate-6 transition-all duration-700 border border-primary/20 relative overflow-hidden`}>
                                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/member:opacity-100 transition-opacity" />
                                                                    {(member.user?.name || "U")[0]}
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-4 border-background rounded-full shadow-xl flex items-center justify-center">
                                                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h4 className="text-2xl font-black italic leading-tight group-hover/member:text-primary transition-colors tracking-tight">{member.user?.name}</h4>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg tracking-widest shadow-sm">
                                                                        Top Pro
                                                                    </Badge>
                                                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6 flex-1 relative z-10">
                                                            <div className="space-y-3 bg-muted/10 p-5 rounded-[2rem] border border-border/50 group-hover/member:bg-muted/30 transition-all">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 leading-none mb-2">Ecosystem Role</p>
                                                                <p className="text-sm font-bold text-foreground/80 leading-relaxed italic line-clamp-2 min-h-[2.5rem]">
                                                                    {member.user?.role || "Independent Professional Shaping the Future of the Ecosystem"}
                                                                </p>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2">
                                                                {(member.user?.skills?.length ? member.user.skills.slice(0, 3) : ["Strategy", "Scale", "Innovation"]).map((skill: string) => (
                                                                    <span key={skill} className="px-3 py-1 rounded-lg bg-muted/50 text-[9px] font-black uppercase text-muted-foreground tracking-widest group-hover/member:bg-primary/5 group-hover/member:text-primary transition-colors">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>

                                                            {(member.user?.organization || member.user?.email) && (
                                                                <div className="flex items-center gap-2 bg-muted/20 px-3 py-2 rounded-xl border border-border/40">
                                                                    {member.user?.organization && (
                                                                        <span className="text-[10px] font-bold text-muted-foreground truncate flex items-center gap-1.5">
                                                                            <Building2 className="w-3 h-3 shrink-0" /> {member.user.organization}
                                                                        </span>
                                                                    )}
                                                                    {member.user?.email && (
                                                                        <span className="text-[10px] font-bold text-muted-foreground truncate flex items-center gap-1.5 ml-auto">
                                                                            <Mail className="w-3 h-3 shrink-0" /> {member.user.email}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="pt-6 border-t border-border/10 flex items-center gap-3 relative z-10">
                                                            <Button
                                                                className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
                                                                onClick={() => {
                                                                    setSelectedMember(member.user);
                                                                    setIsContactModalOpen(true);
                                                                }}
                                                            >
                                                                Collaborate
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-12 w-12 rounded-2xl bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:rotate-12 transition-all"
                                                            >
                                                                <Activity className="w-5 h-5" />
                                                            </Button>
                                                        </div>

                                                        <div className="absolute bottom-6 right-8">
                                                            <p className="text-[8px] font-black uppercase text-muted-foreground/20 tracking-widest italic group-hover/member:text-primary/30 transition-colors">
                                                                Active {i % 2 === 0 ? "Now" : (i + 1) + "h ago"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}

                    {currentView === "bookings" && (
                        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-primary">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <CalendarCheck className="w-5 h-5 sm:w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Booking Center</h2>
                                    </div>
                                    <p className="text-muted-foreground font-medium max-w-xl">
                                        Explore premium workspaces across the COMS network and request access to expand your operations.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-xl sm:rounded-2xl border border-border/50 w-fit">
                                    <div className="flex flex-col items-end px-3 sm:px-4">
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Requests</span>
                                        <span className="text-lg sm:text-xl font-black text-primary">{myRequests.filter(r => r.status === 'Pending').length}</span>
                                    </div>
                                    <div className="w-px h-8 sm:h-10 bg-border/50" />
                                    <div className="flex flex-col items-end px-3 sm:px-4">
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest">Completed Bookings</span>
                                        <span className="text-lg sm:text-xl font-black text-emerald-600">{myRequests.filter(r => r.status === 'Completed').length}</span>
                                    </div>
                                </div>
                            </div>

                            <Tabs defaultValue="explore" className="w-full">
                                <TabsList className="bg-muted/50 p-1 rounded-xl sm:rounded-2xl mb-8 border border-border/50 w-full flex overflow-x-auto h-auto scrollbar-none justify-start sm:justify-center">
                                    <TabsTrigger value="explore" className="rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm whitespace-nowrap text-xs sm:text-sm">
                                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" /> Explore Spaces
                                    </TabsTrigger>
                                    <TabsTrigger value="my-requests" className="rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm whitespace-nowrap text-xs sm:text-sm">
                                        <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" /> My Requests
                                    </TabsTrigger>
                                    <TabsTrigger value="invoices" className="rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm whitespace-nowrap text-xs sm:text-sm">
                                        <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" /> Invoices & Payments
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="explore" className="mt-0 focus-visible:ring-0">
                                    {/* Workspace Filters */}
                                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                                        <div className="relative flex-1 group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                placeholder="Search workspaces by name or location..."
                                                className="pl-10 h-11 bg-muted/20 border-border/50 rounded-xl focus:ring-primary/20 transition-all font-medium"
                                                value={workspaceSearch}
                                                onChange={(e) => setWorkspaceSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <Select value={workspaceTypeFilter} onValueChange={setWorkspaceTypeFilter}>
                                                <SelectTrigger className="w-[180px] h-11 bg-muted/20 border-border/50 rounded-xl font-bold">
                                                    <div className="flex items-center gap-2">
                                                        <Layers className="w-3.5 h-3.5 text-primary" />
                                                        <SelectValue placeholder="Type" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border/50">
                                                    {workspaceTypes.map(type => (
                                                        <SelectItem key={type} value={type} className="font-medium rounded-lg">{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Select value={locationFilter} onValueChange={setLocationFilter}>
                                                <SelectTrigger className="w-[180px] h-11 bg-muted/20 border-border/50 rounded-xl font-bold">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                                        <SelectValue placeholder="Location" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border/50">
                                                    {locations.map(loc => (
                                                        <SelectItem key={loc} value={loc} className="font-medium rounded-lg">{loc}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {filteredWorkspaces.length === 0 ? (
                                        <div className="py-20 text-center space-y-6 card-elevated glass rounded-[2.5rem] border border-dashed border-border/50">
                                            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground animate-pulse">
                                                <Building2 className="w-10 h-10" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black italic">No workspaces found</h3>
                                                <p className="text-muted-foreground text-sm font-medium">Try adjusting your filters or search terms to find available spaces.</p>
                                                <Button
                                                    variant="ghost"
                                                    className="mt-4 text-primary font-bold hover:bg-primary/5"
                                                    onClick={() => {
                                                        setWorkspaceSearch("");
                                                        setWorkspaceTypeFilter("All");
                                                        setLocationFilter("All");
                                                    }}
                                                >
                                                    Reset all filters
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {filteredWorkspaces.map((ws) => {
                                            const now = new Date();
                                            const allotmentStart = ws.allotmentStart ? new Date(ws.allotmentStart) : null;
                                            const isUnavailable = ws.type === "Open WorkStation"
                                                ? (ws.availableSeats !== undefined ? ws.availableSeats <= 0 : false)
                                                : !!ws.allottedTo && (!allotmentStart || now >= allotmentStart);
                                            const availableUntil = !!ws.allottedTo && allotmentStart && now < allotmentStart ? allotmentStart : null;

                                            return (
                                                <div key={ws._id || ws.id} className={`card-elevated group overflow-hidden flex flex-col h-full transition-all duration-500 ${isUnavailable ? 'grayscale opacity-80' : ''}`}>
                                                    <div className="relative h-56 overflow-hidden">
                                                        <img
                                                            src={ws.image || DEFAULT_WORKSPACE_IMAGE}
                                                            alt={ws.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        {ws.featured && !isUnavailable && (
                                                            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-lg">
                                                                Featured
                                                            </div>
                                                        )}
                                                        {isUnavailable && (
                                                            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-destructive text-white text-[10px] font-black uppercase tracking-[0.1em] shadow-xl animate-pulse flex items-center gap-1.5 ring-4 ring-destructive/20">
                                                                <Clock className="w-3 h-3" />
                                                                {ws.type === "Open WorkStation" && ws.availableSeats !== undefined && ws.availableSeats <= 0 ? "Fully Booked" : "Unavailable"}
                                                            </div>
                                                        )}
                                                        {availableUntil && (
                                                            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.1em] shadow-xl flex items-center gap-1.5 ring-4 ring-amber-500/20">
                                                                <Clock className="w-3 h-3" />
                                                                Available Until {new Date(availableUntil.getTime() - 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-6 flex-1 flex flex-col">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-xs font-bold text-primary uppercase tracking-widest">{ws.type}</span>
                                                            <span className="text-sm font-semibold text-foreground">
                                                                {ws.price && Number(ws.price) > 0
                                                                    ? `₹${Number(ws.price).toLocaleString('en-IN')} / month`
                                                                    : "Contact for Pricing"}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-foreground mb-3">{ws.name}</h3>

                                                        {isUnavailable && (
                                                            <div className="mb-4 bg-destructive/10 border border-destructive/20 p-3 rounded-xl flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
                                                                    <Clock className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] uppercase font-black tracking-widest text-destructive">
                                                                        {ws.type === "Open WorkStation" ? "Booking Status" : "Booked Until"}
                                                                    </span>
                                                                    <span className="text-xs font-bold text-destructive">
                                                                        {ws.type === "Open WorkStation"
                                                                            ? "Current capacity is full"
                                                                            : (ws.unavailableUntil ? new Date(ws.unavailableUntil).toLocaleString(undefined, {
                                                                                month: 'short',
                                                                                day: 'numeric',
                                                                                year: 'numeric'
                                                                            }) : "Further Notice")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="space-y-3 mb-6 font-medium">
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <MapPin className="w-4 h-4 text-primary" />
                                                                {ws.location}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Users className="w-4 h-4 text-primary" />
                                                                {ws.type === "Open WorkStation"
                                                                    ? `${ws.availableSeats ?? 0} / ${ws.totalSeats ?? 0} Seats Available`
                                                                    : ws.capacity}
                                                            </div>
                                                        </div>

                                                        <div className="mt-auto flex gap-3">
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 rounded-xl font-bold"
                                                                onClick={() => changeView("workspace-details", String(ws._id || ws.id))}
                                                            >
                                                                View Details
                                                            </Button>
                                                            {!isUnavailable && (
                                                                <Button
                                                                    disabled={isRequesting}
                                                                    onClick={() => handleRequestWorkspace(ws)}
                                                                    className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02]"
                                                                >
                                                                    Request Booking
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                            })}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="my-requests" className="mt-0 focus-visible:ring-0">
                                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                                        <div className="relative flex-1 group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                placeholder="Search by workspace name..."
                                                className="pl-10 h-11 bg-muted/20 border-border/50 rounded-xl focus:ring-primary/20 transition-all font-medium"
                                                value={requestSearch}
                                                onChange={(e) => setRequestSearch(e.target.value)}
                                            />
                                        </div>
                                        <Select value={requestTypeFilter} onValueChange={setRequestTypeFilter}>
                                            <SelectTrigger className="w-[150px] h-11 bg-muted/20 border-border/50 rounded-xl font-bold">
                                                <div className="flex items-center gap-2">
                                                    <Layers className="w-3.5 h-3.5 text-primary" />
                                                    <SelectValue placeholder="Type" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border/50">
                                                {["All", "Booking", "Visit", "Quote"].map(type => (
                                                    <SelectItem key={type} value={type} className="font-medium rounded-lg">{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                                            <SelectTrigger className="w-[150px] h-11 bg-muted/20 border-border/50 rounded-xl font-bold">
                                                <div className="flex items-center gap-2">
                                                    <Filter className="w-3.5 h-3.5 text-primary" />
                                                    <SelectValue placeholder="Status" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border/50">
                                                {["All", "Pending", "Reviewed", "Awaiting Payment", "Completed"].map(status => (
                                                    <SelectItem key={status} value={status} className="font-medium rounded-lg">{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="bg-background rounded-[2rem] border border-border/50 shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-muted/30 border-b border-border/50">
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Workspace</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Seats</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duration</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Invoice ID</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/30">
                                                    {filteredRequests.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={7} className="px-8 py-20 text-center">
                                                                <div className="flex flex-col items-center gap-4 opacity-50">
                                                                    <Ticket className="w-12 h-12" />
                                                                    <p className="text-xl font-black italic">No booking requests found</p>
                                                                    <p className="text-sm font-medium">Try adjusting your filters or explore spaces to start a booking.</p>
                                                                    {(requestSearch || requestStatusFilter !== "All" || requestTypeFilter !== "All") && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-primary font-bold hover:bg-primary/5 mt-2"
                                                                            onClick={() => {
                                                                                setRequestSearch("");
                                                                                setRequestStatusFilter("All");
                                                                                setRequestTypeFilter("All");
                                                                            }}
                                                                        >
                                                                            Clear request filters
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        filteredRequests.map((req, i) => (
                                                            <tr key={i} className="hover:bg-muted/10 transition-colors">
                                                                <td className="px-8 py-5">
                                                                    <Badge variant="outline" className={`rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase ${req.type === 'booking' ? 'bg-primary/5 text-primary border-primary/20' :
                                                                            req.type === 'visit' ? 'bg-amber-500/5 text-amber-600 border-amber-500/20' :
                                                                                'bg-indigo-500/5 text-indigo-600 border-indigo-500/20'
                                                                        }`}>
                                                                        {req.type}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold italic">{req.requiredWorkspace}</span>
                                                                        <span className="text-[10px] text-muted-foreground font-medium">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <span className="text-sm font-black italic">{req.seatCount || 1}</span>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <span className="text-sm font-medium">{req.duration}</span>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    {req.type === 'booking' ? (
                                                                        <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[9px] font-bold uppercase ${req.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-orange-50 text-orange-600 border-orange-200'
                                                                            }`}>
                                                                            {req.paymentStatus || 'Pending'}
                                                                        </Badge>
                                                                    ) : (
                                                                        <span className="text-muted-foreground italic text-[10px]">N/A</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <Badge
                                                                        className={`rounded-full px-4 py-1 text-[9px] font-black uppercase border-none shadow-sm ${req.status === 'Pending' ? 'bg-orange-500/10 text-orange-600' :
                                                                            req.status === 'Reviewed' || req.status === 'Awaiting Payment' ? 'bg-blue-500/10 text-blue-600' :
                                                                                'bg-emerald-500/10 text-emerald-600'
                                                                            }`}
                                                                    >
                                                                        {req.status}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <span className="text-xs font-mono font-bold text-muted-foreground">
                                                                        {req.invoiceId || "—"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="invoices" className="mt-0 focus-visible:ring-0">
                                    <div className="card-elevated glass rounded-2xl sm:rounded-[2.5rem] border border-border/50 overflow-hidden">
                                        <div className="p-6 sm:p-10 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-black italic text-foreground/90">Invoices & Statements</h3>
                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Billed to your identity</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                                                    <SelectTrigger className="w-[140px] h-9 bg-muted/20 border-border/50 rounded-lg font-bold text-xs">
                                                        <SelectValue placeholder="All Invoices" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-border/50">
                                                        <SelectItem value="All" className="font-medium">All Invoices</SelectItem>
                                                        <SelectItem value="Paid" className="font-medium">Paid Only</SelectItem>
                                                        <SelectItem value="Pending" className="font-medium">Unpaid Only</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Badge className="w-fit rounded-full bg-primary/10 text-primary border-none px-4 py-1.5 font-black uppercase text-[9px] tracking-widest">
                                                    Payment Method: {userInfo.mobile ? "Pre-Authorized" : "Manual Transfer"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto custom-scrollbar">
                                            <table className="w-full min-w-[700px] text-left">
                                                <thead>
                                                    <tr className="bg-muted/30 border-b border-border/50">
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Invoice ID</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Period / Date</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/20">
                                                    {filteredInvoices.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-8 py-16 text-center">
                                                                <div className="flex flex-col items-center gap-3 opacity-40">
                                                                    <Building2 className="w-10 h-10" />
                                                                    <p className="text-base font-bold italic">No {invoiceStatusFilter === 'All' ? '' : invoiceStatusFilter.toLowerCase()} invoices found</p>
                                                                    {invoiceStatusFilter !== 'All' && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-primary font-bold hover:bg-primary/5"
                                                                            onClick={() => setInvoiceStatusFilter("All")}
                                                                        >
                                                                            Show all invoices
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : filteredInvoices.map((inv) => {
                                                        const booking = myRequests.find(r => r.invoiceId === inv.invoiceNumber);
                                                        const isExpanded = expandedInv === inv.invoiceNumber;

                                                        return (
                                                            <Fragment key={inv._id}>
                                                                <tr
                                                                    className={`group transition-colors h-20 cursor-pointer ${isExpanded ? 'bg-primary/[0.03]' : 'hover:bg-muted/10'}`}
                                                                    onClick={() => setExpandedInv(isExpanded ? null : inv.invoiceNumber)}
                                                                >
                                                                    <td className="px-8 py-4">
                                                                        <span className="text-xs font-mono font-black text-primary/80 tracking-tighter bg-primary/5 px-2 py-1 rounded-lg">
                                                                            {inv.invoiceNumber}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-8 py-4">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs font-bold">{formatDisplayDate(inv.createdAt)}</span>
                                                                            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Issue Date</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-4">
                                                                        <span className="text-sm font-black italic">₹{inv.amount.toLocaleString('en-IN')}</span>
                                                                    </td>
                                                                    <td className="px-8 py-4">
                                                                        <Badge className={`rounded-full px-4 py-1 text-[9px] font-black uppercase border-none shadow-sm ${inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600 border-red-200'
                                                                            }`}>
                                                                            {inv.status}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="px-8 py-4 text-right">
                                                                        <div className="flex justify-end gap-2 items-center">
                                                                                <Button 
                                                                                    variant="ghost" 
                                                                                    size="icon" 
                                                                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary transition-all duration-300 group/preview" 
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        const userInfo = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
                                                                                        const token = userInfo ? JSON.parse(userInfo).token : '';
                                                                                        window.open(`/api/requests/invoices/${inv._id}/download?token=${token}&preview=true`, '_blank');
                                                                                    }}
                                                                                    title="View & Download Invoice"
                                                                                >
                                                                                    <Eye className="w-4 h-4 group-hover/preview:scale-110 transition-transform" />
                                                                                </Button>
                                                                            
                                                                            {inv.status === 'Pending' ? (
                                                                                <Button
                                                                                    size="sm"
                                                                                    disabled={isRequesting || payingInvoiceId === inv._id}
                                                                                    onClick={(e) => { e.stopPropagation(); handlePayInvoice(inv._id); }}
                                                                                    className="rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md shadow-primary/20 h-9 px-4"
                                                                                >
                                                                                    {payingInvoiceId === inv._id ? (
                                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                                    ) : "Clear Dues"}
                                                                                </Button>
                                                                            ) : inv.status === 'Paid' ? (
                                                                                <div className="flex items-center bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                                                    <span className="text-[10px] font-black uppercase tracking-widest">Paid</span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-[10px] text-muted-foreground">—</span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                {isExpanded && (
                                                                    <tr className="bg-primary/[0.02]">
                                                                        <td colSpan={5} className="px-8 py-8 border-b border-primary/10">
                                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                                                                                <div className="space-y-4">
                                                                                    <div className="flex items-center gap-2 text-primary">
                                                                                        <Building2 className="w-4 h-4" />
                                                                                        <h4 className="text-xs font-black uppercase tracking-widest">Workspace Details</h4>
                                                                                    </div>
                                                                                    <div className="space-y-2">
                                                                                        <p className="text-sm font-bold">{inv.workspaceName}</p>
                                                                                        <Badge variant="outline" className="rounded-lg text-[10px] uppercase font-bold text-muted-foreground">
                                                                                            {booking?.requiredWorkspace || "Dedicated Cabin"}
                                                                                        </Badge>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="space-y-4">
                                                                                    <div className="flex items-center gap-2 text-primary">
                                                                                        <Calendar className="w-4 h-4" />
                                                                                        <h4 className="text-xs font-black uppercase tracking-widest">Billing Period</h4>
                                                                                    </div>
                                                                                    {inv.billingMonth ? (
                                                                                        <div className="space-y-1">
                                                                                            <div className="flex items-center gap-4 text-xs font-medium">
                                                                                                <span className="text-muted-foreground w-10">From:</span>
                                                                                                <span className="font-bold text-foreground">
                                                                                                    {(() => {
                                                                                                        const [year, month] = inv.billingMonth.split('-').map(Number);
                                                                                                        return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                                                                                    })()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-4 text-xs font-medium">
                                                                                                <span className="text-muted-foreground w-10">To:</span>
                                                                                                <span className="font-bold text-foreground">
                                                                                                    {(() => {
                                                                                                        const [year, month] = inv.billingMonth.split('-').map(Number);
                                                                                                        return new Date(year, month, 0).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                                                                                    })()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="mt-2 text-[10px] font-black text-primary uppercase bg-primary/5 px-2 py-1 rounded-md inline-block">
                                                                                                DURATION: FULL MONTH
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="space-y-1">
                                                                                            <div className="flex items-center gap-4 text-xs">
                                                                                                <span className="text-muted-foreground font-medium w-10">From:</span>
                                                                                                <span className="font-bold">{formatDisplayDate(booking?.startDate)}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-4 text-xs">
                                                                                                <span className="text-muted-foreground font-medium w-10">To:</span>
                                                                                                <span className="font-bold">{getEndDate(booking?.startDate, booking?.duration)}</span>
                                                                                            </div>
                                                                                            <div className="mt-2 text-[10px] font-black text-primary uppercase bg-primary/5 px-2 py-1 rounded-md inline-block">
                                                                                                Duration: {booking?.duration || 'N/A'}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="space-y-4">
                                                                                    <div className="flex items-center gap-2 text-primary">
                                                                                        <Sparkles className="w-4 h-4" />
                                                                                        <h4 className="text-xs font-black uppercase tracking-widest">Billing Info</h4>
                                                                                    </div>
                                                                                    <div className="space-y-1 border-l-2 border-primary/20 pl-4">
                                                                                        <p className="text-[10px] text-muted-foreground font-black uppercase">Recipient</p>
                                                                                        <p className="text-xs font-bold">{inv.customerName}</p>
                                                                                        <p className="text-[10px] text-muted-foreground font-medium">{inv.customerEmail}</p>
                                                                                        {booking?.firmName && <p className="text-[10px] text-primary font-black mt-1">{booking.firmName}</p>}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}

                    {/* ---- My Agreements View ---- */}
                    {currentView === "agreements" && (
                        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-violet-600">My Agreement</h1>
                                <p className="text-muted-foreground font-black uppercase tracking-[0.25em] text-[10px]">Service Agreement Documents</p>
                            </div>

                            {agreements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 text-center">
                                    <div className="w-24 h-24 rounded-3xl bg-muted/30 flex items-center justify-center mb-6 ring-1 ring-border/50 rotate-3">
                                        <FileText className="w-12 h-12 text-muted-foreground/20" />
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">No agreement assigned yet</p>
                                    <p className="text-xs text-muted-foreground/30 mt-2">Your service agreement will appear here once your admin uploads it</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {agreements.map((agr) => (
                                        <div key={agr._id} className="group relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-muted/20 to-muted/5 p-6 hover:border-primary/20 hover:from-primary/5 hover:to-muted/5 transition-all duration-500 shadow-sm hover:shadow-lg">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-indigo-500/60 to-violet-600/60" />

                                            <div className="flex items-start gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                    <FileText className="w-7 h-7 text-rose-500" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-base truncate">{agr.fileName}</p>
                                                    {agr.workspaceName && agr.workspaceName !== 'General' && (
                                                        <p className="text-xs font-bold text-primary mt-0.5">{agr.workspaceName}</p>
                                                    )}

                                                    {(agr.startDate || agr.endDate) && (
                                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                                            {agr.startDate && (
                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                                    <Calendar className="w-3 h-3 text-emerald-500" />
                                                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                                                        Start: {new Date(agr.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {agr.endDate && (
                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                                                    <Clock className="w-3 h-3 text-rose-500" />
                                                                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                                                                        End: {new Date(agr.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {agr.notes && (
                                                        <p className="mt-3 text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">{agr.notes}</p>
                                                    )}

                                                    <div className="flex items-center gap-3 mt-4">
                                                        <a
                                                            href={agr.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-200"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" />
                                                            View Document
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                                                        {new Date(agr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {currentView === "profile" && userInfo && (
                        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 relative">
                            {/* Decorative Background Elements */}
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
                            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />

                            <div className="flex flex-col gap-3 relative z-10 text-center sm:text-left">
                                <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-violet-600">Personal Identity</h1>
                                <div className="flex items-center justify-center sm:justify-start gap-3">
                                    <div className="h-px w-8 bg-primary/40 hidden sm:block" />
                                    <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs">Secure Ecosystem Presence Profile</p>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-12 gap-8 relative z-10">
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Profile Overview Card */}
                                    <div className="card-elevated glass p-8 flex flex-col items-center text-center space-y-8 relative overflow-hidden group/card shadow-2xl border-primary/5">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />

                                        <div className="relative">
                                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[3rem] bg-gradient-to-tr from-primary via-primary to-accent flex items-center justify-center font-black text-white text-4xl sm:text-5xl shadow-2xl relative z-10 rotate-3 group-hover:rotate-0 transition-all duration-500">
                                                {(userInfo?.name || "U").split(" ").map((n: string) => n[0]).join("")}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-background rounded-2xl flex items-center justify-center shadow-lg border border-border/50 z-20">
                                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                            </div>
                                        </div>

                                        <div className="space-y-3 relative z-10">
                                            <h3 className="text-3xl font-black tracking-tight">{userInfo.name}</h3>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-xl uppercase tracking-widest text-[10px] font-black">
                                                    {userInfo.role}
                                                </Badge>
                                                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/5 px-4 py-1.5 rounded-xl uppercase tracking-widest text-[10px] font-black">
                                                    Status: Active
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="w-full pt-8 border-t border-border/50 space-y-5">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col items-start translate-y-1">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Profile Mastery</span>
                                                    <span className="text-2xl font-black text-primary">92%</span>
                                                </div>
                                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md uppercase tracking-tighter">Gold Tier</span>
                                            </div>
                                            <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden p-0.5">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary to-accent w-[92%] rounded-full shadow-[0_0_15px_rgba(var(--primary),0.4)] relative"
                                                >
                                                    <div className="absolute top-0 right-0 w-4 h-full bg-white/20 animate-shimmer" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-medium text-left">Your identity is almost complete. Add a professional bio to reach 100%.</p>
                                        </div>
                                    </div>

                                    {/* Ecosystem Access Card */}
                                    <div className="card-elevated glass p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ecosystem Access</h4>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { icon: ShieldCheck, label: "Global ID", value: "Verified Member", color: "text-emerald-500" },
                                                ...(myWorkspaces.length > 0 ? [{ icon: Building2, label: "Asset Status", value: "Workspace Allotted", color: "text-blue-500" }] : [])
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/10 border border-transparent hover:border-primary/10 transition-all group/item text-left">
                                                    <div className={`w-10 h-10 rounded-xl bg-background flex items-center justify-center transition-colors group-hover/item:shadow-lg`}>
                                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{item.label}</span>
                                                        <span className="text-sm font-black">{item.value}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-8 space-y-8">
                                    <div className="card-elevated glass p-8 sm:p-10 space-y-10 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />

                                        <div>
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-black flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <UserIcon className="w-4 h-4 text-primary" />
                                                        </div>
                                                        Core Information
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground font-medium ml-11">Essential details used across the COMS platform.</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isEditingProfile ? (
                                                        <div className="flex gap-2 animate-in fade-in zoom-in duration-300">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="rounded-xl font-bold h-9 px-4 text-muted-foreground"
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
                                                                className="rounded-xl font-black h-9 px-6 shadow-lg shadow-primary/20"
                                                                onClick={async () => {
                                                                    await handleUpdateProfileInfo();
                                                                    setIsEditingProfile(false);
                                                                }}
                                                                disabled={isUpdatingProfile}
                                                            >
                                                                {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-xl font-bold h-9 px-4 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                                                            onClick={() => setIsEditingProfile(true)}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Profile
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                                                <div className="space-y-3 group text-left">
                                                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1 group-hover:text-primary transition-colors">Legal Identity</Label>
                                                    {isEditingProfile ? (
                                                        <Input
                                                            className="rounded-xl bg-muted/30 border-border/50 font-bold focus:ring-primary/20 transition-all h-12"
                                                            value={editProfileData.name || ""}
                                                            onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
                                                        />
                                                    ) : (
                                                        <div className="h-12 flex items-center px-4 rounded-xl bg-muted/20 border border-transparent font-bold text-foreground italic group-hover:border-primary/10 transition-all">
                                                            {userInfo.name}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-3 group text-left">
                                                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1 group-hover:text-primary transition-colors">Primary Email</Label>
                                                    {isEditingProfile ? (
                                                        <Input
                                                            className="rounded-xl bg-muted/30 border-border/50 font-bold focus:ring-primary/20 transition-all h-12"
                                                            value={editProfileData.email || ""}
                                                            onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                                                        />
                                                    ) : (
                                                        <div className="h-12 flex items-center px-4 rounded-xl bg-muted/20 border border-transparent font-bold text-foreground italic group-hover:border-primary/10 transition-all">
                                                            {userInfo.email}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-3 group text-left">
                                                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1 group-hover:text-primary transition-colors">Entity Affiliation</Label>
                                                    {isEditingProfile ? (
                                                        <Input
                                                            className="rounded-xl bg-muted/30 border-border/50 font-bold focus:ring-primary/20 transition-all h-12"
                                                            value={editProfileData.organization || ""}
                                                            onChange={(e) => setEditProfileData({ ...editProfileData, organization: e.target.value })}
                                                        />
                                                    ) : (
                                                        <div className="h-12 flex items-center px-4 rounded-xl bg-muted/20 border border-transparent font-bold text-foreground italic group-hover:border-primary/10 transition-all">
                                                            {userInfo.organization || "Independent Specialist"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-3 group text-left">
                                                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1 group-hover:text-primary transition-colors">Mobile Endpoint</Label>
                                                    {isEditingProfile ? (
                                                        <Input
                                                            className="rounded-xl bg-muted/30 border-border/50 font-bold focus:ring-primary/20 transition-all h-12"
                                                            value={editProfileData.mobile || ""}
                                                            onChange={(e) => setEditProfileData({ ...editProfileData, mobile: e.target.value })}
                                                        />
                                                    ) : (
                                                        <div className="h-12 flex items-center px-4 rounded-xl bg-muted/20 border border-transparent font-bold text-foreground italic group-hover:border-primary/10 transition-all">
                                                            {userInfo.mobile || "N/A"}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-12 border-t border-border/50">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-black flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                                            <KeyRound className="w-4 h-4 text-amber-600" />
                                                        </div>
                                                        Security Infrastructure
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground font-medium ml-11 text-left">Manage your encryption keys and access protocols.</p>
                                                </div>

                                                <Dialog open={isSecurityModalOpen} onOpenChange={setIsSecurityModalOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="rounded-xl font-black h-10 px-6 bg-amber-500/5 border-amber-500/20 text-amber-700 hover:bg-amber-500/10 shadow-sm transition-all hover:scale-[1.02]">
                                                            Rotate Credentials
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="rounded-3xl border-border/50 glass max-w-md shadow-2xl p-0 overflow-hidden">
                                                        <div className="bg-gradient-to-tr from-amber-500/10 via-background to-background p-8 space-y-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                                                    <LockIcon className="w-6 h-6" />
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <DialogTitle className="text-2xl font-black">Security Protocol</DialogTitle>
                                                                    <DialogDescription className="text-xs font-bold uppercase tracking-wider text-amber-600/60">Authentication Update</DialogDescription>
                                                                </div>
                                                            </div>

                                                            <p className="text-sm font-medium text-muted-foreground leading-relaxed text-left">
                                                                Enhance your account security by updating your master credentials. COMS recommends rotating keys every 90 days.
                                                            </p>

                                                            <form className="space-y-5" onSubmit={(e) => {
                                                                e.preventDefault();
                                                                handlePasswordChange();
                                                            }} noValidate>
                                                                <div className="space-y-4">
                                                                    <div className="space-y-2 group text-left">
                                                                        <Label htmlFor="oldPassword" title="Current Password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-amber-600 transition-colors">Current Key</Label>
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
                                                                    <div className="space-y-2 group text-left">
                                                                        <Label htmlFor="newPassword" title="New Secure Password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-amber-600 transition-colors">New Security Key</Label>
                                                                        <Input
                                                                            id="newPassword"
                                                                            type="password"
                                                                            placeholder="Enter new strong password"
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
                                                                    <div className="space-y-2 group text-left">
                                                                        <Label htmlFor="confirmPassword" title="Confirm New Password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-amber-600 transition-colors">Verify New Key</Label>
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
                                                                            <><Loader2 className="w-5 h-5 animate-spin mr-3" />Verifying Protocol...</>
                                                                        ) : "Apply Security Protocol"}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </form>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>

                                        <div className="pt-12 border-t border-border/50">
                                            <div className="flex items-center justify-between mb-8">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                                    <Clock className="w-3 h-3" /> Member Analytics
                                                </h4>
                                                <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent ml-6" />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="flex items-center gap-5 p-5 rounded-3xl bg-muted/20 border border-transparent hover:border-violet-500/20 transition-all group text-left">
                                                    <div className="w-14 h-14 rounded-2xl bg-white/50 flex items-center justify-center transition-colors group-hover:bg-violet-500/10">
                                                        <Building2 className="w-7 h-7 text-violet-600" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">Active Assets</span>
                                                        <span className="text-lg font-black text-violet-600 italic">
                                                            {myWorkspaces.length} Space{myWorkspaces.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-5 p-5 rounded-3xl bg-muted/20 border border-transparent hover:border-primary/10 transition-all group text-left">
                                                    <div className="w-14 h-14 rounded-2xl bg-white/50 flex items-center justify-center transition-colors group-hover:bg-primary/10">
                                                        <Zap className="w-7 h-7 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">Total Investment</span>
                                                        <span className="text-lg font-black text-primary italic">
                                                            ₹{invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                </main>
            </SidebarInset >

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!isDeletingPost) setIsDeleteDialogOpen(open); }}>
                <AlertDialogContent className="rounded-3xl border-border/50 glass max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black">Delete Story?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
                            This action cannot be undone. This story and all its comments will be permanently removed from the community ecosystem.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl font-bold border-border/50" disabled={isDeletingPost}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async (e) => {
                                e.preventDefault();
                                setIsDeletingPost(true);
                                await confirmDelete();
                                setIsDeletingPost(false);
                            }}
                            disabled={isDeletingPost}
                            className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                        >
                            {isDeletingPost ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</> : "Delete Permanently"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isCommentDeleteDialogOpen} onOpenChange={(open) => { if (!isDeletingComment) setIsCommentDeleteDialogOpen(open); }}>
                <AlertDialogContent className="rounded-3xl border-border/50 glass max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black">Remove Comment?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
                            Are you sure you want to delete this comment? This will also remove any replies to it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl font-bold border-border/50" disabled={isDeletingComment}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async (e) => {
                                e.preventDefault();
                                setIsDeletingComment(true);
                                await confirmCommentDelete();
                                setIsDeletingComment(false);
                            }}
                            disabled={isDeletingComment}
                            className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                        >
                            {isDeletingComment ? <><Loader2 className="w-4 h-4 animate-spin" />Removing...</> : "Delete Comment"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isReplyDeleteDialogOpen} onOpenChange={(open) => { if (!isDeletingReply) setIsReplyDeleteDialogOpen(open); }}>
                <AlertDialogContent className="rounded-3xl border-border/50 glass max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black">Remove Reply?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
                            Are you sure you want to delete this reply? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl font-bold border-border/50" disabled={isDeletingReply}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async (e) => {
                                e.preventDefault();
                                setIsDeletingReply(true);
                                await confirmReplyDelete();
                                setIsDeletingReply(false);
                            }}
                            disabled={isDeletingReply}
                            className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                        >
                            {isDeletingReply ? <><Loader2 className="w-4 h-4 animate-spin" />Removing...</> : "Delete Reply"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl glass">
                    <ScrollArea className="max-h-[85vh]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Request Space</DialogTitle>
                        <DialogDescription>Select the start date and duration for your booking.</DialogDescription>
                    </DialogHeader>
                    <div className="bg-primary p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <CalendarCheck className="w-32 h-32" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">Request Space</h2>
                        <p className="text-primary-foreground/80 font-medium text-sm">
                            {selectedWorkspaceToBook?.name} in {selectedWorkspaceToBook?.location}
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Planning to start from</Label>
                            <DateTimePicker
                                date={bookingParams.startDate ? new Date(bookingParams.startDate + 'T00:00:00') : undefined}
                                setDate={(date) => {
                                    if (date) {
                                        const y = date.getFullYear();
                                        const m = String(date.getMonth() + 1).padStart(2, '0');
                                        const d = String(date.getDate()).padStart(2, '0');
                                        setBookingParams({ ...bookingParams, startDate: `${y}-${m}-${d}` });
                                    } else {
                                        setBookingParams({ ...bookingParams, startDate: '' });
                                    }
                                }}
                                className="h-12 border-border/50 bg-muted/30 font-bold transition-colors focus:ring-primary/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Stay until</Label>
                            <DateTimePicker
                                date={bookingParams.endDate ? new Date(bookingParams.endDate + 'T23:59:59') : undefined}
                                setDate={(date) => {
                                    if (date) {
                                        const y = date.getFullYear();
                                        const m = String(date.getMonth() + 1).padStart(2, '0');
                                        const d = String(date.getDate()).padStart(2, '0');
                                        setBookingParams({ ...bookingParams, endDate: `${y}-${m}-${d}` });
                                    } else {
                                        setBookingParams({ ...bookingParams, endDate: '' });
                                    }
                                }}
                                className="h-12 border-border/50 bg-muted/30 font-bold transition-colors focus:ring-primary/20"
                                disabled={(date: Date) => {
                                    const start = bookingParams.startDate ? new Date(bookingParams.startDate + 'T00:00:00') : new Date(new Date().setHours(0, 0, 0, 0));
                                    return date <= start;
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Strategy</Label>
                            <Select
                                value={bookingParams.paymentMethod || "Pay Now"}
                                onValueChange={(val) => setBookingParams({ ...bookingParams, paymentMethod: val })}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border/50 font-bold">
                                    <SelectValue placeholder="Select Payment Method" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="Pay Now">
                                        <div className="flex items-center gap-2 font-bold">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            </div>
                                            Pay Now
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="Pay Later">
                                        <div className="flex items-center gap-2 font-bold">
                                            <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                                <Clock className="w-3.5 h-3.5 text-orange-600" />
                                            </div>
                                            Pay Later
                                        </div>
                                    </SelectItem>
                                    <SelectItem
                                        value="Pay Monthly"
                                        disabled={(() => {
                                            const parts = bookingParams.duration.split(" ");
                                            const num = parseFloat(parts[0]) || 0;
                                            const unit = parts[1]?.toLowerCase() || '';
                                            if (unit.startsWith('month')) return num < 1;
                                            if (unit.startsWith('year')) return num < (1 / 12);
                                            return true; // Not eligible for days/weeks/hours
                                        })()}
                                    >
                                        <div className="flex items-center gap-2 font-bold">
                                            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Layers className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                            Pay Monthly
                                        </div>
                                    </SelectItem>

                                </SelectContent>
                            </Select>
                        </div>
                        {selectedWorkspaceToBook?.type === "Open WorkStation" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Number of Seats (Available: {selectedWorkspaceToBook.availableSeats ?? (selectedWorkspaceToBook as any).features?.workstationSeats ?? 0})</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={selectedWorkspaceToBook.availableSeats ?? (selectedWorkspaceToBook as any).features?.workstationSeats ?? 20}
                                    value={bookingParams.seatCount || 1}
                                    onChange={(e) => setBookingParams({ ...bookingParams, seatCount: parseInt(e.target.value) || 1 })}
                                    className="h-12 border-border/50 bg-muted/30 font-bold focus:ring-primary/20"
                                />
                            </div>
                        )}

                        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                                    {bookingParams.paymentMethod === "Pay Monthly" ? "Monthly Commitment" : "Estimated Total"}
                                </p>
                                <p className="text-sm font-medium text-muted-foreground leading-none">
                                    {bookingParams.paymentMethod === "Pay Monthly"
                                        ? "Billed every month start"
                                        : `Pro-rated for ${bookingParams.duration}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-primary italic">
                                    ₹{bookingParams.paymentMethod === "Pay Monthly"
                                        ? (Number(selectedWorkspaceToBook?.price || 0) * (selectedWorkspaceToBook?.type === "Open WorkStation" ? bookingParams.seatCount : 1)).toLocaleString()
                                        : estimatedTotal.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button
                                variant="ghost"
                                className="flex-1 h-12 rounded-xl font-bold"
                                onClick={() => setIsBookingModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                                onClick={handleConfirmedBooking}
                                disabled={isRequesting}
                            >
                                {isRequesting ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    bookingParams.paymentMethod === "Pay Now" ? "Pay Now & Book" :
                                        bookingParams.paymentMethod === "Pay Monthly" ? "Confirm Monthly Plan" : "Confirm Request"
                                )}
                            </Button>
                        </div>
                    </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
            {/* Member Contact Modal */}
            <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-0 overflow-hidden border-none glass shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Contact Member</DialogTitle>
                        <DialogDescription>Get in touch with the community member.</DialogDescription>
                    </DialogHeader>
                    <div className="relative h-32 bg-gradient-to-br from-primary via-primary/80 to-accent">
                        <div className="absolute inset-0 bg-grid-white/[0.1]" />
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                            <div className="w-24 h-24 rounded-3xl bg-background border-4 border-background flex items-center justify-center font-black text-primary text-3xl shadow-xl">
                                {(selectedMember?.name || "U").split(" ").map((n: string) => n[0]).join("")}
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8 text-center space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black italic">{selectedMember?.name}</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedMember?.role || "Community Member"}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 flex items-center gap-4 group hover:bg-muted/60 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="text-left font-sans">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider leading-none mb-1">Email Address</p>
                                    <p className="text-sm font-bold truncate max-w-[200px]">{selectedMember?.email}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 flex items-center gap-4 group hover:bg-muted/60 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="text-left font-sans">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider leading-none mb-1">Mobile Number</p>
                                    <p className="text-sm font-bold">{selectedMember?.mobile || selectedMember?.contactNumber || "Contact not provided"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex pt-4">
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest"
                                onClick={() => setIsContactModalOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </SidebarProvider >
    );
};

const DashboardShieldCheck = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const UserDashboardWrapper = () => (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    }>
        <UserDashboard />
    </Suspense>
);

export default UserDashboardWrapper;




