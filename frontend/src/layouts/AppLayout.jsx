import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

import Dashboard from "../modules/Dashboard";
import Projects from "../modules/Projects";
import Team from "../modules/Team";
import Reports from "../modules/Reports";

const AppLayout = ({ user, onLogout }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

  const renderModule = () => {
    switch (activeItem) {
      case "Dashboard":
        return <Dashboard />;

      case "Projects":
        return <Projects />;

      case "Team":
        return <Team />;

      case "Reports":
        return <Reports />;
      
      
      default:
        return (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
            <h1 className="text-2xl font-bold text-slate-900">{activeItem}</h1>
            {/* <p className="mt-3 text-sm text-slate-500">
              This section is not implemented yet. Select Dashboard, Projects, Team, or Reports from the sidebar.
            </p> */}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <Sidebar
        activeItem={activeItem}
        onNavigate={setActiveItem}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-[250px]">
        <Topbar
          user={user}
          onLogout={onLogout}
          pageTitle={activeItem}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
