"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ARTICLE_TYPE_LABELS } from "@/types/database";
import type { ArticleType, Keyword, Project } from "@/types/database";

interface GeneratePanelProps {
  onNavigate: (panel: string) => void;
}

export function GeneratePanel({ onNavigate }: GeneratePanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [articleType, setArticleType] = useState<ArticleType>("ranking");
  const [materials, setMaterials] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<{ title: string; content: string } | null>(null);
  const [error, setError] = useState("");

  const supabase = createClient();

  // 加载项目
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

  // 加载关键词
  useEffect(() => {
    if (!selectedProjectId) return;
    supabase
      .from("keywords")
      .select("*")
      .eq("project_id", selectedProjectId)
      .order("priority", { ascending: true })
      .then(({ data }) => {
        setKeywords((data ?? []) as unknown as Keyword[]);
        setSelectedKeyword("");
      });
  }, [selectedProjectId, supabase]);

  const handleGenerate = async () => {
    if (!selectedKeyword) return;
    setGenerating(true);
    setError("");
    setGeneratedArticle(null);

    try {
      const response = await fetch("/api/articles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywordId: selectedKeyword,
          articleType,
          materials,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.error || "生成失败");
        setGenerating(false);
        return;
      }

      setGeneratedArticle({ title: result.data.title, content: result.data.content });
    } catch {
      setError("生成失败，请稍后重试");
    } finally {
      setGenerating(false);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted mb-4">还没有项目，请先创建项目</p>
        <button onClick={() => onNavigate("new-project")} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">新建项目</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">生成文章</h1>
        <p className="text-muted mt-1">选择关键词和文章类型，AI帮你写初稿</p>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <section className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">第一步：选择关键词和文章类型</h2>
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-foreground mb-1.5">选择项目</label>
          <select id="project" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors">
            {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-foreground mb-1.5">目标搜索词</label>
          <select id="keyword" value={selectedKeyword} onChange={(e) => setSelectedKeyword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors">
            <option value="">请选择关键词</option>
            {keywords.map((kw) => (
              <option key={kw.id} value={kw.id}>{kw.full_keyword}（{"★".repeat(kw.priority)}）</option>
            ))}
          </select>
          {keywords.length === 0 && selectedProjectId && (
            <p className="text-xs text-warning mt-1">该项目还没有关键词，请先去关键词中心生成</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">文章类型</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.entries(ARTICLE_TYPE_LABELS) as [ArticleType, string][]).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setArticleType(key)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${articleType === key ? "border-primary bg-primary-light text-primary" : "border-border text-muted hover:border-primary/50"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">第二步：补充素材（选填）</h2>
        <p className="text-xs text-muted">AI需要真实数据才能写出被引用的文章。形容词没用，数字和案例才有用。</p>
        <div>
          <label htmlFor="materials" className="block text-sm font-medium text-foreground mb-1.5">补充素材</label>
          <textarea id="materials" rows={4} value={materials} onChange={(e) => setMaterials(e.target.value)}
            placeholder="填入核心卖点、数据案例、资质背书、竞品信息等，越具体越好"
            className="w-full px-4 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none" />
        </div>
        <button onClick={handleGenerate} disabled={generating || !selectedKeyword}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {generating ? "AI正在生成文章，预计20-30秒..." : "生成文章初稿"}
        </button>
      </section>

      {generatedArticle && (
        <section className="bg-white rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">第三步：文章初稿</h2>
            <span className="text-xs text-muted">约{generatedArticle.content.length}字</span>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-base font-semibold text-foreground mb-4">{generatedArticle.title}</h3>
            <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap">
              {generatedArticle.content}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleGenerate} disabled={generating}
              className="flex-1 py-2.5 rounded-lg border border-border text-muted font-medium hover:bg-secondary transition-colors disabled:opacity-50">
              重新生成
            </button>
            <button onClick={() => onNavigate("articles")}
              className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors">
              查看文章列表
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
