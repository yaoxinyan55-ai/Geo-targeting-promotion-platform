"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types/database";

interface ProjectsPanelProps {
  onNavigate: (panel: string) => void;
}

export function ProjectsPanel({ onNavigate }: ProjectsPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setProjects(data as unknown as Project[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">项目管理</h1>
          <p className="text-muted mt-1">管理你的所有GEO推广项目</p>
        </div>
        <button
          onClick={() => onNavigate("new-project")}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          + 新建项目
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-primary bg-primary-light px-2.5 py-1 rounded-full">
                  {project.target_type === "company" ? "公司/品牌" : project.target_type === "personal_ip" ? "个人IP" : "产品"}
                </span>
                <span className="text-xs text-success font-medium">
                  {project.status === "active" ? "进行中" : "已归档"}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{project.name}</h3>
              <p className="text-sm text-muted mb-4">推广对象：{project.target_name} · {project.industry}</p>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span>{project.existing_platforms.filter((p) => p.enabled).length} 个已有平台</span>
                <span>
                  目标：{project.target_ai_platforms.map((p) => p === "doubao" ? "豆包" : p === "deepseek" ? "DeepSeek" : "Kimi").join("、")}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted">创建于 {new Date(project.created_at).toLocaleDateString("zh-CN")}</span>
                <button onClick={() => onNavigate("keywords")} className="text-sm text-primary hover:text-primary-hover font-medium">
                  查看详情
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => onNavigate("new-project")}
            className="flex flex-col items-center justify-center min-h-[200px] rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary-light/50 transition-colors"
          >
            <span className="text-4xl text-muted mb-2">+</span>
            <span className="text-sm text-muted">新建项目</span>
          </button>
        </div>
      )}
    </div>
  );
}
