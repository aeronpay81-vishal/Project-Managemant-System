import {
  Calendar,
  Users,
  Edit2,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

const ProjectTable = ({ projects, onDelete }) => {
  const statusStyles = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    "In Progress": "bg-amber-50 text-amber-700 border-amber-100",
    Planning: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Active Projects
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Manage your current projects and track progress.
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
                Progress
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Team
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Deadline
              </th>

              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="group transition hover:bg-slate-50/70"
              >
                {/* Project */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 text-xs font-bold text-indigo-600">
                      {project.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {project.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Project #{project.id}
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
                    {project.status}
                  </span>
                </td>

                {/* Progress */}
                <td className="px-6 py-4">
                  <div className="w-[150px]">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-500">
                        Progress
                      </span>

                      <span className="text-[11px] font-bold text-slate-700">
                        {project.progress}%
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                        style={{
                          width: `${project.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>

                {/* Team */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {project.team} members
                  </span>
                </td>

                {/* Deadline */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {project.deadline}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                    <button className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50">
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onDelete(project.id)}
                      className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProjectTable;