import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function AdminLayout({
  activeTab,
  setActiveTab,
  counts,
  adminEmail,
  onLogout,
  onSwitchToPublic,
  title,
  subtitle,
  children
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#131316] text-[#e4e1e5] flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        adminEmail={adminEmail}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSwitchToPublic={onSwitchToPublic}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#131316]/95 backdrop-blur-md border-b border-[#f3be65]/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80"
              aria-label="Open sidebar"
            >
              ☰
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">
                  Control Center
                </span>
                <span className="text-[10px] text-[#a3a1a8]">/</span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#a3a1a8]">
                  {title || activeTab}
                </span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#e4e1e5]">
                {title || 'Curator Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Switch to Public Site */}
            {onSwitchToPublic && (
              <button
                onClick={onSwitchToPublic}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#a3a1a8] hover:text-[#f3be65] transition-colors"
              >
                <span>🌐</span>
                <span>Public Site</span>
              </button>
            )}

            {/* Admin Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3be65]/10 border border-[#f3be65]/30 text-[#f3be65] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden md:inline font-semibold">Active Session</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
