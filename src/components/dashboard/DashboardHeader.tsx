"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV } from "@/constants";

export function DashboardHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="lg:hidden bg-white border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-xl font-bold text-primary">AI</span>
          <span className="text-lg font-bold text-foreground">提名官</span>
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2"
          aria-label="切换菜单"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="px-4 pb-4 space-y-1">
          {DASHBOARD_NAV.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary-light text-primary font-medium"
                    : "text-muted hover:bg-secondary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
