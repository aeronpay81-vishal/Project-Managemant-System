import {
  Sparkles,
  Plus,
  CalendarDays,
} from "lucide-react";

const DashboardHeader = ({ onCreateProject }) => {
  return (
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)] sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
            <Sparkles className="h-3.5 w-3.5" />
            Project Control Center
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good morning, Admin 👋
          </h2>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            Track your projects, monitor team activity and keep your
            work moving smoothly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <CalendarDays className="h-4 w-4" />
            This Month
          </button>

          <button
            onClick={onCreateProject}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-violet-700"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;