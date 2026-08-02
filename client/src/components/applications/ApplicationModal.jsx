import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createApplication } from "../../api/applications.js";
import { parseJob } from "../../api/ai.js";

const schema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Job role is required"),
  status: z.string().default("Applied"),
  jobUrl: z.string().optional(),
  location: z.string().optional(),
  jobType: z.string().optional(),
  priority: z.string().default("Medium"),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  jobDescription: z.string().optional(),
});

const InputField = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

const ApplicationModal = ({ onClose }) => {
  const [isParsing, setIsParsing] = useState(false);
  const [jobDesc, setJobDesc] = useState("");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "Applied",
      priority: "Medium",
    },
  });

  // Send job description to AI parser, can auto fill the form fields
  const handleParseJob = async () => {
    if (!jobDesc.trim()) {
      toast.error("Please paste a job description first");
      return;
    }
    setIsParsing(true);
    try {
      const res = await parseJob(jobDesc);
      const data = res.data.data;

      if (data.company) setValue("company", data.company);
      if (data.role) setValue("role", data.role);
      if (data.location) setValue("location", data.location);
      if (data.jobType) setValue("jobType", data.jobType);
      if (data.salaryMin) setValue("salaryMin", String(data.salaryMin));
      if (data.salaryMax) setValue("salaryMax", String(data.salaryMax));
      setValue("jobDescription", jobDesc);

      toast.success("Job description parsed and saved!");
    } catch {
      toast.error("Failed to parse job description.");
    } finally {
      setIsParsing(false);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data) =>
      createApplication({
        ...data,
        salary: {
          min: data.salaryMin !== '' && data.salaryMin !== undefined ? Number(data.salaryMin) : undefined,
          max: data.salaryMax !== '' && data.salaryMax !== undefined ? Number(data.salaryMax) : undefined,
          currency: "USD",
        },
        jobDescription: data.jobDescription || jobDesc,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
      toast.success("Application added!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to add application");
    },
  });

  const onSubmit = (data) => mutate(data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Application
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* AI Parser Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                ✨ AI Job Parser
              </span>
              <span className="text-xs text-blue-500 dark:text-blue-500 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                Auto-fill form
              </span>
            </div>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste the job description here and let AI fill the form for you..."
              className="w-full px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <button
              onClick={handleParseJob}
              disabled={isParsing}
              className="mt-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isParsing ? "Parsing..." : "Parse & Auto-fill"}
            </button>
          </div>

          {/* Form */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Company *" error={errors.company?.message}>
              <input
                {...register("company")}
                placeholder="Google"
                className={inputClass}
              />
            </InputField>

            <InputField label="Role *" error={errors.role?.message}>
              <input
                {...register("role")}
                placeholder="Frontend Developer"
                className={inputClass}
              />
            </InputField>

            <InputField label="Status">
              <select {...register("status")} className={inputClass}>
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </InputField>

            <InputField label="Priority">
              <select {...register("priority")} className={inputClass}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </InputField>

            <InputField label="Location">
              <input
                {...register("location")}
                placeholder="Remote / New York"
                className={inputClass}
              />
            </InputField>

            <InputField label="Job Type">
              <select {...register("jobType")} className={inputClass}>
                <option value="">Select type</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </InputField>

            <InputField label="Job URL">
              <input
                {...register("jobUrl")}
                placeholder="https://..."
                className={inputClass}
              />
            </InputField>

            <InputField label="Applied Date">
              <input
                {...register("appliedDate")}
                type="date"
                className={inputClass}
              />
            </InputField>

            <InputField label="Salary Min">
              <input
                {...register('salaryMin')}
                type="number"
                min="0"
                placeholder="80000"
                className={inputClass}
                onKeyDown={e => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault()
                }}
              />
            </InputField>

            <InputField label="Salary Max">
              <input
                {...register('salaryMax')}
                type="number"
                min="0"
                placeholder="120000"
                className={inputClass}
                onKeyDown={e => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault()
                }}
              />
            </InputField>
          </div>
          {/* Job Description, auto filled by AI parser, editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job Description
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 font-normal">
                used for AI match scoring
              </span>
            </label>
            <textarea
              {...register("jobDescription")}
              rows={4}
              placeholder="Auto-filled when you parse a job description above..."
              className={inputClass + " resize-none"}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            {isPending ? "Adding application..." : "Add Application"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;