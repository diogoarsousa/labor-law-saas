"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  FileText,
  ShieldCheck,
  Briefcase,
  Calculator,
  FilePlus,
  Search,
  Bell,
  LayoutDashboard,
  Scale,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Painel",
    icon: LayoutDashboard,
  },
  {
    href: "/chat",
    label: "Consulta Jurídica IA",
    icon: MessageSquare,
  },
  {
    href: "/contracts",
    label: "Análise de Contratos",
    icon: FileText,
  },
  {
    href: "/compliance",
    label: "Conformidade",
    icon: ShieldCheck,
  },
  {
    href: "/cases",
    label: "Processos",
    icon: Briefcase,
  },
  {
    href: "/calculators",
    label: "Calculadoras",
    icon: Calculator,
  },
  {
    href: "/documents",
    label: "Geração de Documentos",
    icon: FilePlus,
  },
  {
    href: "/jurisprudence",
    label: "Jurisprudência",
    icon: Search,
  },
  {
    href: "/monitoring",
    label: "Monitorização Legal",
    icon: Bell,
  },
];

/** Collapsible sidebar navigation for the dashboard shell */
export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-navy-800 text-white transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-navy-700 px-4">
        <Scale className="h-6 w-6 shrink-0 text-indigo-400" />
        {!collapsed && (
          <span className="ml-3 text-base font-semibold tracking-tight whitespace-nowrap">
            Doutor Trabalho
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-navy-200 hover:bg-navy-700 hover:text-white",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-navy-600 bg-navy-800 text-white hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Footer */}
      <div className="border-t border-navy-700 p-4">
        {!collapsed && (
          <p className="text-xs text-navy-400">
            Código do Trabalho 2024
          </p>
        )}
      </div>
    </aside>
  );
}
