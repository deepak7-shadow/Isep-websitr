import React from 'react';

function formatDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return 'Date not recorded';

  return new Date(value).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function MockInterviewCard({ interview, index, isAdmin, onEdit, onDelete }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#f3be65]/20 bg-[#1b1b1e] shadow-lg transition-colors hover:border-[#f3be65]/45">
      {interview.image && (
        <div className="aspect-[16/8] overflow-hidden border-b border-white/10 bg-black/30">
          <img
            src={interview.image}
            alt={`Mock interview: ${interview.title}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-6 sm:p-7">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <span className="rounded-md border border-[#f3be65]/25 bg-[#f3be65]/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[#f3be65]">
            Mock Interview #{index + 1}
          </span>
          <time className="text-xs text-[#a3a1a8]">{formatDate(interview.date)}</time>
        </div>

        <h2 className="font-serif text-xl font-bold text-[#e4e1e5] transition-colors group-hover:text-[#f3be65]">
          {interview.title}
        </h2>

        <dl className="mt-5 grid grid-cols-1 gap-3 border-y border-white/5 py-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-widest text-[#a3a1a8]">Interviewer</dt>
            <dd className="mt-1 font-medium text-[#e4e1e5]">{interview.interviewer}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-widest text-[#a3a1a8]">Participant</dt>
            <dd className="mt-1 font-medium text-[#e4e1e5]">{interview.participant}</dd>
          </div>
        </dl>

        {interview.description && (
          <p className="mt-5 text-sm leading-relaxed text-[#a3a1a8]">{interview.description}</p>
        )}

        {interview.notes && (
          <div className="mt-5 rounded-xl border border-[#f3be65]/15 bg-[#131316] p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#f3be65]">Interview notes</h3>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[#a3a1a8]">{interview.notes}</p>
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => onEdit(interview)}
              className="rounded-lg border border-[#f3be65]/30 px-3 py-1.5 text-xs text-[#f3be65] transition-colors hover:bg-[#f3be65]/10"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(interview)}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/20"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
