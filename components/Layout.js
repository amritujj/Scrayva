import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg text-dark-text selection:bg-purple-500/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-64 p-8 relative scrollbar-hide">
        {children}
      </main>
    </div>
  );
}
