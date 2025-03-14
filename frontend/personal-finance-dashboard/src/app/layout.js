import Sidebar from "@/components/Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-darkBg">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
