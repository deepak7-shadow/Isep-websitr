import React from 'react';

export default function NotFound({ onGoHome }) {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-6 py-16 selection:bg-[#f3be65]/30">
      <div className="relative max-w-lg w-full bg-[#1b1b1e] border border-[#f3be65]/20 rounded-3xl p-8 sm:p-12 shadow-[0_0_50px_rgba(243,190,101,0.08)] flex flex-col items-center overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#f3be65]/10 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Visual */}
        <div className="w-20 h-20 rounded-2xl bg-[#f3be65]/10 border-2 border-[#f3be65]/30 flex items-center justify-center text-4xl mb-6 shadow-inner">
          🧭
        </div>

        <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#f3be65] font-semibold mb-2">
          HTTP 404 • Missing Chronicle
        </span>

        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#e4e1e5] mb-3">
          Page Not Found
        </h1>

        <p className="text-xs sm:text-sm text-[#a3a1a8] leading-relaxed max-w-sm mb-8">
          The requested record or portal section does not exist in the ISEP Batch 1 Archive.
        </p>

        <button
          onClick={onGoHome || (() => window.location.href = '/')}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#f3be65] hover:bg-[#d4a24c] text-[#131316] font-semibold text-xs uppercase tracking-wider transition-all shadow-md"
        >
          ← Return to Overview
        </button>
      </div>
    </div>
  );
}
