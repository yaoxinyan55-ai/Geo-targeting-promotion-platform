import Link from "next/link";

export function Pricing() {
  return (
    <section className="py-20 bg-secondary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl border border-border p-8 sm:p-12">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            上线测试期
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-4">
            全部功能免费开放
          </h2>

          <p className="text-muted mb-8 max-w-lg mx-auto">
            测试期内所有功能完全免费，包括AI智能选词、文章生成、多平台改写和效果监控。测试期用户享受永久优惠。
          </p>

          <ul className="text-left max-w-sm mx-auto space-y-3 mb-8">
            {[
              "无限项目创建",
              "AI关键词矩阵生成",
              "AI文章写稿 + 多平台改写",
              "效果监控仪表盘",
              "数据导出周报",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <svg
                  className="w-5 h-5 text-success flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/login"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-hover transition-colors"
          >
            免费注册，立即体验
          </Link>

          <p className="mt-4 text-xs text-muted">
            测试期结束后将推出付费方案，测试期用户享受永久优惠
          </p>
        </div>
      </div>
    </section>
  );
}
