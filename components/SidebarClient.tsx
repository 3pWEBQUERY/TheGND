"use client";

import Link from "next/link";
import { Home, Search, Heart, User, Calendar, Star, Menu, Settings, LayoutDashboard, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { logoutUser } from "@/actions/auth";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SidebarClientProps {
    user: {
        username: string;
        email: string;
        image: string | null;
    } | null;
}

export function SidebarClient({ user }: SidebarClientProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--sidebar-width", isCollapsed ? "80px" : "256px");
    }, [isCollapsed]);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-white/10 bg-[#121212] transition-all duration-300",
                isCollapsed ? "w-[80px]" : "w-64"
            )}
        >
            <div className="flex h-full flex-col px-3 py-4">
                <div className={cn("mb-10 flex", isCollapsed ? "flex-col items-center gap-4" : "items-center justify-between pl-2.5")}>
                    {!isCollapsed ? (
                        <div className="relative h-8 w-32">
                            <Image src="/logo-full.svg" alt="The GND" fill className="object-contain" priority />
                        </div>
                    ) : (
                        <div className="relative h-8 w-8">
                            <Image src="/logo-small.svg" alt="The GND" fill className="object-contain" priority />
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-[#383838] transition-colors",
                            isCollapsed ? "" : ""
                        )}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-6 w-6 text-[#E91E63]" />
                        ) : (
                            <ChevronLeft className="h-6 w-6 text-[#E91E63]" />
                        )}
                    </button>
                </div>

                <ul className="space-y-2 font-medium">
                    <li>
                        <Link
                            href="/"
                            className="group flex items-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                        >
                            <Home className="h-5 w-5 flex-shrink-0 transition duration-75 group-hover:text-white" />
                            {!isCollapsed && <span className="ml-3">Home</span>}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#"
                            className="group flex items-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                        >
                            <Search className="h-5 w-5 flex-shrink-0 transition duration-75 group-hover:text-white" />
                            {!isCollapsed && <span className="ml-3">Suche</span>}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/escorts"
                            className="group flex items-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                        >
                            <Calendar className="h-5 w-5 flex-shrink-0 transition duration-75 group-hover:text-white" />
                            {!isCollapsed && <span className="ml-3">Escorts</span>}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#"
                            className="group flex items-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                        >
                            <Heart className="h-5 w-5 flex-shrink-0 transition duration-75 group-hover:text-white" />
                            {!isCollapsed && <span className="ml-3">Favorites</span>}
                        </Link>
                    </li>
                </ul>

                {!isCollapsed && (
                    <div className="mt-8 border-t border-white/10 pt-4">
                        <h3 className="mb-4 px-2 text-xs font-semibold uppercase text-gray-500">
                            Kategorien
                        </h3>
                        <ul className="space-y-2 font-medium">
                            <li>
                                <Link
                                    href="#"
                                    className="group flex items-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                                >
                                    <span className="ml-3">Neu</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="group flex items-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                                >
                                    <span className="ml-3">VIP</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="group flex items-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                                >
                                    <span className="ml-3">Beste Bewertungen</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}

                <div className="mt-auto border-t border-white/10 pt-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn("group flex w-full items-center gap-3 rounded-lg p-2 text-left text-gray-400 hover:bg-white/5 hover:text-white", isCollapsed ? "justify-center" : "")}>
                                {user?.image ? (
                                    <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                                        <Image src={user.image} alt={user.username} fill className="object-cover" />
                                    </div>
                                ) : (
                                    <User className="h-5 w-5 flex-shrink-0 transition duration-75 group-hover:text-white" />
                                )}
                                {!isCollapsed && (
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-medium text-white truncate">{user ? user.username : "Mein Profil"}</span>
                                        {user && <span className="text-xs text-gray-500 truncate">{user.email}</span>}
                                    </div>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-[#181818] text-white border-white/10" side="right" align="end">
                            <DropdownMenuLabel>Mein Account</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />

                            {user ? (
                                <>
                                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <Link href="/dashboard" className="w-full">Dashboard</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <Link href={`/profile/${user.username}`} className="w-full">Öffentliches Profil</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <Link href="/settings" className="w-full">Einstellungen</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer text-red-500 focus:text-red-500">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <form action={logoutUser} className="w-full">
                                            <button type="submit" className="w-full text-left">Abmelden</button>
                                        </form>
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                                        <Link href="/login" className="w-full">Anmelden</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                                        <Link href="/register" className="w-full">Registrieren</Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </aside>
    );
}
