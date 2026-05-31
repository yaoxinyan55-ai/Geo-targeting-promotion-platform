"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface OverviewPanelProps {
  onNavigate: (panel: string) => void;
  selectedProjectName?: string;
}

export function OverviewPanel({ onNavigate, selectedProjectName }: OverviewPanelProps) {
  const [stats, setStats] = useState({ projects: 0, keywords: 0, articles: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("keywords").select("id", { count: "exact", head: true }),
      supabase.from("articles").select("id", { count: "exact", head: true }),
    ]).then(([projectsRes, keywordsRes, articlesRes]) => {
      setStats({
        projects: projectsRes.count ?? 0,
        keywords: keywordsRes.count ?? 0,
        articles: articlesRes.count ?? 0,
      });
      setLoading(false);
    });
  }, []);

  const displayName = selectedProjectName || "全部项目";

  return (
    <div className="ws-view ws-show">
      {/* Header */}
      <div className="ws-ov-head">
        <div>
          <h1>控制台 · {displayName}</h1>
          <p>这个月你的 GEO 推广进展一览</p>
        </div>
        <div style={{ fontSize: "12.5px", color: "var(--ws-sub)" }}>
          更新于 {new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })} · <span style={{ color: "var(--ws-mintink)", fontWeight: 700 }}>本周 +3 词上榜</span>
        </div>
      </div>

      {/* Continue Banner */}
      <div className="ws-ov-banner">
        <div className="ws-bl">
          <div className="ws-bt">本周进展 · 走到第 2 步</div>
          <div className="ws-ovb-steps">
            <span className="ws-ovb-st ws-done">
              <span className="ws-d">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l5 5L20 6" /></svg>
              </span>
              选词
            </span>
            <span className="ws-ovb-ln ws-ok" />
            <span className="ws-ovb-st ws-cur">
              <span className="ws-d">2</span>
              写稿
            </span>
            <span className="ws-ovb-ln" />
            <span className="ws-ovb-st">
              <span className="ws-d">3</span>
              发布
            </span>
            <span className="ws-ovb-ln" />
            <span className="ws-ovb-st">
              <span className="ws-d">4</span>
              看效果
            </span>
          </div>
        </div>
        <button className="ws-btn-white" onClick={() => onNavigate("generate")}>
          继续：去写稿 →
        </button>
      </div>

      {/* Metrics */}
      <div className="ws-ov-cap">本月成绩</div>
      <div className="ws-metric-grid">
        <div className="ws-metric">
          <div className="ws-mk">
            <span className="ws-mi" style={{ background: "var(--ws-lav)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--ws-acc)" strokeWidth="1.8"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
            </span>
            被 AI 引用
          </div>
          <div className="ws-mv ws-grad-v">{loading ? "-" : 8}<span className="ws-u">个词</span></div>
          <div className="ws-md ws-up">▲ 本周 +3</div>
        </div>
        <div className="ws-metric">
          <div className="ws-mk">
            <span className="ws-mi" style={{ background: "var(--ws-mint)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--ws-mintink)" strokeWidth="1.8"><path d="M4 20V10M10 20V4M16 20v-7" /></svg>
            </span>
            引用率
          </div>
          <div className="ws-mv ws-grad-v">67<span className="ws-u">%</span></div>
          <div className="ws-md ws-up">▲ +12%</div>
        </div>
        <div className="ws-metric">
          <div className="ws-mk">
            <span className="ws-mi" style={{ background: "var(--ws-cream)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--ws-creamink)" strokeWidth="1.8"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" /></svg>
            </span>
            最佳排名
          </div>
          <div className="ws-mv">#1<span className="ws-u">豆包</span></div>
          <div className="ws-md ws-flat">— 稳定保持</div>
        </div>
        <div className="ws-metric">
          <div className="ws-mk">
            <span className="ws-mi" style={{ background: "var(--ws-lav)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--ws-acc)" strokeWidth="1.8"><path d="M7 7h.01M7 12h.01M7 17h.01M12 7h5M12 12h5M12 17h5" /></svg>
            </span>
            覆盖词
          </div>
          <div className="ws-mv">{loading ? "-" : 12}<span className="ws-u">个</span></div>
          <div className="ws-md ws-up">▲ +4</div>
        </div>
      </div>

      {/* Chart + Platform Distribution */}
      <div className="ws-ov-2col" style={{ marginTop: 16 }}>
        <div className="ws-dcard">
          <div className="ws-dcard-h">
            <span className="ws-t">被 AI 引用的词数 · 趋势</span>
            <span className="ws-x">近 30 天</span>
          </div>
          <div className="ws-chart-wrap">
            <svg className="ws-chart-svg" viewBox="0 0 600 172" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="var(--ws-acc)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points="20,150 80,140 140,130 200,110 260,120 320,105 380,90 440,70 500,55 560,30"
              />
              <circle cx="560" cy="30" r="5" fill="var(--ws-acc)" stroke="#fff" strokeWidth="2" />
            </svg>
            <div className="ws-chart-x">
              <span>30 天前</span><span>3 周前</span><span>2 周前</span><span>上周</span><span>本周</span>
            </div>
          </div>
        </div>
        <div className="ws-dcard">
          <div className="ws-dcard-h">
            <span className="ws-t">AI 平台覆盖</span>
          </div>
          <div className="ws-plat-dist">
            <PlatRow name="豆包" av="豆" color="#15171C" rank="#1" pct={95} />
            <PlatRow name="DeepSeek" av="DS" color="#4A6CF7" rank="#2" pct={80} />
            <PlatRow name="千问" av="千" color="#7C5CFF" rank="#3" pct={60} />
            <PlatRow name="Kimi" av="Ki" color="#3A3F4A" rank="未覆盖" pct={10} isNo />
          </div>
        </div>
      </div>

      {/* Todo + Activity */}
      <div className="ws-ov-cap">接下来做什么</div>
      <div className="ws-ov-2col ws-even">
        <div className="ws-dcard">
          <div className="ws-dcard-h">
            <span className="ws-t">待办清单</span>
            <span className="ws-x">3 项</span>
          </div>
          <div className="ws-todo">
            <span className="ws-ti" style={{ background: "var(--ws-lav)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--ws-acc)" strokeWidth="1.7"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17v3z" /></svg>
            </span>
            <div>
              <div className="ws-tt">继续写稿</div>
              <div className="ws-ts">还有 3 个高优先级词待写稿</div>
            </div>
            <button className="ws-tb ws-acc-btn" onClick={() => onNavigate("generate")}>去写稿</button>
          </div>
          <div className="ws-todo">
            <span className="ws-ti" style={{ background: "var(--ws-mint)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--ws-mintink)" strokeWidth="1.7"><path d="M22 3L11 14M22 3l-7 18-4-7-7-4 18-7z" /></svg>
            </span>
            <div>
              <div className="ws-tt">发布到平台</div>
              <div className="ws-ts">2 篇稿件已就绪，待发布</div>
            </div>
            <button className="ws-tb" onClick={() => onNavigate("publish")}>去发布</button>
          </div>
          <div className="ws-todo">
            <span className="ws-ti" style={{ background: "var(--ws-cream)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--ws-creamink)" strokeWidth="1.7"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
            </span>
            <div>
              <div className="ws-tt">检测效果</div>
              <div className="ws-ts">本周监控数据待更新</div>
            </div>
            <button className="ws-tb" onClick={() => onNavigate("monitor")}>去检测</button>
          </div>
        </div>
        <div className="ws-dcard">
          <div className="ws-dcard-h">
            <span className="ws-t">最近动态</span>
          </div>
          <div className="ws-feed">
            <div className="ws-feed-i">
              <div className="ws-feed-dot">
                <span className="ws-dt" style={{ background: "var(--ws-mintink)" }} />
                <span className="ws-ln" />
              </div>
              <div className="ws-feed-c">
                <div className="ws-fx"><b>豆包</b> 引用了你 · 排名 #1</div>
                <div className="ws-ft">澳门必吃葡国菜餐厅推荐 · 2 小时前</div>
              </div>
            </div>
            <div className="ws-feed-i">
              <div className="ws-feed-dot">
                <span className="ws-dt" style={{ background: "var(--ws-acc)" }} />
                <span className="ws-ln" />
              </div>
              <div className="ws-feed-c">
                <div className="ws-fx">文章已发布到 <b>今日头条</b></div>
                <div className="ws-ft">排行榜型 · 昨天 14:20</div>
              </div>
            </div>
            <div className="ws-feed-i">
              <div className="ws-feed-dot">
                <span className="ws-dt" style={{ background: "var(--ws-acc2)" }} />
                <span className="ws-ln" />
              </div>
              <div className="ws-feed-c">
                <div className="ws-fx">AI 生成了 <b>1 篇</b>文章初稿</div>
                <div className="ws-ft">选购指南型 · 昨天 10:05</div>
              </div>
            </div>
            <div className="ws-feed-i">
              <div className="ws-feed-dot">
                <span className="ws-dt" style={{ background: "#CFD4DC" }} />
              </div>
              <div className="ws-feed-c">
                <div className="ws-fx">新增 <b>4 个</b>目标搜索词</div>
                <div className="ws-ft">系统自动推荐 · 前天</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlatRow({ name, av, color, rank, pct, isNo }: {
  name: string;
  av: string;
  color: string;
  rank: string;
  pct: number;
  isNo?: boolean;
}) {
  return (
    <div className="ws-pd-row">
      <div className="ws-pdh">
        <span className="ws-pd-ico" style={{ background: color }}>{av}</span>
        <span className="ws-pn">{name}</span>
        <span className={`ws-pr${isNo ? " ws-no" : " ws-ok"}`} style={{ marginLeft: "auto" }}>{rank}</span>
      </div>
      <div className="ws-pd-bar">
        <div className="ws-pd-fill" style={{ width: `${pct}%`, background: isNo ? "#D4D8DF" : "var(--ws-grad)" }} />
      </div>
    </div>
  );
}
