"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartBar,
  FaWallet,
  FaBalanceScale,
  FaUser,
  FaBars,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import useStore from "../app/store/useStore"; // Import Zustand store

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useStore((state) => state.user);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const setDarkMode = useStore((state) => state.setDarkMode);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);

  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar open/close state

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        useStore.getState().setUser(user); // Update Zustand state with the user
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <FaChartBar /> },
    { name: "Transactions", href: "/transactions", icon: <FaWallet /> },
    { name: "Net Worth", href: "/networth", icon: <FaBalanceScale /> },
    { name: "Profile", href: "/profile", icon: <FaUser /> },
  ];

  // Use Zustand's toggleDarkMode function
  const handleDarkModeToggle = () => {
    toggleDarkMode();
    localStorage.setItem("darkMode", !isDarkMode); // Save preference in localStorage
  };

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
    }
  }, [setDarkMode]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside
        className={`w-64 ${
          isDarkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"
        } p-6 flex flex-col min-h-screen fixed top-0 left-0 z-50 transition-all duration-300
          ${sidebarOpen ? "block" : "hidden"} md:block md:w-64 md:h-screen md:overflow-hidden`}
      >
        {/* User Icon */}
        <div
          className={`w-16 h-16 ${
            isDarkMode ? "bg-gray-700" : "bg-gray-300"
          } rounded-full flex items-center justify-center text-lg font-bold mt-15`}
        >
          {user?.displayName ? user.displayName.charAt(0) : "U"}
        </div>

        <div className="w-full max-w-xs">
          <h2 className="text-lg font-semibold break-words mt-5">
            {user?.displayName || "Guest"}
          </h2>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 py-2 px-3 rounded-md transition
                ${
                  pathname === item.href
                    ? isDarkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-300 text-black"
                    : isDarkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-300 text-gray-800"
                }`}
            >
              {item.icon} <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Dark Mode Toggle */}
        <button
          onClick={handleDarkModeToggle}
          className={`mt-6 p-2 rounded-md flex cursor-pointer items-center transition ${
            isDarkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-300 text-black hover:bg-gray-400 "
          }`}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
          <span className="ml-2">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* Logout Button */}
        {user && (
          <button
            onClick={handleLogout}
            className="mt-6 bg-red-600 px-8 py-2 rounded-md hover:bg-red-700 transition cursor-pointer"
          >
            Logout
          </button>
        )}
      </aside>

      {/* Main content container */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        } md:ml-64`}
      ></div>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`md:hidden p-4 rounded-full text-white fixed top-4 left-4 z-50 transition ${
          sidebarOpen
            ? isDarkMode
              ? "bg-gray-400 hover:bg-gray-500"
              : "bg-gray-700 hover:bg-gray-600"
            : isDarkMode
            ? "bg-blue-800 hover:bg-blue-600"
            : "bg-gray-800 hover:bg-gray-700"
        }`}
      >
        <FaBars />
      </button>
    </div>
  );
}
