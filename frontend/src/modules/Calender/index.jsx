import React, { useMemo, useState } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Filter,
    Plus,
    CheckCircle2,
    Clock3,
    AlertTriangle,
    ListTodo,
} from "lucide-react";

export const Calender = ({ user }) => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 20));
    const [view, setView] = useState("Month");

    const monthName = currentDate.toLocaleString("en-US", {
        month: "long",
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // API later:
    // const [tasks, setTasks] = useState([]);
    //
    // Example:
    // GET /api/tasks?project_id=...
    //
    // tasks should contain:
    // {
    //   id,
    //   summary,
    //   due_date,
    //   priority,
    //   status,
    //   project_id
    // }

    const tasks = [
        {
            id: 1,
            title: "UI/UX Design",
            date: "2026-08-05",
            priority: "Low",
            status: "in_progress",
        },
        {
            id: 2,
            title: "API Integration",
            date: "2026-08-07",
            priority: "Medium",
            status: "in_progress",
        },
        {
            id: 3,
            title: "Database Design",
            date: "2026-08-10",
            priority: "Completed",
            status: "done",
        },
        {
            id: 4,
            title: "Dashboard UI",
            date: "2026-08-12",
            priority: "Low",
            status: "in_progress",
        },
        {
            id: 5,
            title: "Team Meeting",
            date: "2026-08-12",
            priority: "Medium",
            status: "todo",
        },
        {
            id: 6,
            title: "Bug Fixing",
            date: "2026-08-14",
            priority: "High",
            status: "in_progress",
        },
        {
            id: 7,
            title: "Authentication",
            date: "2026-08-18",
            priority: "Completed",
            status: "done",
        },
        {
            id: 8,
            title: "User Profile API",
            date: "2026-08-20",
            priority: "Low",
            status: "in_progress",
        },
        {
            id: 9,
            title: "Design Review",
            date: "2026-08-20",
            priority: "Medium",
            status: "todo",
        },
        {
            id: 10,
            title: "Testing",
            date: "2026-08-22",
            priority: "High",
            status: "todo",
        },
        {
            id: 11,
            title: "Deploy to Staging",
            date: "2026-08-25",
            priority: "High",
            status: "todo",
        },
        {
            id: 12,
            title: "Performance Test",
            date: "2026-08-27",
            priority: "Medium",
            status: "todo",
        },
    ];

    const days = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Monday first
        const mondayFirst = firstDay === 0 ? 6 : firstDay - 1;

        const result = [];

        for (let i = 0; i < mondayFirst; i++) {
            result.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            result.push(i);
        }

        while (result.length < 42) {
            result.push(null);
        }

        return result;
    }, [year, month]);

    const getDateString = (day) => {
        if (!day) return "";

        return `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
        ).padStart(2, "0")}`;
    };

    const getTasksForDay = (day) => {
        if (!day) return [];

        const date = getDateString(day);

        return tasks.filter((task) => task.date === date);
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case "High":
                return "bg-red-50 text-red-600 border-red-100";

            case "Medium":
                return "bg-orange-50 text-orange-600 border-orange-100";

            case "Completed":
                return "bg-purple-50 text-purple-600 border-purple-100";

            default:
                return "bg-emerald-50 text-emerald-600 border-emerald-100";
        }
    };

    const getPriorityDot = (priority) => {
        switch (priority) {
            case "High":
                return "bg-red-500";

            case "Medium":
                return "bg-orange-500";

            case "Completed":
                return "bg-purple-500";

            default:
                return "bg-emerald-500";
        }
    };

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToday = () => {
        setCurrentDate(new Date(2026, 7, 20));
    };

    const today = 20;

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                    <div>
                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <CalendarDays size={22} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Calendar
                                </h1>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    View and manage project tasks, deadlines and events.
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                        {/* Project */}
                        <button className="flex min-w-[210px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">

                            <div className="flex items-center gap-2">

                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Website Development
                                </span>

                            </div>

                            <ChevronDown
                                size={16}
                                className="text-slate-400"
                            />

                        </button>

                        {/* Add Task */}
                        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                            <Plus size={17} />
                            Add Task
                        </button>

                    </div>
                </div>
            </div>


            {/* Calendar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                {/* Calendar Toolbar */}
                <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                    <div className="flex items-center gap-2">

                        <button
                            onClick={previousMonth}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            <ChevronLeft size={17} />
                        </button>

                        <button
                            onClick={nextMonth}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            <ChevronRight size={17} />
                        </button>

                        <button
                            onClick={goToday}
                            className="ml-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Today
                        </button>

                        <div className="ml-3 flex items-center gap-2">

                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {monthName} {year}
                            </h2>

                            <ChevronDown
                                size={17}
                                className="text-slate-400"
                            />

                        </div>
                    </div>


                    <div className="flex items-center gap-3">

                        {/* View */}
                        <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">

                            {["Month", "Week", "Day"].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => setView(item)}
                                    className={`px-4 py-2 text-xs font-semibold transition ${view === item
                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40"
                                            : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}

                        </div>

                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                            <Filter size={14} />
                            Filters
                        </button>

                    </div>
                </div>


                {/* Calendar + Deadlines */}
                <div className="grid gap-5 xl:grid-cols-[1fr_300px]">

                    {/* Calendar Grid */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">

                        {/* Week Days */}
                        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">

                            {[
                                "Mon",
                                "Tue",
                                "Wed",
                                "Thu",
                                "Fri",
                                "Sat",
                                "Sun",
                            ].map((day) => (
                                <div
                                    key={day}
                                    className="px-3 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400"
                                >
                                    {day}
                                </div>
                            ))}

                        </div>


                        {/* Days */}
                        <div className="grid grid-cols-7">

                            {days.map((day, index) => {

                                const dayTasks = getTasksForDay(day);
                                const isToday = day === today && month === 7;

                                return (
                                    <div
                                        key={index}
                                        className="min-h-[115px] border-b border-r border-slate-100 p-2 dark:border-slate-800"
                                    >

                                        {day && (
                                            <>
                                                <div className="mb-2 flex justify-between">

                                                    <span
                                                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday
                                                                ? "bg-blue-600 text-white"
                                                                : "text-slate-600 dark:text-slate-400"
                                                            }`}
                                                    >
                                                        {day}
                                                    </span>

                                                    {dayTasks.length > 2 && (
                                                        <span className="text-[10px] text-slate-400">
                                                            +{dayTasks.length - 2}
                                                        </span>
                                                    )}

                                                </div>


                                                <div className="space-y-1">

                                                    {dayTasks.slice(0, 2).map((task) => (
                                                        <div
                                                            key={task.id}
                                                            className={`truncate rounded-md border px-2 py-1.5 text-[10px] font-medium ${getPriorityStyle(
                                                                task.priority
                                                            )}`}
                                                            title={task.title}
                                                        >
                                                            <div className="flex items-center gap-1">

                                                                <span
                                                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${getPriorityDot(
                                                                        task.priority
                                                                    )}`}
                                                                />

                                                                <span className="truncate">
                                                                    {task.title}
                                                                </span>

                                                            </div>
                                                        </div>
                                                    ))}

                                                </div>
                                            </>
                                        )}

                                    </div>
                                );
                            })}

                        </div>
                    </div>


                    {/* Upcoming Deadlines */}
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">

                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-2">

                                <CalendarDays
                                    size={17}
                                    className="text-blue-600"
                                />

                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    Upcoming Deadlines
                                </h3>

                            </div>

                        </div>


                        {/* Today */}
                        <div className="mt-5">

                            <p className="mb-2 text-xs font-semibold text-blue-600">
                                Today · Aug 20
                            </p>

                            <DeadlineItem
                                title="User Profile API"
                                project="Website Development"
                                priority="High"
                                color="green"
                            />

                            <DeadlineItem
                                title="Design Review"
                                project="Website Development"
                                priority="Medium"
                                color="orange"
                            />

                        </div>


                        {/* Tomorrow */}
                        <div className="mt-5">

                            <p className="mb-2 text-xs font-semibold text-blue-600">
                                Tomorrow · Aug 21
                            </p>

                            <DeadlineItem
                                title="Testing"
                                project="Website Development"
                                priority="High"
                                color="blue"
                            />

                        </div>


                        {/* Aug 22 */}
                        <div className="mt-5">

                            <p className="mb-2 text-xs font-semibold text-slate-500">
                                Aug 22, 2026
                            </p>

                            <DeadlineItem
                                title="Bug Fixing"
                                project="Website Development"
                                priority="Medium"
                                color="purple"
                            />

                        </div>


                        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50">
                            View All Tasks
                            <ChevronRight size={14} />
                        </button>

                    </div>

                </div>


                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-5 px-2">

                    <Legend color="bg-emerald-500" text="Low Priority" />
                    <Legend color="bg-orange-500" text="Medium Priority" />
                    <Legend color="bg-red-500" text="High Priority" />
                    <Legend color="bg-blue-500" text="In Progress" />
                    <Legend color="bg-purple-500" text="Completed" />

                </div>
            </div>


            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">

                <Stat
                    icon={ListTodo}
                    title="Total Tasks"
                    value="24"
                    color="purple"
                />

                <Stat
                    icon={CheckCircle2}
                    title="Completed"
                    value="8"
                    extra="33%"
                    color="blue"
                />

                <Stat
                    icon={Clock3}
                    title="In Progress"
                    value="10"
                    extra="42%"
                    color="orange"
                />

                <Stat
                    icon={ListTodo}
                    title="To Do"
                    value="6"
                    extra="25%"
                    color="green"
                />

                <Stat
                    icon={AlertTriangle}
                    title="Overdue"
                    value="2"
                    extra="8%"
                    color="red"
                />

            </div>

        </div>
    );
};


const DeadlineItem = ({
    title,
    project,
    priority,
    color,
}) => {

    const dots = {
        green: "bg-emerald-500",
        orange: "bg-orange-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
    };

    const priorityColor =
        priority === "High"
            ? "text-red-500"
            : "text-orange-500";

    return (
        <div className="mb-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">

            <div className="flex items-start gap-2">

                <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dots[color]}`}
                />

                <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-2">

                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {title}
                        </p>

                        <span className={`shrink-0 text-[10px] font-semibold ${priorityColor}`}>
                            {priority}
                        </span>

                    </div>

                    <p className="mt-1 truncate text-[10px] text-slate-400">
                        {project}
                    </p>

                </div>

            </div>

        </div>
    );
};


const Legend = ({ color, text }) => {
    return (
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
            {text}
        </div>
    );
};


const Stat = ({
    icon: Icon,
    title,
    value,
    extra,
    color,
}) => {

    const colors = {
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/30",
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/30",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-950/30",
        green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30",
        red: "bg-red-50 text-red-600 dark:bg-red-950/30",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center gap-3">

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}
                >
                    <Icon size={18} />
                </div>

                <div>
                    <p className="text-xs text-slate-400">
                        {title}
                    </p>

                    <div className="mt-1 flex items-end gap-2">

                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {value}
                        </p>

                        {extra && (
                            <span className="mb-1 text-[10px] font-semibold text-slate-400">
                                {extra}
                            </span>
                        )}

                    </div>
                </div>

            </div>

        </div>
    );
};

export default Calender;