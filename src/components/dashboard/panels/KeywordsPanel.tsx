"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project, Keyword } from "@/types/database";

interface KeywordsPanelProps {
  onNavigate: (panel: string) => void;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "待写稿", color: "text-muted bg-secondary" },
  article_written: { label: "已写稿", color: "text-warning bg-warning/10" },
  published: { label: "已发布", color: "text-success bg-success/10" },
  monitoring: { label: "监控中", color: "text-primary bg-primary-light" },
};

export function KeywordsPanel({ onNavigate }: KeywordsPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  // 加载项目列表
  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const projectList = (data ?? []) as unknown as Project[];
        setProjects(projectList);
        if (projectList.length > 0) {
          setSelectedProjectId(projectList[0].id);
        }
        setLoading(false);
      });
  }, [supabase]);

  // 加载关键词
  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    supabase
      .from("keywords")
      .select("*")
      .eq("project_id", selectedProjectId)
      .order("priority", { ascending: true })
      .then(({ data }) => {
        setKeywords((data ?? []) as unknown as Keyword[]);
        setLoading(false);
      });
  }, [selectedProjectId, supabase]);

  const handleGenerate = async () => {
    if (!selectedProjectId) return;
    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/keywords/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId }),
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.error || "生成失败");
        setGenerating(false);
        return;
      }

      // 重新加载关键词
      const { data } = await supabase
        .from("keywords")
        .select("*")
        .eq("project_id", selectedProjectId)
        .order("priority", { ascending: true });
      setKeywords((data ?? []) as unknown as Keyword[]);
    } catch {
      setError("生成失败，请稍后重试");
    } finally {
      setGenerating(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (loading && projects.length === 0) {
    return <div className="text-center py-12 text-muted">加载中...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted mb-4">还没有项目，请先创建项目</p>
        <button onClick={() => onNavigate("new-project")} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
          新建项目
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">关键词中心</h1>
          <div className="flex items-center gap-3 mt-1">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-sm text-muted border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="text-muted text-sm">共 {keywords.length} 个目标搜索词</span>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? "AI生成中..." : keywords.length > 0 ? "重新生成" : "AI生成关键词"}
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {generating && (
        <div className="bg-primary-light rounded-xl p-6 text-center">
          <div className="animate-pulse text-primary font-medium">AI 正在分析项目信息，生成关键词矩阵...</div>
          <p className="text-sm text-muted mt-2">预计需要 10-20 秒</p>
        </div>
      )}

      {keywords.length > 0 ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">前缀词</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">主词</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">后缀词</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">完整目标搜索词</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">优先级</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">状态</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw, index) => {
                  const status = STATUS_MAP[kw.status] ?? STATUS_MAP.pending;
                  return (
                    <tr key={kw.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-muted">{String(index + 1).padStart(2, "0")}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{kw.prefix}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{kw.main_word}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{kw.suffix}</td>
                      <td className="px-4 py-3 text-sm text-foreground max-w-[200px] truncate">{kw.full_keyword}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium">{"★".repeat(kw.priority)}</span>
                        <span className="text-xs text-muted ml-1">{kw.priority === 1 ? "高" : kw.priority === 2 ? "中" : "低"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => onNavigate(kw.status === "pending" ? "generate" : "articles")}
                          className="text-sm text-primary hover:text-primary-hover font-medium">
                          {kw.status === "pending" ? "生成文章" : "查看文章"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : !generating && (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-muted mb-4">还没有关键词，点击上方按钮让AI自动生成</p>
        </div>
      )}

      <div className="bg-primary-light rounded-xl p-4 text-sm text-primary">
        <strong>plant公式提示：</strong>目标搜索词 = 前缀词 + 主词 + 后缀词。主词应由内向外扩展到细分赛道，后缀词决定AI回答形式。
      </div>
    </div>
  );
}
