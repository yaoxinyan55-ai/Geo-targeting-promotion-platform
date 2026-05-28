import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callDeepSeek } from "@/lib/ai";
import type { AIPlatform } from "@/types/database";

interface DetectResult {
  keyword_id: string;
  keyword_text: string;
  ai_platform: AIPlatform;
  is_cited: boolean;
  rank_position: number | null;
  citation_snippet: string;
  citation_source: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
    }

    const { projectId } = await request.json();
    if (!projectId) {
      return NextResponse.json({ success: false, error: "缺少项目ID" }, { status: 400 });
    }

    // 获取项目信息
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ success: false, error: "项目不存在" }, { status: 404 });
    }

    // 获取该项目所有关键词
    const { data: keywords } = await supabase
      .from("keywords")
      .select("*")
      .eq("project_id", projectId);

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ success: false, error: "没有关键词" }, { status: 400 });
    }

    const targetName = project.target_name;
    const results: DetectResult[] = [];

    // 对每个关键词调用DeepSeek检测
    // 目前只检测 deepseek 平台，豆包和Kimi以后加API后扩展
    for (const keyword of keywords) {
      try {
        const answer = await callDeepSeek([
          {
            role: "system",
            content: "你是一个普通用户在使用AI搜索引擎。请根据用户的问题给出详细、客观的回答。回答中如果涉及品牌/产品推荐，请列出你认为值得推荐的，并简要说明理由。",
          },
          {
            role: "user",
            content: keyword.full_keyword,
          },
        ], 0.3);

        // 分析回答中是否提到了目标品牌
        const analysis = analyzeResponse(answer, targetName);

        results.push({
          keyword_id: keyword.id,
          keyword_text: keyword.full_keyword,
          ai_platform: "deepseek",
          is_cited: analysis.isCited,
          rank_position: analysis.rankPosition,
          citation_snippet: analysis.snippet,
          citation_source: "DeepSeek直答",
        });
      } catch {
        // 单个关键词检测失败不影响其他
        results.push({
          keyword_id: keyword.id,
          keyword_text: keyword.full_keyword,
          ai_platform: "deepseek",
          is_cited: false,
          rank_position: null,
          citation_snippet: "检测失败",
          citation_source: "",
        });
      }
    }

    // 批量写入 monitor_records
    const now = new Date().toISOString();
    const records = results.map((r) => ({
      project_id: projectId,
      keyword_id: r.keyword_id,
      keyword_text: r.keyword_text,
      ai_platform: r.ai_platform,
      detected_at: now,
      is_cited: r.is_cited,
      rank_position: r.rank_position,
      citation_snippet: r.citation_snippet,
      citation_source: r.citation_source,
      citation_ratio: null,
      competitors_found: [],
    }));

    const { error: insertError } = await supabase
      .from("monitor_records")
      .insert(records);

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    // 更新已检测关键词的状态为 monitoring
    const citedKeywordIds = results
      .filter((r) => r.is_cited)
      .map((r) => r.keyword_id);

    if (citedKeywordIds.length > 0) {
      await supabase
        .from("keywords")
        .update({ status: "monitoring" })
        .in("id", citedKeywordIds);
    }

    const citedCount = results.filter((r) => r.is_cited).length;

    return NextResponse.json({
      success: true,
      data: {
        total: results.length,
        cited: citedCount,
        rate: Math.round((citedCount / results.length) * 100),
        results,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * 分析AI回答中是否提到了目标品牌
 */
function analyzeResponse(
  response: string,
  targetName: string
): { isCited: boolean; rankPosition: number | null; snippet: string } {
  const lowerResponse = response.toLowerCase();
  const lowerTarget = targetName.toLowerCase();

  // 检查是否包含目标品牌名
  const isCited = lowerResponse.includes(lowerTarget);

  if (!isCited) {
    return { isCited: false, rankPosition: null, snippet: "" };
  }

  // 尝试判断排名位置（通过在回答中出现的顺序）
  // 简单策略：找到目标品牌在第几个被提到的"推荐项"中
  const rankPosition = estimateRank(response, targetName);

  // 提取包含品牌名的那段话作为引用片段
  const snippet = extractSnippet(response, targetName);

  return { isCited: true, rankPosition, snippet };
}

/**
 * 估算品牌在推荐列表中的排名
 */
function estimateRank(response: string, targetName: string): number {
  // 按段落或编号拆分，找目标品牌在第几段被提到
  const lines = response.split("\n").filter((line) => line.trim().length > 0);
  const numberedPattern = /^[\d]+[.、)）]/;

  let rank = 0;
  for (const line of lines) {
    if (numberedPattern.test(line.trim())) {
      rank++;
      if (line.toLowerCase().includes(targetName.toLowerCase())) {
        return rank;
      }
    }
  }

  // 如果没有编号列表格式，直接返回出现位置的大致排名
  const position = response.toLowerCase().indexOf(targetName.toLowerCase());
  const textBefore = response.slice(0, position);
  const paragraphs = textBefore.split("\n\n").length;
  return Math.max(1, Math.min(paragraphs, 10));
}

/**
 * 提取包含品牌名的上下文片段
 */
function extractSnippet(response: string, targetName: string): string {
  const index = response.toLowerCase().indexOf(targetName.toLowerCase());
  if (index === -1) return "";

  const start = Math.max(0, index - 50);
  const end = Math.min(response.length, index + targetName.length + 100);
  let snippet = response.slice(start, end).trim();

  if (start > 0) snippet = "..." + snippet;
  if (end < response.length) snippet = snippet + "...";

  return snippet;
}
