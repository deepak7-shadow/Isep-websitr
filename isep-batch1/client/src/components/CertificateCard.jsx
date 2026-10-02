import React from 'react';

/**
 * CertificateCard (Member 10 - M10 Deliverable)
 * 
 * Reusable certificate card component adhering to the M1 Certificate model
 * and matching the visual language of CertCard.jsx without modifying or replacing it.
 * 
 * Displays certificate name, issuing organization, conferral date, credential links,
 * document view/download triggers, and owner controls (edit/delete).
 */
export default function CertificateCard({
  certificate,
  isOwner = false,
  onEdit = null,
  onDelete = null,
  onInspect = null
}) {
  if (!certificate) return null;

  const {
    certificateName,
    title,
    issuingOrganization,
    recipientName,
    date,
    issueDate,
    category,
    credentialLink,
    fileUrl,
    file_url
  } = certificate;

  const displayTitle = certificateName || title || 'Accreditation Certificate';
  const displayIssuer = issuingOrganization || 'ISEP Academic Council';
  const displayFile = fileUrl || file_url;
  const showOwnerControls = Boolean(isOwner || onEdit || onDelete);

  const formattedDate = date || issueDate
    ? new Date(date || issueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Archival Record';

  return (
    <div className="group relative rounded-xl bg-[#1b1b1e] border border-[#f3be65]/20 hover:border-[#f3be65]/60 p-6 transition-all duration-300 shadow-md hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(212,162,76,0.15)] flex flex-col justify-between">
      <div>
        {/* Card Header: Emblem, Category & Owner Controls */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f3be65]/10 border border-[#f3be65]/30 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#f3be65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                Verified Credential
              </span>
              {category && (
                <span className="ml-1.5 text-[10px] font-mono text-[#a3a1a8]/60 uppercase">
                  • {category}
                </span>
              )}
            </div>
          </div>

          {/* Owner Management Controls */}
          {showOwnerControls && (
            <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(certificate)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-[#f3be65]/20 text-[#a3a1a8] hover:text-[#f3be65] border border-white/10 hover:border-[#f3be65]/30 transition-all text-xs"
                  title="Edit Certificate"
                  aria-label="Edit Certificate"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(certificate)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all text-xs"
                  title="Delete Certificate"
                  aria-label="Delete Certificate"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Certificate Title */}
        <h3 className="font-serif text-lg font-bold text-[#e4e1e5] group-hover:text-[#f3be65] transition-colors line-clamp-2">
          {displayTitle}
        </h3>

        {/* Issuing Organization */}
        <p className="text-xs text-[#f3be65] font-medium tracking-wide mt-1 flex items-center gap-1.5">
          <span>{displayIssuer}</span>
        </p>

        {/* Recipient info if present */}
        {recipientName && (
          <p className="text-xs text-[#a3a1a8] mt-1.5">
            Conferred to: <span className="text-[#e4e1e5] font-medium">{recipientName}</span>
          </p>
        )}

        {/* Metadata Details */}
        <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-[#a3a1a8]">
          <div className="flex justify-between">
            <span className="text-[#a3a1a8]/60">Cohort:</span>
            <span className="font-mono text-[#e4e1e5]">Batch 1 (2024)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#a3a1a8]/60">Date Conferred:</span>
            <span className="font-mono text-[#e4e1e5]">{formattedDate}</span>
          </div>
          {credentialLink && (
            <div className="flex justify-between items-center pt-1">
              <span className="text-[#a3a1a8]/60">Verification:</span>
              <a
                href={credentialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f3be65] hover:text-[#d4a24c] font-mono text-[11px] underline flex items-center gap-1"
              >
                <span>Verify Online</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-[#f3be65]/15 flex items-center justify-between gap-3">
        <span className="text-[10px] text-[#a3a1a8] uppercase tracking-wider flex items-center gap-1">
          <svg className="w-3 h-3 text-[#f3be65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Archival Record
        </span>

        <div className="flex items-center gap-2">
          {displayFile && (
            <a
              href={displayFile}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="text-xs font-semibold text-[#a3a1a8] hover:text-[#e4e1e5] px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1"
              title="Download Certificate File"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>File</span>
            </a>
          )}

          {onInspect ? (
            <button
              type="button"
              onClick={() => onInspect(certificate)}
              className="text-xs font-semibold text-[#f3be65] hover:text-[#d4a24c] px-3 py-1.5 rounded-lg bg-[#f3be65]/10 hover:bg-[#f3be65]/20 border border-[#f3be65]/30 transition-all"
            >
              Preview
            </button>
          ) : (
            <span className="text-[10px] font-mono text-[#a3a1a8]/60">Permanent</span>
          )}
        </div>
      </div>
    </div>
  );
}
