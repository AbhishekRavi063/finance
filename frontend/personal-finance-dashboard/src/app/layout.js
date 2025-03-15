export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-darkBg ">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`flex-1 p-6 transition-all duration-300
          md:ml-64`} // Keep space for the sidebar on desktop
      >
        {children}
      </main>
    </div>
  );
}
