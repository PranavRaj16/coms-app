"use client";
import { useState, useEffect, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { verifyDayPass } from "@/lib/api";
import { toast } from "sonner";
import {
    Scan,
    User,
    Calendar,
    Clock,
    ShieldCheck,
    ShieldAlert,
    LogOut,
    CheckCircle2,
    XCircle,
    Loader2,
    History,
    RefreshCcw,
    AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";

const AuthenticatorDashboard = () => {
    const [scannedResult, setScannedResult] = useState<any>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
    const [scanHistory, setScanHistory] = useState<any[]>([]);

    const router = useRouter();
    const [userInfo, setUserInfo] = useState<any>({});

    useEffect(() => {
        const stored = localStorage.getItem("userInfo");
        if (stored) {
            setUserInfo(JSON.parse(stored));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        router.push("/login");
    };

    const playSound = (type: 'success' | 'error') => {
        const audio = new Audio(type === 'success' ? '/success.mp3' : '/error.mp3');
        audio.play().catch(() => { }); // Ignore if audio fails to play
    };

    const processScan = useCallback(async (decodedText: string) => {
        if (decodedText === lastScannedCode || isLoading) return;

        setLastScannedCode(decodedText);
        setIsLoading(true);
        setIsScanning(false);

        try {
            const response = await verifyDayPass(decodedText);
            setScannedResult({
                success: true,
                data: response.data,
                message: response.message
            });
            playSound('success');
            setScanHistory(prev => [{
                code: decodedText,
                name: response.data.name,
                time: new Date().toLocaleTimeString(),
                status: 'Success'
            }, ...prev].slice(0, 10));
            toast.success(response.message);
        } catch (error: any) {
            setScannedResult({
                success: false,
                message: error.message || "Invalid or Expired Pass"
            });
            playSound('error');
            setScanHistory(prev => [{
                code: decodedText,
                name: "Unknown",
                time: new Date().toLocaleTimeString(),
                status: 'Failed'
            }, ...prev].slice(0, 10));
            toast.error(error.message || "Verification failed");
        } finally {
            setIsLoading(false);
        }
    }, [lastScannedCode, isLoading]);

    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;

        if (isScanning && !isLoading) {
            scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );

            scanner.render(
                (decodedText) => {
                    processScan(decodedText);
                    scanner?.clear();
                },
                (error) => {
                    // console.warn(error);
                }
            );
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            }
        };
    }, [isScanning, isLoading, processScan]);

    const resetScanner = () => {
        setScannedResult(null);
        setLastScannedCode(null);
        setIsScanning(true);
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight">AUTHENTICATOR</h1>
                            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Cohort Access Control</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-bold">{userInfo.name}</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Security Officer</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container max-w-5xl mx-auto py-8 px-4 sm:px-6">
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* Left Column: Scanner & Results */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Status Card */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="glass shadow-soft overflow-hidden border-none bg-primary/5">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-primary/20 text-primary">
                                        <Scan className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scanner Status</p>
                                        <p className="text-sm font-bold">{isScanning ? 'Active' : 'Standby'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="glass shadow-soft overflow-hidden border-none bg-indigo-500/5">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-500">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Encryption</p>
                                        <p className="text-sm font-bold">256-bit AES</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Scanner Card */}
                        <Card className="glass shadow-2xl border-none overflow-hidden rounded-3xl">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-black italic">Access Verification</CardTitle>
                                    {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {isScanning ? (
                                    <div className="relative">
                                        <div id="reader" className="overflow-hidden rounded-2xl border-4 border-muted/50"></div>
                                        <div className="mt-6 text-center">
                                            <p className="text-sm text-muted-foreground font-medium animate-pulse flex items-center justify-center gap-2">
                                                <Scan className="w-4 h-4" /> Align QR code within the frame
                                            </p>
                                        </div>
                                    </div>
                                ) : scannedResult ? (
                                    <div className="py-8 space-y-8 animate-in zoom-in-95 duration-300">
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${scannedResult.success ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'} ring-8 ${scannedResult.success ? 'ring-emerald-500/10' : 'ring-rose-500/10'}`}>
                                                {scannedResult.success ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                                            </div>
                                            <div>
                                                <h3 className={`text-2xl font-black ${scannedResult.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {scannedResult.success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                                                </h3>
                                                <p className="text-muted-foreground font-bold mt-1 uppercase tracking-tight italic">
                                                    {scannedResult.message}
                                                </p>
                                            </div>
                                        </div>

                                        {scannedResult.data && (
                                            <div className="bg-muted/30 rounded-3xl p-6 space-y-4 border border-border/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center font-black text-xl text-primary">
                                                        {scannedResult.data.name[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-lg">{scannedResult.data.name}</h4>
                                                        <p className="text-xs text-muted-foreground font-bold">{scannedResult.data.email}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase text-muted-foreground/60">Pass ID</p>
                                                        <p className="text-sm font-bold tracking-widest">{scannedResult.data.passCode}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase text-muted-foreground/60">Valid Date</p>
                                                        <p className="text-sm font-bold">
                                                            {new Date(scannedResult.data.visitDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-border/50 flex flex-col gap-1">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground/60">Purpose of Visit</p>
                                                    <p className="text-xs font-bold italic">"{scannedResult.data.purpose}"</p>
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            onClick={resetScanner}
                                            className="w-full h-14 rounded-2xl font-black italic tracking-widest gap-3 shadow-xl shadow-primary/20"
                                        >
                                            <RefreshCcw className="w-5 h-5" /> RESTART SCANNER
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                        <div className="p-4 rounded-full bg-muted/50">
                                            <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground font-bold uppercase tracking-widest">Processing Data...</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: History & Stats */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="glass border-none shadow-xl overflow-hidden rounded-3xl">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-lg font-black flex items-center gap-2">
                                    <History className="w-5 h-5 text-primary" /> RECENT SCANS
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    {scanHistory.length > 0 ? (
                                        scanHistory.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/50 group hover:border-primary/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${item.status === 'Success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                                                    <div>
                                                        <p className="text-sm font-black truncate max-w-[150px]">{item.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-bold tracking-tighter">{item.code}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black">{item.time}</p>
                                                    <Badge className={`text-[8px] h-4 uppercase font-black px-1.5 border-none ${item.status === 'Success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center text-muted-foreground">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-xs font-black uppercase tracking-widest opacity-40">No activity logged</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/10 p-4">
                                <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100">
                                    Clear Local History
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Security Notice */}
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 space-y-3">
                            <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4" /> Security Protocol
                            </h4>
                            <p className="text-xs text-amber-700/80 font-medium leading-relaxed">
                                Always verify the visitor's physical identity matches the name displayed on the screen. Reported fraudulent attempts must be logged immediately.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AuthenticatorDashboard;




