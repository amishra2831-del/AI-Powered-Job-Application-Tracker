import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useDarkMode } from "../../hooks/useDarkMode.js";
import toast from "react-hot-toast";

const DarkModeToggle = ({ toggle, isDark }) => (
  <button
    onClick={toggle}
    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  >
    {isDark ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707.707M6.343 6.343l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        />
      </svg>
    )}
  </button>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
        Job Tracker
      </Link>

      {user ? (
        <>
          {/* Center — nav links with active highlight */}
          <div className="flex items-center gap-6">
            <Link
              to="/board"
              className={`text-sm font-medium transition-colors ${
                isActive("/board")
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Track
            </Link>
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors ${
                isActive("/dashboard")
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/resume"
              className={`text-sm font-medium transition-colors ${
                isActive("/resume")
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Resume
            </Link>
            <Link
              to="/profile"
              className={`text-sm font-medium transition-colors ${
                isActive("/profile")
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Profile
            </Link>
          </div>

          {/* Right — dark mode + user + logout */}
          <div className="flex items-center gap-4">
            <DarkModeToggle toggle={toggle} isDark={isDark} />
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <DarkModeToggle toggle={toggle} isDark={isDark} />
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get Started →
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;