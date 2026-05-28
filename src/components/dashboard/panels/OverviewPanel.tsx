"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface OverviewPanelProps {
  onNavigate: (panel: string) => void;
}

export function OverviewPanel({ onNavigate }: OverviewPanelProps) {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">控制台</h1>
        <p className="text-muted mt-1">欢迎回来，查看你的GEO推广概览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="项目总数" value={loading ? "-" : stats.projects} unit="个" />
        <StatCard label="目标关键词" value={loading ? "-" : stats.keywords} unit="条" />
        <StatCard label="已写文章" value={loading ? "-" : stats.articles} unit="篇" highlight />
        <StatCard label="平均排名" value="-" unit="位" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">待办事项</h2>
          <ul className="space-y-3">
            {stats.projects === 0 && (
              <TodoItem
                text="还没有项目，创建第一个吧"
                onClick={() => onNavigate("new-project")}
                type="warning"
              />
            )}
            {stats.projects > 0 && stats.keywords === 0 && (
              <TodoItem
                text="项目已创建，去生成关键词"
                onClick={() => onNavigate("keywords")}
                type="info"
              />
            )}
            {stats.keywords > 0 && stats.articles === 0 && (
              <TodoItem
                text="关键词已就绪，去生成文章"
                onClick={() => onNavigate("generate")}
                type="info"
              />
            )}
            <TodoItem
              text="本周监控数据待更新"
              onClick={() => onNavigate("monitor")}
              type="info"
            />
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">快捷操作</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction label="新建项目" onClick={() => onNavigate("new-project")} icon="+" />
            <QuickAction label="生成文章" onClick={() => onNavigate("generate")} icon="E" />
            <QuickAction label="查看发布" onClick={() => onNavigate("publish")} icon="S" />
            <QuickAction label="检测效果" onClick={() => onNavigate("monitor")} icon="M" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, highlight }: { label: string; value: number | string; unit: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <p className="text-sm text-muted mb-1">{label}</p>
      <p className="text-3xl font-bold">
        <span className={highlight ? "text-primary" : "text-foreground"}>{value}</span>
        <span className="text-sm text-muted ml-1">{unit}</span>
      </p>
    </div>
  );
}

function TodoItem({ text, onClick, type }: { text: string; onClick: () => void; type: "warning" | "info" }) {
  return (
    <li>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${type === "warning" ? "bg-warning" : "bg-primary"}`} />
        <span className="text-sm text-foreground">{text}</span>
        <svg className="w-4 h-4 text-muted ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </li>
  );
}

function QuickAction({ label, onClick, icon }: { label: string; onClick: () => void; icon: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary-light transition-colors text-left"
    >
      <span className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center text-lg font-bold">{icon}</span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  );
}
