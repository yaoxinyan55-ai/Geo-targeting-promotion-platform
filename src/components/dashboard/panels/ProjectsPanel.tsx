"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types/database";

interface ProjectsPanelProps {
  onNavigate: (panel: string) => void;
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string, projectName: string) => void;
}

const COLORS = ["#3B6CF6", "#7C5CFF", "#E84D8A", "#F59E0B", "#1F8A5B"];

export function ProjectsPanel({ onNavigate, selectedProjectId, onSelectProject }: ProjectsPanelProps) {
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
    <div className="ws-view ws-show">
      <div className="ws-ov-head">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>我的项目</h1>
          <p style={{ fontSize: "13.5px", color: "var(--ws-sub)", marginTop: 4 }}>选择一个项目开始推广，或新建项目</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ws-sub)" }}>加载中...</div>
      ) : (
        <div className="ws-proj-grid">
          {projects.map((project, idx) => {
            const isSelected = selectedProjectId === project.id;
            const color = COLORS[idx % COLORS.length];
            const initial = project.name.charAt(0);
            const enabledPlatforms = project.existing_platforms.filter((p) => p.enabled).length;
            // Simulate progress: 0-4 steps
            const progress = isSelected ? 2 : Math.min(enabledPlatforms, 4);

            return (
              <button
                key={project.id}
                className={`ws-pcardx${isSelected ? " ws-on" : ""}`}
                onClick={() => {
                  if (isSelected) {
                    onNavigate("keywords");
                  } else {
                    onSelectProject?.(project.id, project.name);
                  }
                }}
              >
                <div className="ws-pcx-top">
                  <span className="ws-pcx-ava" style={{ background: color }}>{initial}</span>
                  <div>
                    <div className="ws-pcx-nm">{project.name}</div>
                    <div className="ws-pcx-cat">
                      {project.target_type === "company" ? "公司/品牌" : project.target_type === "personal_ip" ? "个人IP" : "产品"} · {project.industry}
                    </div>
                  </div>
                  {isSelected && <span className="ws-pcx-badge">当前项目</span>}
                </div>
                <div className="ws-pcx-steps">
                  {[0, 1, 2, 3].map((i) => (
                    <i key={i} className={i < progress ? "ws-ok" : ""} />
                  ))}
                </div>
                <div className="ws-pcx-foot">
                  <div className="ws-pcx-stat">
                    <b>{enabledPlatforms}</b>
                    <span>已有平台</span>
                  </div>
                  <div className="ws-pcx-stat">
                    <b>{project.target_ai_platforms.length}</b>
                    <span>目标 AI</span>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: "12.5px", color: isSelected ? "var(--ws-acc)" : "var(--ws-sub)", fontWeight: 600 }}>
                    {isSelected ? "继续推广 →" : "选择并开始 →"}
                  </span>
                </div>
              </button>
            );
          })}

          <button className="ws-pcx-new" onClick={() => onNavigate("new-project")}>
            <span className="ws-plus">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span style={{ fontSize: "13.5px", fontWeight: 700 }}>新建项目</span>
          </button>
        </div>
      )}
    </div>
  );
}
