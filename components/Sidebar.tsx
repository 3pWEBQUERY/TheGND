import Link from "next/link";
import { Home, Search, Heart, User, Calendar, Star, Menu, Settings, LayoutDashboard, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { logoutUser } from "@/actions/auth";

export async function Sidebar() {
  const session = await verifySession();
  let user = null;

  if (session?.userId) {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { username: true, image: true, email: true },
    });
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-white/10 bg-[#121212] transition-transform sm:translate-x-0">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-10 flex items-center pl-2.5">
          <span className="self-center whitespace-nowrap text-2xl font-semi text-white">
            THE<span className="text-[#E91E63]">GND</span>
          </span>
        </div>
        <ul className="space-y-2 font-medium">
          <li>
            <Link
              href="/"
              className="group flex items-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <Home className="h-5 w-5 transition duration-75 group-hover:text-white" />
              <span className="ml-3">Home</span>
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="group flex items-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <Search className="h-5 w-5 transition duration-75 group-hover:text-white" />
              <span className="ml-3">Suche</span>
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="group flex items-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <Calendar className="h-5 w-5 transition duration-75 group-hover:text-white" />
              <span className="ml-3">Escorts</span>
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="group flex items-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <Heart className="h-5 w-5 transition duration-75 group-hover:text-white" />
              <span className="ml-3">Favorites</span>
            </Link>
          </li>
        </ul>
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
        <div className="mt-auto border-t border-white/10 pt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex w-full items-center gap-3 rounded-lg p-2 text-left text-gray-400 hover:bg-white/5 hover:text-white">
                {user?.image ? (
                  <div className="relative h-8 w-8 overflow-hidden rounded-full">
                    <Image src={user.image} alt={user.username} fill className="object-cover" />
                  </div>
                ) : (
                  <User className="h-5 w-5 transition duration-75 group-hover:text-white" />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{user ? user.username : "Mein Profil"}</span>
                  {user && <span className="text-xs text-gray-500 truncate w-32">{user.email}</span>}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#181818] text-white border-white/10">
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
