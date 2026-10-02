import React from 'react';

/**
 * StatsCard Component (Member 7 - M7)
 * 
 * Reusable metric card conforming to the ISEP dark/gold design system.
 * 
 * @param {Object} props
 * @param {string} props.title - Card title / metric label
 * @param {string|number} props.value - Numeric count or metric value
 * @param {React.ReactNode} [props.icon] - Lucide icon component or SVG element
 * @param {string} [props.subtitle] - Optional supporting descriptive text
 * @param {boolean} [props.loading] - Whether the card is in a loading/shimmer state
 * @param {string} [props.className] - Additional Tailwind classes for customization
 * @param {Function} [props.onClick] - Optional click handler if card acts as interactive trigger
 */
export default function StatsCard({
  title,
  value,
  icon,
  subtitle,
  loading = false,
  className = '',
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-[#1b1b1e] border border-[#f3be65]/20 rounded-2xl p-6 transition-all duration-300 hover:border-[#f3be65]/50 hover:shadow-[0_4px_24px_rgba(243,190,101,0.08)] ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {/* Subtle top golden accent highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f3be65]/30 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <span className="text-[11px] uppercase tracking-widest text-[#a3a1a8] font-medium block">
            {title}
          </span>

          {loading ? (
            <div className="h-9 w-20 bg-white/5 animate-pulse rounded-lg mt-1" />
          ) : (
            <div className="font-cinzel text-3xl sm:text-4xl font-bold text-[#f3be65] tracking-tight">
              {value !== undefined && value !== null ? value : 0}
            </div>
          )}

          {subtitle && (
            <p className="text-[11px] text-[#a3a1a8]/70 leading-normal">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className="w-12 h-12 rounded-xl bg-[#f3be65]/10 border border-[#f3be65]/25 flex items-center justify-center text-[#f3be65] shrink-0 shadow-inner">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
