"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartBar,
  FaWallet,
  FaBalanceScale,
  FaFileAlt,
  FaUser,
  FaBars,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start with the sidebar closed for mobile

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
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

  return (
    <div className="flex">
      {/* Sidebar */}

      {/* Profile Section */}
      <aside
        className={`w-64  bg-gray-800 p-6 flex flex-col min-h-screen fixed top-0 left-0 z-50  transition-all duration-300
          ${
            sidebarOpen ? "block" : "hidden"
          } md:block md:w-64 md:h-screen md:overflow-hidden`}
      >
        <div className="w-15 h-15 bg-gray-600 rounded-full flex items-center justify-center text-lg font-bold mt-15 ">
          {user?.displayName ? user.displayName.charAt(0) : "U"}
        </div>

        <div className="w-full max-w-xs">
          <h2 className="text-lg font-semibold text-white break-words mt-5">
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
                    ? "bg-gray-700 text-white"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              {item.icon} <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        {user && (
          <button
            onClick={handleLogout}
            className="mt-10 bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition cursor-pointer"
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
      >
        {/* Content goes here */}
      </div>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`md:hidden p-4 text-white 
    ${
      sidebarOpen
        ? "bg-gray-600 hover:bg-blue-700"
        : "bg-blue-800 hover:bg-gray-700"
    } 
    fixed top-4 left-4 z-50`}
      >
        <FaBars />
      </button>
    </div>
  );
}
