export function Cases() {
  return (
    <section id="cases" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground">真实案例</h2>
          <p className="mt-4 text-muted">
            这些品牌已经被AI主动推荐
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CaseCard
            title="少儿编程机构"
            result="豆包排名第2"
            articles={3}
            days={3}
            platforms={["今日头条", "搜狐"]}
            keyword="深圳少儿编程推荐"
          />
          <CaseCard
            title="AI培训课程"
            result="豆包排名第1"
            articles={3}
            days={1}
            platforms={["今日头条", "搜狐", "知乎"]}
            keyword="AI训练师课程创始人"
          />
          <CaseCard
            title="本地餐饮品牌"
            result="DeepSeek被引用"
            articles={5}
            days={5}
            platforms={["今日头条", "搜狐", "CSDN"]}
            keyword="广州日料推荐"
          />
        </div>
      </div>
    </section>
  );
}

function CaseCard({
  title,
  result,
  articles,
  days,
  platforms,
  keyword,
}: {
  title: string;
  result: string;
  articles: number;
  days: number;
  platforms: string[];
  keyword: string;
}) {
  return (
    <div className="rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-primary bg-primary-light px-3 py-1 rounded-full">
          {title}
        </span>
        <span className="text-sm font-bold text-success">{result}</span>
      </div>

      <p className="text-sm text-muted mb-4">
        目标词：<span className="text-foreground font-medium">{keyword}</span>
      </p>

      <div className="flex items-center gap-4 text-sm text-muted mb-4">
        <span>{articles}篇文章</span>
        <span className="w-px h-4 bg-border" />
        <span>{days}天见效</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => (
          <span
            key={p}
            className="text-xs bg-secondary text-muted px-2 py-1 rounded"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
