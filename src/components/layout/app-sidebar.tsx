"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Speaker,
  GitCompare,
  SlidersHorizontal,
  Box,
  Mic,
  ChevronLeft,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meu-projeto", label: "Meu Projeto", icon: Car },
  { href: "/equipamentos", label: "Equipamentos", icon: Speaker },
  { href: "/compatibilidade", label: "Compatibilidade", icon: GitCompare },
  { href: "/configuracao", label: "Configuração", icon: SlidersHorizontal },
  { href: "/caixa", label: "Caixa", icon: Box },
  { href: "/medidor-db", label: "Medidor dB", icon: Mic },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/[0.06] bg-[#0A0E14] transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/[0.06] px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Volume2 className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-white">
              Som<span className="text-cyan-400">Certo</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 shadow-sm shadow-cyan-500/5"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-cyan-400"
                    : "text-gray-500 group-hover:text-gray-400"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/[0.04] hover:text-gray-300"
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  );
}
