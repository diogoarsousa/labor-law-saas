"use client";

import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout, getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

/** Top bar header with user menu and notification bell */
export function Header() {
  const router = useRouter();
  const user = getUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Left — page title slot */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">
          Plataforma de Direito do Trabalho
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-600" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500",
              menuOpen && "bg-slate-100"
            )}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="max-w-[120px] truncate">
              {user?.nome ?? "Utilizador"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-56 rounded-md border bg-white py-1 shadow-lg z-50">
              <div className="border-b px-4 py-2">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.nome}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Terminar sessão
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
