"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INDUSTRIES, SOCIAL_PLATFORMS } from "@/constants";
import type { AIPlatform, PlatformPresence } from "@/types/database";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [targetName, setTargetName] = useState("");
  const [targetType, setTargetType] = useState<"personal_ip" | "company" | "product">("company");
  const [industry, setIndustry] = useState("");
  const [platforms, setPlatforms] = useState<PlatformPresence[]>(
    SOCIAL_PLATFORMS.map((p) => ({
      platform: p.key,
      followers: "",
      url: "",
      enabled: false,
    }))
  );
  const [targetDirection, setTargetDirection] = useState("");
  const [targetAI, setTargetAI] = useState<AIPlatform[]>(["doubao", "deepseek", "kimi"]);
  const [sellingPoints, setSellingPoints] = useState("");
  const [dataCases, setDataCases] = useState("");
  const [competitors, setCompetitors] = useState("");

  const togglePlatform = (index: number) => {
    setPlatforms((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const updatePlatformFollowers = (index: number, value: string) => {
    setPlatforms((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, followers: value } : p
      )
    );
  };

  const toggleAI = (ai: AIPlatform) => {
    setTargetAI((prev) =>
      prev.includes(ai) ? prev.filter((a) => a !== ai) : [...prev, ai]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard/keywords");
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">新建GEO项目</h1>
        <p className="text-muted mt-1">填写信息后系统将自动生成关键词矩阵</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">基本信息</h2>

          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-foreground mb-1.5">
              项目名称
            </label>
            <input
              id="projectName"
              type="text"
              placeholder="如：小码王少儿编程GEO推广"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label htmlFor="targetName" className="block text-sm font-medium text-foreground mb-1.5">
              推广对象
            </label>
            <input
              id="targetName"
              type="text"
              placeholder="品牌名/产品名/个人名"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              对象类型
            </label>
            <div className="flex gap-3">
              {(
                [
                  { key: "personal_ip", label: "个人IP" },
                  { key: "company", label: "公司/品牌" },
                  { key: "product", label: "产品" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setTargetType(opt.key)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    targetType === opt.key
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border text-muted hover:border-primary/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-foreground mb-1.5">
              所属行业
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            >
              <option value="">请选择行业</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">现有留痕</h2>
          <p className="text-sm text-muted">已有哪些平台账号？（勾选并填写粉丝数）</p>

          <div className="space-y-3">
            {platforms.map((p, index) => {
              const label = SOCIAL_PLATFORMS.find(
                (sp) => sp.key === p.platform
              )?.label;
              return (
                <div key={p.platform} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer min-w-[100px]">
                    <input
                      type="checkbox"
                      checked={p.enabled}
                      onChange={() => togglePlatform(index)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">{label}</span>
                  </label>
                  {p.enabled && (
                    <input
                      type="text"
                      placeholder="粉丝数"
                      value={p.followers}
                      onChange={(e) =>
                        updatePlatformFollowers(index, e.target.value)
                      }
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">目标方向</h2>

          <div>
            <label htmlFor="targetDirection" className="block text-sm font-medium text-foreground mb-1.5">
              希望被搜到的方向
            </label>
            <input
              id="targetDirection"
              type="text"
              placeholder="写大概方向就行，如：深圳少儿编程、孩子学编程"
              value={targetDirection}
              onChange={(e) => setTargetDirection(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              目标AI平台
            </label>
            <div className="flex gap-3">
              {(
                [
                  { key: "doubao", label: "豆包" },
                  { key: "deepseek", label: "DeepSeek" },
                  { key: "kimi", label: "Kimi" },
                ] as const
              ).map((ai) => (
                <button
                  key={ai.key}
                  type="button"
                  onClick={() => toggleAI(ai.key)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    targetAI.includes(ai.key)
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border text-muted hover:border-primary/50"
                  }`}
                >
                  {ai.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            核心素材
            <span className="text-sm text-muted font-normal ml-2">
              选填，后面也能补充
            </span>
          </h2>

          <div>
            <label htmlFor="sellingPoints" className="block text-sm font-medium text-foreground mb-1.5">
              核心卖点
            </label>
            <textarea
              id="sellingPoints"
              rows={2}
              placeholder="如：8年教学经验，3个校区，累计学员1200人"
              value={sellingPoints}
              onChange={(e) => setSellingPoints(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            />
          </div>

          <div>
            <label htmlFor="dataCases" className="block text-sm font-medium text-foreground mb-1.5">
              数据 / 案例
            </label>
            <textarea
              id="dataCases"
              rows={2}
              placeholder="如：就业率82%，获深圳教育局备案"
              value={dataCases}
              onChange={(e) => setDataCases(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            />
          </div>

          <div>
            <label htmlFor="competitors" className="block text-sm font-medium text-foreground mb-1.5">
              对标竞品
            </label>
            <input
              id="competitors"
              type="text"
              placeholder="如：编程猫、童程童美"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </section>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-lg border border-border text-muted font-medium hover:bg-secondary transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading || !name || !targetName}
            className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "生成关键词中..." : "创建项目并生成关键词"}
          </button>
        </div>
      </form>
    </div>
  );
}
