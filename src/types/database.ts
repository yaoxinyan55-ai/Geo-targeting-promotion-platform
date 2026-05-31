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

export type AIPlatform = "doubao" | "deepseek" | "kimi" | "qianwen";

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

export type PublishPlatform =
  | "wangyi"
  | "sohu"
  | "baijiahao"
  | "toutiao"
  | "qiehao"
  | "zhihu"
  | "gongzhonghao"
  | "xiaohongshu"
  | "douyin"
  | "bilibili"
  | "csdn"
  | "jianshu";

export const PUBLISH_PLATFORM_LABELS: Record<PublishPlatform, string> = {
  wangyi: "网易",
  sohu: "搜狐",
  baijiahao: "百家号",
  toutiao: "头条号",
  qiehao: "企鹅号",
  zhihu: "知乎",
  gongzhonghao: "公众号",
  xiaohongshu: "小红书",
  douyin: "抖音",
  bilibili: "B站",
  csdn: "CSDN",
  jianshu: "简书",
};

export const PUBLISH_PLATFORM_URLS: Record<PublishPlatform, string> = {
  wangyi: "https://mp.163.com/login.html",
  sohu: "https://mp.sohu.com/mpfe/v3/main/new-batch.action",
  baijiahao: "https://baijiahao.baidu.com/builder/rc/edit",
  toutiao: "https://mp.toutiao.com/profile_v4/graphic/publish",
  qiehao: "https://om.qq.com/article/articlePublish",
  zhihu: "https://zhuanlan.zhihu.com/write",
  gongzhonghao: "https://mp.weixin.qq.com/",
  xiaohongshu: "https://creator.xiaohongshu.com/publish/publish",
  douyin: "https://creator.douyin.com/creator-micro/content/upload",
  bilibili: "https://member.bilibili.com/platform/upload/text/edit",
  csdn: "https://editor.csdn.net/md",
  jianshu: "https://www.jianshu.com/writer",
};

export const PLATFORM_TONE_DESC: Record<PublishPlatform, string> = {
  wangyi: "严肃专业、新闻感强、注重数据引用",
  sohu: "信息密集、客观报道风格、标题吸引力强",
  baijiahao: "通俗易懂、故事化叙述、适合SEO优化",
  toutiao: "标题党风格、口语化、短段落、强节奏感",
  qiehao: "轻松幽默、年轻化表达、互动性强",
  zhihu: "专业深度、逻辑严密、引用数据和来源",
  gongzhonghao: "温暖走心、品牌调性强、排版精美",
  xiaohongshu: "种草风、口语化、emoji丰富、分点罗列",
  douyin: "短平快、口语极强、话题感、引发讨论",
  bilibili: "年轻化、梗多、UP主人设感、真诚分享",
  csdn: "技术向、代码示例、结构化、干货密集",
  jianshu: "文艺清新、个人体验感、散文化叙事",
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
  qianwen: "千问",
};
