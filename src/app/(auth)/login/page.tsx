"use client";
import { useState, useEffect } from "react";
import Link from "next/link"; import { useRouter } from "next/navigation";
import { login, forgotPassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Lock, Mail, Loader2, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [isForgotLoading, setIsForgotLoading] = useState(false);
    const [isForgotOpen, setIsForgotOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const router = useRouter();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!forgotEmail) {
            setErrors({ email: "Email is required" });
            return;
        } else if (!emailRegex.test(forgotEmail)) {
            setErrors({ email: "Please enter a valid email address" });
            return;
        }

        setIsForgotLoading(true);
        try {
            await forgotPassword(forgotEmail);
            toast.success("Password reset link sent to your email!");
            setIsForgotOpen(false);
            setForgotEmail("");
        } catch (error: any) {
            toast.error(error.message || "Failed to send reset link");
        } finally {
            setIsForgotLoading(false);
        }
    };

    useEffect(() => {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            const data = JSON.parse(userInfo);
            if (data.role === "Admin") {
                router.push("/admin");
            } else if (data.role === "Authenticator") {
                router.push("/authenticator");
            } else {
                router.push("/dashboard");
            }
        }
    }, [router]);

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const data = await login({ email, password });
            localStorage.setItem("userInfo", JSON.stringify(data));
            toast.success("Login successful!");
            if (data.role === "Admin") {
                router.push("/admin");
            } else if (data.role === "Authenticator") {
                router.push("/authenticator");
            } else {
                router.push("/dashboard");
            }
        } catch (error: any) {
            toast.error(error.message || "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 flex items-center justify-center p-6 pt-32 pb-20">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="bg-card rounded-3xl shadow-soft-lg p-8 border border-border">
                        <div className="text-center space-y-2 mb-8">
                            <h1 className="text-3xl font-bold">Welcome Back</h1>
                            <p className="text-muted-foreground">Sign in to your Cohort account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            className={`pl-10 h-12 rounded-xl border-primary/10 transition-all focus:ring-primary/20 ${errors.email ? "border-destructive ring-destructive/20" : ""}`}
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (errors.email) setErrors({ ...errors, email: undefined });
                                            }}
                                        />
                                    </div>
                                    {errors.email && <p className="text-destructive text-xs mt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-sm font-semibold">Password</label>
                                        <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                                            <DialogTrigger asChild>
                                                <button type="button" className="text-xs font-medium text-primary hover:underline">Forgot password?</button>
                                            </DialogTrigger>
                                            <DialogContent className="rounded-[2rem] sm:max-w-md border-border/50 shadow-soft-xl">
                                                <DialogHeader>
                                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                                                        <AlertCircle className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <DialogTitle className="text-2xl font-black">Account Recovery</DialogTitle>
                                                    <DialogDescription className="font-medium text-muted-foreground">
                                                        Enter your registered email address and we'll send you a secure link to reset your credentials.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form onSubmit={handleForgotPassword} className="space-y-6 mt-4" noValidate>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Registered Email</label>
                                                        <div className="relative group">
                                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                            <Input
                                                                type="email"
                                                                placeholder="john@example.com"
                                                                className={`pl-11 h-12 rounded-2xl bg-muted/30 border-border/50 focus:bg-background transition-all ${errors.email ? "border-destructive ring-destructive/20" : ""}`}
                                                                value={forgotEmail}
                                                                onChange={(e) => {
                                                                    setForgotEmail(e.target.value);
                                                                    if (errors.email) setErrors({ ...errors, email: undefined });
                                                                }}
                                                            />
                                                        </div>
                                                        {errors.email && (
                                                            <p className="text-destructive text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                <AlertCircle className="w-3 h-3" /> {errors.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            type="submit"
                                                            className="w-full h-12 rounded-2xl font-black shadow-lg hover:shadow-primary/20 transition-all gap-2"
                                                            disabled={isForgotLoading}
                                                        >
                                                            {isForgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Recovery Link"}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className={`pl-10 pr-10 h-12 rounded-xl border-primary/10 transition-all focus:ring-primary/20 ${errors.password ? "border-destructive ring-destructive/20" : ""}`}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (errors.password) setErrors({ ...errors, password: undefined });
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-destructive text-xs mt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.password}</p>}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-lg font-bold shadow-lg hover:shadow-primary/20 transition-all gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Sign In <ArrowRight className="w-5 h-5" /></>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            <p className="text-muted-foreground">
                                Don't have an account?{" "}
                                <Link href="/contact" className="text-primary font-bold hover:underline">Contact us</Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Test Credentials</p>
                        <p className="text-sm text-muted-foreground">Admin: <span className="font-semibold text-foreground">k.pranavraj123@gmail.com</span> / <span className="font-semibold text-foreground">password123</span></p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Login;




