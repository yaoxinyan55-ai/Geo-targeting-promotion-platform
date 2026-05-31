"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CONTENT_PLATFORMS } from "@/constants";
import {
  PUBLISH_PLATFORM_LABELS,
  PUBLISH_PLATFORM_URLS,
  PLATFORM_TONE_DESC,
} from "@/types/database";
import type { Article, PublishPlatform, PlatformPresence } from "@/types/database";

/** Map legacy project platform keys to PublishPlatform keys */
const LEGACY_KEY_MAP: Record<string, PublishPlatform> = {
  douyin: "douyin",
  xiaohongshu: "xiaohongshu",
  zhihu: "zhihu",
  toutiao: "toutiao",
  wechat: "gongzhonghao",
  weibo: "douyin", // 微博 doesn't have a direct match; skip
};

interface PlatformArticle {
  platform: PublishPlatform;
  title: string;
  content: string;
  status: "pending" | "generating" | "done" | "error";
}

interface PublishPanelProps {
  onNavigate: (panel: string) => void;
}

export function PublishPanel({ onNavigate }: PublishPanelProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<PublishPlatform>>(new Set());
  const [platformArticles, setPlatformArticles] = useState<PlatformArticle[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [step, setStep] = useState<"select-article" | "select-platforms" | "results">("select-article");
  const [userPlatformKeys, setUserPlatformKeys] = useState<Set<string>>(new Set());

  // Load articles + user's existing platform accounts
  useEffect(() => {
    const supabase = createClient();
    const saved = localStorage.getItem("geo_selected_project");
    if (!saved) {
      setLoading(false);
      return;
    }
    const { id: projectId } = JSON.parse(saved) as { id: string };

    // Load articles and project in parallel
    Promise.all([
      supabase
        .from("articles")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      supabase
        .from("projects")
        .select("existing_platforms")
        .eq("id", projectId)
        .single(),
    ]).then(([articlesRes, projectRes]) => {
      setArticles((articlesRes.data ?? []) as unknown as Article[]);

      // Extract user's existing platform keys
      if (projectRes.data) {
        const platforms = projectRes.data.existing_platforms as PlatformPresence[];
        const enabledKeys = new Set(
          platforms.filter((p) => p.enabled).map((p) => p.platform)
        );
        setUserPlatformKeys(enabledKeys);

        // Auto-select matching platforms
        const autoSelected = new Set<PublishPlatform>();
        enabledKeys.forEach((key) => {
          const mapped = LEGACY_KEY_MAP[key];
          if (mapped && mapped !== "douyin") autoSelected.add(mapped); // skip weibo→douyin mapping
          // Direct match check
          const directMatch = CONTENT_PLATFORMS.find((cp) => cp.key === key);
          if (directMatch) autoSelected.add(directMatch.key as PublishPlatform);
        });
        setSelectedPlatforms(autoSelected);
      }

      setLoading(false);
    });
  }, []);

  const togglePlatform = useCallback((platform: PublishPlatform) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) {
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const all = CONTENT_PLATFORMS.map((p) => p.key as PublishPlatform);
    setSelectedPlatforms(new Set(all));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedPlatforms(new Set());
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedArticle || selectedPlatforms.size === 0) return;
    setGenerating(true);
    setStep("results");

    const platforms = Array.from(selectedPlatforms);
    const initial: PlatformArticle[] = platforms.map((p) => ({
      platform: p,
      title: "",
      content: "",
      status: "pending",
    }));
    setPlatformArticles(initial);

    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      setPlatformArticles((prev) =>
        prev.map((pa) => pa.platform === platform ? { ...pa, status: "generating" } : pa)
      );

      try {
        const response = await fetch("/api/articles/adapt-platform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId: selectedArticle.id,
            platform,
            masterTitle: selectedArticle.title,
            masterContent: selectedArticle.content,
            toneDescription: PLATFORM_TONE_DESC[platform],
            platformName: PUBLISH_PLATFORM_LABELS[platform],
          }),
        });

        const result = await response.json() as { success: boolean; data?: { title: string; content: string }; error?: string };
        if (result.success && result.data) {
          setPlatformArticles((prev) =>
            prev.map((pa) =>
              pa.platform === platform
                ? { ...pa, title: result.data!.title, content: result.data!.content, status: "done" }
                : pa
            )
          );
        } else {
          setPlatformArticles((prev) =>
            prev.map((pa) => pa.platform === platform ? { ...pa, status: "error" } : pa)
          );
        }
      } catch {
        setPlatformArticles((prev) =>
          prev.map((pa) => pa.platform === platform ? { ...pa, status: "error" } : pa)
        );
      }
    }

    setGenerating(false);
  }, [selectedArticle, selectedPlatforms]);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // Split platforms into groups
  const userOwnedPlatforms = CONTENT_PLATFORMS.filter((p) => {
    const key = p.key;
    // Check direct match or legacy key match
    return userPlatformKeys.has(key) ||
      Object.entries(LEGACY_KEY_MAP).some(([legacyKey, mapped]) => mapped === key && userPlatformKeys.has(legacyKey));
  });

  const corePlatforms = CONTENT_PLATFORMS.filter(
    (p) => p.geoTier === "core" && !userOwnedPlatforms.includes(p)
  );
  const otherPlatforms = CONTENT_PLATFORMS.filter(
    (p) => p.geoTier !== "core" && !userOwnedPlatforms.includes(p)
  );

  if (loading) {
    return <div className="ws-view ws-show"><div style={{ textAlign: "center", padding: "48px 0", color: "var(--ws-sub)" }}>加载中...</div></div>;
  }

  return (
    <div className="ws-view ws-show">
      <div className="ws-ov-head">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>发布中心</h1>
          <p style={{ fontSize: "13.5px", color: "var(--ws-sub)", marginTop: 4 }}>
            选择主稿 → 选择平台 → AI 自动改写 → 一键跳转发布
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="ws-pub-steps">
        <StepPill label="选主稿" active={step === "select-article"} done={step !== "select-article"} onClick={() => { if (step !== "select-article") setStep("select-article"); }} />
        <span className="ws-pub-arrow">→</span>
        <StepPill label="选平台" active={step === "select-platforms"} done={step === "results"} onClick={() => { if (step === "results") setStep("select-platforms"); }} />
        <span className="ws-pub-arrow">→</span>
        <StepPill label="生成发布" active={step === "results"} done={false} onClick={() => {}} />
      </div>

      {/* Step 1: Select article */}
      {step === "select-article" && (
        <div className="ws-pub-section">
          {articles.length === 0 ? (
            <div className="ws-pub-empty">
              <p>还没有文章，先去生成主稿</p>
              <button className="ws-pub-btn" onClick={() => onNavigate("generate")}>去写稿</button>
            </div>
          ) : (
            <div className="ws-pub-article-list">
              {articles.map((article) => (
                <button
                  key={article.id}
                  className={`ws-pub-article-card${selectedArticle?.id === article.id ? " ws-on" : ""}`}
                  onClick={() => { setSelectedArticle(article); setStep("select-platforms"); }}
                >
                  <div className="ws-pub-ac-top">
                    <span className="ws-pub-ac-type">{article.article_type === "ranking" ? "排行榜" : article.article_type === "buying_guide" ? "选购指南" : article.article_type === "deep_analysis" ? "深度分析" : article.article_type === "qa" ? "QA问答" : "年度盘点"}</span>
                    <span className="ws-pub-ac-date">{new Date(article.created_at).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <div className="ws-pub-ac-title">{article.title}</div>
                  <div className="ws-pub-ac-meta">约 {article.content.length} 字</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select platforms */}
      {step === "select-platforms" && selectedArticle && (
        <div className="ws-pub-section">
          <div className="ws-pub-master-preview">
            <div className="ws-pub-mp-label">已选主稿</div>
            <div className="ws-pub-mp-title">{selectedArticle.title}</div>
            <button className="ws-pub-mp-change" onClick={() => setStep("select-article")}>更换</button>
          </div>

          <div className="ws-pub-plat-head">
            <h3>选择发布平台</h3>
            <div className="ws-pub-plat-acts">
              <button onClick={selectAll}>全选</button>
              <button onClick={deselectAll}>清空</button>
            </div>
          </div>

          {/* Group 1: User's existing platforms */}
          {userOwnedPlatforms.length > 0 && (
            <div className="ws-pub-group">
              <div className="ws-pub-group-label">
                <span className="ws-pub-gl-dot ws-green" />
                你已有的平台 · 优先发布
              </div>
              <div className="ws-pub-plat-grid">
                {userOwnedPlatforms.map((p) => (
                  <PlatformCard
                    key={p.key}
                    platform={p.key as PublishPlatform}
                    isSelected={selectedPlatforms.has(p.key as PublishPlatform)}
                    onToggle={togglePlatform}
                    badge="已有"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group 2: Core GEO platforms */}
          {corePlatforms.length > 0 && (
            <div className="ws-pub-group">
              <div className="ws-pub-group-label">
                <span className="ws-pub-gl-dot ws-blue" />
                GEO 推荐 · AI 引用率高
              </div>
              <div className="ws-pub-plat-grid">
                {corePlatforms.map((p) => (
                  <PlatformCard
                    key={p.key}
                    platform={p.key as PublishPlatform}
                    isSelected={selectedPlatforms.has(p.key as PublishPlatform)}
                    onToggle={togglePlatform}
                    badge="推荐"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Other platforms */}
          {otherPlatforms.length > 0 && (
            <div className="ws-pub-group">
              <div className="ws-pub-group-label">
                <span className="ws-pub-gl-dot ws-gray" />
                更多平台
              </div>
              <div className="ws-pub-plat-grid">
                {otherPlatforms.map((p) => (
                  <PlatformCard
                    key={p.key}
                    platform={p.key as PublishPlatform}
                    isSelected={selectedPlatforms.has(p.key as PublishPlatform)}
                    onToggle={togglePlatform}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="ws-pub-gen-bar">
            <span className="ws-pub-gen-info">
              已选 <b>{selectedPlatforms.size}</b> 个平台
            </span>
            <button
              className="ws-pub-gen-btn"
              disabled={selectedPlatforms.size === 0}
              onClick={handleGenerate}
            >
              一键改写并生成 ({selectedPlatforms.size} 篇)
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === "results" && (
        <div className="ws-pub-section">
          <div className="ws-pub-results-head">
            <h3>平台文章 ({platformArticles.filter((p) => p.status === "done").length}/{platformArticles.length})</h3>
            {generating && <span className="ws-pub-generating">AI 改写中...</span>}
            {!generating && platformArticles.length > 0 && (
              <button className="ws-pub-redo" onClick={() => setStep("select-platforms")}>重新选择平台</button>
            )}
          </div>

          <div className="ws-pub-results-list">
            {platformArticles.map((pa) => (
              <PlatformResultCard
                key={pa.platform}
                platformArticle={pa}
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StepPill({ label, active, done, onClick }: { label: string; active: boolean; done: boolean; onClick: () => void }) {
  return (
    <button
      className={`ws-pub-pill${active ? " ws-active" : ""}${done ? " ws-done" : ""}`}
      onClick={onClick}
    >
      {done && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 12l5 5L20 6" />
        </svg>
      )}
      {label}
    </button>
  );
}

function PlatformCard({
  platform,
  isSelected,
  onToggle,
  badge,
}: {
  platform: PublishPlatform;
  isSelected: boolean;
  onToggle: (p: PublishPlatform) => void;
  badge?: string;
}) {
  return (
    <button
      className={`ws-pub-plat-card${isSelected ? " ws-on" : ""}`}
      onClick={() => onToggle(platform)}
    >
      <div className="ws-pub-plat-top">
        <span className="ws-pub-plat-check">
          {isSelected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12l5 5L20 6" />
            </svg>
          )}
        </span>
        {badge && (
          <span className={`ws-pub-plat-badge${badge === "推荐" ? " ws-rec" : " ws-own"}`}>
            {badge}
          </span>
        )}
      </div>
      <span className="ws-pub-plat-name">{PUBLISH_PLATFORM_LABELS[platform]}</span>
      <span className="ws-pub-plat-tone">{PLATFORM_TONE_DESC[platform].slice(0, 12)}</span>
    </button>
  );
}

function PlatformResultCard({
  platformArticle,
  copiedId,
  onCopy,
}: {
  platformArticle: PlatformArticle;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  const { platform, title, content, status } = platformArticle;
  const [expanded, setExpanded] = useState(false);

  if (status === "pending") {
    return (
      <div className="ws-pub-result-card ws-pending">
        <div className="ws-pub-rc-head">
          <span className="ws-pub-rc-plat">{PUBLISH_PLATFORM_LABELS[platform]}</span>
          <span className="ws-pub-rc-status">等待中...</span>
        </div>
      </div>
    );
  }

  if (status === "generating") {
    return (
      <div className="ws-pub-result-card ws-generating">
        <div className="ws-pub-rc-head">
          <span className="ws-pub-rc-plat">{PUBLISH_PLATFORM_LABELS[platform]}</span>
          <span className="ws-pub-rc-status ws-spin">生成中...</span>
        </div>
        <div className="ws-pub-rc-skeleton">
          <div className="ws-skel-line ws-w80" />
          <div className="ws-skel-line ws-w60" />
          <div className="ws-skel-line ws-w90" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="ws-pub-result-card ws-error">
        <div className="ws-pub-rc-head">
          <span className="ws-pub-rc-plat">{PUBLISH_PLATFORM_LABELS[platform]}</span>
          <span className="ws-pub-rc-status ws-err">生成失败</span>
        </div>
      </div>
    );
  }

  const fullText = `${title}\n\n${content}`;
  const copyId = `${platform}-full`;

  return (
    <div className="ws-pub-result-card ws-done">
      <div className="ws-pub-rc-head">
        <span className="ws-pub-rc-plat">{PUBLISH_PLATFORM_LABELS[platform]}</span>
        <span className="ws-pub-rc-tone">{PLATFORM_TONE_DESC[platform].slice(0, 15)}</span>
        <div className="ws-pub-rc-actions">
          <button
            className="ws-pub-rc-copy"
            onClick={() => onCopy(fullText, copyId)}
          >
            {copiedId === copyId ? "已复制 ✓" : "复制全文"}
          </button>
          <a
            href={PUBLISH_PLATFORM_URLS[platform]}
            target="_blank"
            rel="noopener noreferrer"
            className="ws-pub-rc-link"
          >
            去发布
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
      <div className="ws-pub-rc-title">{title}</div>
      <div className={`ws-pub-rc-content${expanded ? " ws-expanded" : ""}`}>
        {content}
      </div>
      <button className="ws-pub-rc-expand" onClick={() => setExpanded(!expanded)}>
        {expanded ? "收起" : "展开全文"}
      </button>
    </div>
  );
}
