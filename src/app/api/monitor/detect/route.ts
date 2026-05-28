import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAIPlatform, getConfiguredPlatforms } from "@/lib/ai";
import type { AIPlatform } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
    }

    const { projectId, keywordId, platform } = await request.json() as {
      projectId: string;
      keywordId: string;
      platform?: AIPlatform;
    };

    if (!projectId || !keywordId) {
      return NextResponse.json({ success: false, error: "缺少参数" }, { status: 400 });
    }

    // 获取项目和关键词
    const [projectRes, keywordRes] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase.from("keywords").select("*").eq("id", keywordId).single(),
    ]);

    if (!projectRes.data || !keywordRes.data) {
      return NextResponse.json({ success: false, error: "项目或关键词不存在" }, { status: 404 });
    }

    const project = projectRes.data;
    const keyword = keywordRes.data;
    const targetName = project.target_name as string;

    // 确定要检测的平台
    const configuredPlatforms = getConfiguredPlatforms();
    const platformsToCheck: AIPlatform[] = platform
      ? (configuredPlatforms.includes(platform) ? [platform] : [])
      : configuredPlatforms;

    if (platformsToCheck.length === 0) {
      return NextResponse.json({ success: false, error: "没有可用的AI平台API" }, { status: 400 });
    }

    const results: Array<{
      platform: AIPlatform;
      is_cited: boolean;
      rank_position: number | null;
      snippet: string;
    }> = [];

    // 逐个平台检测
    for (const p of platformsToCheck) {
      try {
        const answer = await callAIPlatform(p, [
          {
            role: "system",
            content: "你是一个普通用户在使用AI搜索引擎。请根据用户的问题给出详细、客观的回答。回答中如果涉及品牌/产品推荐，请列出你认为值得推荐的，并简要说明理由。",
          },
          {
            role: "user",
            content: keyword.full_keyword as string,
          },
        ], 0.3);

        const analysis = analyzeResponse(answer, targetName);
        results.push({
          platform: p,
          is_cited: analysis.isCited,
          rank_position: analysis.rankPosition,
          snippet: analysis.snippet,
        });
      } catch {
        results.push({
          platform: p,
          is_cited: false,
          rank_position: null,
          snippet: "检测失败",
        });
      }
    }

    // 批量写入 monitor_records
    const now = new Date().toISOString();
    const PLATFORM_SOURCE: Record<string, string> = {
      deepseek: "DeepSeek直答",
      doubao: "豆包直答",
      kimi: "Kimi直答",
      qianwen: "千问直答",
    };

    const records = results.map((r) => ({
      project_id: projectId,
      keyword_id: keywordId,
      keyword_text: keyword.full_keyword,
      ai_platform: r.platform,
      detected_at: now,
      is_cited: r.is_cited,
      rank_position: r.rank_position,
      citation_snippet: r.snippet,
      citation_source: r.is_cited ? PLATFORM_SOURCE[r.platform] : "",
      citation_ratio: null,
      competitors_found: [],
    }));

    const { error: insertError } = await supabase
      .from("monitor_records")
      .insert(records);

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    // 如果任一平台被引用，更新关键词状态
    if (results.some((r) => r.is_cited)) {
      await supabase
        .from("keywords")
        .update({ status: "monitoring" })
        .eq("id", keywordId);
    }

    return NextResponse.json({
      success: true,
      data: {
        platforms_checked: platformsToCheck,
        results,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

function analyzeResponse(
  response: string,
  targetName: string
): { isCited: boolean; rankPosition: number | null; snippet: string } {
  const lowerResponse = response.toLowerCase();
  const lowerTarget = targetName.toLowerCase();
  const isCited = lowerResponse.includes(lowerTarget);

  if (!isCited) {
    return { isCited: false, rankPosition: null, snippet: "" };
  }

  const rankPosition = estimateRank(response, targetName);
  const snippet = extractSnippet(response, targetName);
  return { isCited: true, rankPosition, snippet };
}

function estimateRank(response: string, targetName: string): number {
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

  const position = response.toLowerCase().indexOf(targetName.toLowerCase());
  const textBefore = response.slice(0, position);
  const paragraphs = textBefore.split("\n\n").length;
  return Math.max(1, Math.min(paragraphs, 10));
}

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
