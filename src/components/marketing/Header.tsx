"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE_NAME, NAV_ITEMS } from "@/constants";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">AI</span>
            <span className="text-xl font-bold text-foreground">提名官</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              登录
            </Link>
            <Link
              href="/login"
              className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
            >
              免费注册
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="切换菜单"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border pt-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block py-2 text-sm text-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/login"
                className="text-center text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
              >
                免费注册 / 登录
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
