import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import  TopNav  from "./TopNav";

export function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">

      {/* LEFT SIDEBAR */}
      <AppSidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* RIGHT SIDE CONTENT AREA */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[80px]" : "ml-[280px]"
        }`}
      >
        {/* TOP NAVIGATION */}
        <TopNav />

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}