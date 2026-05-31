"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import "../../dashboard.css";
import { createClient } from "@/lib/supabase/client";
import { UnifiedSidebar, MobileHeader } from "@/components/dashboard/UnifiedSidebar";
import type { PanelKey } from "@/components/dashboard/UnifiedSidebar";
import {
  OverviewPanel,
  ProjectsPanel,
  NewProjectPanel,
  KeywordsPanel,
  ArticlesPanel,
  GeneratePanel,
  PublishPanel,
  MonitorPanel,
} from "@/components/dashboard/panels";

const STEP_LABELS = ["选词", "写稿", "发布", "看效果"];
const STEP_KEYS: PanelKey[] = ["keywords", "generate", "publish", "monitor"];

type GuideStage = "select-project" | "step-1" | "step-2" | "step-3" | "step-4" | "overview";

const COACH_CONTENT: Record<GuideStage, { label: string; t: string; d: string; btn: string }> = {
  "select-project": {
    label: "第一步",
    t: "选择一个项目开始推广",
    d: "点击一个项目卡片上的「选择并开始推广」，或新建一个项目。选定后系统会围绕这个项目进行后续的选词、写稿、发布和监控。",
    btn: "知道了",
  },
  "step-1": {
    label: "1 / 4",
    t: "选词 · 找对搜索词",
    d: "系统已根据你的项目生成了目标搜索词，勾选 3 个高优先级的词作为本周主攻。",
    btn: "知道了",
  },
  "step-2": {
    label: "2 / 4",
    t: "写稿 · AI 出文章",
    d: "选一个目标词和文章类型，点「生成文章初稿」，AI 会自动写好一篇带数据的文章。",
    btn: "知道了",
  },
  "step-3": {
    label: "3 / 4",
    t: "发布 · 一键多平台",
    d: "点「一键改写」，主稿会适配头条 / 搜狐 / 知乎 / 小红书，复制粘贴即可发布。",
    btn: "知道了",
  },
  "step-4": {
    label: "4 / 4",
    t: "看效果 · 检测上榜",
    d: "点「一键检测全部」，看 4 个 AI 平台是否已经推荐你、排第几。",
    btn: "知道了",
  },
  "overview": {
    label: "总览",
    t: "这是你的数据总览",
    d: "这里可以看到所有项目的关键数据。想开始推广？从上方「我的项目」选择一个项目开始。",
    btn: "知道了",
  },
};

function getGuideStage(panel: PanelKey, hasSelectedProject: boolean): GuideStage {
  if (panel === "projects" || panel === "new-project") return "select-project";
  if (!hasSelectedProject) return "select-project";
  const stepIdx = STEP_KEYS.indexOf(panel);
  if (stepIdx >= 0) return `step-${stepIdx + 1}` as GuideStage;
  return "overview";
}

export default function DashboardPage() {
  const [activePanel, setActivePanel] = useState<PanelKey>("projects");
  const [guideOn, setGuideOn] = useState(true);
  const [coachVisible, setCoachVisible] = useState(true);
  const [toast, setToast] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [projMenuOpen, setProjMenuOpen] = useState(false);
  const [projectList, setProjectList] = useState<{ id: string; name: string; industry: string }[]>([]);
  const projMenuRef = useRef<HTMLDivElement>(null);

  const currentStepIndex = STEP_KEYS.indexOf(activePanel);
  const isStepPanel = currentStepIndex >= 0;
  const hasSelectedProject = !!selectedProjectId;

  const guideStage = getGuideStage(activePanel, hasSelectedProject);
  const coachContent = COACH_CONTENT[guideStage];

  // Check for saved selected project on mount + load project list
  useEffect(() => {
    const saved = localStorage.getItem("geo_selected_project");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { id: string; name: string };
        setSelectedProjectId(parsed.id);
        setSelectedProjectName(parsed.name);
      } catch { /* ignore */ }
    }
    // Load project list for dropdown
    const supabase = createClient();
    supabase.from("projects").select("id, name, industry").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setProjectList(data);
    });
    setLoading(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projMenuRef.current && !projMenuRef.current.contains(e.target as Node)) {
        setProjMenuOpen(false);
      }
    };
    if (projMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [projMenuOpen]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }, []);

  const handleNavigate = useCallback((panel: string) => {
    setActivePanel(panel as PanelKey);
    setCoachVisible(true);
  }, []);

  const toggleGuide = useCallback(() => {
    const nextOn = !guideOn;
    setGuideOn(nextOn);
    if (nextOn) {
      setCoachVisible(true);
    } else {
      setCoachVisible(false);
    }
  }, [guideOn]);

  const handleSelectProject = useCallback((projectId: string, projectName: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName);
    localStorage.setItem("geo_selected_project", JSON.stringify({ id: projectId, name: projectName }));
    // Auto-navigate to step 1 after selecting project
    setActivePanel("keywords");
    setCoachVisible(true);
    setToast(`已选择「${projectName}」，开始推广流程`);
    setTimeout(() => setToast(""), 2000);
  }, []);

  const handleCoachAction = useCallback(() => {
    setCoachVisible(false);
  }, []);

  const shouldShowCoach = guideOn && coachVisible && !loading;

  return (
    <div className="ws-app">
      <UnifiedSidebar
        activePanel={activePanel}
        onNavigate={handleNavigate}
        guideOn={guideOn}
        onToggleGuide={toggleGuide}
      />

      <main className="ws-main">
        {/* Top bar */}
        <header className="ws-top">
          <span className="ws-lbl">当前项目</span>
          <div className="ws-proj-switch" ref={projMenuRef}>
            <button className="ws-proj" onClick={() => setProjMenuOpen(!projMenuOpen)}>
              <span>{selectedProjectName || "未选择项目"}</span>
              <span className="ws-car">▾</span>
            </button>
            <div className={`ws-proj-menu${projMenuOpen ? " ws-show" : ""}`}>
              {projectList.map((p) => (
                <button
                  key={p.id}
                  className={`ws-pm-item${selectedProjectId === p.id ? " ws-on" : ""}`}
                  onClick={() => {
                    handleSelectProject(p.id, p.name);
                    setProjMenuOpen(false);
                  }}
                >
                  <span className="ws-pm-ava" style={{ background: selectedProjectId === p.id ? "var(--ws-acc)" : "var(--ws-ink)" }}>
                    {p.name.charAt(0)}
                  </span>
                  <div>
                    <div className="ws-nm">{p.name}</div>
                    <div className="ws-mt">{p.industry}</div>
                  </div>
                  <span className="ws-ck">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 12l5 5L20 6" />
                    </svg>
                  </span>
                </button>
              ))}
              <button className="ws-pm-new" onClick={() => { setProjMenuOpen(false); handleNavigate("new-project"); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                新建项目
              </button>
            </div>
          </div>
          <button
            className={`ws-guide-pill${guideOn ? "" : " ws-off"}`}
            onClick={toggleGuide}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9a2.5 2.5 0 113.5 2.3c-.9.5-1.5 1-1.5 2.2M12 17h.01" />
            </svg>
            {guideOn ? "引导中" : "开启引导"}
          </button>
        </header>

        <div className="ws-scroll">
          <div className="ws-canvas">
            {/* Stepper - only show on step panels when project is selected */}
            {isStepPanel && hasSelectedProject && (
              <div className="ws-stepper">
                {STEP_LABELS.map((label, i) => (
                  <StepItem
                    key={i}
                    index={i}
                    label={label}
                    currentIndex={currentStepIndex}
                    onClick={() => handleNavigate(STEP_KEYS[i])}
                    isLast={i === STEP_LABELS.length - 1}
                  />
                ))}
              </div>
            )}

            {/* Panels */}
            <div className="ws-panel">
              {activePanel === "overview" && <OverviewPanel onNavigate={handleNavigate} selectedProjectName={selectedProjectName} />}
              {activePanel === "projects" && (
                <ProjectsPanel
                  onNavigate={handleNavigate}
                  selectedProjectId={selectedProjectId}
                  onSelectProject={handleSelectProject}
                />
              )}
              {activePanel === "new-project" && <NewProjectPanel onNavigate={handleNavigate} />}
              {activePanel === "keywords" && <KeywordsPanel onNavigate={handleNavigate} />}
              {activePanel === "articles" && <ArticlesPanel onNavigate={handleNavigate} />}
              {activePanel === "generate" && <GeneratePanel onNavigate={handleNavigate} />}
              {activePanel === "publish" && <PublishPanel onNavigate={handleNavigate} />}
              {activePanel === "monitor" && <MonitorPanel onNavigate={handleNavigate} />}
            </div>
          </div>
        </div>
      </main>

      {/* Coach overlay */}
      {shouldShowCoach && (
        <>
          <div className="ws-coach-dim ws-show" onClick={() => setCoachVisible(false)} />
          <div className="ws-coach ws-show" style={{ bottom: 100, right: 40 }}>
            <div className="ws-coach-top">
              <span className="ws-cn">{coachContent.label}</span>
              <button className="ws-skip" onClick={() => { setGuideOn(false); setCoachVisible(false); }}>
                跳过引导
              </button>
            </div>
            <h4>{coachContent.t}</h4>
            <p>{coachContent.d}</p>
            <div className="ws-coach-foot">
              <div className="ws-dots">
                {isStepPanel
                  ? [0, 1, 2, 3].map((i) => (
                      <i key={i} className={i === currentStepIndex ? "ws-on" : ""} />
                    ))
                  : <i className="ws-on" />
                }
              </div>
              <button className="ws-coach-next" onClick={handleCoachAction}>
                {coachContent.btn}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      <div className={`ws-toast${toast ? " ws-show" : ""}`}>{toast}</div>

      {/* Mobile header */}
      <MobileHeader activePanel={activePanel} onNavigate={handleNavigate} />
    </div>
  );
}

function StepItem({
  index,
  label,
  currentIndex,
  onClick,
  isLast,
}: {
  index: number;
  label: string;
  currentIndex: number;
  onClick: () => void;
  isLast: boolean;
}) {
  const isDone = index < currentIndex;
  const isCur = index === currentIndex;

  return (
    <>
      <button
        className={`ws-st${isDone ? " ws-done" : ""}${isCur ? " ws-cur" : ""}`}
        onClick={onClick}
      >
        <span className="ws-n">
          {isDone ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12l5 5L20 6" />
            </svg>
          ) : (
            index + 1
          )}
        </span>
        <span className="ws-tx">
          <b>{label}</b>
          <span>{isCur ? "进行中" : isDone ? "已完成" : `第${index + 1}步`}</span>
        </span>
      </button>
      {!isLast && <div className={`ws-st-ln${isDone ? " ws-ok" : ""}`} />}
    </>
  );
}
