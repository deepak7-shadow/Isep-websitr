import React, { useState } from 'react';

export default function MemoryCard({ memory, isAdmin, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formattedDate = memory.date
    ? new Date(memory.date).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    : '';

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(memory._id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-[#1b1b1e] border border-white/5 hover:border-[#f3be65]/30 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(243,190,101,0.08)] cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
    >
      {/* Image Area */}
      <div className="relative overflow-hidden bg-[#131316]" style={{ aspectRatio: '4/3' }}>
        {memory.image ? (
          <img
            src={memory.image}
            alt={memory.caption}
            onContextMenu={e => e.preventDefault()}
            onDragStart={e => e.preventDefault()}
            className={`w-full h-full object-cover select-none transition-transform duration-500 ${
              hovered ? 'scale-110' : 'scale-100'
            }`}
          />
        ) : (
          /* Placeholder when no image */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#a3a1a8]/40">
            <span className="text-5xl">📷</span>
            <span className="text-xs font-mono">No Image</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-60'
        }`} />

        {/* Date badge */}
        {formattedDate && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/70 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
              {formattedDate}
            </span>
          </div>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <div className={`absolute top-3 right-3 flex gap-1.5 transition-all duration-200 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}>
            {onEdit && (
              <button
                onClick={e => { e.stopPropagation(); onEdit(memory); }}
                className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-[#f3be65] hover:border-[#f3be65] hover:text-[#131316] text-white/80 text-sm flex items-center justify-center transition-all"
                title="Edit memory"
              >
                ✏️
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); handleDelete(); }}
              className={`h-7 px-2 rounded-lg backdrop-blur-sm border text-sm flex items-center gap-1 transition-all ${
                confirmDelete
                  ? 'bg-red-500 border-red-500 text-white text-[10px] font-bold'
                  : 'bg-black/60 border-white/10 hover:bg-red-500/80 hover:border-red-500 text-white/80'
              }`}
              title="Delete memory"
            >
              {confirmDelete ? '⚠️ Confirm' : '🗑️'}
            </button>
          </div>
        )}

        {/* Caption pinned to bottom of image */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 transition-transform duration-300 ${
          hovered ? 'translate-y-0' : 'translate-y-1'
        }`}>
          <p className="font-medium text-sm text-white leading-snug drop-shadow">
            {memory.caption}
          </p>
        </div>
      </div>

      {/* Card footer — description */}
      {memory.description && (
        <div className="px-4 py-3 border-t border-white/5">
          <p className="text-xs text-[#a3a1a8] leading-relaxed line-clamp-2">
            {memory.description}
          </p>
        </div>
      )}
    </div>
  );
}
