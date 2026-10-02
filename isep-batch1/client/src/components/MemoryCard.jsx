import React from 'react';

export default function MemoryCard({ memory, onEdit, onDelete, canEdit, canDelete }) {
  const formattedDate = memory.date
    ? new Date(memory.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-[#1b1b1e] border border-[#f3be65]/20 hover:border-[#f3be65]/60 transition-all duration-300 shadow-lg break-inside-avoid mb-6">
      {/* Image */}
      <div className="relative overflow-hidden bg-black/40">
        <img
          src={memory.image}
          alt={memory.caption || 'ISEP memory'}
          loading="lazy"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03] select-none"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131316]/80 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

        {/* Date badge */}
        {formattedDate && (
          <div className="absolute top-3 right-3 bg-[#131316]/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-medium text-[#f3be65] border border-[#f3be65]/30">
            {formattedDate}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-[#e4e1e5] group-hover:text-[#f3be65] transition-colors">
          {memory.caption}
        </h3>

        {memory.description && (
          <p className="text-xs text-[#a3a1a8] mt-2 leading-relaxed">
            {memory.description}
          </p>
        )}

        {/* Uploaded by */}
        {memory.uploadedBy?.name && (
          <p className="text-[10px] text-[#a3a1a8]/70 mt-3">
            📸 Shared by {memory.uploadedBy.name}
          </p>
        )}

        {/* Actions */}
        {(canEdit || canDelete) && (
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit?.(memory)}
                className="px-3 py-1.5 rounded-lg text-[11px] text-[#f3be65] border border-[#f3be65]/30 hover:bg-[#f3be65]/10 transition-colors"
              >
                Edit
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete?.(memory)}
                className="px-3 py-1.5 rounded-lg text-[11px] text-red-300 border border-red-300/20 hover:bg-red-300/10 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}