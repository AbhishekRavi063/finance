import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // Added to handle reauthentication
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const router = useRouter();

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
            alert("Password updated successfully!");
          } catch (err) {
            setModalMessage("Reauthentication failed. Please try again.");
            setIsModalOpen(true);
            return;
          }
        } else if (newPassword && !isEmailProvider) {
          setModalMessage("Password update is only available for email/password users.");
          setIsModalOpen(true);
          return;
        }

        alert("Profile updated successfully!");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white mt-10">
      <div className="lg:flex">
        <Sidebar />
        <div className="lg:w-3/4 w-full p-6 bg-gray-800 rounded-lg max-w-4xl mx-auto mt-10 lg:mt-0">
          <h1 className="text-2xl font-bold mb-6">Update Profile</h1>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 p-3 w-full bg-gray-700 text-white rounded-md"
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
                className="mt-1 p-3 w-full bg-gray-700 text-white rounded-md"
                disabled
              />
            </div>

            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 p-3 w-full bg-gray-700 text-white rounded-md"
                placeholder="Enter your current password"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 p-3 w-full bg-gray-700 text-white rounded-md"
                placeholder="Enter a new password (optional)"
              />
            </div>

            <div className="mb-4">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{modalMessage}</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
