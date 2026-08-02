import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import { uploadResume } from "../api/ai.js";
import { getMe } from "../api/auth.js";

const Resume = () => {
  const [activeTab, setActiveTab] = useState("paste");
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await getMe();
      return res.data.user;
    },
  });

  const { mutate: submitResume, isPending } = useMutation({
    mutationFn: async () => {
      if (activeTab === "paste") {
        return uploadResume({ resumeText });
      } else {
        const formData = new FormData();
        formData.append("resume", file);
        return uploadResume(formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
      toast.success("Resume saved successfully!");
      setResumeText("");
      setFile(null);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          "Failed to save resume. Please try again.",
      );
    },
  });

  const handleSubmit = () => {
    if (activeTab === "paste" && !resumeText.trim()) {
      toast.error("Please paste your resume text");
      return;
    }
    if (activeTab === "upload" && !file) {
      toast.error("Please select a PDF file");
      return;
    }
    submitResume();
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Resume
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload your resume to enable AI match scoring for your applications
          </p>
        </div>

        {/* Current Resume Status */}
        <div
          className={`rounded-xl p-4 border mb-6 ${
            userData?.resumeUploadedAt
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                userData?.resumeUploadedAt
                  ? "bg-green-100 dark:bg-green-900/40"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {userData?.resumeUploadedAt ? "✅" : "📄"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {userData?.resumeUploadedAt
                  ? "Resume uploaded"
                  : "No resume uploaded yet"}
              </p>
              {userData?.resumeUploadedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Last updated{" "}
                  {new Date(userData.resumeUploadedAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Upload Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab("paste")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "paste"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Paste Text
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "upload"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Upload PDF
            </button>
          </div>

          <div className="p-6">
            {/* Paste Tab */}
            {activeTab === "paste" && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Copy and paste your resume content below
                </p>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume here — skills, experience, education, projects..."
                  rows={12}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {resumeText.length} characters
                </p>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === "upload" && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Upload your resume as a PDF file (max 5MB)
                </p>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors bg-gray-50 dark:bg-gray-800">
                  <div className="text-center">
                    <p className="text-3xl mb-2">📄</p>
                    {file ? (
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {file.name}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Click to upload PDF
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          PDF files only, max 5MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              {isPending ? "Saving..." : "Save Resume"}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
            How it works ?
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-300">
            Once uploaded, your resume is used to generate AI match scores for
            each job application. Open any application card → Go to AI Match tab
            → Get Match Score.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Resume;