import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callDeepSeek } from "@/lib/ai";
import type { PublishPlatform } from "@/types/database";

interface AdaptRequest {
  articleId: string;
  platform: PublishPlatform;
  masterTitle: string;
  masterContent: string;
  toneDescription: string;
  platformName: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
    }

    const body = await request.json() as AdaptRequest;
    const { articleId, platform, masterTitle, masterContent, toneDescription, platformName } = body;

    if (!articleId || !platform || !masterContent) {
      return NextResponse.json({ success: false, error: "缺少参数" }, { status: 400 });
    }

    const prompt = `你是一个资深内容运营专家，擅长将文章改写为适合不同内容平台的版本。

## 任务
将下面的主稿改写为适合「${platformName}」平台发布的版本。

## 平台调性要求
${toneDescription}

## 改写规则
1. 保持核心信息和关键数据不变
2. 调整语气、结构和表达方式以匹配平台特点
3. 标题需要重新优化，符合该平台的标题风格
4. 如果是社交平台（小红书、抖音），可以适当加入emoji和分段
5. 如果是专业平台（知乎、CSDN），强调逻辑性和专业性
6. 字数可以适当调整：短内容平台缩短，长内容平台保持或扩展
7. 不要使用极限词（最、第一、100%、顶级等）

## 主稿标题
${masterTitle}

## 主稿正文
${masterContent}

## 输出格式
请严格按照以下JSON格式返回，不要有其他内容：
{"title":"改写后的标题","content":"改写后的正文内容"}`;

    const result = await callDeepSeek(
      [{ role: "user", content: prompt }],
      0.75
    );

    // Parse the JSON response
    let parsed: { title: string; content: string };
    try {
      // Try to extract JSON from the response (might have markdown wrapping)
      const jsonMatch = result.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(result);
      }
    } catch {
      // If JSON parsing fails, use a fallback structure
      parsed = {
        title: `【${platformName}】${masterTitle}`,
        content: result,
      };
    }

    // Save to platform_versions table
    await supabase.from("platform_versions").insert({
      article_id: articleId,
      platform,
      title: parsed.title,
      content: parsed.content,
      tags: [],
      status: "ready",
    });

    return NextResponse.json({
      success: true,
      data: { title: parsed.title, content: parsed.content },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "改写失败";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
