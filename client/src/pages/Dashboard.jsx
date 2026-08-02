import Layout from "../components/layout/Layout.jsx";
import { useQuery } from "@tanstack/react-query";
import { getStats, getApplications } from "../api/applications.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Colors for donut chart
const STATUS_COLORS = {
  Saved: "#9ca3af",
  Applied: "#3b82f6",
  Interview: "#eab308",
  Offer: "#22c55e",
  Rejected: "#ef4444",
};

// Stat card component
const StatCard = ({ label, value, sub, color }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p
      className={`text-3xl font-bold mt-1 ${color || "text-gray-900 dark:text-white"}`}
    >
      {value}
    </p>
    {sub && (
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
    )}
  </div>
);

const Dashboard = () => {
  const now = new Date();
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await getStats();
      return res.data.data;
    },
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await getApplications();
      return res.data.data;
    },
  });

  if (statsLoading || appsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const total = statsData?.total || 0;
  const byStatus = statsData?.byStatus || [];
  const upcoming =
    applications
      ?.filter((app) => app.deadline && new Date(app.deadline) >= now)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)) || [];

  // Calculate stats from byStatus array
  const getCount = (status) =>
    byStatus.find((s) => s._id === status)?.count || 0;

  const interviews = getCount("Interview");
  const offers = getCount("Offer");
  const rejected = getCount("Rejected");
  // const applied = getCount('Applied')

  // Response rate = those moved past Applied stage
  const responded = interviews + offers + rejected;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  // Rejection rate
  const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

  // Applications this week
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek =
    applications?.filter((app) => new Date(app.createdAt) >= oneWeekAgo)
      .length || 0;

  // Bar chart data  (applications per week for last 6 weeks)
  const getWeekLabel = (weeksAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - weeksAgo * 7);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const weeklyData = Array.from({ length: 6 }, (_, i) => {
    const weeksAgo = 5 - i;
    const weekStart = new Date(
      now.getTime() - (weeksAgo + 1) * 7 * 24 * 60 * 60 * 1000,
    );
    const weekEnd = new Date(
      now.getTime() - weeksAgo * 7 * 24 * 60 * 60 * 1000,
    );
    const count =
      applications?.filter((app) => {
        const created = new Date(app.createdAt);
        return created >= weekStart && created < weekEnd;
      }).length || 0;
    return { week: getWeekLabel(weeksAgo), count };
  });

  // Donut chart data
  const donutData = byStatus.map((s) => ({
    name: s._id,
    value: s.count,
  }));

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your job search at a glance
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Applications" value={total} sub="all time" />
          <StatCard
            label="Response Rate"
            value={`${responseRate}%`}
            sub="moved past Applied"
            color={responseRate >= 30 ? "text-green-500" : "text-red-500"}
          />
          <StatCard
            label="Interviews"
            value={interviews}
            sub={`${offers} offer${offers !== 1 ? "s" : ""}`}
            color="text-yellow-500"
          />
          <StatCard
            label="This Week"
            value={thisWeek}
            sub="applications added"
            color="text-blue-500"
          />
          <StatCard
            label="Rejection Rate"
            value={`${rejectionRate}%`}
            sub={`${rejected} rejected`}
            color={
              rejectionRate >= 50
                ? "text-red-500"
                : "text-gray-900 dark:text-white"
            }
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Bar Chart covers 2/3 width */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Applications Per Week
            </h2>
            {applications?.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
                No applications yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData} barSize={32}>
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#f9fafb",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "rgba(59,130,246,0.08)" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Donut Chart covers 1/3 width */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Status Breakdown
            </h2>
            {donutData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || "#9ca3af"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#f9fafb",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: "#9ca3af", fontSize: "11px" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Upcoming Deadlines
            <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
              next 7 days
            </span>
          </h2>

          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              No upcoming deadlines
            </p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((app) => {
                const daysLeft = Math.ceil(
                  (new Date(app.deadline) - new Date()) / (1000 * 60 * 60 * 24),
                );
                return (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {app.company}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {app.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          daysLeft <= 2
                            ? "text-red-500"
                            : daysLeft <= 5
                              ? "text-yellow-500"
                              : "text-green-500"
                        }`}
                      >
                        {daysLeft === 0
                          ? "Due today"
                          : daysLeft === 1
                            ? "Tomorrow"
                            : `${daysLeft} days left`}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {new Date(app.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;