"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ARTICLE_TYPE_LABELS, PUBLISH_PLATFORM_LABELS } from "@/types/database";
import type { Article, Project, PublishPlatform } from "@/types/database";

const PLATFORM_URLS: Record<PublishPlatform, string> = {
  toutiao: "https://mp.toutiao.com/profile_v4/graphic/publish",
  sohu: "https://mp.sohu.com/mpfe/v3/main/new-batch.action",
  zhihu: "https://zhuanlan.zhihu.com/write",
  csdn: "https://editor.csdn.net/md",
};

const PLATFORMS: PublishPlatform[] = ["toutiao", "sohu", "zhihu", "csdn"];

interface PublishPanelProps {
  onNavigate: (panel: string) => void;
}

export function PublishPanel({ onNavigate }: PublishPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading && projects.length === 0) {
    return <div className="text-center py-12 text-muted">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">发布中心</h1>
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
            <span className="text-muted text-sm">共 {articles.length} 篇可发布</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate("generate")}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          + 生成新文章
        </button>
      </div>

      {articles.length === 0 && !loading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-muted mb-4">还没有文章，先去生成文章再来发布</p>
          <button
            onClick={() => onNavigate("generate")}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            生成文章
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-primary bg-primary-light px-2.5 py-1 rounded-full">
                  {ARTICLE_TYPE_LABELS[article.article_type]}
                </span>
                <span className="text-xs text-muted">
                  {new Date(article.created_at).toLocaleDateString("zh-CN")}
                </span>
                <span className="text-xs text-muted">约{article.content.length}字</span>
              </div>

              <h3 className="text-base font-semibold text-foreground mb-4">{article.title}</h3>

              {/* 一键复制区 */}
              <div className="space-y-2 mb-4">
                <CopyRow
                  label="复制标题"
                  text={article.title}
                  id={`${article.id}-title`}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                />
                <CopyRow
                  label="复制正文"
                  text={article.content}
                  id={`${article.id}-content`}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                />
                <CopyRow
                  label="复制全文（标题+正文）"
                  text={`${article.title}\n\n${article.content}`}
                  id={`${article.id}-full`}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                />
              </div>

              {/* 平台发布链接 */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted mb-3">复制内容后，选择平台去发布：</p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => (
                    <a
                      key={platform}
                      href={PLATFORM_URLS[platform]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:border-primary hover:text-primary hover:bg-primary-light/50 transition-colors"
                    >
                      {PUBLISH_PLATFORM_LABELS[platform]}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CopyRow({
  label,
  text,
  id,
  copiedId,
  onCopy,
}: {
  label: string;
  text: string;
  id: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  return (
    <button
      onClick={() => onCopy(text, id)}
      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-border hover:border-primary hover:bg-primary-light/50 transition-colors text-left"
    >
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-xs font-medium text-primary">
        {copiedId === id ? "已复制 ✓" : "点击复制"}
      </span>
    </button>
  );
}
