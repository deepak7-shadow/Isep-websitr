import React from 'react';

/**
 * AchievementCard (Member 10 - M10 Deliverable)
 * 
 * Reusable milestone achievement card component.
 * Adheres to the archival timeline aesthetic: gold date chip, category badge,
 * serif title, proof image preview, and optional owner controls (edit/delete).
 */
export default function AchievementCard({
  achievement,
  index = null,
  isOwner = false,
  onEdit = null,
  onDelete = null,
  onInspect = null
}) {
  if (!achievement) return null;

  const {
    title,
    description,
    date,
    category = 'General',
    proofImage,
    imageUrl,
    _id
  } = achievement;

  const displayImage = proofImage || imageUrl;
  const showOwnerControls = Boolean(isOwner || onEdit || onDelete);

  // Category styling
  const getCategoryBadgeClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'hackathon':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'academic':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'research':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-[#f3be65]/10 text-[#f3be65] border-[#f3be65]/30';
    }
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Archival Date';

  return (
    <div className="group relative rounded-2xl bg-[#1b1b1e] border border-[#f3be65]/20 hover:border-[#f3be65]/60 p-6 sm:p-8 transition-all duration-300 shadow-lg hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(212,162,76,0.15)] flex flex-col justify-between">
      <div>
        {/* Header: Date, Category, Milestone #, & Owner Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[#f3be65] bg-[#f3be65]/10 px-3 py-1 rounded-md border border-[#f3be65]/20">
              {formattedDate}
            </span>
            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${getCategoryBadgeClass(category)} font-medium tracking-wider`}>
              {category}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            {index !== null && index !== undefined && (
              <span className="text-[10px] uppercase font-mono text-[#a3a1a8] tracking-widest">
                Milestone #{index + 1 < 10 ? `0${index + 1}` : index + 1}
              </span>
            )}

            {/* Owner Management Controls */}
            {showOwnerControls && (
              <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(achievement)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-[#f3be65]/20 text-[#a3a1a8] hover:text-[#f3be65] border border-white/10 hover:border-[#f3be65]/30 transition-all text-xs"
                    title="Edit Milestone"
                    aria-label="Edit Milestone"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(achievement)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all text-xs"
                    title="Delete Milestone"
                    aria-label="Delete Milestone"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Milestone Title */}
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#e4e1e5] mb-3 group-hover:text-[#f3be65] transition-colors leading-tight">
          {title}
        </h3>

        {/* Narrative Description */}
        <p className="text-xs sm:text-sm text-[#a3a1a8] leading-relaxed mb-4">
          {description}
        </p>

        {/* Proof / Event Image */}
        {displayImage && (
          <div
            className="mt-4 rounded-xl overflow-hidden aspect-[16/9] max-h-64 border border-white/10 bg-black/40 relative cursor-pointer group/img"
            onClick={() => onInspect && onInspect(achievement)}
          >
            <img
              src={displayImage}
              alt={title}
              loading="lazy"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="w-full h-full object-cover select-none transition-transform duration-500 group-hover/img:scale-105 pointer-events-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-3">
              <span className="text-[10px] text-[#f3be65] font-mono uppercase tracking-wider flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Enlarge Proof
              </span>
            </div>
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[9px] text-[#e4e1e5]/80 px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest font-mono">
              View Only
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Bar */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-[#a3a1a8]/60 font-mono">
        <span className="uppercase tracking-wider">ISEP Batch 1 Archive</span>
        <span className="text-emerald-400/80">Permanent Record</span>
      </div>
    </div>
  );
}
