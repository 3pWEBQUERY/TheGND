"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Home, Users2, LogIn, MessageSquare, Settings, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function MobileNavbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<"none" | "login" | "user">("none")
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    // Close dropdown on route change
    setOpenMenu("none")
  }, [pathname])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (openMenu === "none") return
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenMenu("none")
      }
    }
    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [openMenu])

  // Fetch avatar when authenticated
  useEffect(() => {
    let isMounted = true
    async function loadAvatar() {
      try {
        if (!session?.user?.id) {
          setAvatarUrl(null)
          return
        }
        const res = await fetch("/api/profile", { credentials: "include" })
        if (!res.ok) return
        const data = await res.json()
        const url: unknown = data?.user?.profile?.avatar
        if (isMounted && typeof url === "string" && url.length > 0) {
          setAvatarUrl(url)
        } else if (isMounted) {
          setAvatarUrl(null)
        }
      } catch {
        if (isMounted) setAvatarUrl(null)
      }
    }
    loadAvatar()
    return () => {
      isMounted = false
    }
  }, [session?.user?.id])

  const baseItemClass =
    "flex min-w-0 flex-col items-center justify-center gap-1 px-3 py-2"

  const iconClass = (active: boolean) =>
    `h-5 w-5 ${active ? "text-pink-500" : "text-white"}`

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="md:hidden fixed left-1/2 -translate-x-1/2 bottom-4 z-50 w-[calc(100%-2rem)] max-w-xl"
      aria-label="Mobile navigation"
    >
      <div
        className="relative mx-auto rounded-2xl bg-black/80 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md"
      >
        <div className="grid grid-cols-5 items-stretch">
          {/* HOME */}
          <Link href="/" aria-label="Home" className={`${baseItemClass} rounded-l-2xl`}>
            <Home className={iconClass(isActive("/"))} />
          </Link>

          {/* ESCORT */}
          <Link href="/escorts" aria-label="Escort" className={baseItemClass}>
            <Users2 className={iconClass(isActive("/escorts"))} />
          </Link>

          {/* LOGIN or USER MENU in the middle */}
          {session?.user ? (
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "user" ? "none" : "user"))}
              className={`${baseItemClass} relative`}
              aria-haspopup="menu"
              aria-expanded={openMenu === "user"}
              aria-controls="user-menu"
              aria-label="Mein Bereich"
            >
              <div className="flex flex-col items-center justify-center">
                <Avatar className="size-5 mb-1 bg-white/10 ring-1 ring-white/30">
                  <AvatarImage src={avatarUrl ?? undefined} alt="avatar" />
                  <AvatarFallback className="text-[10px] font-medium tracking-widest text-white bg-white/10">
                    {session.user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "login" ? "none" : "login"))}
              className={`${baseItemClass} relative`}
              aria-haspopup="menu"
              aria-expanded={openMenu === "login"}
              aria-controls="login-menu"
              aria-label="Login"
            >
              <LogIn className={iconClass(false)} />
            </button>
          )}

          {/* NACHRICHTEN */}
          <Link href="/notifications" aria-label="Nachrichten" className={baseItemClass}>
            <MessageSquare className={iconClass(isActive("/notifications"))} />
          </Link>

          {/* EINSTELLUNGEN */}
          <Link href="/settings" aria-label="Einstellungen" className={`${baseItemClass} rounded-r-2xl`}>
            <Settings className={iconClass(isActive("/settings"))} />
          </Link>
        </div>

        {/* Dropdowns */}
        {openMenu !== "none" && (
          <div
            ref={dropdownRef}
            id={openMenu === "login" ? "login-menu" : "user-menu"}
            role="menu"
            className="absolute -top-2 translate-y-[-100%] left-1/2 -translate-x-1/2 w-56 rounded-xl bg-black/90 ring-1 ring-white/15 shadow-xl backdrop-blur-md p-2"
          >
            {openMenu === "login" ? (
              <>
                <Link
                  href="/auth/signin"
                  className="block w-full px-3 py-2 rounded-lg text-sm tracking-wider text-white/90 hover:bg-white/10"
                  role="menuitem"
                >
                  Anmelden
                </Link>
                <Link
                  href="/auth/signup"
                  className="mt-1 block w-full px-3 py-2 rounded-lg text-sm tracking-wider text-white/90 hover:bg-white/10"
                  role="menuitem"
                >
                  Registrieren
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="block w-full px-3 py-2 rounded-lg text-sm tracking-wider text-white/90 hover:bg-white/10"
                  role="menuitem"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="mt-1 w-full px-3 py-2 rounded-lg text-left text-sm tracking-wider text-white/90 hover:bg-white/10 flex items-center gap-2"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" /> Abmelden
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Safe area spacer for iOS */}
      <div className="pt-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
