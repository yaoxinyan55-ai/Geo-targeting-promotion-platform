import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI提名官 - 让AI搜索主动推荐你的品牌",
  description:
    "帮IP/公司/产品被豆包、DeepSeek、Kimi等AI搜索引擎主动推荐的GEO自动化平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
