import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext"; // Import authentication hook
import Sidebar from "./Sidebar";
import { CircularProgress } from "@mui/material";

export default function Layout({ children }) {
  const { user, loading } = useAuth(); // Get the user and loading state
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login"); // Prevent back navigation to protected pages
      }
      setIsCheckingAuth(false);
    }
  }, [user, loading, router]);

  // Show loading spinner until authentication is checked
  if (loading || isCheckingAuth) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <CircularProgress size={50} className="animate-spin text-blue-500" />
        <p className="mt-4 text-gray-700 font-medium">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-darkBg">
      {/* Sidebar (Only show if user is logged in) */}
      {user && <Sidebar />}

      {/* Main Content */}
      <main
        className={`flex-1 p-6 transition-all duration-300 ${
          user ? "md:ml-64" : "" // Adjust spacing if Sidebar is shown
        }`}
      >
        {children}
      </main>
    </div>
  );
}
