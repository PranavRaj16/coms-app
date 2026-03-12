"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Loader2, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

const ResetPassword = () => {
    const params = useParams();
    const token = String(params?.token ?? '');
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: typeof errors = {};

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword(token || "", { password });
            setIsSuccess(true);
            toast.success("Password reset successful!");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setErrors({ general: err.message || "Failed to reset password" });
            toast.error(err.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <main className="flex-1 flex items-center justify-center p-6 pb-20">
                    <div className="w-full max-w-md text-center space-y-6 animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-black">Success!</h1>
                        <p className="text-muted-foreground font-medium">Your password has been reset successfully. Redirecting you to login...</p>
                        <Button onClick={() => router.push("/login")} className="rounded-xl px-8 h-12 font-bold">
                            Go to Login Now
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-1 flex items-center justify-center p-6 pb-20">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="bg-card rounded-[2.5rem] shadow-soft-lg p-10 border border-border/50 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-50" />

                        <div className="space-y-2 mb-10">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight">Set New Password</h1>
                            <p className="text-muted-foreground font-medium">Resetting password for token: <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-primary">{token?.substring(0, 8)}...</span></p>
                        </div>

                        <form onSubmit={handleReset} className="space-y-6" noValidate>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className={`pl-11 h-12 rounded-2xl bg-muted/30 border-border/50 transition-all focus:ring-primary/20 focus:bg-background ${errors.password ? "border-destructive ring-destructive/20" : ""}`}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (errors.password) setErrors({ ...errors, password: undefined });
                                            }}
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <AlertCircle className="w-3 h-3" /> {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className={`pl-11 h-12 rounded-2xl bg-muted/30 border-border/50 transition-all focus:ring-primary/20 focus:bg-background ${errors.confirmPassword ? "border-destructive ring-destructive/20" : ""}`}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                                            }}
                                        />
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {errors.general && (
                                <div className="bg-destructive/5 border border-destructive/20 text-destructive text-xs p-3 rounded-xl animate-shake flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.general}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-2xl text-base font-black shadow-lg hover:shadow-primary/20 transition-all gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Update Password <ArrowRight className="w-4 h-4" /></>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResetPassword;
