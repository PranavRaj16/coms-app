"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette, Sun, Moon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const themes = [
    { name: "Teal (Default)", class: "" },
    { name: "Ocean", class: "theme-ocean" },
    { name: "Rose", class: "theme-rose" },
];

export function ThemeSwitcher({ className }: { className?: string }) {
    const [currentTheme, setCurrentTheme] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);

    const setTheme = (themeClass: string) => {
        const root = window.document.documentElement;

        // Remove all theme classes
        themes.forEach((t) => {
            if (t.class) root.classList.remove(t.class);
        });

        // Add new theme class
        if (themeClass) {
            root.classList.add(themeClass);
        }

        setCurrentTheme(themeClass);
        localStorage.setItem("app-theme", themeClass);
    };

    const toggleDarkMode = () => {
        const root = window.document.documentElement;
        const newMode = !isDarkMode;

        if (newMode) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        setIsDarkMode(newMode);
        localStorage.setItem("app-appearance", newMode ? "dark" : "light");
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem("app-theme") || "";
        const savedAppearance = localStorage.getItem("app-appearance") || "light";
        const root = window.document.documentElement;

        setTheme(savedTheme);

        if (savedAppearance === "dark") {
            root.classList.add("dark");
            setIsDarkMode(true);
        } else {
            root.classList.remove("dark");
            setIsDarkMode(false);
        }
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`w-9 h-9 ${className || ""}`}>
                    <Palette className="h-5 w-5" />
                    <span className="sr-only">Switch theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuItem onClick={toggleDarkMode}>
                    <div className="flex items-center gap-2 w-full">
                        {isDarkMode ? (
                            <>
                                <Sun className="h-4 w-4" />
                                <span>Light Mode</span>
                            </>
                        ) : (
                            <>
                                <Moon className="h-4 w-4" />
                                <span>Dark Mode</span>
                            </>
                        )}
                    </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
                {themes.map((theme) => (
                    <DropdownMenuItem
                        key={theme.class}
                        onClick={() => setTheme(theme.class)}
                        className={currentTheme === theme.class ? "bg-accent" : ""}
                    >
                        {theme.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}





