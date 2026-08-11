import { useState } from "react";
import {
  Home,
  Clock3,
  FolderKanban,
  CheckSquare,
  Sparkles,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  Workflow,
  ChevronLeft,
  ChevronRight,
  Rocket,
  X,
} from "lucide-react";

const Sidebar = ({ activeItem = "Dashboard", onNavigate, mobileOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      label: "Dashboard",
      icon: Home,
    },
    {
      label: "Smart Timeline",
      icon: Clock3,
    },
    {
      label: "Projects",
      icon: FolderKanban,
    },
    {
      label: "Tasks",
      icon: CheckSquare,
    },
    {
      label: "AI Insights",
      icon: Sparkles,
      badge: "New",
    },
    {
      label: "Workflow Engine",
      icon: Workflow,
    },
    {
      label: "Workload",
      icon: Users,
    },
    {
      label: "Calendar",
      icon: CalendarDays,
    },
    {
      label: "Reports",
      icon: BarChart3,
    },
    {
      label: "Team",
      icon: Users,
    },
    {
      label: "Settings",
      icon: Settings,
    },
  ];

  const handleNavigation = (item) => {
    if (onNavigate) {
      onNavigate(item);
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          bg-[#071426] text-white
          shadow-[8px_0_30px_rgba(2,8,23,0.18)]
          transition-all duration-300
          
          ${collapsed ? "w-[82px]" : "w-[250px]"}

          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex h-[76px] items-center border-b border-white/8 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
              <Rocket className="h-5 w-5 text-white" />
            </div>

            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="truncate text-[20px] font-bold tracking-tight">
                  Aero<span className="text-violet-400">Pilot</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Project Management
                </p>
              </div>
            )}
          </div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Workspace
            </p>
          )}

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeItem === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.label)}
                  title={collapsed ? item.label : ""}
                  className={`
                    group relative flex w-full items-center gap-3 rounded-xl
                    px-3 py-2.5 text-sm font-medium
                    transition-all duration-200
                    ${
                      active
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/30"
                        : "text-slate-400 hover:bg-white/6 hover:text-white"
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-[18px] w-[18px] shrink-0
                      ${
                        active
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white"
                      }
                    `}
                  />

                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>

                      {item.badge && (
                        <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[9px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom learning card */}
        {!collapsed && (
          <div className="border-t border-white/8 p-3">
            <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  AI Learning
                </span>

                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>

              <p className="mb-3 text-[11px] leading-relaxed text-slate-400">
                AeroPilot is learning your team's work patterns.
              </p>

              <div className="mb-2 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Progress</span>
                <span className="font-semibold text-violet-400">92%</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
              </div>
            </div>
          </div>
        )}

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden h-12 items-center justify-center border-t border-white/8 text-slate-500 transition hover:bg-white/5 hover:text-white lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;