import React from 'react';

export default function MemberLayout({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  children
}) {
  const memberNav = [
    { id: 'dashboard', label: 'My Dashboard', icon: '🏠' },
    { id: 'portfolio', label: 'My Portfolio', icon: '👤' },
    { id: 'activities', label: 'Activities', icon: '🎯' },
    { id: 'hackathons', label: 'Hackathons', icon: '💻' },
    { id: 'mock-interviews', label: 'Mock Interviews', icon: '🎤' }
  ];

  return (
    <div className="min-h-screen bg-[#131316] text-[#e4e1e5] flex flex-col">
      {/* Subheader Navigation for Logged-In Members */}
      <div className="bg-[#1b1b1e]/90 border-b border-[#f3be65]/20 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f3be65]/20 text-[#f3be65] flex items-center justify-center font-bold font-serif text-sm border border-[#f3be65]/30">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <span className="text-xs font-semibold text-[#e4e1e5]">
                {user?.fullName || 'Cohort Member'}
              </span>
              <span className="text-[10px] text-[#a3a1a8] block font-mono">
                {user?.role === 'head' ? '👑 ISEP Head' : '👤 Batch 1 Member'}
              </span>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
            {memberNav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 ${
                  activeTab === item.id
                    ? 'bg-[#f3be65] text-[#131316] font-semibold shadow-[0_0_10px_rgba(243,190,101,0.2)]'
                    : 'text-[#a3a1a8] hover:text-[#e4e1e5] hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Sign Out */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-xs font-mono text-red-400 hover:text-red-300 px-3 py-1 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors shrink-0"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
