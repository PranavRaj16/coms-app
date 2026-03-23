"use client";
import { useState } from "react";
import { User } from "@/data/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ShieldCheck, User as UserIcon, Mail, Building2, Phone, Clock, Calendar, TrendingUp, Pencil, Lock, Loader2, KeyRound, AlertCircle, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface AdminProfileProps {
    userInfo: any;
    isEditingProfile: boolean;
    setIsEditingProfile: (val: boolean) => void;
    editProfileData: any;
    setEditProfileData: (val: any) => void;
    isUpdatingProfile: boolean;
    handleUpdateProfileInfo: () => void;
    onUpdatePassword: (passwords: any) => Promise<void>;
}

export function AdminProfile({ 
    userInfo, 
    isEditingProfile, 
    setIsEditingProfile, 
    editProfileData, 
    setEditProfileData, 
    isUpdatingProfile, 
    handleUpdateProfileInfo,
    onUpdatePassword
}: AdminProfileProps) {
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match");
            return;
        }
        setIsChangingPassword(true);
        try {
            await onUpdatePassword(passwords);
            setIsPasswordDialogOpen(false);
            setPasswords({ current: "", new: "", confirm: "" });
            toast.success("Password updated successfully");
        } catch (err: any) {
            toast.error(err.message || "Failed to update password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
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
                                { icon: Building2, label: "Workspace Control", value: "Full Access", color: "text-blue-500", bg: "bg-blue-500/10" }
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
                                                onClick={handleUpdateProfileInfo}
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
                                                : "Never"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Actions */}
                        <div className="pt-12 border-t border-primary/10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 mb-8">
                                <ShieldCheck className="w-3.5 h-3.5" /> Security Controls
                            </h4>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    className="flex-1 h-20 rounded-[2rem] bg-background border-2 border-primary/10 hover:border-primary/40 text-foreground transition-all duration-500 group/sec relative overflow-hidden"
                                    onClick={() => setIsPasswordDialogOpen(true)}
                                >
                                    <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover/sec:translate-y-0 transition-transform duration-500" />
                                    <div className="relative z-10 flex items-center px-6 gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/sec:scale-110 transition-transform">
                                            <KeyRound className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-black italic">Change Password</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Last updated 14 days ago</span>
                                        </div>
                                    </div>
                                </Button>
                                <Button variant="ghost" className="flex-1 h-20 rounded-[2rem] border border-destructive/5 hover:bg-destructive/5 text-destructive/80 transition-all duration-500 flex items-center px-8 gap-6 group/sec">
                                    <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center group-hover/sec:scale-110 transition-transform">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col items-start text-destructive">
                                        <span className="text-sm font-black italic">Two-Factor Auth</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Status: Disabled</span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Dialog */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-gradient-to-b from-primary/10 to-background p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <form onSubmit={handlePasswordSubmit} className="space-y-6 relative z-10">
                            <DialogHeader>
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <KeyRound className="w-7 h-7 text-primary" />
                                </div>
                                <DialogTitle className="text-3xl font-black italic tracking-tight">Access Control</DialogTitle>
                                <DialogDescription className="font-bold text-muted-foreground">Reset your administrative password</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Password</Label>
                                    <Input
                                        type="password"
                                        required
                                        className="h-14 rounded-2xl bg-background/50 border-primary/10 focus:border-primary/40 font-bold px-5"
                                        value={passwords.current}
                                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
                                    <Input
                                        type="password"
                                        required
                                        className="h-14 rounded-2xl bg-background/50 border-primary/10 focus:border-primary/40 font-bold px-5"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</Label>
                                    <Input
                                        type="password"
                                        required
                                        className="h-14 rounded-2xl bg-background/50 border-primary/10 focus:border-primary/40 font-bold px-5"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="w-full h-14 rounded-2xl font-black bg-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
    );
}
