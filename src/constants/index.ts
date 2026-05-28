export const SITE_NAME = "AI提名官";
export const SITE_DESCRIPTION = "让AI搜索主动推荐你的品牌";
export const SITE_TAGLINE = "3篇文章，7天上AI答案";

export const NAV_ITEMS = [
  { label: "功能介绍", href: "#features" },
  { label: "案例展示", href: "#cases" },
  { label: "使用流程", href: "#steps" },
] as const;

export const DASHBOARD_NAV = [
  { label: "控制台", href: "/dashboard", icon: "chart" },
  { label: "项目管理", href: "/dashboard/projects", icon: "folder" },
  { label: "关键词中心", href: "/dashboard/keywords", icon: "key" },
  { label: "文章工作台", href: "/dashboard/articles", icon: "edit" },
  { label: "发布中心", href: "/dashboard/publish", icon: "send" },
  { label: "监控仪表盘", href: "/dashboard/monitor", icon: "monitor" },
] as const;

export const INDUSTRIES = [
  "教育培训",
  "餐饮美食",
  "医疗健康",
  "金融理财",
  "科技互联网",
  "电商零售",
  "房产家居",
  "旅游出行",
  "美容护肤",
  "法律服务",
  "其他",
] as const;

export const SOCIAL_PLATFORMS = [
  { key: "douyin", label: "抖音" },
  { key: "xiaohongshu", label: "小红书" },
  { key: "zhihu", label: "知乎" },
  { key: "toutiao", label: "今日头条号" },
  { key: "weibo", label: "微博" },
  { key: "wechat", label: "微信公众号" },
] as const;

export const FEATURES = [
  {
    icon: "target",
    title: "智能选词",
    description: "自动拆解目标搜索词矩阵，找到竞争小、上榜快的细分赛道词",
  },
  {
    icon: "edit",
    title: "AI写稿",
    description: "一键生成排行榜、选购指南等5种类型文章，自带数据和案例框架",
  },
  {
    icon: "refresh",
    title: "多平台改写",
    description: "一篇主稿自动适配头条、搜狐、知乎等平台调性，复制粘贴即可发布",
  },
  {
    icon: "monitor",
    title: "效果监控",
    description: "追踪目标词在豆包、DeepSeek、Kimi的引用情况，排名和趋势一目了然",
  },
] as const;

export const STEPS = [
  {
    step: 1,
    title: "输入产品信息",
    description: "填写你的品牌、行业和目标方向",
  },
  {
    step: 2,
    title: "AI生成内容",
    description: "自动出关键词、文章和投放方案",
  },
  {
    step: 3,
    title: "复制发布",
    description: "一键复制到头条、搜狐、知乎发布",
  },
  {
    step: 4,
    title: "上AI答案",
    description: "被豆包、DeepSeek、Kimi主动推荐",
  },
] as const;
