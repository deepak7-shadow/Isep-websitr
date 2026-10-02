import React, { useEffect, useState } from 'react';

export default function MemoryForm({ onSubmit, editingMemory, onCancel }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingMemory) {
      setCaption(editingMemory.caption || '');
      setDate(
        editingMemory.date
          ? new Date(editingMemory.date).toISOString().split('T')[0]
          : ''
      );
      setDescription(editingMemory.description || '');
      setImage(null);
    } else {
      setCaption('');
      setDate('');
      setDescription('');
      setImage(null);
    }
  }, [editingMemory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingMemory && !image) {
      alert('Please select a memory image.');
      return;
    }

    if (!caption.trim()) {
      alert('Please enter a caption.');
      return;
    }

    const formData = new FormData();

    if (image) {
      formData.append('image', image);
    }

    formData.append('caption', caption.trim());

    if (date) {
      formData.append('date', date);
    }

    formData.append('description', description.trim());

    try {
      setSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Memory form submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1b1b1e] border border-[#f3be65]/20 rounded-2xl p-5 sm:p-6 space-y-5"
    >
      <div>
        <p className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">
          {editingMemory ? 'Edit Memory' : 'Add New Memory'}
        </p>

        <h2 className="font-serif text-2xl font-semibold text-[#e4e1e5] mt-1">
          {editingMemory ? 'Update this moment ✨' : 'Save a moment 📸'}
        </h2>
      </div>

      {/* Image */}
      <div>
        <label className="block text-xs font-medium text-[#e4e1e5] mb-2">
          Memory Image {!editingMemory && '*'}
        </label>

        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="w-full text-xs text-[#a3a1a8] file:mr-3 file:rounded-lg file:border-0 file:bg-[#f3be65] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#131316] hover:file:bg-[#ffd486] cursor-pointer"
        />

        {image && (
          <p className="text-[10px] text-[#a3a1a8] mt-2">
            Selected: {image.name}
          </p>
        )}

        {editingMemory && !image && (
          <p className="text-[10px] text-[#a3a1a8] mt-2">
            Leave empty to keep the existing image.
          </p>
        )}
      </div>

      {/* Caption */}
      <div>
        <label className="block text-xs font-medium text-[#e4e1e5] mb-2">
          Caption *
        </label>

        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="e.g. ISEP Team Day ❤️"
          maxLength={120}
          className="w-full bg-[#131316] border border-[#f3be65]/20 rounded-xl px-4 py-3 text-sm text-[#e4e1e5] placeholder:text-[#a3a1a8]/50 focus:outline-none focus:border-[#f3be65] transition-colors"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-[#e4e1e5] mb-2">
          Date
        </label>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-[#131316] border border-[#f3be65]/20 rounded-xl px-4 py-3 text-sm text-[#e4e1e5] focus:outline-none focus:border-[#f3be65] transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-[#e4e1e5] mb-2">
          Short Description
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us what made this moment special..."
          rows={4}
          maxLength={500}
          className="w-full bg-[#131316] border border-[#f3be65]/20 rounded-xl px-4 py-3 text-sm text-[#e4e1e5] placeholder:text-[#a3a1a8]/50 focus:outline-none focus:border-[#f3be65] transition-colors resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl bg-[#f3be65] text-[#131316] px-5 py-3 text-sm font-semibold hover:bg-[#ffd486] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting
            ? 'Saving...'
            : editingMemory
              ? 'Update Memory'
              : 'Upload Memory'}
        </button>

        {editingMemory && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 text-[#e4e1e5] px-5 py-3 text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
