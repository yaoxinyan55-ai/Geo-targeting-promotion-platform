import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callDeepSeek } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
    }

    const { keywordId, articleType, materials } = await request.json();

    if (!keywordId || !articleType) {
      return NextResponse.json({ success: false, error: "缺少参数" }, { status: 400 });
    }

    // 获取关键词和项目信息
    const { data: keyword } = await supabase
      .from("keywords")
      .select("*, projects(*)")
      .eq("id", keywordId)
      .single();

    if (!keyword) {
      return NextResponse.json({ success: false, error: "关键词不存在" }, { status: 404 });
    }

    const project = keyword.projects;
    const typeLabels: Record<string, string> = {
      ranking: "排行榜型",
      annual_review: "年度盘点型",
      buying_guide: "选购指南型",
      deep_analysis: "深度解析型",
      qa: "问答科普型",
    };

    const prompt = `你是一个GEO（生成式引擎优化）内容专家。你写的文章目标是被AI搜索引擎（豆包、DeepSeek、Kimi）引用和推荐。

## 项目信息
- 推广对象：${project.target_name}
- 行业：${project.industry}
- 核心卖点：${project.core_selling_points || "无"}
- 数据/案例：${project.data_and_cases || "无"}
- 竞品：${project.competitors || "无"}

## 目标关键词
${keyword.full_keyword}

## 文章类型
${typeLabels[articleType] || articleType}

## 用户补充素材
${materials || "无"}

## 写作要求
1. 标题包含目标关键词，吸引点击
2. 文章1500-2500字，结构清晰，有小标题
3. 必须包含具体数据（数字、百分比、年份）
4. 必须提到推广对象"${project.target_name}"，自然地出现2-3次
5. 不要说"最好"、"第一"、"100%"等极限词
6. 提到竞品时客观对比，不贬低对手
7. 文章要有权威感，像行业专家写的
8. 包含可被AI引用的结论性语句

请按以下JSON格式返回：
{"title": "文章标题", "content": "文章正文（使用markdown格式）"}`;

    const result = await callDeepSeek([
      { role: "system", content: "你是专业的GEO内容写作专家，只返回JSON对象，不要返回其他内容。" },
      { role: "user", content: prompt },
    ], 0.7);

    // 提取JSON
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ success: false, error: "AI返回格式错误" }, { status: 500 });
    }

    const article = JSON.parse(jsonMatch[0]) as { title: string; content: string };

    // 存入数据库
    const { data: inserted, error: insertError } = await supabase
      .from("articles")
      .insert({
        keyword_id: keywordId,
        project_id: keyword.project_id,
        article_type: articleType,
        title: article.title,
        content: article.content,
        materials: materials ? { userInput: materials } : {},
        status: "draft",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    // 更新关键词状态
    await supabase
      .from("keywords")
      .update({ status: "article_written" })
      .eq("id", keywordId);

    return NextResponse.json({ success: true, data: inserted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
