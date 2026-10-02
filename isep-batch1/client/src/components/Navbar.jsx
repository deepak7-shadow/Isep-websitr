import React from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
  { id: 'home', label: 'Overview' },
  { id: 'gallery', label: 'Photo Gallery' },
  { id: 'certificates', label: 'Certifications' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'thoughts', label: 'Thoughts Wall' },
  { id: 'activities', label: 'Activities' },
  { id: 'admin', label: 'Admin Portal' }
];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#131316]/90 border-b border-[#f3be65]/20 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full border border-[#f3be65]/50 flex items-center justify-center bg-[#1b1b1e] group-hover:border-[#f3be65] transition-colors">
            <span className="font-cinzel text-xs font-bold text-[#f3be65]">ISEP</span>
          </div>
          <div>
            <div className="font-serif text-lg tracking-wider text-[#e4e1e5] group-hover:text-[#f3be65] transition-colors flex items-center gap-2">
              ISEP ARCHIVE
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#f3be65]/10 text-[#f3be65] border border-[#f3be65]/30 uppercase tracking-widest font-sans font-semibold">
                Batch 1
              </span>
            </div>
            <p className="text-[11px] text-[#a3a1a8] uppercase tracking-widest">Inaugural Cohort 2024</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-wrap items-center justify-center gap-1 bg-[#1b1b1e]/80 p-1 rounded-full border border-[#f3be65]/20">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                activeTab === item.id
                  ? 'bg-[#f3be65] text-[#131316] font-semibold shadow-[0_0_12px_rgba(243,190,101,0.3)]'
                  : 'text-[#e4e1e5]/80 hover:text-[#f3be65] hover:bg-[#25252a]/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* View-Only Indicator */}
        <div className="flex items-center gap-2 text-[11px] text-[#a3a1a8] bg-[#1b1b1e] px-3 py-1.5 rounded-full border border-[#f3be65]/15">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono uppercase tracking-wider">Permanent Archive</span>
        </div>
      </div>
    </header>
  );
}
