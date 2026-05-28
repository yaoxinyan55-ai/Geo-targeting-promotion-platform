import Link from "next/link";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "@/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-light to-white py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-4 py-1.5 text-sm text-muted mb-8">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          上线测试期 · 全部功能免费开放
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
          {SITE_DESCRIPTION}
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto">
          {SITE_TAGLINE}。帮你的IP、公司、产品被豆包、DeepSeek、Kimi主动推荐
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-hover transition-colors"
          >
            免费开始使用
          </Link>
          <a
            href="#cases"
            className="w-full sm:w-auto border border-border text-foreground px-8 py-3 rounded-lg text-lg font-medium hover:bg-secondary transition-colors"
          >
            查看案例
          </a>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">3篇</span>
            <span>文章起步</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">7天</span>
            <span>首次见效</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">3个</span>
            <span>AI平台覆盖</span>
          </div>
        </div>
      </div>
    </section>
  );
}
