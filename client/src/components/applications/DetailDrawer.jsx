import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  updateApplication,
  deleteApplication,
  addNote,
  deleteNote,
  getApplications,
} from "../../api/applications.js";
import { getMatchScore } from "../../api/ai.js";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

const statusColors = {
  Saved: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Interview:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Offer: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const DetailDrawer = ({ application, onClose }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState({});
  const [newNote, setNewNote] = useState("");
  const [isGettingScore, setIsGettingScore] = useState(false);
  const queryClient = useQueryClient();

  // Live data from React Query cache
  const { data: applications } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await getApplications();
      return res.data.data;
    },
  });
  const liveApp =
    applications?.find((a) => a._id === application._id) || application;

  useEffect(() => {
    if (application) {
      setForm({
        company: application.company || "",
        role: application.role || "",
        status: application.status || "Applied",
        jobUrl: application.jobUrl || "",
        location: application.location || "",
        jobType: application.jobType || "",
        priority: application.priority || "Medium",
        salaryMin: application.salary?.min || "",
        salaryMax: application.salary?.max || "",
        jobDescription: application.jobDescription || "",
        deadline: application.deadline
          ? new Date(application.deadline).toISOString().split("T")[0]
          : "",
      });
    }
  }, [application]);

  const { mutate: saveApp, isPending: isSaving } = useMutation({
    mutationFn: () =>
      updateApplication(application._id, {
        ...form,
        salary: {
          min: form.salaryMin !== '' && form.salaryMin !== undefined ? Number(form.salaryMin) : undefined,
          max: form.salaryMax !== '' && form.salaryMax !== undefined ? Number(form.salaryMax) : undefined,
          currency: "USD",
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
      toast.success("Saved!");
    },
    onError: () => toast.error("Failed to save"),
  });

  const { mutate: removeApp } = useMutation({
    mutationFn: () => deleteApplication(application._id),
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
      toast.success("Application deleted");
      onClose();
    },
    onError: () => toast.error("Failed to delete"),
  });

  const { mutate: submitNote } = useMutation({
    mutationFn: () => addNote(application._id, newNote),
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
      setNewNote("");
      toast.success("Note added");
    },
    onError: () => toast.error("Failed to add note"),
  });

  const { mutate: removeNote } = useMutation({
    mutationFn: (noteId) => deleteNote(application._id, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
      toast.success("Note deleted");
    },
    onError: () => toast.error("Failed to delete note"),
  });

  const handleGetMatchScore = async () => {
    setIsGettingScore(true);
    try {
      await getMatchScore(application._id);
      queryClient.invalidateQueries(["applications"]);
      toast.success("Match score generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to get match score");
    } finally {
      setIsGettingScore(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Delete this application?")) removeApp();
  };

  if (!application) return null;

  const tabs = ["details", "notes", "ai"];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg z-50 bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {application.company}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {application.role}
            </p>
            <span
              className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[liveApp.status]}`}
            >
              {liveApp.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab === "ai" ? "✨ AI Match" : tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Location
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Job Type
                  </label>
                  <select
                    value={form.jobType}
                    onChange={(e) =>
                      setForm({ ...form, jobType: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">Select type</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Salary Min
                  </label>
                  <input
                      type="number"
                      min="0"
                      value={form.salaryMin}
                      onChange={e => setForm({ ...form, salaryMin: e.target.value })}
                      placeholder="80000"
                      className={inputClass}
                      onKeyDown={e => {
                        if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault()
                      }}
                   />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Salary Max
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.salaryMax}
                    onChange={e => setForm({ ...form, salaryMax: e.target.value })}
                    placeholder="120000"
                    className={inputClass}
                    onKeyDown={e => {
                      if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault()
                    }}
                   />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Job URL
                  </label>
                  <input
                    value={form.jobUrl}
                    onChange={(e) =>
                      setForm({ ...form, jobUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className={inputClass}
                  />
                  {form.jobUrl && (
                    <a
                      href={form.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                    >
                      View Job Posting →
                    </a>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Job Description
                </label>
                <textarea
                  value={form.jobDescription}
                  onChange={(e) =>
                    setForm({ ...form, jobDescription: e.target.value })
                  }
                  placeholder="Paste the job description here..."
                  rows={5}
                  className={inputClass + " resize-none"}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleDelete}
                  className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Delete Application
                </button>
                <button
                  onClick={saveApp}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className={inputClass + " resize-none"}
                />
                <button
                  onClick={() => {
                    if (!newNote.trim()) return;
                    submitNote();
                  }}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Add Note
                </button>
              </div>

              <div className="space-y-3">
                {liveApp.notes?.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                    No notes yet
                  </p>
                )}
                {liveApp.notes?.map((note) => (
                  <div
                    key={note._id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        onClick={() => removeNote(note._id)}
                        className="text-xs text-red-400 hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Match Tab */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              {liveApp.matchScore !== null &&
              liveApp.matchScore !== undefined ? (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-blue-500 mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {liveApp.matchScore}%
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Resume Match Score
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700 mb-4">
                    <span className="text-gray-400 text-2xl">?</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No match score yet
                  </p>
                </div>
              )}

              <button
                onClick={handleGetMatchScore}
                disabled={isGettingScore}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                {isGettingScore ? "Analyzing..." : "✨ Get Match Score"}
              </button>

              {liveApp.matchFeedback?.strengths?.length > 0 && (
                <div className="space-y-4 mt-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                      ✅ Strengths
                    </h4>
                    <ul className="space-y-1">
                      {liveApp.matchFeedback.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="text-sm text-green-700 dark:text-green-300"
                        >
                          • {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                    <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                      ❌ Gaps
                    </h4>
                    <ul className="space-y-1">
                      {liveApp.matchFeedback.gaps.map((g, i) => (
                        <li
                          key={i}
                          className="text-sm text-red-700 dark:text-red-300"
                        >
                          • {g}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                      💡 Tips
                    </h4>
                    <ul className="space-y-1">
                      {liveApp.matchFeedback.tips.map((t, i) => (
                        <li
                          key={i}
                          className="text-sm text-blue-700 dark:text-blue-300"
                        >
                          • {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {!liveApp.jobDescription && (
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
                  Add a job description in the Details tab to enable AI matching
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DetailDrawer;