import React, { useState, useEffect } from 'react';

/**
 * AchievementForm (Member 10 - M10 Deliverable)
 * 
 * Reusable milestone / achievement creation and editing form.
 * Accepts initialData for Edit mode, delegates persistence to M8 via onSubmit,
 * and exposes renderUpload slot for M11 image uploader integration.
 */
export default function AchievementForm({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  renderUpload = null
}) {
  const isEditMode = Boolean(initialData && (initialData._id || initialData.title));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('General');
  const [proofImage, setProofImage] = useState('');
  const [formError, setFormError] = useState('');

  const CATEGORIES = ['Hackathon', 'Academic', 'Research', 'General'];

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
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setDate(formatDateForInput(initialData.date) || '2026-06-28');
      setCategory(initialData.category || 'General');
      setProofImage(initialData.proofImage || initialData.imageUrl || '');
    } else {
      setTitle('');
      setDescription('');
      setDate(formatDateForInput(new Date()));
      setCategory('General');
      setProofImage('');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Milestone title is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Milestone description is required.');
      return;
    }

    const payload = {
      ...(initialData?._id ? { _id: initialData._id } : {}),
      title: title.trim(),
      description: description.trim(),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      category,
      proofImage: proofImage.trim()
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
            {isEditMode ? 'Chronology Modification' : 'Archive Pavilion III Registry'}
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#e4e1e5]">
            {isEditMode ? 'Edit Milestone Record' : 'Log Batch Milestone'}
          </h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#f3be65]/10 border border-[#f3be65]/30 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-[#f3be65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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
        {/* Title */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
            Milestone Title <span className="text-[#f3be65]">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 48-Hour Inter-College Hackathon Grand Victory"
            className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors"
          />
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
              Category
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

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
              Event Date <span className="text-[#f3be65]">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2 text-xs text-[#e4e1e5] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
            Milestone Narrative & Summary <span className="text-[#f3be65]">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Document the technical challenge, faculty mentor involvement, breakthrough results, or team distinction..."
            className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Proof Image / Integration with M11 Uploader */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
            Proof / Event Photo
          </label>
          {renderUpload ? (
            <div className="m11-uploader-slot">
              {renderUpload({
                value: proofImage,
                onChange: (url) => setProofImage(url)
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="url"
                value={proofImage}
                onChange={(e) => setProofImage(e.target.value)}
                placeholder="https://example.com/certificate-or-trophy.jpg"
                className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-[#a3a1a8]/60">
                Direct URL input. M11 upload widget can be injected via the renderUpload prop.
              </p>
            </div>
          )}

          {proofImage && (
            <div className="mt-2.5 relative aspect-video max-h-36 rounded-lg overflow-hidden border border-white/10 bg-black/40">
              <img
                src={proofImage}
                alt="Proof Preview"
                className="w-full h-full object-cover select-none"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
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
          {isEditMode ? 'Save Milestone Changes' : 'Archive Milestone'}
        </button>
      </div>
    </form>
  );
}
