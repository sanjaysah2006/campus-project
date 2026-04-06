import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import TopNav from "./TopNav";

export function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✅ search state
  const [search, setSearch] = useState("");

  return (
    <div className="flex min-h-screen bg-background">

      {/* SIDEBAR */}
      <AppSidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* CONTENT */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[80px]" : "ml-[280px]"
        }`}
      >
        {/* ✅ PASS SEARCH HANDLER */}
        

        {/* ✅ PASS SEARCH TO CHILD PAGES */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet context={{ search }} />
        </main>
      </div>
    </div>
  );
}