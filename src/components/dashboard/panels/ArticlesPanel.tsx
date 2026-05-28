"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ARTICLE_TYPE_LABELS } from "@/types/database";
import type { Article, Project } from "@/types/database";

interface ArticlesPanelProps {
  onNavigate: (panel: string) => void;
}

export function ArticlesPanel({ onNavigate }: ArticlesPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []) as unknown as Project[];
        setProjects(list);
        if (list.length > 0) setSelectedProjectId(list[0].id);
      });
  }, [supabase]);

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    supabase
      .from("articles")
      .select("*")
      .eq("project_id", selectedProjectId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setArticles((data ?? []) as unknown as Article[]);
        setLoading(false);
      });
  }, [selectedProjectId, supabase]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert("已复制到剪贴板");
  };

  if (loading && projects.length === 0) {
    return <div className="text-center py-12 text-muted">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">文章工作台</h1>
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
            <span className="text-muted text-sm">共 {articles.length} 篇文章</span>
          </div>
        </div>
        <button onClick={() => onNavigate("generate")}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
          + 生成新文章
        </button>
      </div>

      {articles.length === 0 && !loading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-muted mb-4">还没有文章，去生成第一篇吧</p>
          <button onClick={() => onNavigate("generate")}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">
            生成文章
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => {
            const isExpanded = expandedId === article.id;
            return (
              <div key={article.id} className="bg-white rounded-xl border border-border p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-primary bg-primary-light px-2.5 py-1 rounded-full">
                        {ARTICLE_TYPE_LABELS[article.article_type]}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(article.created_at).toLocaleDateString("zh-CN")}
                      </span>
                      <span className="text-xs text-muted">约{article.content.length}字</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{article.title}</h3>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="border border-border rounded-lg p-4 mb-4 max-h-[500px] overflow-y-auto">
                    <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap">
                      {article.content}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted mb-4 line-clamp-2">{article.content.slice(0, 150)}...</p>
                )}

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : article.id)}
                    className="text-sm text-primary hover:text-primary-hover font-medium"
                  >
                    {isExpanded ? "收起" : "展开全文"}
                  </button>
                  <button
                    onClick={() => handleCopy(`${article.title}\n\n${article.content}`)}
                    className="text-sm text-primary hover:text-primary-hover font-medium"
                  >
                    一键复制
                  </button>
                  <button onClick={() => onNavigate("publish")}
                    className="text-sm text-primary hover:text-primary-hover font-medium"
                  >
                    去发布
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
