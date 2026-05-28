export interface User {
  id: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  target_name: string;
  target_type: "personal_ip" | "company" | "product";
  industry: string;
  existing_platforms: PlatformPresence[];
  target_direction: string;
  target_ai_platforms: AIPlatform[];
  core_selling_points: string;
  data_and_cases: string;
  competitors: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface PlatformPresence {
  platform: string;
  followers: string;
  url: string;
  enabled: boolean;
}

export type AIPlatform = "doubao" | "deepseek" | "kimi";

export interface Keyword {
  id: string;
  project_id: string;
  prefix: string;
  main_word: string;
  suffix: string;
  full_keyword: string;
  priority: 1 | 2 | 3;
  status: "pending" | "article_written" | "published" | "monitoring";
  created_at: string;
  updated_at: string;
}

export type ArticleType =
  | "ranking"
  | "annual_review"
  | "buying_guide"
  | "deep_analysis"
  | "qa";

export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  ranking: "排行榜型",
  annual_review: "年度盘点型",
  buying_guide: "选购指南型",
  deep_analysis: "深度分析型",
  qa: "QA问答型",
};

export type PublishPlatform = "toutiao" | "sohu" | "zhihu" | "csdn";

export const PUBLISH_PLATFORM_LABELS: Record<PublishPlatform, string> = {
  toutiao: "今日头条",
  sohu: "搜狐",
  zhihu: "知乎",
  csdn: "CSDN",
};

export interface Article {
  id: string;
  keyword_id: string;
  project_id: string;
  article_type: ArticleType;
  title: string;
  content: string;
  materials: ArticleMaterials;
  status: "draft" | "confirmed" | "adapting" | "ready";
  created_at: string;
  updated_at: string;
}

export interface ArticleMaterials {
  selling_points: string;
  credentials: string;
  cases: string;
  competitors: string;
}

export interface PlatformVersion {
  id: string;
  article_id: string;
  platform: PublishPlatform;
  title: string;
  content: string;
  tags: string[];
  status: "draft" | "ready" | "published";
  published_url: string;
  published_at: string | null;
  created_at: string;
}

export interface MonitorRecord {
  id: string;
  project_id: string;
  keyword_id: string;
  keyword_text: string;
  ai_platform: AIPlatform;
  detected_at: string;
  is_cited: boolean;
  rank_position: number | null;
  citation_snippet: string;
  citation_source: string;
  citation_ratio: number | null;
  competitors_found: CompetitorEntry[];
  created_at: string;
}

export interface CompetitorEntry {
  name: string;
  rank: number;
}

export const AI_PLATFORM_LABELS: Record<AIPlatform, string> = {
  doubao: "豆包",
  deepseek: "DeepSeek",
  kimi: "Kimi",
};
