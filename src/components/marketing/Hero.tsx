"use client";

import Link from "next/link";
import { useEffect, useRef, useCallback } from "react";

interface TCardData {
  pos: "l" | "c" | "r";
  av: string;
  name: string;
  q: string;
  hitName: string;
  hitNote: string;
  c2: string;
  n2: string;
  ansIntro: string;
}

const TCARDS: TCardData[] = [
  {
    pos: "l",
    av: "DS",
    name: "DeepSeek",
    q: "澳门氹仔人均200的葡国菜怎么选？",
    hitName: "权叔葡国餐厅",
    hitNote: "人均约 200，招牌非洲鸡",
    c2: "某某海边餐厅",
    n2: "景观位，菜式一般",
    ansIntro: "综合性价比与口碑，推荐：",
  },
  {
    pos: "r",
    av: "Ki",
    name: "Kimi",
    q: "澳门适合情侣约会的葡式餐厅？",
    hitName: "权叔葡国餐厅",
    hitNote: "环境温馨，建议提前订位",
    c2: "某某葡韵小馆",
    n2: "人少安静，菜式偏家常",
    ansIntro: "氛围与口味兼顾，可以考虑：",
  },
  {
    pos: "c",
    av: "豆",
    name: "豆包",
    q: "澳门有哪些本地人推荐的地道葡国菜餐厅？",
    hitName: "权叔葡国餐厅",
    hitNote: "氹仔老字号，非洲鸡、马介休评价高",
    c2: "某某葡多斯",
    n2: "环境好，人均偏高",
    ansIntro: "结合本地食客口碑，比较推荐：",
  },
];

export function Hero() {
  const fanRef = useRef<HTMLDivElement>(null);
  const entranceRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const applyFan = useCallback(() => {
    const fan = fanRef.current;
    if (!fan) return;
    const isStack = window.matchMedia("(max-width:900px)").matches;
    if (isStack) return;

    const fanL = fan.querySelector<HTMLElement>(".mk-tc-l");
    const fanC = fan.querySelector<HTMLElement>(".mk-tc-c");
    const fanR = fan.querySelector<HTMLElement>(".mk-tc-r");
    if (!fanL || !fanC || !fanR) return;

    const BASE = 0.5;
    const scroll = Math.min(1, Math.max(0, window.scrollY / 380));
    const scrollEase = 1 - Math.pow(1 - scroll, 3);
    const entrance = entranceRef.current;
    const e = (BASE + (1 - BASE) * scrollEase) * entrance;
    const off = 104 * e;
    const rot = 8 * e;

    fanC.style.transform = `translateX(-50%) rotate(0deg) scale(${0.9 + 0.1 * entrance})`;
    fanC.style.opacity = (0.2 + 0.8 * entrance).toFixed(2);
    fanL.style.transform = `translateX(${-50 - off}%) rotate(${-rot}deg) scale(${0.88 + 0.1 * e})`;
    fanR.style.transform = `translateX(${-50 + off}%) rotate(${rot}deg) scale(${0.88 + 0.1 * e})`;
    fanL.style.opacity = fanR.style.opacity = (0.1 + 0.85 * e).toFixed(2);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (reduce) {
      entranceRef.current = 1;
      applyFan();
    } else {
      const timeout = setTimeout(() => {
        let t0: number | null = null;
        const run = (ts: number) => {
          if (t0 === null) t0 = ts;
          const k = Math.min(1, (ts - t0) / 800);
          entranceRef.current = 1 - Math.pow(1 - k, 3);
          applyFan();
          if (k < 1) {
            rafRef.current = requestAnimationFrame(run);
          }
        };
        rafRef.current = requestAnimationFrame(run);
      }, 460);

      return () => {
        clearTimeout(timeout);
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [applyFan]);

  useEffect(() => {
    const onScroll = () => applyFan();
    const onResize = () => applyFan();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [applyFan]);

  return (
    <section className="mk-hero" id="top">
      <div className="mk-hero-dots" />
      <div className="mk-wrap mk-inner">
        <span className="mk-tag">
          <span className="mk-dot" />
          上线测试期 · 全部功能免费开放
        </span>
        <div className="mk-hero-icon">@</div>
        <h1>
          让 AI 搜索
          <br />
          <span className="mk-em">主动推荐</span>你的品牌
        </h1>
        <p className="mk-sub">
          港澳商家 &amp; 个人 IP 专用。一条龙帮你出现在豆包、DeepSeek、Kimi、千问的回答里。
        </p>
        <div className="mk-hero-cta">
          <Link className="mk-btn mk-btn-dark mk-btn-lg" href="/login">
            免费开始
          </Link>
          <span className="mk-hero-login">
            已有账号？
            <Link href="/login">登录</Link>
          </span>
        </div>

        {/* Trading Card Fan */}
        <div className="mk-fan" ref={fanRef}>
          {TCARDS.map((card) => (
            <div
              key={card.pos}
              className={`mk-tcard mk-tc-${card.pos}`}
            >
              <div className="mk-ans-head">
                <span className="mk-ans-av">{card.av}</span>
                <span style={{ fontWeight: 700, fontSize: "13.5px" }}>{card.name}</span>
                <span className="mk-live">AI 实时回答</span>
              </div>
              <div className="mk-ans-q">
                <span>{card.q}</span>
              </div>
              <p className="mk-ans-a">{card.ansIntro}</p>
              <div className="mk-ans-list">
                <div className="mk-ans-item mk-hit">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3B6CF6" strokeWidth="1.6">
                    <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2" />
                  </svg>
                  <div>
                    <div className="mk-nm">
                      {card.hitName}<span className="mk-badge">你的店</span>
                    </div>
                    <div className="mk-nt">{card.hitNote}</div>
                  </div>
                </div>
                <div className="mk-ans-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9AA0AC" strokeWidth="1.6">
                    <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2" />
                  </svg>
                  <div>
                    <div className="mk-nm" style={{ color: "#3A3F4A" }}>{card.c2}</div>
                    <div className="mk-nt">{card.n2}</div>
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
          ))}
        </div>
      </div>
    </section>
  );
}
