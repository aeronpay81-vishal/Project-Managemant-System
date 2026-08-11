import { useState } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock3,
  Users,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from "lucide-react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import ProjectTable from "../../components/dashboard/ProjectTable";

const Dashboard = () => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Website Redesign",
      status: "In Progress",
      team: 5,
      deadline: "Dec 15, 2024",
      progress: 75,
    },
    {
      id: 2,
      name: "Mobile App",
      status: "Planning",
      team: 3,
      deadline: "Jan 20, 2025",
      progress: 30,
    },
    {
      id: 3,
      name: "API Integration",
      status: "Completed",
      team: 4,
      deadline: "Oct 10, 2024",
      progress: 100,
    },
  ]);

  const deleteProject = (id) => {
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== id)
    );
  };

  const handleCreateProject = () => {
    console.log("Create new project");
  };

  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;
  const inProgressProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;
  const totalTeamMembers = projects.reduce(
    (total, project) => total + project.team,
    0
  );

  return (
    <>
      <DashboardHeader onCreateProject={handleCreateProject} />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          description="All projects"
          icon={LayoutDashboard}
          color="indigo"
        />

        <StatCard
          title="Completed"
          value={completedProjects}
          description="Successfully completed"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="In Progress"
          value={inProgressProjects}
          description="Currently active"
          icon={Clock3}
          color="amber"
        />

        <StatCard
          title="Team Members"
          value={totalTeamMembers}
          description="Across all projects"
          icon={Users}
          color="violet"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <ProjectTable projects={projects} onDelete={deleteProject} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Performance</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Project completion rate
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">78%</p>
                <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  12.4%
                </div>
              </div>

              <div className="flex h-16 items-end gap-1.5">
                {[35, 45, 40, 58, 52, 68, 62, 78].map((height, index) => (
                  <div
                    key={index}
                    className="w-2.5 rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Recent Activity</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Latest project updates
                </p>
              </div>

              <Activity className="h-5 w-5 text-violet-500" />
            </div>

            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    API Integration completed
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">2 hours ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Website Redesign updated
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">5 hours ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Mobile App moved to planning
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">Yesterday</p>
                </div>
              </div>
            </div>

            <button className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              View All Activity
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
          <p className="text-xs font-semibold text-indigo-600">PROJECT HEALTH</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">Everything looks good</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Most of your projects are progressing according to schedule.
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5">
          <p className="text-xs font-semibold text-violet-600">AI INSIGHT</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">3 tasks need attention</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            AeroPilot detected tasks that may affect upcoming deadlines.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
          <p className="text-xs font-semibold text-emerald-600">TEAM STATUS</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">Team workload is balanced</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            No team member is currently showing critical over-allocation.
          </p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
