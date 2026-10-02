import React, { useState } from 'react';

export default function HackathonCard({ hackathon, onEdit, onDelete }) {
  const [showModal, setShowModal] = useState(false);

  const images = hackathon.images && hackathon.images.length > 0 ? hackathon.images : [];
  const heroImage = images[0] || null;
  const teamMembers = hackathon.teamMembers || [];

  const formattedDate = hackathon.date
    ? new Date(hackathon.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Archived';

  // Badge color based on result
  const isWinner =
    /winner|1st|first|gold|champion/i.test(hackathon.result || '');
  const isFinalist =
    /finalist|top|2nd|3rd|runner|silver|bronze/i.test(hackathon.result || '');

  const badgeClass = isWinner
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
    : isFinalist
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    : 'bg-[#f3be65]/10 text-[#f3be65] border-[#f3be65]/30';

  return (
    <>
      <div className="group rounded-2xl overflow-hidden bg-[#1b1b1e] border border-[#f3be65]/20 hover:border-[#f3be65]/60 transition-all duration-300 shadow-xl flex flex-col justify-between hover:-translate-y-1">
        {/* Card Header & Media */}
        <div>
          <div
            className="relative aspect-[16/9] overflow-hidden bg-black/40 cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            {heroImage ? (
              <img
                src={heroImage}
                alt={hackathon.hackathonName}
                loading="lazy"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#a3a1a8] text-xs bg-gradient-to-br from-[#1b1b1e] to-[#131316]">
                <span className="text-3xl mb-2">💻</span>
                <span>Hackathon Archival Record</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b1e] via-transparent to-transparent opacity-80"></div>

            {/* Result Tag Badge */}
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border backdrop-blur-md ${badgeClass}`}>
              🏆 {hackathon.result || 'Participated'}
            </div>

            {/* Photos Count */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-white/90 border border-white/10">
                📷 +{images.length - 1} photos
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#a3a1a8] mb-2">
              <span className="flex items-center gap-1.5">
                <span>📅</span>
                {formattedDate}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#f3be65]/80">
                ISEP Team
              </span>
            </div>

            <h3
              onClick={() => setShowModal(true)}
              className="font-serif text-lg font-bold text-[#e4e1e5] group-hover:text-[#f3be65] transition-colors cursor-pointer line-clamp-1"
            >
              {hackathon.hackathonName}
            </h3>

            <p className="text-xs text-[#a3a1a8] mt-2 line-clamp-2 leading-relaxed">
              {hackathon.description}
            </p>

            {/* Team Members */}
            {teamMembers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#a3a1a8]/70 block mb-1.5">
                  👥 Team Members
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {teamMembers.slice(0, 4).map((member, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-[#e4e1e5]"
                    >
                      {member}
                    </span>
                  ))}
                  {teamMembers.length > 4 && (
                    <span className="px-2 py-0.5 rounded-md bg-[#f3be65]/10 text-[11px] text-[#f3be65] font-mono">
                      +{teamMembers.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Experience preview snippet */}
            {hackathon.experience && (
              <div className="mt-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-[#a3a1a8] italic line-clamp-2">
                "{hackathon.experience}"
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 pb-5 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowModal(true)}
            className="text-[11px] font-mono uppercase tracking-wider text-[#f3be65] hover:underline flex items-center gap-1"
          >
            Read Story & Details →
          </button>

          {(onEdit || onDelete) && (
            <div className="flex items-center gap-3">
              {onEdit && (
                <button
                  onClick={() => onEdit(hackathon)}
                  className="text-xs text-[#f3be65] hover:text-white transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(hackathon._id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Details Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-[#1b1b1e] border border-[#f3be65]/40 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider font-bold border ${badgeClass}`}>
                    🏆 {hackathon.result || 'Participated'}
                  </span>
                  <span className="text-xs font-mono text-[#a3a1a8]">
                    📅 {formattedDate}
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#e4e1e5]">
                  {hackathon.hackathonName}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Gallery Section */}
            {images.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65] block mb-2">
                  Archival Photos ({images.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10"
                    >
                      <img
                        src={img}
                        alt={`${hackathon.hackathonName} ${i + 1}`}
                        className="w-full h-full object-cover"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65] block mb-1">
                Project Overview & Challenge
              </span>
              <p className="text-sm text-[#e4e1e5]/90 leading-relaxed whitespace-pre-line">
                {hackathon.description || 'No detailed description recorded.'}
              </p>
            </div>

            {/* Experience / Story */}
            {hackathon.experience && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-[#f3be65]/20">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65] block mb-1">
                  📖 Experience & Team Story
                </span>
                <p className="text-xs sm:text-sm text-[#a3a1a8] leading-relaxed whitespace-pre-line italic">
                  "{hackathon.experience}"
                </p>
              </div>
            )}

            {/* Team Roster */}
            {teamMembers.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65] block mb-2">
                  👥 Cohort Participants
                </span>
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131316] border border-white/10 text-xs text-[#e4e1e5]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#f3be65]/20 text-[#f3be65] text-[10px] flex items-center justify-center font-bold">
                        {member.charAt(0)}
                      </span>
                      <span>{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl bg-[#f3be65] text-[#131316] font-semibold text-xs tracking-wider uppercase transition-transform hover:scale-105"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
