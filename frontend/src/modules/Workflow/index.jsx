import React from "react";
import {
    Plus,
    MoreHorizontal,
    CalendarDays,
    User,
    Settings2,
    Zap,
    BarChart3,
    Clock3,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
} from "lucide-react";

const Workflow = ({ user }) => {
    const stages = [
        {
            id: "backlog",
            name: "Backlog",
            description: "Ideas & incoming tasks",
            count: 3,
            color: "slate",
            tasks: [
                {
                    title: "Client Requirements",
                    label: "Planning",
                    priority: "High",
                    date: "May 20",
                    user: "M",
                },
                {
                    title: "Competitor Analysis",
                    label: "Research",
                    priority: "Medium",
                    date: "May 21",
                    user: "K",
                },
            ],
        },
        {
            id: "todo",
            name: "To Do",
            description: "Tasks to be started",
            count: 3,
            color: "blue",
            tasks: [
                {
                    title: "UI/UX Wireframes",
                    label: "Design",
                    priority: "High",
                    date: "May 23",
                    user: "A",
                },
                {
                    title: "Database Design",
                    label: "Development",
                    priority: "Medium",
                    date: "May 24",
                    user: "S",
                },
                {
                    title: "API Structure Plan",
                    label: "Backend",
                    priority: "Medium",
                    date: "May 24",
                    user: "P",
                },
            ],
        },
        {
            id: "progress",
            name: "In Progress",
            description: "Tasks currently being worked on",
            count: 2,
            color: "amber",
            tasks: [
                {
                    title: "Homepage UI Design",
                    label: "Design",
                    priority: "High",
                    date: "May 25",
                    user: "A",
                },
                {
                    title: "User Authentication API",
                    label: "Development",
                    priority: "High",
                    date: "May 26",
                    user: "P",
                },
            ],
        },
        {
            id: "review",
            name: "Review",
            description: "Waiting for approval",
            count: 2,
            color: "purple",
            tasks: [
                {
                    title: "Responsive Layout",
                    label: "Frontend",
                    priority: "Medium",
                    date: "May 28",
                    user: "K",
                },
                {
                    title: "API Integration",
                    label: "Backend",
                    priority: "Medium",
                    date: "May 29",
                    user: "S",
                },
            ],
        },
        {
            id: "testing",
            name: "Testing",
            description: "Quality verification",
            count: 1,
            color: "cyan",
            tasks: [
                {
                    title: "Login Flow Testing",
                    label: "QA",
                    priority: "High",
                    date: "May 30",
                    user: "R",
                },
            ],
        },
        {
            id: "done",
            name: "Done",
            description: "Completed tasks",
            count: 3,
            color: "green",
            tasks: [
                {
                    title: "Project Setup",
                    label: "Setup",
                    priority: "Done",
                    date: "May 15",
                    user: "M",
                },
                {
                    title: "Requirement Gathering",
                    label: "Planning",
                    priority: "Done",
                    date: "May 16",
                    user: "M",
                },
                {
                    title: "Team Setup",
                    label: "Management",
                    priority: "Done",
                    date: "May 17",
                    user: "A",
                },
            ],
        },
    ];

    const colorMap = {
        slate: "bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700",
        blue: "bg-blue-50/60 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900",
        amber: "bg-amber-50/60 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900",
        purple: "bg-purple-50/60 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900",
        cyan: "bg-cyan-50/60 border-cyan-100 dark:bg-cyan-950/20 dark:border-cyan-900",
        green: "bg-emerald-50/60 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900",
    };

    const headingColors = {
        slate: "text-slate-700",
        blue: "text-blue-700",
        amber: "text-amber-700",
        purple: "text-purple-700",
        cyan: "text-cyan-700",
        green: "text-emerald-700",
    };

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <Zap size={20} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Workflow Engine
                                </h1>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Manage tasks and project workflow stages
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                        {/* PROJECT SELECTOR */}
                        <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left dark:border-slate-700 dark:bg-slate-800">

                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                    Project
                                </p>

                                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                    Website Development
                                </p>
                            </div>

                            <ChevronDown
                                size={16}
                                className="text-slate-400"
                            />
                        </button>

                        <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                            <Settings2 size={17} />
                            Settings
                        </button>

                        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                            <Plus size={17} />
                            Add Task
                        </button>
                    </div>
                </div>
            </div>


            {/* WORKFLOW INFO */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">

                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Website Development Workflow
                        </h2>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40">
                            Active
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Move tasks through the development lifecycle.
                    </p>
                </div>

                <div className="flex items-center gap-6 text-sm">

                    <div>
                        <p className="text-xs text-slate-400">
                            Total Tasks
                        </p>
                        <p className="font-bold text-slate-800 dark:text-white">
                            14
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">
                            Completed
                        </p>
                        <p className="font-bold text-emerald-600">
                            3
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">
                            Progress
                        </p>
                        <p className="font-bold text-blue-600">
                            42%
                        </p>
                    </div>
                </div>
            </div>


            {/* WORKFLOW BOARD */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                <div className="mb-5 flex items-center justify-between">

                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                            Project Workflow
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Track your project from planning to completion.
                        </p>
                    </div>

                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
                        <Plus size={14} />
                        Add Stage
                    </button>
                </div>


                {/* HORIZONTAL BOARD */}
                <div className="overflow-x-auto pb-3">

                    <div className="flex min-w-[1500px] gap-4">

                        {stages.map((stage) => (

                            <div
                                key={stage.id}
                                className={`w-[245px] shrink-0 rounded-xl border p-3 ${colorMap[stage.color]}`}
                            >

                                {/* STAGE HEADER */}
                                <div className="mb-3 flex items-start justify-between">

                                    <div>
                                        <div className="flex items-center gap-2">

                                            <h3
                                                className={`text-sm font-bold ${headingColors[stage.color]}`}
                                            >
                                                {stage.name}
                                            </h3>

                                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm dark:bg-slate-800">
                                                {stage.count}
                                            </span>

                                        </div>

                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {stage.description}
                                        </p>
                                    </div>

                                    <button className="rounded-lg p-1 hover:bg-white/70 dark:hover:bg-slate-800">
                                        <MoreHorizontal
                                            size={17}
                                            className="text-slate-400"
                                        />
                                    </button>
                                </div>


                                {/* ADD TASK */}
                                <button className="mb-3 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white/50 py-2 text-xs font-medium text-blue-600 hover:bg-white dark:border-slate-700 dark:bg-slate-900/30">
                                    <Plus size={14} />
                                    Add Task
                                </button>


                                {/* TASKS */}
                                <div className="space-y-2">

                                    {stage.tasks.map((task, index) => (

                                        <div
                                            key={index}
                                            className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                                        >

                                            <div className="flex items-start justify-between gap-2">

                                                <h4 className="text-xs font-semibold leading-5 text-slate-800 dark:text-slate-100">
                                                    {task.title}
                                                </h4>

                                                <MoreHorizontal
                                                    size={15}
                                                    className="shrink-0 text-slate-300 group-hover:text-slate-500"
                                                />
                                            </div>


                                            <div className="mt-3 flex items-center justify-between">

                                                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                    {task.label}
                                                </span>

                                                <span
                                                    className={`text-[10px] font-semibold ${task.priority === "High"
                                                            ? "text-red-500"
                                                            : task.priority === "Done"
                                                                ? "text-emerald-500"
                                                                : "text-amber-500"
                                                        }`}
                                                >
                                                    {task.priority}
                                                </span>

                                            </div>


                                            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">

                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                    <CalendarDays size={12} />
                                                    {task.date}
                                                </div>

                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                                    {task.user}
                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            </div>

                        ))}

                    </div>
                </div>
            </div>


            {/* BOTTOM ANALYTICS */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <BarChart3 size={17} />
                        Workflow Overview
                    </div>

                    <div className="mt-4 flex items-end gap-5">
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                14
                            </p>
                            <p className="text-xs text-slate-400">
                                Total Tasks
                            </p>
                        </div>

                        <div>
                            <p className="text-2xl font-bold text-blue-600">
                                6
                            </p>
                            <p className="text-xs text-slate-400">
                                Active
                            </p>
                        </div>
                    </div>
                </div>


                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <CheckCircle2 size={17} />
                        Completion
                    </div>

                    <p className="mt-4 text-2xl font-bold text-emerald-600">
                        42%
                    </p>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full w-[42%] rounded-full bg-emerald-500" />
                    </div>
                </div>


                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <Clock3 size={17} />
                        Average Cycle Time
                    </div>

                    <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                        2.4 Days
                    </p>

                    <p className="mt-1 text-xs text-emerald-500">
                        ↓ 12% from last month
                    </p>
                </div>


                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <AlertTriangle size={17} />
                        Bottlenecks
                    </div>

                    <div className="mt-4 space-y-2">

                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">
                                Review
                            </span>
                            <span className="font-semibold text-purple-600">
                                2 tasks
                            </span>
                        </div>

                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">
                                Testing
                            </span>
                            <span className="font-semibold text-cyan-600">
                                1 task
                            </span>
                        </div>

                    </div>
                </div>

            </div>


            {/* AUTOMATION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    <div>
                        <div className="flex items-center gap-2">
                            <Zap
                                size={18}
                                className="text-amber-500"
                            />

                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                Workflow Automation
                            </h3>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                            Automate common project actions.
                        </p>
                    </div>

                    <button className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 dark:bg-blue-950/30">
                        Manage Rules
                    </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">

                    <AutomationItem
                        title="Move task to Review"
                        description="When all subtasks are completed"
                    />

                    <AutomationItem
                        title="Notify team"
                        description="When a task is assigned"
                    />

                    <AutomationItem
                        title="Prioritize overdue"
                        description="When task passes due date"
                    />

                </div>
            </div>

        </div>
    );
};


const AutomationItem = ({ title, description }) => {
    return (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">

            <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {title}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                    {description}
                </p>
            </div>

            <div className="h-5 w-9 rounded-full bg-emerald-500 p-0.5">
                <div className="ml-auto h-4 w-4 rounded-full bg-white shadow-sm" />
            </div>

        </div>
    );
};

export default Workflow;