import React, { useState, useEffect } from 'react';

/**
 * CertificateForm (Member 10 - M10 Deliverable)
 * 
 * Reusable certificate registration and editing form component.
 * Integrates with M8 CRUD APIs via onSubmit/onCancel props,
 * and provides an integration slot (renderUpload) for M11's file/PDF uploader.
 */
export default function CertificateForm({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  renderUpload = null
}) {
  const isEditMode = Boolean(
    initialData && (initialData._id || initialData.certificateName || initialData.title)
  );

  const [certificateName, setCertificateName] = useState('');
  const [issuingOrganization, setIssuingOrganization] = useState('');
  const [date, setDate] = useState('');
  const [credentialLink, setCredentialLink] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [category, setCategory] = useState('Completion');
  const [formError, setFormError] = useState('');

  const CATEGORIES = ['Completion', 'Excellence', 'Leadership', 'Award', 'Special Recognition'];

  // Format date helper for input type="date"
  const formatDateForInput = (d) => {
    if (!d) return '';
    try {
      const parsed = new Date(d);
      if (isNaN(parsed.getTime())) return '';
      return parsed.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (initialData) {
      setCertificateName(initialData.certificateName || initialData.title || '');
      setIssuingOrganization(
        initialData.issuingOrganization || initialData.issuer || 'ISEP Directorate'
      );
      setDate(formatDateForInput(initialData.date || initialData.issueDate) || '2026-06-28');
      setCredentialLink(initialData.credentialLink || '');
      setFileUrl(initialData.fileUrl || initialData.file_url || '');
      setCategory(initialData.category || 'Completion');
    } else {
      setCertificateName('');
      setIssuingOrganization('');
      setDate(formatDateForInput(new Date()));
      setCredentialLink('');
      setFileUrl('');
      setCategory('Completion');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!certificateName.trim()) {
      setFormError('Certificate name is required.');
      return;
    }
    if (!issuingOrganization.trim()) {
      setFormError('Issuing organization is required.');
      return;
    }

    const payload = {
      ...(initialData?._id ? { _id: initialData._id } : {}),
      certificateName: certificateName.trim(),
      title: certificateName.trim(), // Supports both M1 schema and archival format
      issuingOrganization: issuingOrganization.trim(),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      issueDate: date || '2026-06-28',
      category,
      credentialLink: credentialLink.trim(),
      fileUrl: fileUrl.trim()
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1b1b1e] border border-[#f3be65]/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
    >
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">
            {isEditMode ? 'Modify Credential Dossier' : 'Archive Pavilion II Registration'}
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#e4e1e5]">
            {isEditMode ? 'Edit Credential Dossier' : 'Confer New Credential'}
          </h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#f3be65]/10 border border-[#f3be65]/30 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-[#f3be65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>

      {formError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
          {formError}
        </div>
      )}

      {/* Fields */}
      <div className="space-y-4">
        {/* Certificate Title */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
            Certificate Name / Award Title <span className="text-[#f3be65]">*</span>
          </label>
          <input
            type="text"
            required
            value={certificateName}
            onChange={(e) => setCertificateName(e.target.value)}
            placeholder="e.g. Certificate of Technical Distinction"
            className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors"
          />
        </div>

        {/* Issuing Organization & Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
              Issuing Organization <span className="text-[#f3be65]">*</span>
            </label>
            <input
              type="text"
              required
              value={issuingOrganization}
              onChange={(e) => setIssuingOrganization(e.target.value)}
              placeholder="e.g. ISEP Academic Directorate, AWS, TCS"
              className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
              Award Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] focus:outline-none transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Issue Date & Credential Link Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
              Date Conferred <span className="text-[#f3be65]">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2 text-xs text-[#e4e1e5] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
              Online Credential / Ledger Link
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[#a3a1a8]/60">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </span>
              <input
                type="url"
                value={credentialLink}
                onChange={(e) => setCredentialLink(e.target.value)}
                placeholder="https://verify.cert.org/..."
                className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Certificate Image / PDF Document: Integration Slot for M11 */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
            Certificate File / Document (PDF or Image)
          </label>
          {renderUpload ? (
            <div className="m11-uploader-slot">
              {renderUpload({
                value: fileUrl,
                onChange: (url) => setFileUrl(url)
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://example.com/certificate-document.pdf"
                className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-[#a3a1a8]/60">
                Direct URL input. M11 PDF/Image upload widget will connect here via renderUpload slot.
              </p>
            </div>
          )}

          {fileUrl && (
            <div className="mt-2.5 p-3 rounded-lg bg-[#131316] border border-white/10 flex items-center justify-between text-xs text-[#e4e1e5]">
              <div className="flex items-center gap-2 truncate max-w-sm">
                <span className="text-[#f3be65]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="font-mono truncate">{fileUrl}</span>
              </div>
              <button
                type="button"
                onClick={() => setFileUrl('')}
                className="text-red-400 hover:text-red-300 text-xs font-mono ml-2 shrink-0"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-[#a3a1a8] hover:text-[#e4e1e5] text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg bg-[#f3be65] hover:bg-[#d4a24c] text-[#131316] text-xs font-semibold uppercase tracking-wider shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && (
            <span className="w-3.5 h-3.5 border-2 border-[#131316] border-t-transparent rounded-full animate-spin"></span>
          )}
          {isEditMode ? 'Save Certificate Changes' : 'Register Certificate'}
        </button>
      </div>
    </form>
  );
}
