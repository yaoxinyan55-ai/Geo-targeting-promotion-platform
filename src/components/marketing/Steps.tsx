"use client";

import { useEffect, useRef } from "react";

export function Steps() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
          }
        });
      },
      { threshold: 0.12 }
    );

    const rvElements = sectionRef.current?.querySelectorAll(".mk-rv");
    rvElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="mk-sec" id="how" ref={sectionRef}>
      <div className="mk-wrap">
        <div className="mk-stage mk-rv">
          <div className="mk-core">@</div>
          <div className="mk-fpill mk-fp1">
            <span className="mk-fi">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </span>
            <span className="mk-step">01</span>选词 · 找对搜索词
          </div>
          <div className="mk-fpill mk-fp2">
            <span className="mk-fi">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17v3z" />
              </svg>
            </span>
            <span className="mk-step">02</span>写稿 · AI 出文
          </div>
          <div className="mk-fpill mk-fp3">
            <span className="mk-fi">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 3L11 14M22 3l-7 18-4-7-7-4 18-7z" />
              </svg>
            </span>
            <span className="mk-step">03</span>发布 · 一键多平台
          </div>
          <div className="mk-fpill mk-fp5">
            <span className="mk-fi">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
              </svg>
            </span>
            <span className="mk-step">04</span>上榜 · 实时监控
          </div>
          <div className="mk-fpill mk-fp4">
            <span className="mk-fi">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
              </svg>
            </span>
            全程 AI 辅助
          </div>
        </div>
        <div className="mk-sec-head" style={{ marginTop: "10px" }}>
          <h2>上 AI 答案，就是这么简单</h2>
          <p>选词 · 写稿 · 发布 · 监控，四步全自动，复制粘贴就能发</p>
        </div>
      </div>
    </section>
  );
}
