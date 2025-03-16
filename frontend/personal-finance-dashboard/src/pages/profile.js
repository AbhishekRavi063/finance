import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import Snackbar from "@mui/material/Snackbar";  // Material UI Snackbar for pop-up
import MuiAlert from "@mui/material/Alert";  // Material UI Alert for success message
import useStore from '../app/store/useStore';  // Import Zustand store


export default function Profile() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // Added to handle reauthentication
  const [error, setError] = useState(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false); // Snackbar state for success message
  const [modalMessage, setModalMessage] = useState("");
  const router = useRouter();

  const { isDarkMode, setDarkMode } = useStore(); // Zustand state

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode); // Toggle between true (dark mode) and false (light mode)
  };


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setDisplayName(user.displayName || "");
        setEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (user) {
      try {
        // Update display name if changed
        if (displayName !== user.displayName) {
          await updateProfile(user, { displayName });
        }

        // Check if user is using email/password authentication
        const isEmailProvider = user.providerData.some(
          (provider) => provider.providerId === "password"
        );

        // Only allow password update for email/password users
        if (newPassword && isEmailProvider) {
          // Reauthenticate the user with current password before updating
          const credential = EmailAuthProvider.credential(user.email, currentPassword);

          try {
            // Reauthenticate the user
            await reauthenticateWithCredential(user, credential);

            // Now update the password
            await updatePassword(user, newPassword);
            setModalMessage("Password updated successfully!");
          } catch (err) {
            setModalMessage("Reauthentication failed. Please try again.");
            setIsSnackbarOpen(true);
            return;
          }
        } else if (newPassword && !isEmailProvider) {
          setModalMessage("Password update is only available for email/password users.");
          setIsSnackbarOpen(true);
          return;
        }

        setModalMessage("Profile updated successfully!");
        setIsSnackbarOpen(true);
        setTimeout(() => {
          router.reload(); // Refresh the page after successful update
        }, 2000); // Wait for Snackbar to show before refreshing

      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div
      className={`min-h-screen text-white  ${
        isDarkMode ? "bg-gray-800" : "bg-white text-black"
      }`}
    >
      <div className="lg:flex">
        <Sidebar />
        <div
          className={` w-full p-6 rounded-lg max-w-4xl mx-auto mt-20 lg:mt-15 ${
            isDarkMode ? "bg-gray-900 text-white" : "bg-gray-300 text-black"
          }`}
        >
          <h1 className="text-2xl font-bold mb-6">Update Profile</h1>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="mb-4">
              <label
                htmlFor="displayName"
                className="block text-sm font-medium"
              >
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`mt-1 p-3 w-full rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-black border-gray-300 border"
                }`}
                placeholder="Enter your display name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 p-3 w-full rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-black border-gray-300 border"
                }`}
                disabled
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`mt-1 p-3 w-full rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-black border-gray-300 border"
                }`}
                placeholder="Enter your current password"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`mt-1 p-3 w-full rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-black border-gray-300 border"
                }`}
                placeholder="Enter a new password (optional)"
              />
            </div>

            <div className="mb-4">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setIsSnackbarOpen(false)}
      >
        <MuiAlert
          onClose={() => setIsSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {modalMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}
