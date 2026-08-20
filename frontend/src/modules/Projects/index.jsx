import { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Users,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Loader,
  X,
  Sparkles,
} from "lucide-react";
import { projectsAPI } from "../../api/project";
import { authAPI } from "../../api/admin";
import ProjectTable from "../../components/dashboard/ProjectTable";
import ProjectFormModal from "../../components/dashboard/ProjectFormModal";

const Projects = ({ user }) => {
  const currentUser = user || authAPI.getStoredUser() || {};
  const isManager = currentUser?.role === "manager";
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectsAPI.getAll();
      const data = response.data || response || [];
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await projectsAPI.delete(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
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
        const updated = response.data || response;
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProjectId ? updated : p))
        );
        setSuccessMessage("Project updated successfully");
      } else {
        response = await projectsAPI.create(formData, useFormData);
        const created = response.data || response;
        setProjects((prev) => [created, ...prev]);
        setSuccessMessage("Project created and assigned successfully");
      }

      setIsFormOpen(false);
      setIsEditMode(false);
      setEditingProjectId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchProjects();
    } catch (err) {
      throw new Error(err?.message || "Failed to save project");
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.assignee && (project.assignee.full_name || project.assignee.username).toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const foundProject = isEditMode
    ? projects.find((p) => p.id === editingProjectId)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
              <FolderKanban className="h-3.5 w-3.5" />
              {isManager ? "Project Portfolio & Assignments" : "Assigned Projects"}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isManager ? "Project Portfolio" : "My Projects"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isManager
                ? "Manage your projects, assign them to database team members, and track progress."
                : "Projects assigned to your account by your Project Manager."}
            </p>
          </div>

          {isManager && (
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-violet-700"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          )}
        </div>
      </section>

      {/* Alerts */}
      {error && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="flex gap-3 rounded-lg bg-emerald-50 p-4 border border-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900">Success</h3>
            <p className="text-sm text-emerald-700 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name, description, assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">📋 Open</option>
            <option value="in_progress">⚙️ In Progress</option>
            <option value="review">🔍 Review</option>
            <option value="active">✨ Active</option>
            <option value="closed">✅ Closed</option>
            <option value="completed">🎉 Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🟠 High</option>
            <option value="critical">🔴 Critical</option>
          </select>
        </div>
      </div>

      {/* Projects Table Component */}
      <ProjectTable
        projects={filteredProjects}
        onDelete={deleteProject}
        onEdit={handleEditProject}
        isLoading={loading}
        user={user}
      />

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
    </div>
  );
};

export default Projects;
