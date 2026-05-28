"use client";

import { useState } from "react";
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

export default function DashboardPage() {
  const [activePanel, setActivePanel] = useState<PanelKey>("overview");

  const handleNavigate = (panel: string) => {
    setActivePanel(panel as PanelKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen bg-secondary">
      <UnifiedSidebar activePanel={activePanel} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader activePanel={activePanel} onNavigate={handleNavigate} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activePanel === "overview" && <OverviewPanel onNavigate={handleNavigate} />}
          {activePanel === "projects" && <ProjectsPanel onNavigate={handleNavigate} />}
          {activePanel === "new-project" && <NewProjectPanel onNavigate={handleNavigate} />}
          {activePanel === "keywords" && <KeywordsPanel onNavigate={handleNavigate} />}
          {activePanel === "articles" && <ArticlesPanel onNavigate={handleNavigate} />}
          {activePanel === "generate" && <GeneratePanel onNavigate={handleNavigate} />}
          {activePanel === "publish" && <PublishPanel onNavigate={handleNavigate} />}
          {activePanel === "monitor" && <MonitorPanel onNavigate={handleNavigate} />}
        </main>
      </div>
    </div>
  );
}
