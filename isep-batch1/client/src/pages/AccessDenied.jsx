import React from 'react';

export default function AccessDenied({
  requiredRoles = [],
  userRole = 'member',
  onGoHome,
  onSwitchAccount
}) {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-6 py-16 selection:bg-[#f3be65]/30">
      <div className="relative max-w-lg w-full bg-[#1b1b1e] border border-red-500/30 rounded-3xl p-8 sm:p-12 shadow-[0_0_50px_rgba(239,68,68,0.1)] flex flex-col items-center overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#f3be65]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon */}
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center text-4xl mb-6 shadow-inner animate-pulse">
          🛡️
        </div>

        <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-red-400 font-semibold mb-2">
          HTTP 403 • Restricted Zone
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#e4e1e5] mb-3">
          Access Denied
        </h1>

        <p className="text-xs sm:text-sm text-[#a3a1a8] leading-relaxed max-w-sm mb-6">
          You do not have the required permissions to view this section of the ISEP Portal.
        </p>

        {/* Role badge */}
        <div className="w-full bg-[#131316] border border-white/5 rounded-xl p-3.5 mb-8 text-xs font-mono flex items-center justify-between">
          <span className="text-[#a3a1a8]">Your Current Role:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#f3be65] uppercase text-[11px] font-bold">
            {userRole || 'Guest'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={onGoHome || (() => window.location.href = '/')}
            className="flex-1 py-3 rounded-xl bg-[#f3be65] hover:bg-[#d4a24c] text-[#131316] font-semibold text-xs uppercase tracking-wider transition-all shadow-md"
          >
            ← Return to Overview
          </button>
          {onSwitchAccount && (
            <button
              onClick={onSwitchAccount}
              className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-[#e4e1e5] border border-white/10 text-xs font-mono transition-colors"
            >
              Switch Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
