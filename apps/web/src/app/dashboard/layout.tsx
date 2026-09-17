'use client';
import { Sidebar } from '../../components/layouts/Sidebar';
import { useAppStore } from '../../store/app-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted hover:text-text transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <span className="font-serif font-bold text-text">FocusFlow</span>
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
