"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartBar, FaWallet, FaBalanceScale, FaFileAlt, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

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
    { name: "Reports", href: "/reports", icon: <FaFileAlt /> },
    { name: "Settings", href: "/settings", icon: <FaCog /> },
  ];

  return (
    <aside className="w-64 bg-gray-800 p-6 flex flex-col min-h-screen">
      {/* Profile Section */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-lg font-bold">
          {user?.displayName ? user.displayName.charAt(0) : "U"}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            {user?.displayName || "Guest"}
          </h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>
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
          className="mt-6 bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition cursor-pointer"
        >
          Logout
        </button>
      )}
    </aside>
  );
}
