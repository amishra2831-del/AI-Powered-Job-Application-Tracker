import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Set cookie via backend using the token
    axios
      .post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/set-cookie`,
        { token },
        { withCredentials: true },
      )
      .then((res) => {
        queryClient.setQueryData(["user"], res.data.user);
        navigate("/board");
      })
      .catch(() => {
        navigate("/login?error=google_failed");
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Signing you in...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;