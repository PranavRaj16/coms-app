"use client";
import { useState, useEffect } from "react";
import Link from "next/link"; import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LayoutDashboard, Building2 } from "lucide-react";
import cohortimage from "@/assets/cohort-logo.png";
import { ThemeSwitcher } from "./ThemeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();
  const location = usePathname() ?? '';

  const isHeroPage = ["/", "/about"].includes(location);
  const useDarkNavbar = isHeroPage && !isScrolled && !isMobileMenuOpen;

  useEffect(() => {
    const user = localStorage.getItem("userInfo");
    if (user) {
      setUserInfo(JSON.parse(user));
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    router.push("/login");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${!useDarkNavbar
        ? "glass shadow-soft border-b border-border/50"
        : "bg-black/20 backdrop-blur-[2px]"
        }`}
    >
      <nav className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src={cohortimage.src} alt="Logo" className="w-40 rounded-full" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {["Home", "Browse Workspaces", "Day Pass", "About", "Contact"].map((item) => {
              const path = item === "Home" ? "/" :
                item === "Browse Workspaces" ? "/workspaces" :
                  item === "Day Pass" ? "/day-pass" :
                    `/${item.toLowerCase().replace(" ", "-")}`;

              return (
                <Link
                  key={item}
                  href={path}
                  className={`transition-colors link-underline ${!useDarkNavbar ? "text-muted-foreground hover:text-foreground" : "text-white hover:text-white"
                    }`}
                >
                  {item}
                </Link>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeSwitcher className={useDarkNavbar ? "text-white hover:text-white" : ""} />

            {userInfo ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={useDarkNavbar ? "ghost" : "outline"} size="sm" className={`gap-2 ${useDarkNavbar ? "border-white/30 text-white hover:bg-white/10 bg-transparent" : ""}`}>
                    <User className="w-4 h-4" />
                    {userInfo.name.split(' ')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-bold">{userInfo.name}</p>
                    <p className="text-xs text-muted-foreground">{userInfo.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center gap-2 w-full">
                      <Building2 className="w-4 h-4" />
                      Workplace Portal
                    </Link>
                  </DropdownMenuItem>
                  {(userInfo.role === "Admin" || userInfo.role === "Authenticator") && (
                    <DropdownMenuItem asChild>
                      <Link href="/authenticator" className="cursor-pointer flex items-center gap-2 w-full">
                        <User className="w-4 h-4" />
                        Authenticator Portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userInfo.role === "Admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer flex items-center gap-2 w-full">
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant={useDarkNavbar ? "ghost" : "outline"} size="sm" asChild className={useDarkNavbar ? "border border-white/30 text-white hover:bg-white/10 bg-transparent" : ""}>
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            <Button variant="default" size="sm" asChild>
              <Link href="/get-quote">Get Quote</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${!useDarkNavbar ? "hover:bg-muted" : "hover:bg-white/10"
              }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${!useDarkNavbar ? "text-foreground" : "text-white"}`} />
            ) : (
              <Menu className={`w-6 h-6 ${!useDarkNavbar ? "text-foreground" : "text-white"}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in overflow-y-auto max-h-[calc(100vh-5rem)] pb-8 px-1">
            <div className="flex flex-col gap-4">
              <Link href="/"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link href="/workspaces"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse Workspaces
              </Link>
              <Link href="/day-pass"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Day Pass
              </Link>

              <Link href="/about"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link href="/contact"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {userInfo ? (
                  <>
                    <div className="px-2 py-2">
                      <p className="font-bold">{userInfo.name}</p>
                      <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Button variant="outline" asChild className="justify-start">
                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Workplace Portal</Link>
                      </Button>

                      {(userInfo.role === "Admin" || userInfo.role === "Authenticator") && (
                        <Button variant="outline" asChild className="justify-start">
                          <Link href="/authenticator" onClick={() => setIsMobileMenuOpen(false)}>Authenticator Portal</Link>
                        </Button>
                      )}

                      {userInfo.role === "Admin" && (
                        <Button variant="outline" asChild className="justify-start text-primary border-primary/20 bg-primary/5">
                          <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
                        </Button>
                      )}
                    </div>
                    <Button variant="ghost" onClick={handleLogout} className="justify-start text-destructive hover:text-destructive">
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                )}
                <Button asChild>
                  <Link href="/get-quote" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;





