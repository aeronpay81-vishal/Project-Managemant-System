import {
  Calendar,
  Edit2,
  Trash2,
  MoreHorizontal,
  Loader,
} from "lucide-react";

const ProjectTable = ({ projects, onDelete, onEdit, isLoading }) => {
  const statusStyles = {
    closed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    in_progress: "bg-amber-50 text-amber-700 border-amber-100",
    open: "bg-indigo-50 text-indigo-700 border-indigo-100",
    review: "bg-blue-50 text-blue-700 border-blue-100",
    cancelled: "bg-red-50 text-red-700 border-red-100",
    active: "bg-indigo-50 text-indigo-700 border-indigo-100",
    on_hold: "bg-slate-50 text-slate-700 border-slate-100",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  const getStatusLabel = (status) => {
    const labels = {
      closed: "Closed",
      in_progress: "In Progress",
      open: "Open",
      review: "Review",
      cancelled: "Cancelled",
      active: "Active",
      on_hold: "On Hold",
      completed: "Completed",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-blue-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      critical: "text-red-600",
    };
    return colors[priority] || "text-slate-600";
  };

  const getPriorityEmoji = (priority) => {
    const emojis = {
      low: "🟢",
      medium: "🟡",
      high: "🟠",
      critical: "🔴",
    };
    return emojis[priority] || "◯";
  };

  // Normalizes labels to an array of strings regardless of whether
  // the API/DB gives us a comma-separated string, an array, or null.
  const getLabelsArray = (labels) => {
    if (!labels) return [];
    if (Array.isArray(labels)) return labels.map((l) => String(l).trim());
    return String(labels)
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
  };

  // Loading State
  if (isLoading) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Active Projects</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Manage your current projects and track progress.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-12">
          <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-medium mt-4">Loading projects...</p>
        </div>
      </section>
    );
  }

  // Empty State
  if (projects.length === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Active Projects</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Manage your current projects and track progress.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-12">
          <div className="rounded-full bg-slate-100 p-3 mb-3">
            <MoreHorizontal className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No projects yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Create your first project to get started
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Active Projects</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage your current projects and track progress. ({projects.length}{" "}
            {projects.length === 1 ? "project" : "projects"})
          </p>
        </div>

        <button className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
          View All
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Project
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Priority
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Labels
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Due Date
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Reporter
              </th>

              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => {
              const labelsArray = getLabelsArray(project.labels);

              return (
                <tr
                  key={project.id}
                  className="group transition hover:bg-slate-50/70"
                >
                  {/* Project */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 text-xs font-bold text-indigo-600">
                        {(project.summary || "P")
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {project.summary}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          ID: {project.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        statusStyles[project.status] ||
                        "border-slate-100 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-semibold capitalize ${getPriorityColor(
                        project.priority
                      )}`}
                    >
                      {getPriorityEmoji(project.priority)} {project.priority}
                    </span>
                  </td>

                  {/* Labels */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {labelsArray.length > 0 ? (
                        labelsArray.slice(0, 2).map((label, idx) => (
                          <span
                            key={idx}
                            className="inline-flex text-[10px] font-medium rounded-full bg-slate-100 px-2 py-1 text-slate-600"
                          >
                            {label}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No labels</span>
                      )}
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatDate(project.due_date)}
                    </span>
                  </td>

                  {/* Reporter */}
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600">
                      {project.reporter || "—"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                      <button
                        onClick={() => onEdit(project)}
                        className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                        title="Edit project"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onDelete(project.id)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        title="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProjectTable;