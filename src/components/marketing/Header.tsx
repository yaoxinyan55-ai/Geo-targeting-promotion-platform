"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`mk-nav${scrolled ? " scrolled" : ""}`} id="nav">
      <div className="mk-wrap mk-nav-inner">
        <Link className="mk-logo" href="#top">
          <span className="mk-logo-mark">@</span>
          <span className="mk-logo-word">
            <span className="mk-ai">AI</span>提名官
          </span>
        </Link>
        <nav className="mk-nav-links">
          <a href="#how">怎么用</a>
          <a href="#power">核心能力</a>
          <a href="#case">示例项目</a>
        </nav>
        <div className="mk-nav-cta">
          <Link className="mk-btn mk-btn-ghost" href="/login">
            登录
          </Link>
          <Link className="mk-btn mk-btn-dark" href="/login">
            免费注册
          </Link>
        </div>
      </div>
    </header>
  );
}
