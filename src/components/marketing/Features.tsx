"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface DemoCardData {
  av: string;
  name: string;
  q: string;
  c2: string;
  n2: string;
}

const DEMO_CARDS: DemoCardData[] = [
  {
    av: "豆",
    name: "豆包",
    q: "澳门有哪些本地人推荐的地道葡国菜餐厅？",
    c2: "某某葡多斯",
    n2: "环境好，人均偏高",
  },
  {
    av: "DS",
    name: "DeepSeek",
    q: "澳门氹仔人均200左右的葡国菜怎么选？",
    c2: "某某海边餐厅",
    n2: "景观位，菜式中规中矩",
  },
  {
    av: "Ki",
    name: "Kimi",
    q: "澳门适合情侣约会的葡式餐厅有哪些？",
    c2: "某某葡韵小馆",
    n2: "氛围好，建议提前订位",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [aci, setAci] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCarousel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSwapping(true);
      setTimeout(() => {
        setAci((prev) => (prev + 1) % DEMO_CARDS.length);
        setSwapping(false);
      }, 200);
    }, 3800);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setSwapping(true);
      setTimeout(() => {
        setAci(i);
        setSwapping(false);
      }, 200);
      startCarousel();
    },
    [startCarousel]
  );

  useEffect(() => {
    startCarousel();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startCarousel]);

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

  const d = DEMO_CARDS[aci];

  return (
    <div ref={sectionRef}>
      {/* CORE — AI Answer Demo */}
      <section className="mk-sec" id="power" style={{ background: "#fff" }}>
        <div className="mk-wrap">
          <div className="mk-sec-head mk-rv">
            <span className="mk-eyebrow">CORE</span>
            <h2>AI 会主动点名你的品牌</h2>
            <p>大陆游客问豆包、DeepSeek、Kimi、千问，答案里第一个出现的，就是你</p>
          </div>
          <div className="mk-demo mk-rv">
            <div className={`mk-ans-card${swapping ? " mk-swap" : ""}`}>
              <div className="mk-ans-head">
                <span className="mk-ans-av">{d.av}</span>
                <span style={{ fontWeight: 700, fontSize: "13.5px" }}>{d.name}</span>
                <span className="mk-live">AI 实时回答</span>
              </div>
              <div className="mk-ans-q">
                <span>{d.q}</span>
              </div>
              <p className="mk-ans-a">结合本地食客口碑，比较推荐的有：</p>
              <div className="mk-ans-list">
                <div className="mk-ans-item mk-hit">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3B6CF6" strokeWidth="1.6">
                    <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2" />
                  </svg>
                  <div>
                    <div className="mk-nm">
                      权叔葡国餐厅<span className="mk-badge">你的店</span>
                    </div>
                    <div className="mk-nt">氹仔老字号，非洲鸡、马介休评价高</div>
                  </div>
                </div>
                <div className="mk-ans-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9AA0AC" strokeWidth="1.6">
                    <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2" />
                  </svg>
                  <div>
                    <div className="mk-nm" style={{ color: "#3A3F4A" }}>{d.c2}</div>
                    <div className="mk-nt">{d.n2}</div>
                  </div>
                </div>
              </div>
              <div className="mk-ans-cite">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3B6CF6" strokeWidth="2">
                  <path d="M5 12l5 5L20 6" />
                </svg>
                来源 · AI提名官内容
              </div>
            </div>
            <div className="mk-dotgrid">
              {DEMO_CARDS.map((_, i) => (
                <i
                  key={i}
                  className={i === aci ? "mk-on" : ""}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <p className="mk-demo-hint">切换看不同 AI 平台的回答 →</p>
          </div>
        </div>
      </section>

      {/* Dark Dashboard Preview */}
      <section className="mk-sec" style={{ padding: "0 0 96px" }}>
        <div className="mk-dark-sec">
          <div className="mk-wrap">
            <div className="mk-sec-head mk-rv">
              <span className="mk-eyebrow">工作台</span>
              <h2>清清楚楚的四步工作台</h2>
              <p>顶部进度条永远告诉你&ldquo;在第几步、下一步做什么&rdquo;，新手引导浮层随开随关</p>
            </div>
            <div className="mk-winframe mk-rv">
              <div className="mk-win-bar">
                <i /><i /><i />
                <span className="mk-url">app.ai-tmg.com / 工作台</span>
              </div>
              <div className="mk-dash">
                <aside className="mk-d-side">
                  <div className="mk-dl">
                    <span className="mk-logo">
                      <span className="mk-logo-mark" style={{ width: 30, height: 30, fontSize: 16, borderRadius: 9, background: "#fff", color: "#15171C", boxShadow: "none" }}>@</span>
                      <span className="mk-logo-word" style={{ color: "#fff", fontSize: 16 }}>
                        <span className="mk-ai" style={{ color: "#9DB7E6" }}>AI</span>提名官
                      </span>
                    </span>
                  </div>
                  <div className="mk-d-nav">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#8C9AB4" strokeWidth="1.6">
                      <rect x="4" y="4" width="7" height="7" rx="1" />
                      <rect x="13" y="4" width="7" height="7" rx="1" />
                      <rect x="4" y="13" width="7" height="7" rx="1" />
                      <rect x="13" y="13" width="7" height="7" rx="1" />
                    </svg>
                    总览
                  </div>
                  <div className="mk-d-cap">推广流程</div>
                  <div className="mk-d-nav mk-on">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4.3-4.3" />
                    </svg>
                    ① 选词
                  </div>
                  <div className="mk-d-nav">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#8C9AB4" strokeWidth="1.6">
                      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17v3z" />
                    </svg>
                    ② 写稿
                  </div>
                  <div className="mk-d-nav">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#8C9AB4" strokeWidth="1.6">
                      <path d="M22 3L11 14M22 3l-7 18-4-7-7-4 18-7z" />
                    </svg>
                    ③ 发布
                  </div>
                  <div className="mk-d-nav">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#8C9AB4" strokeWidth="1.6">
                      <path d="M4 20V10M10 20V4M16 20v-7" />
                    </svg>
                    ④ 看效果
                  </div>
                </aside>
                <div className="mk-d-main">
                  <div className="mk-d-top">
                    <span style={{ fontSize: 12, color: "#7B8290" }}>当前项目</span>
                    <span className="mk-d-proj">澳门 · 权叔葡国餐厅 ▾</span>
                  </div>
                  <div className="mk-d-step-wrap">
                    <div className="mk-d-st mk-done">
                      <span className="mk-n">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1F8A5B" strokeWidth="2.2">
                          <path d="M5 12l5 5L20 6" />
                        </svg>
                      </span>
                      <span className="mk-lab">选词<b>已完成</b></span>
                    </div>
                    <div className="mk-d-line mk-ok" />
                    <div className="mk-d-st mk-cur">
                      <span className="mk-n">2</span>
                      <span className="mk-lab">写稿<b>进行中</b></span>
                    </div>
                    <div className="mk-d-line" />
                    <div className="mk-d-st">
                      <span className="mk-n">3</span>
                      <span className="mk-lab">发布<b>待开始</b></span>
                    </div>
                    <div className="mk-d-line" />
                    <div className="mk-d-st">
                      <span className="mk-n">4</span>
                      <span className="mk-lab">看效果<b>待开始</b></span>
                    </div>
                  </div>
                  <div className="mk-d-h">选好词了，开始写稿</div>
                  <div className="mk-d-table">
                    <div className="mk-d-tr mk-h">
                      <span>目标搜索词</span>
                      <span style={{ textAlign: "center" }}>优先级</span>
                      <span style={{ textAlign: "right" }}>状态</span>
                    </div>
                    <div className="mk-d-tr">
                      <span>澳门必吃葡国菜餐厅推荐</span>
                      <span className="mk-d-pr">★★★</span>
                      <span className="mk-d-badge mk-bg-ok">已上榜</span>
                    </div>
                    <div className="mk-d-tr">
                      <span>澳门人均200葡国餐厅</span>
                      <span className="mk-d-pr">★★★</span>
                      <span className="mk-d-badge mk-bg-mid">已写稿</span>
                    </div>
                    <div className="mk-d-tr">
                      <span>澳门情侣约会餐厅 葡式</span>
                      <span className="mk-d-pr">★★</span>
                      <span className="mk-d-badge mk-bg-todo">待写稿</span>
                    </div>
                    <div className="mk-d-tr">
                      <span>氹仔葡国菜 性价比高</span>
                      <span className="mk-d-pr">★</span>
                      <span className="mk-d-badge mk-bg-new">新词</span>
                    </div>
                  </div>
                  <div className="mk-d-guide">
                    <div className="mk-gh">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3B6CF6" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M9.5 9a2.5 2.5 0 113.5 2.3c-.9.5-1.5 1-1.5 2.2M12 17h.01" />
                      </svg>
                      <span className="mk-gn">这一步该做什么</span>
                      <span className="mk-skip">跳过</span>
                    </div>
                    <h4>挑一个高优先级的词</h4>
                    <p>选一个 ★★★ 的词，点「生成文章」，AI 自动写一篇排行榜或选购指南。</p>
                    <a className="mk-gnext" href="#">挑一个词，生成文章 →</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Gradient */}
      <section className="mk-sec" style={{ paddingTop: 0 }}>
        <div className="mk-wrap">
          <div className="mk-showcase mk-rv">
            <div>
              <h3>
                一篇主稿
                <br />
                一键适配各平台
              </h3>
              <p>头条、搜狐、知乎、小红书各有调性，AI 自动改写，复制粘贴即可发布。</p>
            </div>
            <div className="mk-sc-art">
              <div className="mk-b"><i /><i /><i /></div>
              <div className="mk-sc-body">
                <div className="mk-sc-col">
                  <span className="mk-sc-tab">主稿</span>
                  <span className="mk-sc-chip">澳门十大葡国菜餐厅排行榜…</span>
                  <span className="mk-sc-chip">权叔葡国餐厅，氹仔老字号…</span>
                  <span className="mk-sc-chip">非洲鸡、马介休球评价…</span>
                </div>
                <div className="mk-sc-col">
                  <span className="mk-sc-tab">平台版本</span>
                  <span className="mk-sc-chip mk-hl">头条 · 已适配</span>
                  <span className="mk-sc-chip mk-hl">知乎 · 已适配</span>
                  <span className="mk-sc-chip">小红书 · 改写中…</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
