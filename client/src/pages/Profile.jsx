import { useState } from "react"; // removed useEffect
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import { getMe, updateProfile } from "../api/auth.js";
import { getApplications } from "../api/applications.js";

// Time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

// Avatar initials from name
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ← Avatar color options
const COLOR_OPTIONS = [
  {
    id: "blue",
    label: "Blue",
    avatar: "bg-blue-600",
    banner: "bg-gradient-to-r from-blue-600 to-blue-400",
  },
  {
    id: "violet",
    label: "Violet",
    avatar: "bg-violet-600",
    banner: "bg-gradient-to-r from-violet-600 to-purple-400",
  },
  {
    id: "rose",
    label: "Rose",
    avatar: "bg-rose-600",
    banner: "bg-gradient-to-r from-rose-600 to-pink-400",
  },
  {
    id: "amber",
    label: "Amber",
    avatar: "bg-amber-500",
    banner: "bg-gradient-to-r from-amber-500 to-yellow-400",
  },
  {
    id: "emerald",
    label: "Emerald",
    avatar: "bg-emerald-600",
    banner: "bg-gradient-to-r from-emerald-600 to-teal-400",
  },
  {
    id: "cyan",
    label: "Cyan",
    avatar: "bg-cyan-600",
    banner: "bg-gradient-to-r from-cyan-600 to-sky-400",
  },
  {
    id: "orange",
    label: "Orange",
    avatar: "bg-orange-600",
    banner: "bg-gradient-to-r from-orange-600 to-amber-400",
  },
  {
    id: "slate",
    label: "Slate",
    avatar: "bg-slate-700",
    banner: "bg-gradient-to-r from-slate-700 to-slate-500",
  },
  {
    id: "sunset",
    label: "Sunset",
    avatar: "bg-rose-500",
    banner: "bg-gradient-to-r from-rose-500 via-orange-400 to-yellow-400",
  },
  {
    id: "ocean",
    label: "Ocean",
    avatar: "bg-blue-700",
    banner: "bg-gradient-to-r from-blue-700 via-cyan-500 to-teal-400",
  },
  {
    id: "aurora",
    label: "Aurora",
    avatar: "bg-purple-600",
    banner: "bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400",
  },
  {
    id: "forest",
    label: "Forest",
    avatar: "bg-green-700",
    banner: "bg-gradient-to-r from-green-700 via-emerald-500 to-teal-400",
  },
];

const getColorClasses = (colorId) => {
  return COLOR_OPTIONS.find((c) => c.id === colorId) || COLOR_OPTIONS[0];
};

const Profile = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await getMe();
      return res.data.user;
    },
  });

  const { data: applications } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await getApplications();
      return res.data.data;
    },
  });

  // Derive form values directly
  const formValues = form ?? {
    name: userData?.name || "",
    username: userData?.username || "",
    bio: userData?.bio || "",
    location: userData?.location || "",
    avatarColor: userData?.avatarColor || "blue",
  };

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: () => updateProfile(formValues),
    onSuccess: (res) => {
      queryClient.setQueryData(["user"], res.data.user);
      toast.success("Profile updated!");
      setIsEditing(false);
      setForm(null);
    },
    onError: () => toast.error("Failed to update profile"),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  // Stats
  const total = applications?.length || 0;
  const offers = applications?.filter((a) => a.status === "Offer").length || 0;
  const interviews =
    applications?.filter((a) => a.status === "Interview").length || 0;

  const displayName = userData?.username || userData?.name || "User";
  const initials = getInitials(formValues.name || userData?.name);
  const joinDate = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";
  const authMethod = userData?.googleId ? "Google" : "Email & Password";

  const currentColor = getColorClasses(
    isEditing ? formValues.avatarColor : userData?.avatarColor || "blue",
  );

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getGreeting()},
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {displayName} 👋
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
          <div
            className={`h-24 transition-all duration-300 ${currentColor.banner}`}
          />

          {/* Avatar + Edit */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div
                className={`w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-md transition-all duration-300 ${currentColor.avatar}`}
              >
                <span className="text-2xl font-bold text-white">
                  {initials}
                </span>
              </div>

              {/* Edit & Save buttons */}
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setForm(null); // (reset to derived state on cancel)
                    }}
                    className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveProfile()}
                    disabled={isPending}
                    className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-4">
                {/* Color Picker */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Profile Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() =>
                          setForm({ ...formValues, avatarColor: color.id })
                        }
                        className={`w-8 h-8 rounded-lg transition-all ${color.avatar} ${
                          formValues.avatarColor === color.id
                            ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900 scale-110"
                            : "hover:scale-105"
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                    Selected: {getColorClasses(formValues.avatarColor).label} —
                    preview updates live above
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Full Name
                    </label>
                    <input
                      value={formValues.name}
                      onChange={(e) =>
                        setForm({ ...formValues, name: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Username
                    </label>
                    <input
                      value={formValues.username}
                      onChange={(e) =>
                        setForm({ ...formValues, username: e.target.value })
                      }
                      className={inputClass}
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Location
                  </label>
                  <input
                    value={formValues.location}
                    onChange={(e) =>
                      setForm({ ...formValues, location: e.target.value })
                    }
                    className={inputClass}
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Bio{" "}
                    <span className="text-gray-400">
                      ({formValues.bio.length}/200)
                    </span>
                  </label>
                  <textarea
                    value={formValues.bio}
                    onChange={(e) =>
                      setForm({ ...formValues, bio: e.target.value })
                    }
                    maxLength={200}
                    rows={3}
                    className={inputClass + " resize-none"}
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
              </div>
            ) : (
              /* View Mode */
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {userData?.name}
                </h2>
                {userData?.username && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">
                    @{userData.username}
                  </p>
                )}
                {userData?.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {userData.location}
                  </p>
                )}
                {userData?.bio ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                    {userData.bio}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-3 italic">
                    No bio yet — click Edit Profile to add one
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Applications", value: total },
            {
              label: "Interviews",
              value: interviews,
              color: "text-yellow-500",
            },
            { label: "Offers", value: offers, color: "text-green-500" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 text-center"
            >
              <p
                className={`text-2xl font-bold ${stat.color || "text-gray-900 dark:text-white"}`}
              >
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Account Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Account Info
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Email
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {userData?.email}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Signed in with
              </span>
              <span className="text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                {userData?.googleId && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {authMethod}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Member since
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {joinDate}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Resume
              </span>
              <span
                className={`text-sm font-medium ${userData?.resumeUploadedAt ? "text-green-500" : "text-gray-400 dark:text-gray-500"}`}
              >
                {userData?.resumeUploadedAt
                  ? `Updated ${new Date(userData.resumeUploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  : "Not uploaded"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;