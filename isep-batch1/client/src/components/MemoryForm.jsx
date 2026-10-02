import React, { useState, useRef } from 'react';

export default function MemoryForm({ onSubmit, onCancel, initial = null, loading = false }) {
  const [caption, setCaption] = useState(initial?.caption || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [date, setDate] = useState(
    initial?.date
      ? new Date(initial.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initial?.image || '');
  const [imageUrl, setImageUrl] = useState('');
  const [useUrl, setUseUrl] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!caption.trim()) {
      setError('Caption is required.');
      return;
    }

    if (!imageFile && !imageUrl && !imagePreview) {
      setError('Please add an image (upload or paste a URL).');
      return;
    }

    const formData = new FormData();
    formData.append('caption', caption.trim());
    formData.append('description', description);
    formData.append('date', date);

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (imageUrl) {
      formData.append('imageUrl', imageUrl);
    } else if (imagePreview && imagePreview.startsWith('http')) {
      formData.append('imageUrl', imagePreview);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Image Upload Area */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#a3a1a8] mb-2">Memory Photo</label>

        {/* Toggle: Upload vs URL */}
        <div className="flex gap-2 mb-3">
          <button type="button" onClick={() => setUseUrl(false)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              !useUrl ? 'bg-[#f3be65] text-[#131316] font-bold' : 'bg-white/5 text-[#a3a1a8] hover:text-white'
            }`}>
            📁 Upload File
          </button>
          <button type="button" onClick={() => setUseUrl(true)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              useUrl ? 'bg-[#f3be65] text-[#131316] font-bold' : 'bg-white/5 text-[#a3a1a8] hover:text-white'
            }`}>
            🔗 Paste URL
          </button>
        </div>

        {!useUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className="relative w-full border-2 border-dashed border-[#f3be65]/20 hover:border-[#f3be65]/50 rounded-xl overflow-hidden transition-colors cursor-pointer group"
            style={{ minHeight: '160px' }}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-56" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs font-mono">Click to change image</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-[#a3a1a8]">
                <span className="text-4xl">📷</span>
                <span className="text-xs font-mono">Click or drag & drop an image</span>
                <span className="text-[10px] text-[#a3a1a8]/50">Max 5 MB · JPG, PNG, WEBP</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="url"
              value={imageUrl}
              onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value); }}
              placeholder="https://example.com/photo.jpg"
              className="w-full bg-[#131316] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none focus:border-[#f3be65]/50"
            />
            {imagePreview && imagePreview.startsWith('http') && (
              <img src={imagePreview} alt="URL Preview" className="rounded-xl max-h-48 object-contain border border-white/10" />
            )}
          </div>
        )}
      </div>

      {/* Caption */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#a3a1a8] mb-1">
          Caption <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="ISEP Team Day ❤️"
          className="w-full bg-[#131316] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none focus:border-[#f3be65]/50"
          required
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#a3a1a8] mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-[#131316] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#e4e1e5] focus:outline-none focus:border-[#f3be65]/50"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#a3a1a8] mb-1">Short Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="A brief story about this memory…"
          className="w-full bg-[#131316] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none focus:border-[#f3be65]/50 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-[#f3be65] hover:bg-[#d4a24c] text-[#131316] font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-60 shadow-md"
        >
          {loading ? 'Saving…' : initial ? '✓ Update Memory' : '+ Add Memory'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#a3a1a8] hover:text-white text-xs font-mono transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
