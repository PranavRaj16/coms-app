import { useState } from "react";
import { useRouter } from "next/navigation";
import cohortimage from "@/assets/cohort-logo.png";

type Role = "user" | "admin";

const LoginForm = () => {
    const [role, setRole] = useState<Role>("user");
    const router = useRouter();

    const handleLogin = () => {
        if (role === "admin") {
            router.push("/admin/dashboard");
        } else {
            router.push("/");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center login-gradient px-4">

            <div className="bg-card w-full max-w-md rounded-2xl shadow-xl p-8 border border-border">
                {/* Logo / Title */}
                <div className="text-center mb-6">
                    <img src={cohortimage.src} alt="Logo" className="w-60 rounded-full mx-auto" />
                    <p className="text-muted-foreground text-sm mt-1">
                        Sign in to continue
                    </p>
                </div>

                {/* Role Switch */}
                <div className="flex bg-muted rounded-xl p-1 mb-6">
                    <button
                        onClick={() => setRole("user")}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${role === "user"
                            ? "bg-card shadow text-primary"
                            : "text-muted-foreground"
                            }`}
                    >
                        User
                    </button>

                    <button
                        onClick={() => setRole("admin")}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${role === "admin"
                            ? "bg-card shadow text-primary"
                            : "text-muted-foreground"
                            }`}
                    >
                        Admin
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">

                    <input
                        type="email"
                        placeholder="Email address"
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />

                    <button
                        onClick={handleLogin}
                        className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primaryDark transition"
                    >
                        Login as {role === "admin" ? "Admin" : "User"}
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-muted-foreground">
                    Forgot password?{" "}
                    <span className="text-primary cursor-pointer hover:underline">
                        Reset
                    </span>
                </div>

            </div>
        </div>
    );
};

export default LoginForm;





