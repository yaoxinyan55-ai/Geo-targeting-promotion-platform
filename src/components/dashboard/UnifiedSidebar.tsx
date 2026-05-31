"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export type PanelKey = "overview" | "projects" | "new-project" | "keywords" | "articles" | "generate" | "publish" | "monitor";

interface UnifiedSidebarProps {
  activePanel: PanelKey;
  onNavigate: (panel: PanelKey) => void;
  guideOn: boolean;
  onToggleGuide: () => void;
}

function maskPhone(phone: string): string {
  const clean = phone.replace(/^\+/, "");
  if (clean.length <= 4) return clean;
  return `${clean.slice(0, 3)}****${clean.slice(-4)}`;
}

const STEP_MAP: { step: number; key: PanelKey; label: string }[] = [
  { step: 1, key: "keywords", label: "选词" },
  { step: 2, key: "generate", label: "写稿" },
  { step: 3, key: "publish", label: "发布" },
  { step: 4, key: "monitor", label: "看效果" },
];

export function UnifiedSidebar({ activePanel, onNavigate, guideOn, onToggleGuide }: UnifiedSidebarProps) {
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

  const isProjectActive = activePanel === "projects" || activePanel === "new-project";

  return (
    <aside className="ws-side">
      <Link className="ws-s-logo" href="/">
        <span className="ws-s-mark">@</span>
        <span className="ws-s-word">AI 提名官</span>
      </Link>

      {/* 我的项目 — 最上面 */}
      <button
        className={`ws-s-item${isProjectActive ? " ws-on" : ""}`}
        onClick={() => onNavigate("projects")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
        我的项目
      </button>

      {/* 推广流程四步 */}
      <div className="ws-s-cap">推广流程</div>
      {STEP_MAP.map((s) => (
        <button
          key={s.step}
          className={`ws-s-item${activePanel === s.key ? " ws-on" : ""}`}
          onClick={() => onNavigate(s.key)}
        >
          <span className="ws-s-num">{s.step}</span>
          {s.label}
          <span className="ws-s-tick">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12l5 5L20 6" />
            </svg>
          </span>
        </button>
      ))}

      <div className="ws-s-divider" />

      {/* 总览 — 最下面 */}
      <button
        className={`ws-s-item${activePanel === "overview" ? " ws-on" : ""}`}
        onClick={() => onNavigate("overview")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
        总览
      </button>

      <div className="ws-s-spacer" />

      {/* Guide toggle */}
      <div className="ws-guide-card">
        <div className="ws-guide-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9a2.5 2.5 0 113.5 2.3c-.9.5-1.5 1-1.5 2.2M12 17h.01" />
          </svg>
          <span className="ws-gt">新手引导</span>
          <button
            className={`ws-switch${guideOn ? " ws-on" : ""}`}
            onClick={onToggleGuide}
            aria-label="切换新手引导"
          />
        </div>
        <p>开启后一步步带你走，熟练了随时关掉。</p>
      </div>

      {/* User */}
      <div className="ws-s-user">
        <span className="ws-s-ava">{userPhone ? userPhone[0] : "U"}</span>
        <div>
          <div className="ws-nm">{userPhone || "加载中..."}</div>
          <div className="ws-pl">免费版</div>
        </div>
        <button className="ws-s-logout" onClick={handleLogout} title="退出登录">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
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

  const allItems: { key: PanelKey; label: string }[] = [
    { key: "projects", label: "我的项目" },
    { key: "keywords", label: "① 选词" },
    { key: "generate", label: "② 写稿" },
    { key: "publish", label: "③ 发布" },
    { key: "monitor", label: "④ 看效果" },
    { key: "overview", label: "总览" },
  ];

  return (
    <header style={{ display: "none" }} className="ws-mobile-header">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 56 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="ws-s-mark" style={{ width: 26, height: 26, fontSize: 14, borderRadius: 7 }}>@</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>AI 提名官</span>
        </Link>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ padding: 8, background: "none", border: "none" }} aria-label="菜单">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <path d="M6 18L18 6M6 6l12 12" />
              : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <nav style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          {allItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { onNavigate(item.key); setMenuOpen(false); }}
              className={`ws-s-item${activePanel === item.key ? " ws-on" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
