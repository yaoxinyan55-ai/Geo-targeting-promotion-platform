import type { AIPlatform } from "@/types/database";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PlatformConfig {
  apiUrl: string;
  model: string;
  envKey: string;
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  deepseek: {
    apiUrl: "https://api.deepseek.com/v1/chat/completions",
    model: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
  },
  doubao: {
    apiUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    model: "doubao-1-5-pro-256k-250115",
    envKey: "DOUBAO_API_KEY",
  },
  kimi: {
    apiUrl: "https://api.moonshot.cn/v1/chat/completions",
    model: "moonshot-v1-8k",
    envKey: "KIMI_API_KEY",
  },
  qianwen: {
    apiUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    model: "qwen-turbo",
    envKey: "QIANWEN_API_KEY",
  },
};

/**
 * 调用DeepSeek API（用于关键词生成和文章生成）
 */
export async function callDeepSeek(messages: ChatMessage[], temperature = 0.7): Promise<string> {
  return callAIPlatform("deepseek", messages, temperature);
}

/**
 * 通用AI平台调用（所有平台都是OpenAI兼容格式）
 */
export async function callAIPlatform(
  platform: AIPlatform,
  messages: ChatMessage[],
  temperature = 0.7
): Promise<string> {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) {
    throw new Error(`不支持的AI平台: ${platform}`);
  }

  const apiKey = process.env[config.envKey];
  if (!apiKey) {
    throw new Error(`未配置 ${config.envKey}`);
  }

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${platform} API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * 检查某个AI平台的API Key是否已配置
 */
export function isPlatformConfigured(platform: AIPlatform): boolean {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) return false;
  return !!process.env[config.envKey];
}

/**
 * 获取所有已配置的AI平台列表
 */
export function getConfiguredPlatforms(): AIPlatform[] {
  return (Object.keys(PLATFORM_CONFIGS) as AIPlatform[]).filter(
    (platform) => isPlatformConfigured(platform)
  );
}
