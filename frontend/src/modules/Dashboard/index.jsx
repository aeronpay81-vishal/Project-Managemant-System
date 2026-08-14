import { useState, useEffect } from "react";
import {
  LayoutDashboard,CheckCircle2,Clock3,Users,TrendingUp,Activity,ArrowUpRight,AlertCircle,MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import ProjectTable from "../../components/dashboard/ProjectTable";
import ProjectFormModal from "../../components/dashboard/ProjectFormModal";
import { projectsAPI } from "../../api/project";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectsAPI.getAll();
      const projectsData = response.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err?.message || "Failed to fetch projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await projectsAPI.delete(id);
        setProjects((currentProjects) =>
          currentProjects.filter((project) => project.id !== id)
        );
        setSuccessMessage("Project deleted successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError(err?.message || "Failed to delete project");
      }
    }
  };

  const handleCreateProject = () => {
    setIsEditMode(false);
    setEditingProjectId(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProjectId(project.id);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData, useFormData = false) => {
    try {
      let response;

      if (isEditMode) {
        response = await projectsAPI.update(editingProjectId, formData, useFormData);
        const updatedProject = response.data || response;
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProjectId ? updatedProject : p))
        );
        setSuccessMessage("Project updated successfully");
      } else {
        response = await projectsAPI.create(formData, useFormData);
        const newProject = response.data || response;
        setProjects((prev) => [...prev, newProject]);
        setSuccessMessage("Project created successfully");
      }

      setIsFormOpen(false);
      setIsEditMode(false);
      setEditingProjectId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      throw new Error(err?.message || "Failed to save project");
    }
  };

  // Calculate stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (project) => project.status === "closed"
  ).length;
  const inProgressProjects = projects.filter(
    (project) => project.status === "in_progress"
  ).length;
  const activeTeamMembers = new Set(
    projects.flatMap((p) => (p.reporter ? [p.reporter] : []))
  ).size;

  // Chart data for Project Progress
  const projectProgressData = [
    { name: "Completed", value: completedProjects, color: "#c4b5fd" },
    { name: "In Progress", value: inProgressProjects, color: "#7c3aed" },
    {
      name: "Not Started",
      value: totalProjects - completedProjects - inProgressProjects,
      color: "#e5e7eb",
    },
  ].filter((item) => item.value > 0);

  // Chart data for Task Overview (example data based on projects)
  const taskOverviewData = [
    { name: "To Do", value: Math.ceil(totalProjects * 0.5), color: "#d1d5db" },
    { name: "In Progress", value: Math.ceil(totalProjects * 0.25), color: "#7c3aed" },
    { name: "In Review", value: 0, color: "#f59e0b" },
    { name: "Done", value: Math.ceil(totalProjects * 0.25), color: "#10b981" },
  ].filter((item) => item.value > 0);

  const foundProject = isEditMode
    ? projects.find((p) => p.id === editingProjectId)
    : undefined;

  return (
    <>
      <DashboardHeader onCreateProject={handleCreateProject} />

      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6 flex gap-3 rounded-lg bg-emerald-50 p-4 border border-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900">Success</h3>
            <p className="text-sm text-emerald-700 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Stats Cards - 4 Column Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          value={activeTeamMembers}
          description="Active team members"
          icon={Users}
          color="violet"
        />
      </div>

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isFormOpen}
        isEditMode={isEditMode}
        editingProject={foundProject}
        onClose={() => {
          setIsFormOpen(false);
          setIsEditMode(false);
          setEditingProjectId(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Main Content - Table and Performance */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Projects Table */}
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Active Projects</h2>
                <p className="text-sm text-slate-500 mt-1">Track and manage your ongoing projects</p>
              </div>
              <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                View All Projects
              </a>
            </div>
            <ProjectTable
              projects={projects}
              onDelete={deleteProject}
              onEdit={handleEditProject}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Performance Overview Sidebar */}
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Performance Overview</h3>
                <p className="mt-1 text-xs text-slate-400">Project Completion Rate</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                <TrendingUp className="h-5 w-5 text-violet-600" />
              </div>
            </div>

            {totalProjects > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-4xl font-bold text-slate-900">
                    {Math.round((completedProjects / totalProjects) * 100)}%
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-600">
                    <ArrowUpRight className="h-4 w-4" />
                    {((completedProjects / totalProjects) * 100).toFixed(1)}% complete
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">On Track</span>
                    <span className="font-semibold text-slate-900">0</span>
                    <span className="text-emerald-600 text-xs">0%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">At Risk</span>
                    <span className="font-semibold text-slate-900">
                      {inProgressProjects}
                    </span>
                    <span className="text-amber-600 text-xs">100%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Overdue</span>
                    <span className="font-semibold text-slate-900">0</span>
                    <span className="text-red-600 text-xs">0%</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm">Create projects to see performance</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Charts Section - 3 Columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Project Progress Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Project Progress</h3>
            <p className="mt-1 text-xs text-slate-500">Overall progress across all projects</p>
          </div>

          {projectProgressData.length > 0 ? (
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={projectProgressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {projectProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-slate-400 text-sm">No data available</p>
            </div>
          )}

          <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
            {projectProgressData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Overview Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Task Overview</h3>
            <p className="mt-1 text-xs text-slate-500">Task distribution by status</p>
          </div>

          {taskOverviewData.length > 0 ? (
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={taskOverviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {taskOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-slate-400 text-sm">No data available</p>
            </div>
          )}

          <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
            {taskOverviewData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Recent Activity</h3>
              <p className="mt-1 text-xs text-slate-500">Latest updates from your projects</p>
            </div>
            <Activity className="h-5 w-5 text-violet-500" />
          </div>

          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div
                    className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${
                      project.status === "in_progress"
                        ? "bg-indigo-500"
                        : project.status === "closed"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {project.summary}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No activity yet</p>
          )}

          <button className="mt-6 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
            View All Activity
          </button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;