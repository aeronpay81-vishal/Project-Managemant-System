import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";

const Topbar = ({ user, onLogout, onMenuClick, pageTitle = "Dashboard" }) => {
  const userName = user?.name || "Admin";
  const userEmail = user?.email || "admin@example.com";

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:block">
          <p className="text-xs font-medium text-slate-400">
            Project Management
          </p>
          <h1 className="text-lg font-bold text-slate-900">
            {pageTitle}
          </h1>
        </div>

        {/* Search */}
        <div className="ml-2 hidden w-[260px] lg:block">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />

            <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification */}
        <button className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <Bell className="h-5 w-5" />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white" />
        </button>

        <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="hidden lg:block">
            <p className="max-w-[130px] truncate text-sm font-semibold text-slate-800">
              {userName}
            </p>

            <p className="max-w-[130px] truncate text-[11px] text-slate-400">
              {userEmail}
            </p>
          </div>

          <button className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 sm:block">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Logout"
          className="ml-1 rounded-xl p-2.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;