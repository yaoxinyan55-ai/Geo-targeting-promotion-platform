"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export type PanelKey = "overview" | "projects" | "new-project" | "keywords" | "articles" | "generate" | "publish" | "monitor";

interface SidebarItem {
  key: PanelKey;
  label: string;
  icon: React.ReactNode;
  indent?: boolean;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/^\+?86/, "");
  if (digits.length !== 11) return digits;
  return `${digits.slice(0, 3)}****${digits.slice(7)}`;
}

const NAV_ITEMS: SidebarItem[] = [
  {
    key: "overview",
    label: "控制台",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  },
  {
    key: "projects",
    label: "项目管理",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  },
  {
    key: "keywords",
    label: "关键词中心",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
  },
  {
    key: "articles",
    label: "文章工作台",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  },
  {
    key: "generate",
    label: "AI生成文章",
    indent: true,
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  },
  {
    key: "publish",
    label: "发布中心",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  },
  {
    key: "monitor",
    label: "监控仪表盘",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
];

interface UnifiedSidebarProps {
  activePanel: PanelKey;
  onNavigate: (panel: PanelKey) => void;
}

export function UnifiedSidebar({ activePanel, onNavigate }: UnifiedSidebarProps) {
  const [userPhone, setUserPhone] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.phone) {
        setUserPhone(maskPhone(data.user.phone));
      }
    });
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-sidebar-bg min-h-screen flex-shrink-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">AI</span>
          <span className="text-xl font-bold text-white">提名官</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === activePanel;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                item.indent ? "ml-4" : ""
              } ${
                isActive
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-text hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
            {userPhone ? userPhone[0] : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{userPhone || "加载中..."}</p>
            <p className="text-xs text-sidebar-text">免费版</p>
          </div>
          <button onClick={handleLogout} className="text-sidebar-text hover:text-white transition-colors" title="退出登录">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

interface MobileHeaderProps {
  activePanel: PanelKey;
  onNavigate: (panel: PanelKey) => void;
}

export function MobileHeader({ activePanel, onNavigate }: MobileHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="lg:hidden bg-white border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-xl font-bold text-primary">AI</span>
          <span className="text-lg font-bold text-foreground">提名官</span>
        </Link>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2" aria-label="切换菜单">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <nav className="px-4 pb-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button key={item.key}
              onClick={() => { onNavigate(item.key); setMenuOpen(false); }}
              className={`w-full text-left block px-3 py-2 rounded-lg text-sm transition-colors ${item.indent ? "ml-4" : ""} ${
                activePanel === item.key ? "bg-primary-light text-primary font-medium" : "text-muted hover:bg-secondary"
              }`}>
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
