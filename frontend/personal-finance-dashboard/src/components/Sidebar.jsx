"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartBar, FaWallet, FaBalanceScale, FaFileAlt, FaCog, FaSignOutAlt } from "react-icons/fa";

export default function Sidebar() {
  const pathname = usePathname(); // ✅ Correct way to get current path

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
          AB
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">abhishek1</h2>
          <p className="text-gray-400 text-sm">ID: 4</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center space-x-3 py-2 px-3 rounded-md transition
            ${pathname === item.href ? "bg-gray-700 text-white" : "hover:bg-gray-700 text-gray-300"}`}
          >
            {item.icon} <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <button className="mt-auto bg-red-600 py-2 px-3 rounded-md hover:bg-red-700 transition flex items-center justify-center">
        <FaSignOutAlt className="mr-2" /> Logout
      </button>
    </aside>
  );
}
