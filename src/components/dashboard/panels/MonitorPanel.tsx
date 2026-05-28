"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AI_PLATFORM_LABELS } from "@/types/database";
import type { Project, Keyword, MonitorRecord, AIPlatform } from "@/types/database";

interface MonitorPanelProps {
  onNavigate: (panel: string) => void;
}

export function MonitorPanel({ onNavigate }: MonitorPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [records, setRecords] = useState<MonitorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [detectProgress, setDetectProgress] = useState({ current: 0, total: 0, keywordName: "" });
  const [platformStatus, setPlatformStatus] = useState<Record<AIPlatform, "waiting" | "checking" | "cited" | "not_cited" | "error">>({
    doubao: "waiting", deepseek: "waiting", kimi: "waiting", qianwen: "waiting",
  });
  const [detectResult, setDetectResult] = useState<string | null>(null);

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

    Promise.all([
      supabase
        .from("keywords")
        .select("*")
        .eq("project_id", selectedProjectId)
        .order("created_at", { ascending: false }),
      supabase
        .from("monitor_records")
        .select("*")
        .eq("project_id", selectedProjectId)
        .order("detected_at", { ascending: false }),
    ]).then(([kwRes, mrRes]) => {
      setKeywords((kwRes.data ?? []) as unknown as Keyword[]);
      setRecords((mrRes.data ?? []) as unknown as MonitorRecord[]);
      setLoading(false);
    });
  }, [selectedProjectId, supabase]);

  const uniqueKeywords = Array.from(new Set(keywords.map((k) => k.full_keyword)));
  const citedKeywords = uniqueKeywords.filter((kw) =>
    records.some((r) => r.keyword_text === kw && r.is_cited)
  );
  const citedCount = citedKeywords.length;
  const citationRate = uniqueKeywords.length > 0
    ? Math.round((citedCount / uniqueKeywords.length) * 100)
    : 0;

  const latestRecord = records.length > 0 ? records[0] : null;

  const PLATFORMS_TO_CHECK: AIPlatform[] = ["deepseek", "doubao", "kimi", "qianwen"];

  const handleDetect = async () => {
    setDetecting(true);
    setDetectResult(null);
    setDetectProgress({ current: 0, total: keywords.length, keywordName: "" });

    let totalCited = 0;
    let totalFail = 0;
    const platformStats: Record<AIPlatform, { cited: number; notCited: number; error: number }> = {
      doubao: { cited: 0, notCited: 0, error: 0 },
      deepseek: { cited: 0, notCited: 0, error: 0 },
      kimi: { cited: 0, notCited: 0, error: 0 },
      qianwen: { cited: 0, notCited: 0, error: 0 },
    };

    for (let i = 0; i < keywords.length; i++) {
      const kw = keywords[i];
      setDetectProgress({ current: i + 1, total: keywords.length, keywordName: kw.full_keyword });

      // 重置所有平台状态为 waiting
      setPlatformStatus({ doubao: "waiting", deepseek: "waiting", kimi: "waiting", qianwen: "waiting" });

      let keywordCited = false;

      // 逐个平台检测
      for (const platform of PLATFORMS_TO_CHECK) {
        setPlatformStatus((prev) => ({ ...prev, [platform]: "checking" }));

        try {
          const res = await fetch("/api/monitor/detect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: selectedProjectId,
              keywordId: kw.id,
              platform,
            }),
          });
          const json = await res.json() as {
            success: boolean;
            data?: { results: Array<{ is_cited: boolean }> };
            error?: string;
          };

          if (json.success && json.data?.results?.[0]) {
            const cited = json.data.results[0].is_cited;
            setPlatformStatus((prev) => ({ ...prev, [platform]: cited ? "cited" : "not_cited" }));
            if (cited) {
              platformStats[platform].cited++;
              keywordCited = true;
            } else {
              platformStats[platform].notCited++;
            }
          } else {
            setPlatformStatus((prev) => ({ ...prev, [platform]: "error" }));
            platformStats[platform].error++;
            totalFail++;
          }
        } catch {
          setPlatformStatus((prev) => ({ ...prev, [platform]: "error" }));
          platformStats[platform].error++;
          totalFail++;
        }
      }

      if (keywordCited) totalCited++;
    }

    // 生成结果摘要
    const total = keywords.length;
    const rate = total > 0 ? Math.round((totalCited / total) * 100) : 0;
    const platformSummary = PLATFORMS_TO_CHECK
      .map((p) => `${AI_PLATFORM_LABELS[p]}引用${platformStats[p].cited}个${platformStats[p].error > 0 ? `(${platformStats[p].error}个失败)` : ""}`)
      .join("，");
    setDetectResult(`检测完成！共 ${total} 个关键词，${totalCited} 个被引用，引用率 ${rate}%。${platformSummary}`);

    // 重新加载数据
    const [kwRes, mrRes] = await Promise.all([
      supabase.from("keywords").select("*").eq("project_id", selectedProjectId).order("created_at", { ascending: false }),
      supabase.from("monitor_records").select("*").eq("project_id", selectedProjectId).order("detected_at", { ascending: false }),
    ]);
    setKeywords((kwRes.data ?? []) as unknown as Keyword[]);
    setRecords((mrRes.data ?? []) as unknown as MonitorRecord[]);
    setDetecting(false);
  };

  if (loading && projects.length === 0) {
    return <div className="text-center py-12 text-muted">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">监控仪表盘</h1>
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
          </div>
        </div>
        <button
          onClick={handleDetect}
          disabled={detecting || keywords.length === 0}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {detecting ? "检测中..." : "一键检测全部"}
        </button>
      </div>

      {/* 检测进度/结果提示 */}
      {detecting && (
        <div className="bg-primary-light rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary font-medium">
              正在检测关键词 ({detectProgress.current}/{detectProgress.total})
            </span>
          </div>
          <p className="text-xs text-primary/70 truncate">当前：{detectProgress.keywordName}</p>
          <div className="w-full bg-white rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${detectProgress.total > 0 ? (detectProgress.current / detectProgress.total) * 100 : 0}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(["deepseek", "doubao", "kimi", "qianwen"] as AIPlatform[]).map((p) => {
              const status = platformStatus[p];
              const statusConfig = {
                waiting: { text: "等待中", bg: "bg-white/60", textColor: "text-muted" },
                checking: { text: "检测中...", bg: "bg-white", textColor: "text-primary animate-pulse" },
                cited: { text: "已引用 ✓", bg: "bg-success/10", textColor: "text-success" },
                not_cited: { text: "未引用", bg: "bg-danger/10", textColor: "text-danger" },
                error: { text: "失败", bg: "bg-danger/10", textColor: "text-danger" },
              };
              const cfg = statusConfig[status];
              return (
                <div key={p} className={`${cfg.bg} rounded-lg px-3 py-2 text-center`}>
                  <p className="text-xs text-muted mb-0.5">{AI_PLATFORM_LABELS[p]}</p>
                  <p className={`text-xs font-medium ${cfg.textColor}`}>{cfg.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {detectResult && !detecting && (
        <div className={`rounded-xl p-4 text-sm ${detectResult.includes("失败") ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
          {detectResult}
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-sm text-muted mb-1">目标词总数</p>
          <p className="text-3xl font-bold text-foreground">{uniqueKeywords.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-sm text-muted mb-1">已被引用</p>
          <p className="text-3xl font-bold text-primary">
            {citedCount}
            <span className="text-sm text-muted ml-1">/ {uniqueKeywords.length}</span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-sm text-muted mb-1">引用率</p>
          <p className="text-3xl font-bold text-foreground">{citationRate}%</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-sm text-muted mb-1">上次检测</p>
          {latestRecord ? (
            <>
              <p className="text-lg font-bold text-foreground">
                {new Date(latestRecord.detected_at).toLocaleDateString("zh-CN")}
              </p>
              <p className="text-xs text-muted">
                {new Date(latestRecord.detected_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </>
          ) : (
            <p className="text-lg font-bold text-muted">暂无</p>
          )}
        </div>
      </div>

      {/* 无数据提示 */}
      {keywords.length === 0 && !loading ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-muted mb-4">还没有关键词，先去生成关键词才能开始监控</p>
          <button
            onClick={() => onNavigate("keywords")}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            去生成关键词
          </button>
        </div>
      ) : (
        /* 关键词引用详情表格 */
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">各关键词引用详情</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">目标搜索词</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase">豆包</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase">DeepSeek</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase">Kimi</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase">千问</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase">最佳排名</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">建议</th>
                </tr>
              </thead>
              <tbody>
                {uniqueKeywords.map((kw) => {
                  const kwRecords = records.filter((r) => r.keyword_text === kw);
                  const rankedRecords = kwRecords.filter((r) => r.rank_position !== null);
                  const bestRank = rankedRecords.length > 0
                    ? Math.min(...rankedRecords.map((r) => r.rank_position as number))
                    : null;

                  return (
                    <tr key={kw} className="border-b border-border last:border-0 hover:bg-secondary/50">
                      <td className="px-4 py-3 text-sm text-foreground max-w-[200px]">{kw}</td>
                      {(["doubao", "deepseek", "kimi", "qianwen"] as const).map((platform: AIPlatform) => {
                        const record = kwRecords.find((r) => r.ai_platform === platform);
                        return (
                          <td key={platform} className="px-4 py-3 text-center">
                            {record ? (
                              record.is_cited ? (
                                <span className="inline-flex flex-col items-center">
                                  <span className="text-success font-medium text-sm">#{record.rank_position}</span>
                                  <span className="text-xs text-muted">{record.citation_source}</span>
                                </span>
                              ) : (
                                <span className="text-danger text-sm">未引用</span>
                              )
                            ) : (
                              <span className="text-muted text-sm">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center">
                        {bestRank !== null ? (
                          <span className="text-sm font-bold text-primary">#{bestRank}</span>
                        ) : (
                          <span className="text-sm text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {kwRecords.length === 0
                          ? "尚未检测"
                          : kwRecords.every((r) => !r.is_cited)
                            ? "补发文章到头条+搜狐"
                            : kwRecords.some((r) => r.ai_platform === "kimi" && !r.is_cited)
                              ? "增加知乎发文"
                              : "保持现状"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 提示信息 */}
      <div className="bg-primary-light rounded-xl p-4">
        <h3 className="text-sm font-semibold text-primary mb-2">功能说明</h3>
        <ul className="space-y-1.5 text-sm text-primary/80">
          <li>&bull; 检测功能将在AI平台搜索您的目标搜索词，查看是否被引用</li>
          <li>&bull; 建议每周检测一次，观察引用率变化趋势</li>
          <li>&bull; 未被引用的关键词，建议增加对应平台的文章发布</li>
        </ul>
      </div>
    </div>
  );
}
