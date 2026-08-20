import { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Loader2,
  Briefcase,
  Calendar,
  FileText,
  Tag,
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  Users,
  Plus,
  Trash2,
  Copy,
} from "lucide-react";
import { authAPI } from "../../api/admin";

// One blank assignment row's shape — each row is one user's own
// priority / status / timeline for this project
const emptyAssignment = () => ({
  _key: `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  assigned_to: "",
  priority: "medium",
  status: "open",
  due_date: "",
  start_date: "",
  task_detail: "",
});

const PRIORITIES = [
  { value: "low", label: "Low", dot: "bg-slate-400", ring: "ring-slate-300", text: "text-slate-700", bg: "bg-slate-50", border: "border-slate-300" },
  { value: "medium", label: "Medium", dot: "bg-blue-500", ring: "ring-blue-300", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300" },
  { value: "high", label: "High", dot: "bg-amber-500", ring: "ring-amber-300", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" },
  { value: "critical", label: "Critical", dot: "bg-red-500", ring: "ring-red-300", text: "text-red-700", bg: "bg-red-50", border: "border-red-300" },
];

const STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "review", label: "In review" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "closed", label: "Closed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const priorityMeta = (value) => PRIORITIES.find((p) => p.value === value) || PRIORITIES[1];

const ProjectFormModal = ({ isOpen, isEditMode, editingProject, onClose, onSubmit }) => {
  // Fields shared across the whole project (same for every assignee)
  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    labels: [],
    reporter: "",
    attachment: null,
  });

  // Per-user rows: each has its own assigned_to + priority + status + dates
  const [assignments, setAssignments] = useState([emptyAssignment()]);

  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [error, setError] = useState("");
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [showSummaryLimitPopup, setShowSummaryLimitPopup] = useState(false);

  const popupTimeoutRef = useRef(null);

  const MAX_SUMMARY_LENGTH = 255;

  // Fetch available users from backend for assignment
  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        setLoadingUsers(true);
        try {
          const res = await authAPI.getUsers();
          const users = res.data || res || [];
          setUsersList(Array.isArray(users) ? users : []);
        } catch (err) {
          console.error("Failed to load users for assignment:", err);
          setUsersList([]);
        } finally {
          setLoadingUsers(false);
        }
      };
      loadUsers();
    }
  }, [isOpen]);

  // Helper function to safely parse dates
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Date parsing error:", error);
      return "";
    }
  };

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && editingProject) {
      let labelsList = [];
      if (editingProject.labels) {
        if (typeof editingProject.labels === "string") {
          labelsList = editingProject.labels.split(",").map((l) => l.trim()).filter((l) => l);
        } else if (Array.isArray(editingProject.labels)) {
          labelsList = editingProject.labels;
        }
      }

      setExistingAttachment(editingProject.attachment || null);

      setFormData({
        summary: editingProject.summary || "",
        description: editingProject.description || "",
        labels: labelsList,
        reporter: editingProject.reporter || "",
        attachment: null,
      });

      const projectTasks =
        (Array.isArray(editingProject.assignments) && editingProject.assignments.length > 0 && editingProject.assignments) ||
        (Array.isArray(editingProject.tasks) && editingProject.tasks.length > 0 && editingProject.tasks) ||
        null;

      if (projectTasks) {
        setAssignments(
          projectTasks.map((a) => ({
            _key: emptyAssignment()._key,
            assigned_to: a.assigned_to ? String(a.assigned_to) : "",
            priority: (a.priority || "medium").toLowerCase(),
            status: (a.status || "open").toLowerCase(),
            due_date: formatDateForInput(a.due_date),
            start_date: formatDateForInput(a.start_date),
            task_detail: a.task_detail || a.description || a.summary || "",
          }))
        );
      } else {
        setAssignments([
          {
            _key: emptyAssignment()._key,
            assigned_to: editingProject.assigned_to ? String(editingProject.assigned_to) : "",
            priority: (editingProject.priority || "medium").toLowerCase(),
            status: (editingProject.status || "open").toLowerCase(),
            due_date: formatDateForInput(editingProject.due_date),
            start_date: formatDateForInput(editingProject.start_date),
            task_detail: editingProject.task_detail || "",
          },
        ]);
      }
    } else {
      setExistingAttachment(null);
      setFormData({
        summary: "",
        description: "",
        labels: [],
        reporter: "",
        attachment: null,
      });
      setAssignments([emptyAssignment()]);
    }
    setError("");
  }, [isEditMode, editingProject, isOpen]);

  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  const triggerSummaryLimitPopup = () => {
    setShowSummaryLimitPopup(true);
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
    popupTimeoutRef.current = setTimeout(() => {
      setShowSummaryLimitPopup(false);
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "summary" && value.length > MAX_SUMMARY_LENGTH) {
      triggerSummaryLimitPopup();
      setFormData((prev) => ({
        ...prev,
        summary: value.slice(0, MAX_SUMMARY_LENGTH),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---- Assignment row helpers ----

  const updateAssignment = (key, field, value) => {
    setAssignments((prev) => prev.map((a) => (a._key === key ? { ...a, [field]: value } : a)));
  };

  const addAssignmentRow = () => {
    setAssignments((prev) => [...prev, emptyAssignment()]);
  };

  // Duplicate a row's priority/status/dates but clear the assignee, so the
  // manager can quickly reuse the same timeline for a different person
  const duplicateAssignmentRow = (key) => {
    setAssignments((prev) => {
      const source = prev.find((a) => a._key === key);
      if (!source) return prev;
      const copy = { ...source, _key: emptyAssignment()._key, assigned_to: "" };
      const index = prev.findIndex((a) => a._key === key);
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const removeAssignmentRow = (key) => {
    setAssignments((prev) => (prev.length === 1 ? prev : prev.filter((a) => a._key !== key)));
  };

  const getUser = (id) => usersList.find((u) => String(u.id) === String(id));

  const getUserLabel = (id) => {
    const u = getUser(id);
    if (!u) return "";
    return u.full_name || u.username;
  };

  const assignedCounts = assignments.reduce((acc, a) => {
    if (a.assigned_to) acc[a.assigned_to] = (acc[a.assigned_to] || 0) + 1;
    return acc;
  }, {});

  const handleAddLabel = () => {
    if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        labels: [...prev.labels, labelInput.trim()],
      }));
      setLabelInput("");
    }
  };

  const handleRemoveLabel = (label) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.filter((l) => l !== label),
    }));
  };

  // ---- File ----

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setError("Only PDF files are allowed");
        return;
      }

      const maxSizeInMB = 10;
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxSizeInMB) {
        setError(`File size must be less than ${maxSizeInMB}MB`);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        attachment: file,
      }));
      setError("");
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      attachment: null,
    }));
  };

  // ---- Validation ----

  const validate = () => {
    if (!formData.summary.trim()) {
      return "Project name is required";
    }
    if (formData.summary.trim().length > MAX_SUMMARY_LENGTH) {
      triggerSummaryLimitPopup();
      return `Project name cannot exceed ${MAX_SUMMARY_LENGTH} characters`;
    }
    if (assignments.length === 0) {
      return "Add at least one assignment";
    }
    for (let i = 0; i < assignments.length; i++) {
      const a = assignments[i];
      if (!a.assigned_to) {
        return `Task ${i + 1}: choose who this is for`;
      }
      if (!a.start_date) {
        return `Task ${i + 1}: start date is required`;
      }
      if (!a.due_date) {
        return `Task ${i + 1}: due date is required`;
      }
      if (new Date(a.start_date) > new Date(a.due_date)) {
        return `Task ${i + 1}: start date must be before due date`;
      }
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Each row becomes its own assignment object — different priority,
      // status and dates per user, all tied to the same project summary
      const assignmentsPayload = assignments.map((a) => ({
        assigned_to: parseInt(a.assigned_to, 10),
        priority: a.priority.toLowerCase(),
        status: a.status.toLowerCase(),
        start_date: new Date(a.start_date).toISOString(),
        due_date: new Date(a.due_date).toISOString(),
        task_detail: a.task_detail.trim() || null,
      }));

      let submitData;
      let useFormData = false;

      if (formData.attachment) {
        useFormData = true;
        submitData = new FormData();
        submitData.append("summary", formData.summary.trim());
        submitData.append("description", formData.description.trim());
        submitData.append("labels", JSON.stringify(formData.labels.length > 0 ? formData.labels : []));
        submitData.append("reporter", formData.reporter.trim() || null);
        // Backend should read this JSON array and create one assignment per entry
        submitData.append("assignments", JSON.stringify(assignmentsPayload));
        submitData.append("attachment", formData.attachment);
      } else {
        submitData = {
          summary: formData.summary.trim(),
          description: formData.description.trim(),
          labels: formData.labels.length > 0 ? formData.labels : [],
          reporter: formData.reporter.trim() || null,
          assignments: assignmentsPayload,
          attachment: null,
        };
      }

      await onSubmit(submitData, useFormData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : err?.message || "Failed to save project";
      setError(errorMessage);
      console.error("Form submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const distinctUserCount = new Set(assignments.map((a) => a.assigned_to).filter(Boolean)).size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {isEditMode ? "Edit project" : "New project"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Each person gets their own priority, status, and timeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Error Alert */}
          {error && (
            <div className="flex gap-3 rounded-md bg-red-50 dark:bg-red-950/30 px-4 py-3 border border-red-200 dark:border-red-900">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Basic Information (shared across all assignees) */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Project details
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Project name
              </label>

              <div className="relative">
                {showSummaryLimitPopup && (
                  <div
                    role="alert"
                    className="absolute bottom-full left-0 mb-2 z-10 flex items-center gap-2 rounded-md bg-slate-900 dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-white shadow-md"
                  >
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    Project name can't be more than {MAX_SUMMARY_LENGTH} characters
                  </div>
                )}

                <input
                  type="text"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="Website redesign, Mobile app v2..."
                  className={`w-full px-3 py-2 rounded-md border text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 transition-shadow ${
                    showSummaryLimitPopup
                      ? "border-red-400 focus:ring-red-200 dark:border-red-800"
                      : "border-slate-300 dark:border-slate-700 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500"
                  }`}
                />
              </div>

              <p className="text-xs mt-1.5 text-slate-400 dark:text-slate-500">
                {formData.summary.length}/{MAX_SUMMARY_LENGTH}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1.5">Optional</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Goals, scope, and key requirements..."
                rows="3"
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Reporter
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1.5">
                  Defaults to your account
                </span>
              </label>
              <input
                type="text"
                name="reporter"
                value={formData.reporter}
                onChange={handleChange}
                placeholder="Project manager name"
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow"
              />
            </div>
          </section>

          {/* Per-user assignment rows — priority, status & dates differ per person */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Tasks
              </h3>
              {loadingUsers && (
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading users
                </span>
              )}
            </div>

            <div className="space-y-3">
              {assignments.map((row, index) => {
                const duplicateWarning = row.assigned_to && assignedCounts[row.assigned_to] > 1;
                const meta = priorityMeta(row.priority);
                const selectedUser = getUser(row.assigned_to);

                return (
                  <div
                    key={row._key}
                    className={`rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 border-l-4 ${meta.border.replace(
                      "border-",
                      "border-l-"
                    )}`}
                    style={{ borderRadius: "8px" }}
                  >
                    <div className="p-4">
                      {/* Row header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {index + 1}
                          </span>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {row.assigned_to ? getUserLabel(row.assigned_to) : `Task ${index + 1}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => duplicateAssignmentRow(row._key)}
                            title="Duplicate for another user"
                            aria-label="Duplicate task"
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          {assignments.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAssignmentRow(row._key)}
                              title="Remove task"
                              aria-label="Remove task"
                              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {duplicateWarning && (
                        <div className="mb-3 flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950/20 px-3 py-2 border border-amber-200 dark:border-amber-900/40">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                          <p className="text-xs text-amber-800 dark:text-amber-300">
                            {getUserLabel(row.assigned_to)} already has another task in this project.
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Assigned to */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Assign to
                          </label>
                          <select
                            value={row.assigned_to}
                            onChange={(e) => updateAssignment(row._key, "assigned_to", e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow"
                          >
                            <option value="">{loadingUsers ? "Loading users..." : "Select a user"}</option>
                            {usersList.map((u) => {
                              const displayName = u.full_name || u.username;
                              return (
                                <option key={u.id} value={u.id}>
                                  {displayName} (@{u.username})
                                </option>
                              );
                            })}
                          </select>
                          {selectedUser && (
                            <div className="mt-2 flex items-center gap-2.5">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                {(selectedUser.full_name || selectedUser.username).charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {selectedUser.email}
                                {selectedUser.role === "manager" && (
                                  <span className="ml-2 inline-flex items-center rounded-full bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-400">
                                    Manager
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Priority */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Priority
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {PRIORITIES.map((p) => {
                              const active = row.priority === p.value;
                              return (
                                <button
                                  key={p.value}
                                  type="button"
                                  onClick={() => updateAssignment(row._key, "priority", p.value)}
                                  className={`flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                                    active
                                      ? `${p.bg} ${p.border} ${p.text} dark:bg-slate-800 dark:border-slate-600`
                                      : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                  }`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                                  {p.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Status
                          </label>
                          <select
                            value={row.status}
                            onChange={(e) => updateAssignment(row._key, "status", e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow"
                          >
                            {STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Start date */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Start date
                          </label>
                          <div className="relative">
                            <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                              type="date"
                              value={row.start_date}
                              onChange={(e) => updateAssignment(row._key, "start_date", e.target.value)}
                              className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow"
                            />
                          </div>
                        </div>

                        {/* Due date */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Due date
                          </label>
                          <div className="relative">
                            <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                              type="date"
                              value={row.due_date}
                              onChange={(e) => updateAssignment(row._key, "due_date", e.target.value)}
                              className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow"
                            />
                          </div>
                        </div>

                        {/* Task detail */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Task detail
                            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1.5">Optional</span>
                          </label>
                          <textarea
                            value={row.task_detail}
                            onChange={(e) => updateAssignment(row._key, "task_detail", e.target.value)}
                            rows="2"
                            placeholder="What this person needs to do..."
                            className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow resize-none"
                          />
                        </div>
                      </div>

                      {row.start_date && row.due_date && (
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          {Math.max(
                            0,
                            Math.ceil((new Date(row.due_date) - new Date(row.start_date)) / (1000 * 60 * 60 * 24))
                          )}{" "}
                          day duration
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add another assignment */}
            <button
              type="button"
              onClick={addAssignmentRow}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add another task
            </button>

            {/* Summary strip */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Users className="h-3.5 w-3.5" />
              {assignments.length} task{assignments.length !== 1 ? "s" : ""} · {distinctUserCount} user
              {distinctUserCount !== 1 ? "s" : ""}
            </div>
          </section>

          {/* File Attachment (shared) */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Attachment
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                PDF file
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1.5">Max 10MB</span>
              </label>

              {formData.attachment ? (
                <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <FileText className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{formData.attachment.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(formData.attachment.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    aria-label="Remove file"
                    className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : existingAttachment && isEditMode ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{existingAttachment}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded file</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <a
                        href={`/uploads/projects/${existingAttachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <a
                        href={`/uploads/projects/${existingAttachment}`}
                        download
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  <details className="group">
                    <summary className="cursor-pointer text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                      Replace with new file
                    </summary>
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full px-4 py-5 rounded-md border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <Upload className="h-4 w-4 text-slate-400 mb-1.5" />
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Drop a new PDF or click to browse
                        </p>
                        <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  </details>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full px-4 py-8 rounded-md border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <Upload className="h-5 w-5 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Drop your PDF here or click to browse
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">PDF files up to 10MB</p>
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
          </section>

          {/* Labels (shared) */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Labels
            </h3>

            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                  placeholder="frontend, urgent, Q1-2024..."
                  className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow"
                />
                <button
                  type="button"
                  onClick={handleAddLabel}
                  className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Add
                </button>
              </div>

              {formData.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-full pl-2.5 pr-1.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => handleRemoveLabel(label)}
                        aria-label={`Remove ${label}`}
                        className="rounded-full p-0.5 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-5 sticky bottom-0 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading
                ? "Saving..."
                : isEditMode
                ? "Update project"
                : `Create project (${assignments.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;
// import { useState, useEffect, useRef } from "react";
// import {
//   X, Upload, Loader, Briefcase, Flag, Calendar, FileText, Tag, AlertCircle, CheckCircle2, Download, Eye, Users, UserCheck,
//   Plus, Trash2, Copy,
// } from "lucide-react";
// import { authAPI } from "../../api/admin";

// // One blank assignment row's shape — each row is one user's own
// // priority / status / timeline for this project
// const emptyAssignment = () => ({
//   _key: `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//   assigned_to: "",
//   priority: "medium",
//   status: "open",
//   due_date: "",
//   start_date: "",
//   task_detail: "",
// });

// const ProjectFormModal = ({ isOpen, isEditMode, editingProject, onClose, onSubmit }) => {
//   // Fields shared across the whole project (same for every assignee)
//   const [formData, setFormData] = useState({
//     summary: "",
//     description: "",
//     labels: [],
//     reporter: "",
//     attachment: null,
//   });

//   // Per-user rows: each has its own assigned_to + priority + status + dates
//   const [assignments, setAssignments] = useState([emptyAssignment()]);

//   const [loading, setLoading] = useState(false);
//   const [usersList, setUsersList] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(false);
//   const [labelInput, setLabelInput] = useState("");
//   const [error, setError] = useState("");
//   const [existingAttachment, setExistingAttachment] = useState(null);
//   const [showSummaryLimitPopup, setShowSummaryLimitPopup] = useState(false);

//   const popupTimeoutRef = useRef(null);

//   const MAX_SUMMARY_LENGTH = 255;

//   // Fetch available users from backend for assignment
//   useEffect(() => {
//     if (isOpen) {
//       const loadUsers = async () => {
//         setLoadingUsers(true);
//         try {
//           const res = await authAPI.getUsers();
//           const users = res.data || res || [];
//           setUsersList(Array.isArray(users) ? users : []);
//         } catch (err) {
//           console.error("Failed to load users for assignment:", err);
//           setUsersList([]);
//         } finally {
//           setLoadingUsers(false);
//         }
//       };
//       loadUsers();
//     }
//   }, [isOpen]);

//   // Helper function to safely parse dates
//   const formatDateForInput = (dateString) => {
//     if (!dateString) return "";
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return "";

//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, "0");
//       const day = String(date.getDate()).padStart(2, "0");
//       return `${year}-${month}-${day}`;
//     } catch (error) {
//       console.error("Date parsing error:", error);
//       return "";
//     }
//   };

//   // Populate form when editing
//   useEffect(() => {
//     if (isEditMode && editingProject) {
//       // Parse labels safely
//       let labelsList = [];
//       if (editingProject.labels) {
//         if (typeof editingProject.labels === "string") {
//           labelsList = editingProject.labels.split(",").map((l) => l.trim()).filter(l => l);
//         } else if (Array.isArray(editingProject.labels)) {
//           labelsList = editingProject.labels;
//         }
//       }

//       setExistingAttachment(editingProject.attachment || null);

//       setFormData({
//         summary: editingProject.summary || "",
//         description: editingProject.description || "",
//         labels: labelsList,
//         reporter: editingProject.reporter || "",
//         attachment: null,
//       });

//       // If the backend already returns per-user assignment rows
//       // (e.g. editingProject.assignments = [{assigned_to, priority, status, due_date, start_date}, ...])
//       // use those directly. Otherwise fall back to the old single-assignee shape.
//       if (Array.isArray(editingProject.assignments) && editingProject.assignments.length > 0) {
//         setAssignments(
//           editingProject.assignments.map((a) => ({
//             _key: emptyAssignment()._key,
//             assigned_to: a.assigned_to ? String(a.assigned_to) : "",
//             priority: (a.priority || "medium").toLowerCase(),
//             status: (a.status || "open").toLowerCase(),
//             due_date: formatDateForInput(a.due_date),
//             start_date: formatDateForInput(a.start_date),
//             task_detail: a.task_detail || "",
//           }))
//         );
//       } else {
//         setAssignments([
//           {
//             _key: emptyAssignment()._key,
//             assigned_to: editingProject.assigned_to ? String(editingProject.assigned_to) : "",
//             priority: (editingProject.priority || "medium").toLowerCase(),
//             status: (editingProject.status || "open").toLowerCase(),
//             due_date: formatDateForInput(editingProject.due_date),
//             start_date: formatDateForInput(editingProject.start_date),
//             task_detail: editingProject.task_detail || "",
//           },
//         ]);
//       }
//     } else {
//       setExistingAttachment(null);
//       setFormData({
//         summary: "",
//         description: "",
//         labels: [],
//         reporter: "",
//         attachment: null,
//       });
//       setAssignments([emptyAssignment()]);
//     }
//     setError("");
//   }, [isEditMode, editingProject, isOpen]);

//   // Clean up popup timeout on unmount
//   useEffect(() => {
//     return () => {
//       if (popupTimeoutRef.current) {
//         clearTimeout(popupTimeoutRef.current);
//       }
//     };
//   }, []);

//   const triggerSummaryLimitPopup = () => {
//     setShowSummaryLimitPopup(true);
//     if (popupTimeoutRef.current) {
//       clearTimeout(popupTimeoutRef.current);
//     }
//     popupTimeoutRef.current = setTimeout(() => {
//       setShowSummaryLimitPopup(false);
//     }, 3000);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "summary" && value.length > MAX_SUMMARY_LENGTH) {
//       triggerSummaryLimitPopup();
//       setFormData((prev) => ({
//         ...prev,
//         summary: value.slice(0, MAX_SUMMARY_LENGTH),
//       }));
//       return;
//     }

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // ---- Assignment row helpers ----

//   const updateAssignment = (key, field, value) => {
//     setAssignments((prev) =>
//       prev.map((a) => (a._key === key ? { ...a, [field]: value } : a))
//     );
//   };

//   const addAssignmentRow = () => {
//     setAssignments((prev) => [...prev, emptyAssignment()]);
//   };

//   // Duplicate a row's priority/status/dates but clear the assignee, so the
//   // manager can quickly reuse the same timeline for a different person
//   const duplicateAssignmentRow = (key) => {
//     setAssignments((prev) => {
//       const source = prev.find((a) => a._key === key);
//       if (!source) return prev;
//       const copy = { ...source, _key: emptyAssignment()._key, assigned_to: "" };
//       const index = prev.findIndex((a) => a._key === key);
//       const next = [...prev];
//       next.splice(index + 1, 0, copy);
//       return next;
//     });
//   };

//   const removeAssignmentRow = (key) => {
//     setAssignments((prev) => (prev.length === 1 ? prev : prev.filter((a) => a._key !== key)));
//   };

//   const getUserLabel = (id) => {
//     const u = usersList.find((u) => String(u.id) === String(id));
//     if (!u) return "";
//     return u.full_name || u.username;
//   };


//   const assignedCounts = assignments.reduce((acc, a) => {
//     if (a.assigned_to) acc[a.assigned_to] = (acc[a.assigned_to] || 0) + 1;
//     return acc;
//   }, {});

//   const handleAddLabel = () => {
//     if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
//       setFormData((prev) => ({
//         ...prev,
//         labels: [...prev.labels, labelInput.trim()],
//       }));
//       setLabelInput("");
//     }
//   };

//   const handleRemoveLabel = (label) => {
//     setFormData((prev) => ({
//       ...prev,
//       labels: prev.labels.filter((l) => l !== label),
//     }));
//   };

//   // ---- File ----

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
//         setError("Only PDF files are allowed");
//         return;
//       }

//       const maxSizeInMB = 10;
//       const fileSizeInMB = file.size / (1024 * 1024);
//       if (fileSizeInMB > maxSizeInMB) {
//         setError(`File size must be less than ${maxSizeInMB}MB`);
//         return;
//       }

//       setFormData((prev) => ({
//         ...prev,
//         attachment: file,
//       }));
//       setError("");
//     }
//   };

//   const handleRemoveFile = () => {
//     setFormData((prev) => ({
//       ...prev,
//       attachment: null,
//     }));
//   };

//   // ---- Validation ----

//   const validate = () => {
//     if (!formData.summary.trim()) {
//       return "Project name/summary is required";
//     }
//     if (formData.summary.trim().length > MAX_SUMMARY_LENGTH) {
//       triggerSummaryLimitPopup();
//       return `Project name cannot exceed ${MAX_SUMMARY_LENGTH} characters`;
//     }
//     if (assignments.length === 0) {
//       return "Add at least one assignment";
//     }
//     for (let i = 0; i < assignments.length; i++) {
//       const a = assignments[i];
//       if (!a.assigned_to) {
//         return `Row #${i + 1}: please choose who this is for`;
//       }
//       if (!a.start_date) {
//         return `Row #${i + 1}: start date is required`;
//       }
//       if (!a.due_date) {
//         return `Row #${i + 1}: due date is required`;
//       }
//       if (new Date(a.start_date) > new Date(a.due_date)) {
//         return `Row #${i + 1}: start date must be before due date`;
//       }
//     }
//     return "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     const validationError = validate();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     setLoading(true);

//     try {
//       // Each row becomes its own assignment object — different priority,
//       // status and dates per user, all tied to the same project summary
//       const assignmentsPayload = assignments.map((a) => ({
//         assigned_to: parseInt(a.assigned_to, 10),
//         priority: a.priority.toLowerCase(),
//         status: a.status.toLowerCase(),
//         start_date: new Date(a.start_date).toISOString(),
//         due_date: new Date(a.due_date).toISOString(),
//         task_detail: a.task_detail.trim() || null,
//       }));

//       let submitData;
//       let useFormData = false;

//       if (formData.attachment) {
//         useFormData = true;
//         submitData = new FormData();
//         submitData.append("summary", formData.summary.trim());
//         submitData.append("description", formData.description.trim());
//         submitData.append("labels", JSON.stringify(formData.labels.length > 0 ? formData.labels : []));
//         submitData.append("reporter", formData.reporter.trim() || null);
//         // Backend should read this JSON array and create one assignment per entry
//         submitData.append("assignments", JSON.stringify(assignmentsPayload));
//         submitData.append("attachment", formData.attachment);
//       } else {
//         submitData = {
//           summary: formData.summary.trim(),
//           description: formData.description.trim(),
//           labels: formData.labels.length > 0 ? formData.labels : [],
//           reporter: formData.reporter.trim() || null,
//           assignments: assignmentsPayload,
//           attachment: null,
//         };
//       }

//       await onSubmit(submitData, useFormData);
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : (err?.message || "Failed to save project");
//       setError(errorMessage);
//       console.error("Form submission error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
//       <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 shadow-2xl">
//         {/* Header */}
//         <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 px-8 py-6">
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
//               <Briefcase className="h-5 w-5 text-white" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
//                 {isEditMode ? "Edit Project" : "Create Project"}
//               </h2>
//               <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
//                 Each person gets their own priority, status and timeline
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="rounded-lg p-2 hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors"
//           >
//             <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-8 space-y-6">
//           {/* Error Alert */}
//           {error && (
//             <div className="flex gap-3 rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-900/50">
//               <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
//               <div>
//                 <h3 className="font-semibold text-red-900 dark:text-red-400">Error</h3>
//                 <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">{error}</p>
//               </div>
//             </div>
//           )}

//           {/* Basic Information (shared across all assignees) */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
//               <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
//               <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
//                 Basic Information
//               </h3>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-2">
//                 Project Name *
//                 <span className="text-xs text-slate-500 dark:text-slate-500 font-normal ml-1">
//                   (Required - max {MAX_SUMMARY_LENGTH} characters)
//                 </span>
//               </label>

//               <div className="relative">
//                 {showSummaryLimitPopup && (
//                   <div
//                     role="alert"
//                     className="absolute bottom-full left-0 mb-2 z-10 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white shadow-lg"
//                   >
//                     <AlertCircle className="h-4 w-4 flex-shrink-0" />
//                     <span>
//                       Project name can't be more than {MAX_SUMMARY_LENGTH} characters
//                     </span>
//                     <span className="absolute top-full left-6 h-2 w-2 rotate-45 bg-red-600" />
//                   </div>
//                 )}

//                 <input
//                   type="text"
//                   name="summary"
//                   value={formData.summary}
//                   onChange={handleChange}
//                   placeholder="e.g., Website Redesign, Mobile App v2"
//                   className={`w-full px-4 py-3 rounded-lg border text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 focus:ring-2 transition-all ${showSummaryLimitPopup
//                     ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-900"
//                     : "border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-200/50"
//                     }`}
//                 />
//               </div>

//               <p
//                 className={`text-xs mt-1 ${formData.summary.length >= MAX_SUMMARY_LENGTH
//                   ? "text-red-600 dark:text-red-500 font-semibold"
//                   : "text-slate-500 dark:text-slate-550"
//                   }`}
//               >
//                 {formData.summary.length}/{MAX_SUMMARY_LENGTH} characters
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
//                 Description
//                 <span className="text-xs text-slate-500 dark:text-slate-500 font-normal ml-1">
//                   (Optional)
//                 </span>
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 placeholder="Describe your project goals, scope, and key requirements..."
//                 rows="4"
//                 className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400 dark:placeholder:text-slate-650 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all resize-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
//                 Reporter / Project Manager
//                 <span className="text-xs text-slate-500 dark:text-slate-500 font-normal ml-1">
//                   (Optional - defaults to your account name)
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 name="reporter"
//                 value={formData.reporter}
//                 onChange={handleChange}
//                 placeholder="e.g., Project Manager Name"
//                 className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all"
//               />
//             </div>
//           </div>

//           {/* Per-user assignment rows — priority, status & dates differ per person */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
//               <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
//               <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
//                 Task (Different Per User)
//               </h3>
//             </div>

//             {loadingUsers && (
//               <span className="text-xs text-indigo-650 dark:text-indigo-400 flex items-center gap-1 font-medium">
//                 <Loader className="h-3 w-3 animate-spin" /> Loading users...
//               </span>
//             )}

//             <div className="space-y-5">
//               {assignments.map((row, index) => {
//                 const duplicateWarning =
//                   row.assigned_to && assignedCounts[row.assigned_to] > 1;

//                 return (
//                   <div
//                     key={row._key}
//                     className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-5 relative"
//                   >
//                     {/* Row header */}
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center gap-2">
//                         <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
//                           {index + 1}
//                         </span>
//                         <p className="text-sm font-bold text-slate-900 dark:text-white">
//                           Task #{index + 1}
//                           {row.assigned_to && (
//                             <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
//                               → for{" "}
//                               <span className="font-semibold text-violet-650 dark:text-violet-400">
//                                 {getUserLabel(row.assigned_to)}
//                               </span>
//                             </span>
//                           )}
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <button
//                           type="button"
//                           onClick={() => duplicateAssignmentRow(row._key)}
//                           title="Duplicate this row for another user"
//                           className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
//                         >
//                           <Copy className="h-4 w-4" />
//                         </button>
//                         {assignments.length > 1 && (
//                           <button
//                             type="button"
//                             onClick={() => removeAssignmentRow(row._key)}
//                             title="Remove this row"
//                             className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         )}
//                       </div>
//                     </div>

//                     {duplicateWarning && (
//                       <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 px-3 py-2 border border-amber-200 dark:border-amber-900/40">
//                         <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
//                         <p className="text-xs text-amber-800 dark:text-amber-300">
//                           {getUserLabel(row.assigned_to)} already appears in another row — that's fine if intentional, just flagging it.
//                         </p>
//                       </div>
//                     )}

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {/* Assigned to */}
//                       <div className="md:col-span-2">
//                         <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 flex items-center gap-1">
//                           <UserCheck className="h-3.5 w-3.5" /> Assign To *
//                         </label>
//                         <select
//                           value={row.assigned_to}
//                           onChange={(e) => updateAssignment(row._key, "assigned_to", e.target.value)}
//                           className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-955 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all font-medium"
//                         >
//                           <option value="">
//                             {loadingUsers ? "Loading users..." : "-- Select user --"}
//                           </option>
//                           {usersList.map((u) => {
//                             const displayName = u.full_name || u.username;
//                             return (
//                               <option key={u.id} value={u.id}>
//                                 {u.role === "manager" ? "👑" : "👤"} {displayName} (@{u.username}) - {u.email}
//                               </option>
//                             );
//                           })}
//                         </select>
//                       </div>

//                       {/* Priority */}
//                       <div>
//                         <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 flex items-center gap-1">
//                           <Flag className="h-3.5 w-3.5" /> Priority *
//                         </label>
//                         <select
//                           value={row.priority}
//                           onChange={(e) => updateAssignment(row._key, "priority", e.target.value)}
//                           className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-955 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all font-medium"
//                         >
//                           <option value="low">🟢 Low</option>
//                           <option value="medium">🟡 Medium</option>
//                           <option value="high">🟠 High</option>
//                           <option value="critical">🔴 Critical</option>
//                         </select>
//                       </div>

//                       {/* Status */}
//                       <div>
//                         <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5">
//                           Status *
//                         </label>
//                         <select
//                           value={row.status}
//                           onChange={(e) => updateAssignment(row._key, "status", e.target.value)}
//                           className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-955 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all font-medium"
//                         >
//                           <option value="open">📋 Open</option>
//                           <option value="in_progress">⚙️ In Progress</option>
//                           <option value="review">🔍 Review</option>
//                           <option value="active">✨ Active</option>
//                           <option value="on_hold">⏸️ On Hold</option>
//                           <option value="closed">✅ Closed</option>
//                           <option value="completed">🎉 Completed</option>
//                           <option value="cancelled">❌ Cancelled</option>
//                         </select>
//                       </div>

//                       {/* Start date */}
//                       <div>
//                         <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 flex items-center gap-1">
//                           <Calendar className="h-3.5 w-3.5" /> Start Date *
//                         </label>
//                         <input
//                           type="date"
//                           value={row.start_date}
//                           onChange={(e) => updateAssignment(row._key, "start_date", e.target.value)}
//                           className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all"
//                         />
//                       </div>

//                       {/* Due date */}
//                       <div>
//                         <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 flex items-center gap-1">
//                           <Calendar className="h-3.5 w-3.5" /> Due Date *
//                         </label>
//                         <input
//                           type="date"
//                           value={row.due_date}
//                           onChange={(e) => updateAssignment(row._key, "due_date", e.target.value)}
//                           className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all"
//                         />
//                       </div>

//                       {/* Task detail — specific instructions for this person */}
//                       <div className="md:col-span-2">
//                         <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5 flex items-center gap-1">
//                           <FileText className="h-3.5 w-3.5" /> Task Detail
//                           <span className="text-[11px] text-slate-500 dark:text-slate-500 font-normal ml-1">
//                             (Optional — what this specific person needs to do)
//                           </span>
//                         </label>
//                         <textarea
//                           value={row.task_detail}
//                           onChange={(e) => updateAssignment(row._key, "task_detail", e.target.value)}
//                           rows="2"
//                           placeholder="e.g., Focus on the backend API integration and write unit tests"
//                           className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all resize-none"
//                         />
//                       </div>
//                     </div>

//                     {row.start_date && row.due_date && (
//                       <div className="mt-3 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex items-start gap-2">
//                         <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
//                         <p className="text-xs text-blue-900 dark:text-blue-300">
//                           <strong>Duration:</strong>{" "}
//                           {Math.max(
//                             0,
//                             Math.ceil(
//                               (new Date(row.due_date) - new Date(row.start_date)) /
//                               (1000 * 60 * 60 * 24)
//                             )
//                           )}{" "}
//                           days
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Add another assignment */}
//             <button
//               type="button"
//               onClick={addAssignmentRow}
//               className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-800 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
//             >
//               <Plus className="h-4 w-4" /> Add Another Assignment (for a different user)
//             </button>

//             {/* Summary strip */}
//             <div className="flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 px-4 py-3 border border-indigo-200 dark:border-indigo-900/40">
//               <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
//               <p className="text-sm text-indigo-800 dark:text-indigo-300">
//                 {assignments.length} assignment{assignments.length > 1 ? "s" : ""} ready ·{" "}
//                 {new Set(assignments.map((a) => a.assigned_to).filter(Boolean)).size} distinct user
//                 {new Set(assignments.map((a) => a.assigned_to).filter(Boolean)).size !== 1 ? "s" : ""}
//               </p>
//             </div>
//           </div>

//           {/* File Attachment (shared) */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
//               <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//               <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
//                 Project Attachment
//               </h3>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
//                 Upload PDF File
//                 <span className="text-xs text-slate-500 dark:text-slate-550 font-normal ml-1">
//                   (Optional - PDF only, max 10MB)
//                 </span>
//               </label>

//               {formData.attachment ? (
//                 <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-955/20 border border-blue-200 dark:border-blue-900/40">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-105 dark:bg-blue-950/50">
//                       <FileText className="h-5 w-5 text-blue-600 dark:text-blue-450" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-semibold text-slate-900 dark:text-white">
//                         {formData.attachment.name}
//                       </p>
//                       <p className="text-xs text-slate-500 dark:text-slate-400">
//                         {(formData.attachment.size / 1024).toFixed(2)} KB
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={handleRemoveFile}
//                     className="rounded-lg p-2 text-red-655 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
//                     title="Remove file"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>
//                 </div>
//               ) : existingAttachment && isEditMode ? (
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-200 dark:border-emerald-900/40">
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
//                         <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-semibold text-slate-900 dark:text-white">
//                           {existingAttachment}
//                         </p>
//                         <p className="text-xs text-slate-500 dark:text-slate-400">
//                           Uploaded file
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex gap-2">
//                       <a
//                         href={`/uploads/projects/${existingAttachment}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="rounded-lg p-2 text-emerald-605 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors"
//                         title="View file"
//                       >
//                         <Eye className="h-4 w-4" />
//                       </a>
//                       <a
//                         href={`/uploads/projects/${existingAttachment}`}
//                         download
//                         className="rounded-lg p-2 text-emerald-605 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors"
//                         title="Download file"
//                       >
//                         <Download className="h-4 w-4" />
//                       </a>
//                     </div>
//                   </div>

//                   <details className="group">
//                     <summary className="cursor-pointer text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-305 font-medium">
//                       Replace with new file
//                     </summary>
//                     <div className="mt-3">
//                       <label className="flex flex-col items-center justify-center w-full px-4 py-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
//                         <div className="flex flex-col items-center justify-center">
//                           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/40 mb-2">
//                             <Upload className="h-5 w-5 text-indigo-650 dark:text-indigo-400" />
//                           </div>
//                           <p className="text-xs font-semibold text-slate-900 dark:text-white">
//                             Drop new PDF here or click to browse
//                           </p>
//                         </div>
//                         <input
//                           type="file"
//                           accept=".pdf"
//                           onChange={handleFileChange}
//                           className="hidden"
//                         />
//                       </label>
//                     </div>
//                   </details>
//                 </div>
//               ) : (
//                 <label className="flex flex-col items-center justify-center w-full px-4 py-8 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
//                   <div className="flex flex-col items-center justify-center">
//                     <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/40 mb-3">
//                       <Upload className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
//                     </div>
//                     <p className="text-sm font-semibold text-slate-900 dark:text-white">
//                       Drop your PDF here or click to browse
//                     </p>
//                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
//                       PDF files up to 10MB
//                     </p>
//                   </div>
//                   <input
//                     type="file"
//                     accept=".pdf"
//                     onChange={handleFileChange}
//                     className="hidden"
//                   />
//                 </label>
//               )}
//             </div>
//           </div>

//           {/* Labels (shared) */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
//               <Tag className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />
//               <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
//                 Labels & Tags
//               </h3>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
//                 Add Labels
//                 <span className="text-xs text-slate-500 dark:text-slate-550 font-normal ml-1">
//                   (Optional)
//                 </span>
//               </label>
//               <div className="flex gap-2 mb-2">
//                 <input
//                   type="text"
//                   value={labelInput}
//                   onChange={(e) => setLabelInput(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAddLabel()}
//                   placeholder="e.g., frontend, urgent, Q1-2024"
//                   className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all"
//                 />
//                 <button
//                   type="button"
//                   onClick={handleAddLabel}
//                   className="px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
//                 >
//                   Add
//                 </button>
//               </div>

//               {formData.labels.length > 0 && (
//                 <div className="flex flex-wrap gap-2 p-3 bg-emerald-50 dark:bg-emerald-955/20 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
//                   {formData.labels.map((label) => (
//                     <span
//                       key={label}
//                       className="inline-flex items-center gap-2 bg-white dark:bg-slate-950 rounded-full px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shadow-sm"
//                     >
//                       #{label}
//                       <button
//                         type="button"
//                         onClick={() => handleRemoveLabel(label)}
//                         className="hover:text-emerald-900 dark:hover:text-emerald-300 font-bold"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-6 sticky bottom-0 bg-white dark:bg-slate-900 z-10">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-850 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30 dark:shadow-indigo-950/20"
//             >
//               {loading && <Loader className="h-4 w-4 animate-spin" />}
//               {loading
//                 ? "Saving..."
//                 : isEditMode
//                   ? "Update Project"
//                   : `Create Project (${assignments.length} assignment${assignments.length > 1 ? "s" : ""})`}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ProjectFormModal;
// import { useState, useEffect, useRef } from "react";
// import {
//   X, Upload, Loader, Briefcase, Flag, Calendar, FileText, Tag, AlertCircle, CheckCircle2, Download, Eye, Users, UserCheck,
// } from "lucide-react";
// import { authAPI } from "../../api/admin";

// const ProjectFormModal = ({ isOpen, isEditMode, editingProject, onClose, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     summary: "",
//     description: "",
//     priority: "medium",
//     status: "open",
//     labels: [],
//     due_date: "",
//     start_date: "",
//     reporter: "",
//     assigned_to: "",
//     attachment: null,
//   });

//   const [loading, setLoading] = useState(false);
//   const [usersList, setUsersList] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(false);
//   const [labelInput, setLabelInput] = useState("");
//   const [error, setError] = useState("");
//   const [existingAttachment, setExistingAttachment] = useState(null);
//   const [showSummaryLimitPopup, setShowSummaryLimitPopup] = useState(false);

//   const popupTimeoutRef = useRef(null);

//   const MAX_SUMMARY_LENGTH = 255;

//   // Fetch available users from backend for assignment
//   useEffect(() => {
//     if (isOpen) {
//       const loadUsers = async () => {
//         setLoadingUsers(true);
//         try {
//           // Fetch users from database
//           const res = await authAPI.getUsers();
//           const users = res.data || res || [];
//           setUsersList(Array.isArray(users) ? users : []);
//         } catch (err) {
//           console.error("Failed to load users for assignment:", err);
//           setUsersList([]);
//         } finally {
//           setLoadingUsers(false);
//         }
//       };
//       loadUsers();
//     }
//   }, [isOpen]);

//   // Helper function to safely parse dates
//   const formatDateForInput = (dateString) => {
//     if (!dateString) return "";
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return "";

//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, "0");
//       const day = String(date.getDate()).padStart(2, "0");
//       return `${year}-${month}-${day}`;
//     } catch (error) {
//       console.error("Date parsing error:", error);
//       return "";
//     }
//   };

//   // Populate form when editing
//   useEffect(() => {
//     if (isEditMode && editingProject) {
//       // Parse labels safely
//       let labelsList = [];
//       if (editingProject.labels) {
//         if (typeof editingProject.labels === "string") {
//           labelsList = editingProject.labels.split(",").map((l) => l.trim()).filter(l => l);
//         } else if (Array.isArray(editingProject.labels)) {
//           labelsList = editingProject.labels;
//         }
//       }

//       // Store existing attachment info
//       setExistingAttachment(editingProject.attachment || null);

//       setFormData({
//         summary: editingProject.summary || "",
//         description: editingProject.description || "",
//         priority: (editingProject.priority || "medium").toLowerCase(),
//         status: (editingProject.status || "open").toLowerCase(),
//         labels: labelsList,
//         due_date: formatDateForInput(editingProject.due_date),
//         start_date: formatDateForInput(editingProject.start_date),
//         reporter: editingProject.reporter || "",
//         assigned_to: editingProject.assigned_to ? String(editingProject.assigned_to) : "",
//         attachment: null,
//       });
//     } else {
//       setExistingAttachment(null);
//       setFormData({
//         summary: "",
//         description: "",
//         priority: "medium",
//         status: "open",
//         labels: [],
//         due_date: "",
//         start_date: "",
//         reporter: "",
//         assigned_to: "",
//         attachment: null,
//       });
//     }
//     setError("");
//   }, [isEditMode, editingProject, isOpen]);

//   // Clean up popup timeout on unmount
//   useEffect(() => {
//     return () => {
//       if (popupTimeoutRef.current) {
//         clearTimeout(popupTimeoutRef.current);
//       }
//     };
//   }, []);

//   const triggerSummaryLimitPopup = () => {
//     setShowSummaryLimitPopup(true);
//     if (popupTimeoutRef.current) {
//       clearTimeout(popupTimeoutRef.current);
//     }
//     popupTimeoutRef.current = setTimeout(() => {
//       setShowSummaryLimitPopup(false);
//     }, 3000);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Explicit length validation for the summary field (covers paste too,
//     // not just typing, since maxLength alone can be bypassed in some cases)
//     if (name === "summary" && value.length > MAX_SUMMARY_LENGTH) {
//       triggerSummaryLimitPopup();
//       setFormData((prev) => ({
//         ...prev,
//         summary: value.slice(0, MAX_SUMMARY_LENGTH),
//       }));
//       return;
//     }

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleAddLabel = () => {
//     if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
//       setFormData((prev) => ({
//         ...prev,
//         labels: [...prev.labels, labelInput.trim()],
//       }));
//       setLabelInput("");
//     }
//   };

//   const handleRemoveLabel = (label) => {
//     setFormData((prev) => ({
//       ...prev,
//       labels: prev.labels.filter((l) => l !== label),
//     }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file type - only PDF allowed
//       if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
//         setError("Only PDF files are allowed");
//         return;
//       }

//       // Validate file size - max 10MB
//       const maxSizeInMB = 10;
//       const fileSizeInMB = file.size / (1024 * 1024);
//       if (fileSizeInMB > maxSizeInMB) {
//         setError(`File size must be less than ${maxSizeInMB}MB`);
//         return;
//       }

//       setFormData((prev) => ({
//         ...prev,
//         attachment: file,
//       }));
//       setError(""); // Clear any previous errors
//     }
//   };

//   const handleRemoveFile = () => {
//     setFormData((prev) => ({
//       ...prev,
//       attachment: null,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     // Validation
//     if (!formData.summary.trim()) {
//       setError("Project name/summary is required");
//       return;
//     }

//     if (formData.summary.trim().length > MAX_SUMMARY_LENGTH) {
//       triggerSummaryLimitPopup();
//       setError(`Project name cannot exceed ${MAX_SUMMARY_LENGTH} characters`);
//       return;
//     }

//     if (!formData.start_date) {
//       setError("Start date is required");
//       return;
//     }

//     if (!formData.due_date) {
//       setError("Due date is required");
//       return;
//     }

//     if (new Date(formData.start_date) > new Date(formData.due_date)) {
//       setError("Start date must be before due date");
//       return;
//     }

//     setLoading(true);

//     try {
//       let submitData;
//       let useFormData = false;

//       // If there's a file attachment, use FormData
//       if (formData.attachment) {
//         useFormData = true;
//         submitData = new FormData();
//         submitData.append("summary", formData.summary.trim());
//         submitData.append("description", formData.description.trim());
//         submitData.append("priority", formData.priority.toLowerCase());
//         submitData.append("status", formData.status.toLowerCase());
//         submitData.append("labels", JSON.stringify(formData.labels.length > 0 ? formData.labels : []));
//         submitData.append("due_date", new Date(formData.due_date).toISOString());
//         submitData.append("start_date", new Date(formData.start_date).toISOString());
//         submitData.append("reporter", formData.reporter.trim() || null);
//         submitData.append("assigned_to", formData.assigned_to ? String(formData.assigned_to) : "");
//         submitData.append("attachment", formData.attachment); // File object
//       } else {
//         // Regular JSON submission
//         submitData = {
//           summary: formData.summary.trim(),
//           description: formData.description.trim(),
//           priority: formData.priority.toLowerCase(),
//           status: formData.status.toLowerCase(),
//           labels: formData.labels.length > 0 ? formData.labels : [],
//           due_date: new Date(formData.due_date).toISOString(),
//           start_date: new Date(formData.start_date).toISOString(),
//           reporter: formData.reporter.trim() || null,
//           assigned_to: formData.assigned_to ? parseInt(formData.assigned_to, 10) : null,
//           attachment: null,
//         };
//       }

//       // Call onSubmit callback with the data and useFormData flag
//       await onSubmit(submitData, useFormData);
//       // Form closing is handled by parent component (Dashboard)
//     } catch (err) {
//       // If onSubmit throws an error, display it
//       const errorMessage = err instanceof Error ? err.message : (err?.message || "Failed to save project");
//       setError(errorMessage);
//       console.error("Form submission error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
//       <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 shadow-2xl">
//         {/* Header */}
//         <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 px-8 py-6">
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
//               <Briefcase className="h-5 w-5 text-white" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
//                 {isEditMode ? "Edit Project" : "Create Project"}
//               </h2>
//               <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
//                 {isEditMode
//                   ? "Update project details"
//                   : "Set up your new project with all details"}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="rounded-lg p-2 hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors"
//           >
//             <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-8 space-y-6">
//           {/* Error Alert */}
//           {error && (
//             <div className="flex gap-3 rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-900/50">
//               <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
//               <div>
//                 <h3 className="font-semibold text-red-900 dark:text-red-400">Error</h3>
//                 <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">{error}</p>
//               </div>
//             </div>
//           )}

//           {/* Basic Information */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
//               <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
//               <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
//                 Basic Information
//               </h3>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-2">
//                 Project Name *
//                 <span className="text-xs text-slate-500 dark:text-slate-500 font-normal ml-1">
//                   (Required - max {MAX_SUMMARY_LENGTH} characters)
//                 </span>
//               </label>

//               <div className="relative">
//                 {/* Popup message shown when the limit is exceeded */}
//                 {showSummaryLimitPopup && (
//                   <div
//                     role="alert"
//                     className="absolute bottom-full left-0 mb-2 z-10 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white shadow-lg"
//                   >
//                     <AlertCircle className="h-4 w-4 flex-shrink-0" />
//                     <span>
//                       Project name can't be more than {MAX_SUMMARY_LENGTH} characters
//                     </span>
//                     <span className="absolute top-full left-6 h-2 w-2 rotate-45 bg-red-600" />
//                   </div>
//                 )}

//                 <input
//                   type="text"
//                   name="summary"
//                   value={formData.summary}
//                   onChange={handleChange}
//                   placeholder="e.g., Website Redesign, Mobile App v2"
//                   className={`w-full px-4 py-3 rounded-lg border text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 focus:ring-2 transition-all ${showSummaryLimitPopup
//                     ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-900"
//                     : "border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-200/50"
//                     }`}
//                 />
//               </div>

//               <p
//                 className={`text-xs mt-1 ${formData.summary.length >= MAX_SUMMARY_LENGTH
//                   ? "text-red-600 dark:text-red-500 font-semibold"
//                   : "text-slate-500 dark:text-slate-550"
//                   }`}
//               >
//                 {formData.summary.length}/{MAX_SUMMARY_LENGTH} characters
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
//                 Description
//                 <span className="text-xs text-slate-500 dark:text-slate-500 font-normal ml-1">
//                   (Optional)
//                 </span>
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 placeholder="Describe your project goals, scope, and key requirements..."
//                 rows="4"
//                 className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400 dark:placeholder:text-slate-650 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all resize-none"
//               />
//             </div>
//           </div>

//           {/* Priority & Status */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
//               <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
//               <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
//                 Priority & Status
//               </h3>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
//                   Priority *
//                 </label>
//                 <select
//                   name="priority"
//                   value={formData.priority}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-955 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all font-medium"
//                 >
//                   <option value="low" className="dark:bg-slate-900 dark:text-white">🟢 Low</option>
//                   <option value="medium" className="dark:bg-slate-900 dark:text-white">🟡 Medium</option>
//                   <option value="high" className="dark:bg-slate-900 dark:text-white">🟠 High</option>
//                   <option value="critical" className="dark:bg-slate-900 dark:text-white">🔴 Critical</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
//                   Status *
//                 </label>
//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-955 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all font-medium"
//                 >
//                   <option value="open" className="dark:bg-slate-900 dark:text-white">📋 Open</option>
//                   <option value="in_progress" className="dark:bg-slate-900 dark:text-white">⚙️ In Progress</option>
//                   <option value="review" className="dark:bg-slate-900 dark:text-white">🔍 Review</option>
//                   <option value="active" className="dark:bg-slate-900 dark:text-white">✨ Active</option>
//                   <option value="on_hold" className="dark:bg-slate-900 dark:text-white">⏸️ On Hold</option>
//                   <option value="closed" className="dark:bg-slate-900 dark:text-white">✅ Closed</option>
//                   <option value="completed" className="dark:bg-slate-900 dark:text-white">🎉 Completed</option>
//                   <option value="cancelled" className="dark:bg-slate-900 dark:text-white">❌ Cancelled</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Timeline */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
//               <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//               <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
//                 Timeline
//               </h3>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
//                   Start Date *
//                 </label>
//                 <input
//                   type="date"
//                   name="start_date"
//                   value={formData.start_date}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
//                   Due Date *
//                 </label>
//                 <input
//                   type="date"
//                   name="due_date"
//                   value={formData.due_date}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all"
//                 />
//               </div>
//             </div>

//             {formData.start_date && formData.due_date && (
//               <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex items-start gap-2">
//                 <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
//                 <p className="text-sm text-blue-900 dark:text-blue-300">
//                   <strong>Duration:</strong>{" "}
//                   {Math.max(
//                     0,
//                     Math.ceil(
//                       (new Date(formData.due_date) -
//                         new Date(formData.start_date)) /
//                       (1000 * 60 * 60 * 24)
//                     )
//                   )}{" "}
//                   days
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Details & Assignment */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
//               <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
//               <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
//                 Assignment & Details
//               </h3>
//             </div>

//             {/* Assign to Team Member */}
//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355">
//                   Assign Project To (Team Member)
//                   <span className="text-xs text-slate-500 dark:text-slate-500 font-normal ml-1">
//                     (Choose a database user to assign this project)
//                   </span>
//                 </label>
//                 {loadingUsers && (
//                   <span className="text-xs text-indigo-650 dark:text-indigo-400 flex items-center gap-1 font-medium">
//                     <Loader className="h-3 w-3 animate-spin" /> Loading users...
//                   </span>
//                 )}
//               </div>

//               <select
//                 name="assigned_to"
//                 value={formData.assigned_to}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-955 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all font-medium"
//               >
//                 <option value="" className="dark:bg-slate-900 dark:text-slate-450">-- No Assignee / Unassigned --</option>
//                 {usersList.map((u) => {
//                   const displayName = u.full_name || u.username;
//                   const isNormalUser = u.role === 'user';
//                   return (
//                     <option key={u.id} value={u.id} className="dark:bg-slate-900 dark:text-slate-200">
//                       {isNormalUser ? "👤" : "👑"} {displayName} (@{u.username}) - {u.email} [{u.role.toUpperCase()}]
//                     </option>
//                   );
//                 })}
//               </select>

//               {/* Selected Assignee preview card */}
//               {formData.assigned_to && (
//                 <div className="mt-2.5 flex items-center gap-3 p-3 rounded-xl bg-violet-50/70 dark:bg-violet-955/20 border border-violet-200/80 dark:border-violet-900/40">
//                   {(() => {
//                     const selectedUser = usersList.find(
//                       (u) => String(u.id) === String(formData.assigned_to)
//                     );
//                     if (!selectedUser) return null;
//                     const name = selectedUser.full_name || selectedUser.username;
//                     return (
//                       <>
//                         <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white shadow-sm">
//                           {name.charAt(0).toUpperCase()}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2">
//                             <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
//                               {name}
//                             </p>
//                             <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/50 px-2 py-0.5 text-[10px] font-bold text-violet-750 dark:text-violet-400">
//                               @{selectedUser.username}
//                             </span>
//                           </div>
//                           <p className="text-xs text-slate-505 dark:text-slate-400 truncate">
//                             {selectedUser.email}
//                           </p>
//                         </div>
//                         <div className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-555 gap-1">
//                           <CheckCircle2 className="h-4 w-4" /> Assigned
//                         </div>
//                       </>
//                     );
//                   })()}
//                 </div>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
//                 Reporter / Project Manager
//                 <span className="text-xs text-slate-500 dark:text-slate-500 font-normal ml-1">
//                   (Optional - defaults to your account name)
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 name="reporter"
//                 value={formData.reporter}
//                 onChange={handleChange}
//                 placeholder="e.g., Project Manager Name"
//                 className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all"
//               />
//             </div>
//           </div>

//           {/* File Attachment */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
//               <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//               <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
//                 Project Attachment
//               </h3>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
//                 Upload PDF File
//                 <span className="text-xs text-slate-500 dark:text-slate-550 font-normal ml-1">
//                   (Optional - PDF only, max 10MB)
//                 </span>
//               </label>

//               {formData.attachment ? (
//                 // New file selected
//                 <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-955/20 border border-blue-200 dark:border-blue-900/40">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-105 dark:bg-blue-950/50">
//                       <FileText className="h-5 w-5 text-blue-600 dark:text-blue-450" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-semibold text-slate-900 dark:text-white">
//                         {formData.attachment.name}
//                       </p>
//                       <p className="text-xs text-slate-500 dark:text-slate-400">
//                         {(formData.attachment.size / 1024).toFixed(2)} KB
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={handleRemoveFile}
//                     className="rounded-lg p-2 text-red-655 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
//                     title="Remove file"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>
//                 </div>
//               ) : existingAttachment && isEditMode ? (
//                 // Existing file in edit mode
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-200 dark:border-emerald-900/40">
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
//                         <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-semibold text-slate-900 dark:text-white">
//                           {existingAttachment}
//                         </p>
//                         <p className="text-xs text-slate-500 dark:text-slate-400">
//                           Uploaded file
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex gap-2">
//                       <a
//                         href={`/uploads/projects/${existingAttachment}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="rounded-lg p-2 text-emerald-605 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors"
//                         title="View file"
//                       >
//                         <Eye className="h-4 w-4" />
//                       </a>
//                       <a
//                         href={`/uploads/projects/${existingAttachment}`}
//                         download
//                         className="rounded-lg p-2 text-emerald-605 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors"
//                         title="Download file"
//                       >
//                         <Download className="h-4 w-4" />
//                       </a>
//                     </div>
//                   </div>

//                   <details className="group">
//                     <summary className="cursor-pointer text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-305 font-medium">
//                       Replace with new file
//                     </summary>
//                     <div className="mt-3">
//                       <label className="flex flex-col items-center justify-center w-full px-4 py-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
//                         <div className="flex flex-col items-center justify-center">
//                           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/40 mb-2">
//                             <Upload className="h-5 w-5 text-indigo-650 dark:text-indigo-400" />
//                           </div>
//                           <p className="text-xs font-semibold text-slate-900 dark:text-white">
//                             Drop new PDF here or click to browse
//                           </p>
//                         </div>
//                         <input
//                           type="file"
//                           accept=".pdf"
//                           onChange={handleFileChange}
//                           className="hidden"
//                         />
//                       </label>
//                     </div>
//                   </details>
//                 </div>
//               ) : (
//                 // Upload area for new file or when no existing file
//                 <label className="flex flex-col items-center justify-center w-full px-4 py-8 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
//                   <div className="flex flex-col items-center justify-center">
//                     <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/40 mb-3">
//                       <Upload className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
//                     </div>
//                     <p className="text-sm font-semibold text-slate-900 dark:text-white">
//                       Drop your PDF here or click to browse
//                     </p>
//                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
//                       PDF files up to 10MB
//                     </p>
//                   </div>
//                   <input
//                     type="file"
//                     accept=".pdf"
//                     onChange={handleFileChange}
//                     className="hidden"
//                   />
//                 </label>
//               )}
//             </div>
//           </div>

//           {/* Labels */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
//               <Tag className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />
//               <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
//                 Labels & Tags
//               </h3>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
//                 Add Labels
//                 <span className="text-xs text-slate-500 dark:text-slate-550 font-normal ml-1">
//                   (Optional)
//                 </span>
//               </label>
//               <div className="flex gap-2 mb-2">
//                 <input
//                   type="text"
//                   value={labelInput}
//                   onChange={(e) => setLabelInput(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAddLabel()}
//                   placeholder="e.g., frontend, urgent, Q1-2024"
//                   className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all"
//                 />
//                 <button
//                   type="button"
//                   onClick={handleAddLabel}
//                   className="px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
//                 >
//                   Add
//                 </button>
//               </div>

//               {formData.labels.length > 0 && (
//                 <div className="flex flex-wrap gap-2 p-3 bg-emerald-50 dark:bg-emerald-955/20 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
//                   {formData.labels.map((label) => (
//                     <span
//                       key={label}
//                       className="inline-flex items-center gap-2 bg-white dark:bg-slate-950 rounded-full px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shadow-sm"
//                     >
//                       #{label}
//                       <button
//                         type="button"
//                         onClick={() => handleRemoveLabel(label)}
//                         className="hover:text-emerald-900 dark:hover:text-emerald-300 font-bold"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-6 sticky bottom-0 bg-white dark:bg-slate-900 z-10">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-850 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30 dark:shadow-indigo-950/20"
//             >
//               {loading && <Loader className="h-4 w-4 animate-spin" />}
//               {loading ? "Saving..." : isEditMode ? "Update Project" : "Create Project"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ProjectFormModal;
