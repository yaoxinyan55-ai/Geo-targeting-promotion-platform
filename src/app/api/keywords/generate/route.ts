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

    const { projectId } = await request.json();
    if (!projectId) {
      return NextResponse.json({ success: false, error: "缺少项目ID" }, { status: 400 });
    }

    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ success: false, error: "项目不存在" }, { status: 404 });
    }

    const prompt = `你是一个GEO（生成式引擎优化）专家。用户想让AI搜索引擎（豆包、DeepSeek、Kimi）在回答问题时推荐他们的品牌/产品。

项目信息：
- 推广对象：${project.target_name}
- 类型：${project.target_type === "personal_ip" ? "个人IP" : project.target_type === "company" ? "公司/品牌" : "产品"}
- 行业：${project.industry}
- 希望被搜到的方向：${project.target_direction}
- 核心卖点：${project.core_selling_points || "无"}
- 竞品：${project.competitors || "无"}

请使用"plant公式"生成12个目标搜索词。plant公式 = 前缀词 + 主词 + 后缀词。

规则：
1. 前缀词：年份（2025/2026）、地域、"最新"、"推荐"等
2. 主词：行业核心词，如"少儿编程"、"麻辣香锅加盟"
3. 后缀词：排行榜、哪家好、怎么选、推荐、测评等
4. 生成的搜索词要像真实用户会搜索的问题
5. 优先级1=高优先(4个)、2=中优先(4个)、3=低优先(4个)

请严格按以下JSON格式返回，不要返回其他内容：
[
  {"prefix": "2026年", "main_word": "主词", "suffix": "排行榜", "full_keyword": "2026年主词排行榜", "priority": 1},
  ...
]`;

    const result = await callDeepSeek([
      { role: "system", content: "你是GEO关键词生成专家，只返回JSON数组，不要返回其他内容。" },
      { role: "user", content: prompt },
    ], 0.8);

    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ success: false, error: "AI返回格式错误" }, { status: 500 });
    }

    const keywords = JSON.parse(jsonMatch[0]) as Array<{
      prefix: string;
      main_word: string;
      suffix: string;
      full_keyword: string;
      priority: number;
    }>;

    const insertData = keywords.map((kw) => ({
      project_id: projectId,
      prefix: kw.prefix,
      main_word: kw.main_word,
      suffix: kw.suffix,
      full_keyword: kw.full_keyword,
      priority: kw.priority,
      status: "pending" as const,
    }));

    const { error: insertError } = await supabase.from("keywords").insert(insertData);

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { count: keywords.length } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
