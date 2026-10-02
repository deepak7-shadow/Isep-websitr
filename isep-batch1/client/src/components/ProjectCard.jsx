import React from 'react';

/**
 * ProjectCard (Member 10 - M10 Deliverable)
 * 
 * Reusable capstone project card component.
 * Displays project identity, technology tags, preview image, live & source links,
 * and optional owner management actions (edit/delete).
 */
export default function ProjectCard({
  project,
  isOwner = false,
  onEdit = null,
  onDelete = null,
  onInspect = null
}) {
  if (!project) return null;

  const {
    projectName,
    title,
    description,
    technologies = [],
    projectImage,
    imageUrl,
    githubLink,
    liveLink,
    createdAt
  } = project;

  const displayTitle = projectName || title || 'Untitled Project';
  const displayImage = projectImage || imageUrl;
  const showOwnerControls = Boolean(isOwner || onEdit || onDelete);

  return (
    <div className="group relative rounded-xl bg-[#1b1b1e] border border-[#f3be65]/20 hover:border-[#f3be65]/60 p-5 sm:p-6 transition-all duration-300 shadow-md hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(212,162,76,0.15)] flex flex-col justify-between">
      <div>
        {/* Top Header: Badge & Owner Actions */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded bg-[#f3be65]/10 text-[#f3be65] border border-[#f3be65]/30 font-semibold tracking-wider">
              Capstone Project
            </span>
            {createdAt && (
              <span className="text-[10px] font-mono text-[#a3a1a8]/60">
                {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Owner Management Controls */}
          {showOwnerControls && (
            <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(project)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-[#f3be65]/20 text-[#a3a1a8] hover:text-[#f3be65] border border-white/10 hover:border-[#f3be65]/30 transition-all text-xs"
                  title="Edit Project"
                  aria-label="Edit Project"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(project)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all text-xs"
                  title="Delete Project"
                  aria-label="Delete Project"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Project Image Banner */}
        {displayImage ? (
          <div
            className="relative aspect-video rounded-lg overflow-hidden bg-black/50 border border-white/5 mb-4 select-none cursor-pointer"
            onClick={() => onInspect && onInspect(project)}
          >
            <img
              src={displayImage}
              alt={displayTitle}
              loading="lazy"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131316] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[9px] text-[#e4e1e5]/80 px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest font-mono">
              View Only
            </div>
          </div>
        ) : (
          <div className="relative aspect-video rounded-lg bg-[#131316] border border-white/5 mb-4 flex items-center justify-center text-[#a3a1a8]/30">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Project Title */}
        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#e4e1e5] group-hover:text-[#f3be65] transition-colors line-clamp-1 mb-2">
          {displayTitle}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#a3a1a8] leading-relaxed line-clamp-3 mb-4">
          {description || 'Comprehensive capstone engineering initiative architected during the residency.'}
        </p>

        {/* Technologies Tags */}
        {technologies && technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {technologies.map((tech, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#131316] text-[#f3be65] border border-[#f3be65]/20 group-hover:border-[#f3be65]/40 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Action Links */}
      <div className="pt-4 border-t border-[#f3be65]/15 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {githubLink && (
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#e4e1e5] border border-white/10 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>Code</span>
            </a>
          )}

          {liveLink && (
            <a
              href={liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f3be65]/10 hover:bg-[#f3be65]/20 text-[#f3be65] border border-[#f3be65]/30 text-xs font-semibold transition-colors"
            >
              <span>Live Demo</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {/* View Details inspection trigger */}
        {onInspect && (
          <button
            type="button"
            onClick={() => onInspect(project)}
            className="text-xs text-[#a3a1a8] hover:text-[#f3be65] font-medium transition-colors ml-auto flex items-center gap-1"
          >
            <span>Details</span>
            <span>&rarr;</span>
          </button>
        )}
      </div>
    </div>
  );
}
