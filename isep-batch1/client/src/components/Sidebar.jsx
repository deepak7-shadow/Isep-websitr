import React from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  counts = {},
  adminEmail = 'admin@isep.org',
  onLogout,
  isOpen = true,
  onClose,
  onSwitchToPublic
}) {
  const navSections = [
    {
      title: 'Main Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        {
          id: 'pendingApprovals',
          label: 'Pending Approvals',
          icon: '⏳',
          badge: counts.pendingApprovals || counts.pendingCount || 0,
          badgeColor: 'bg-amber-500 text-black'
        },
        { id: 'members', label: 'All Members', icon: '👥', badge: counts.members || 0 },
        { id: 'heads', label: 'ISEP Heads', icon: '👑' },
      ]
    },
    {
      title: 'Cohort Modules',
      items: [
        { id: 'activities', label: 'Activities', icon: '🎯', badge: counts.activities || 0 },
        { id: 'hackathons', label: 'Hackathons', icon: '💻', badge: counts.hackathons || 0 },
        { id: 'mockInterviews', label: 'Mock Interviews', icon: '🎤', badge: counts.mockInterviews || 0 },
        { id: 'meetings', label: 'Meetings', icon: '📅' },
        { id: 'tcsMeeting', label: 'TCS Meeting', icon: '🏢' },
        { id: 'memories', label: 'Fun / Memories', icon: '🎉' },
      ]
    },
    {
      title: 'Archive Management',
      items: [
        { id: 'photos', label: 'Uploaded Images', icon: '🖼️', badge: counts.photos || 0 },
        { id: 'certificates', label: 'Certificates', icon: '📜', badge: counts.certificates || 0 },
        { id: 'achievements', label: 'Achievements', icon: '🏆', badge: counts.achievements || 0 },
        {
          id: 'moderate',
          label: 'Moderate Thoughts',
          icon: '💭',
          badge: counts.pendingThoughts || 0,
          badgeColor: 'bg-amber-500 text-black'
        },
        { id: 'announcements', label: 'Announcements', icon: '📢' },
        { id: 'upload', label: 'Add / Archive Records', icon: '📁' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#1b1b1e] border-r border-[#f3be65]/20 flex flex-col justify-between transition-transform duration-300 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f3be65] to-amber-600 flex items-center justify-center text-[#131316] font-cinzel font-bold text-sm shadow-md">
                ADM
              </div>
              <div>
                <div className="font-serif font-bold text-[#e4e1e5] text-sm tracking-wide flex items-center gap-1.5">
                  ISEP Control
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f3be65]/15 text-[#f3be65] font-mono uppercase tracking-widest font-semibold">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#a3a1a8] truncate max-w-[150px]">
                  {adminEmail}
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-6 max-h-[calc(100vh-210px)] overflow-y-auto">
            {navSections.map((section, sIdx) => (
              <div key={sIdx}>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#a3a1a8]/60 px-3 block mb-2">
                  {section.title}
                </span>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          if (onClose) onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#f3be65] text-[#131316] font-semibold shadow-[0_0_15px_rgba(243,190,101,0.25)]'
                            : 'text-[#e4e1e5]/80 hover:text-[#f3be65] hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>

                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isActive
                                ? 'bg-black text-[#f3be65]'
                                : item.badgeColor || 'bg-white/10 text-[#e4e1e5]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-[#131316]/50">
          {onSwitchToPublic && (
            <button
              onClick={onSwitchToPublic}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-mono text-[#a3a1a8] hover:text-[#f3be65] hover:bg-white/5 transition-colors border border-white/5"
            >
              <span>🌐</span>
              <span>View Public Portal</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-red-500/20"
          >
            <span>🚪</span>
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
