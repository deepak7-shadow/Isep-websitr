import React from 'react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="border-t border-[#f3be65]/20 bg-[#131316] py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-sm font-bold text-[#f3be65]">ISEP</span>
            <span className="text-xs uppercase tracking-widest text-[#a3a1a8]">Batch 1 Archive</span>
          </div>
          <p className="text-xs text-[#a3a1a8] mt-2 text-center md:text-left">
            Dedicated to the memory, technical accomplishments, and camaraderie of the 2024 inaugural residency.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#a3a1a8]">
          <button onClick={() => setActiveTab('gallery')} className="hover:text-[#f3be65] transition-colors">Gallery</button>
          <button onClick={() => setActiveTab('certificates')} className="hover:text-[#f3be65] transition-colors">Certifications</button>
          <button onClick={() => setActiveTab('achievements')} className="hover:text-[#f3be65] transition-colors">Achievements</button>
          <button onClick={() => setActiveTab('memories')} className="hover:text-[#f3be65] transition-colors">Memories</button>
          <button onClick={() => setActiveTab('thoughts')} className="hover:text-[#f3be65] transition-colors">Thoughts Wall</button>
          <button onClick={() => setActiveTab('admin')} className="hover:text-[#f3be65] transition-colors text-[#f3be65]/70">Admin Access</button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#f3be65]/10 text-center text-[11px] text-[#a3a1a8]/60">
        View-only public repository. Direct file downloads and unmoderated edits are restricted.
      </div>
    </footer>
  );
}
