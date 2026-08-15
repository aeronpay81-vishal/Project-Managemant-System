import { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Loader,
  Briefcase,
  Flag,
  Calendar,
  FileText,
  Tag,
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
} from "lucide-react";

const ProjectFormModal = ({ isOpen, isEditMode, editingProject, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    priority: "medium",
    status: "open",
    labels: [],
    due_date: "",
    start_date: "",
    reporter: "",
    attachment: null,
  });

  const [loading, setLoading] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [error, setError] = useState("");
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [showSummaryLimitPopup, setShowSummaryLimitPopup] = useState(false);

  const popupTimeoutRef = useRef(null);

  const MAX_SUMMARY_LENGTH = 255;

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
    console.log("📝 ProjectFormModal useEffect triggered:", {
      isEditMode,
      isOpen,
      editingProject,
      editingProjectId: editingProject?.id
    });

    if (isEditMode && editingProject) {
      console.log("✅ Populating form with editing project:", editingProject);
      // Parse labels safely
      let labelsList = [];
      if (editingProject.labels) {
        if (typeof editingProject.labels === "string") {
          labelsList = editingProject.labels.split(",").map((l) => l.trim()).filter(l => l);
        } else if (Array.isArray(editingProject.labels)) {
          labelsList = editingProject.labels;
        }
      }

      // Store existing attachment info
      setExistingAttachment(editingProject.attachment || null);

      setFormData({
        summary: editingProject.summary || "",
        description: editingProject.description || "",
        priority: (editingProject.priority || "medium").toLowerCase(),
        status: (editingProject.status || "open").toLowerCase(),
        labels: labelsList,
        due_date: formatDateForInput(editingProject.due_date),
        start_date: formatDateForInput(editingProject.start_date),
        reporter: editingProject.reporter || "",
        attachment: null,
      });
    } else {
      console.log("➕ Resetting form for create mode");
      setExistingAttachment(null);
      setFormData({
        summary: "",
        description: "",
        priority: "medium",
        status: "open",
        labels: [],
        due_date: "",
        start_date: "",
        reporter: "",
        attachment: null,
      });
    }
    setError("");
  }, [isEditMode, editingProject, isOpen]);

  // Clean up popup timeout on unmount
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

    // Explicit length validation for the summary field (covers paste too,
    // not just typing, since maxLength alone can be bypassed in some cases)
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type - only PDF allowed
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setError("Only PDF files are allowed");
        return;
      }

      // Validate file size - max 10MB
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
      setError(""); // Clear any previous errors
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      attachment: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.summary.trim()) {
      setError("Project name/summary is required");
      return;
    }

    if (formData.summary.trim().length > MAX_SUMMARY_LENGTH) {
      triggerSummaryLimitPopup();
      setError(`Project name cannot exceed ${MAX_SUMMARY_LENGTH} characters`);
      return;
    }

    if (!formData.start_date) {
      setError("Start date is required");
      return;
    }

    if (!formData.due_date) {
      setError("Due date is required");
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.due_date)) {
      setError("Start date must be before due date");
      return;
    }

    setLoading(true);

    try {
      let submitData;
      let useFormData = false;

      // If there's a file attachment, use FormData
      if (formData.attachment) {
        useFormData = true;
        submitData = new FormData();
        submitData.append("summary", formData.summary.trim());
        submitData.append("description", formData.description.trim());
        submitData.append("priority", formData.priority.toLowerCase());
        submitData.append("status", formData.status.toLowerCase());
        submitData.append("labels", JSON.stringify(formData.labels.length > 0 ? formData.labels : []));
        submitData.append("due_date", new Date(formData.due_date).toISOString());
        submitData.append("start_date", new Date(formData.start_date).toISOString());
        submitData.append("reporter", formData.reporter.trim() || null);
        submitData.append("attachment", formData.attachment); // File object
      } else {
        // Regular JSON submission
        submitData = {
          summary: formData.summary.trim(),
          description: formData.description.trim(),
          priority: formData.priority.toLowerCase(),
          status: formData.status.toLowerCase(),
          labels: formData.labels.length > 0 ? formData.labels : [],
          due_date: new Date(formData.due_date).toISOString(),
          start_date: new Date(formData.start_date).toISOString(),
          reporter: formData.reporter.trim() || null,
          attachment: null,
        };
      }

      // Call onSubmit callback with the data and useFormData flag
      await onSubmit(submitData, useFormData);
      // Form closing is handled by parent component (Dashboard)
    } catch (err) {
      // If onSubmit throws an error, display it
      const errorMessage = err instanceof Error ? err.message : (err?.message || "Failed to save project");
      setError(errorMessage);
      console.error("Form submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isEditMode ? "Edit Project" : "Create Project"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditMode
                  ? "Update project details"
                  : "Set up your new project with all details"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="flex gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                Basic Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project Name *
                <span className="text-xs text-slate-500 font-normal ml-1">
                  (Required - max {MAX_SUMMARY_LENGTH} characters)
                </span>
              </label>

              <div className="relative">
                {/* Popup message shown when the limit is exceeded */}
                {showSummaryLimitPopup && (
                  <div
                    role="alert"
                    className="absolute bottom-full left-0 mb-2 z-10 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white shadow-lg"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Project name can't be more than {MAX_SUMMARY_LENGTH} characters
                    </span>
                    <span className="absolute top-full left-6 h-2 w-2 rotate-45 bg-red-600" />
                  </div>
                )}

                <input
                  type="text"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="e.g., Website Redesign, Mobile App v2"
                  className={`w-full px-4 py-3 rounded-lg border text-slate-900 placeholder-slate-400 focus:ring-2 transition-all ${
                    showSummaryLimitPopup
                      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
                  }`}
                />
              </div>

              <p
                className={`text-xs mt-1 ${
                  formData.summary.length >= MAX_SUMMARY_LENGTH
                    ? "text-red-600 font-semibold"
                    : "text-slate-500"
                }`}
              >
                {formData.summary.length}/{MAX_SUMMARY_LENGTH} characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
                <span className="text-xs text-slate-500 font-normal ml-1">
                  (Optional)
                </span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project goals, scope, and key requirements..."
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
              />
            </div>
          </div>

          {/* Priority & Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Flag className="h-5 w-5 text-orange-600" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                Priority & Status
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Priority *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium"
                >
                  <option value="open">📋 Open</option>
                  <option value="in_progress">⚙️ In Progress</option>
                  <option value="review">🔍 Review</option>
                  <option value="active">✨ Active</option>
                  <option value="on_hold">⏸️ On Hold</option>
                  <option value="closed">✅ Closed</option>
                  <option value="completed">🎉 Completed</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                Timeline
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>
            </div>

            {formData.start_date && formData.due_date && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900">
                  <strong>Duration:</strong>{" "}
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(formData.due_date) -
                        new Date(formData.start_date)) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}{" "}
                  days
                </p>
              </div>
            )}
          </div>

          {/* Reporter */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <FileText className="h-5 w-5 text-violet-600" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                Details
              </h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Reporter/Owner
                <span className="text-xs text-slate-500 font-normal ml-1">
                  (Optional - who reported this project)
                </span>
              </label>
              <input
                type="text"
                name="reporter"
                value={formData.reporter}
                onChange={handleChange}
                placeholder="e.g., John Doe, john@example.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
          </div>

          {/* File Attachment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Upload className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                Project Attachment
              </h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Upload PDF File
                <span className="text-xs text-slate-500 font-normal ml-1">
                  (Optional - PDF only, max 10MB)
                </span>
              </label>

              {formData.attachment ? (
                // New file selected
                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formData.attachment.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(formData.attachment.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : existingAttachment && isEditMode ? (
                // Existing file in edit mode
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {existingAttachment}
                        </p>
                        <p className="text-xs text-slate-500">
                          Uploaded file
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/uploads/projects/${existingAttachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <a
                        href={`/uploads/projects/${existingAttachment}`}
                        download
                        className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                      Replace with new file
                    </summary>
                    <div className="mt-3">
                      <label className="flex flex-col items-center justify-center w-full px-4 py-6 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 hover:border-indigo-400 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 mb-2">
                            <Upload className="h-5 w-5 text-indigo-600" />
                          </div>
                          <p className="text-xs font-semibold text-slate-900">
                            Drop new PDF here or click to browse
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </details>
                </div>
              ) : (
                // Upload area for new file or when no existing file
                <label className="flex flex-col items-center justify-center w-full px-4 py-8 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 hover:border-indigo-400 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 mb-3">
                      <Upload className="h-6 w-6 text-indigo-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      Drop your PDF here or click to browse
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF files up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Tag className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                Labels & Tags
              </h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Add Labels
                <span className="text-xs text-slate-500 font-normal ml-1">
                  (Optional)
                </span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddLabel()}
                  placeholder="e.g., frontend, urgent, Q1-2024"
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddLabel}
                  className="px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {formData.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  {formData.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 bg-white rounded-full px-3 py-1.5 text-sm font-medium text-emerald-700 border border-emerald-300 shadow-sm"
                    >
                      #{label}
                      <button
                        type="button"
                        onClick={() => handleRemoveLabel(label)}
                        className="hover:text-emerald-900 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-6 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30"
            >
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              {loading ? "Saving..." : isEditMode ? "Update Project" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;
