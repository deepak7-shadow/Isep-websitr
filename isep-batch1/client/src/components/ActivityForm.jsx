import React, { useEffect, useState } from 'react';

export default function ActivityForm({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false
}) {
  const isEditMode = Boolean(initialData && initialData._id);

  const CATEGORIES = [
    'ISEP Activities',
    'Workshops',
    'Events',
    'College Activities',
    'Team Outings'
  ];

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ISEP Activities');

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [formError, setFormError] = useState('');

  const formatDateForInput = (value) => {
    if (!value) return '';

    const parsed = new Date(value);

    if (isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (initialData) {
      const oldImages = Array.isArray(initialData.images)
        ? initialData.images
        : [];

      setTitle(initialData.title || '');
      setDate(formatDateForInput(initialData.date));
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'ISEP Activities');
      setExistingImages(oldImages);
      setNewImages([]);
      setPreviews(oldImages);
    } else {
      setTitle('');
      setDate(formatDateForInput(new Date()));
      setDescription('');
      setCategory('ISEP Activities');
      setExistingImages([]);
      setNewImages([]);
      setPreviews([]);
    }

    setFormError('');
  }, [initialData]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        setFormError(`${file.name} is not a valid image.`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        setFormError(`${file.name} is larger than 10 MB.`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setFormError('');

    setNewImages((previous) => [...previous, ...validFiles]);

    const newPreviewUrls = validFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews((previous) => [...previous, ...newPreviewUrls]);

    e.target.value = '';
  };

  const removeImage = (index) => {
    const existingCount = existingImages.length;

    if (index < existingCount) {
      setExistingImages((previous) =>
        previous.filter((_, imageIndex) => imageIndex !== index)
      );
    } else {
      const newIndex = index - existingCount;

      setNewImages((previous) =>
        previous.filter((_, imageIndex) => imageIndex !== newIndex)
      );
    }

    setPreviews((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Activity title is required.');
      return;
    }

    if (!date) {
      setFormError('Activity date is required.');
      return;
    }

    if (!description.trim()) {
      setFormError('Activity description is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      date: new Date(date).toISOString(),
      description: description.trim(),
      category,
      existingImages,
      newImages
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
      <div className="border-b border-white/10 pb-4">
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">
          {isEditMode ? 'Activity Modification' : 'Activity Archive'}
        </span>

        <h2 className="font-serif text-2xl font-bold text-[#e4e1e5]">
          {isEditMode ? 'Edit Activity' : 'Add New Activity'}
        </h2>
      </div>

      {formError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
          {formError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
          Activity Title <span className="text-[#f3be65]">*</span>
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. ISEP Team Building Activity"
          className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors"
        />
      </div>

      {/* Category + Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
            Category <span className="text-[#f3be65]">*</span>
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] focus:outline-none"
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
            Activity Date <span className="text-[#f3be65]">*</span>
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] focus:outline-none"
          />
        </div>

      </div>

      {/* Description */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
          Description <span className="text-[#f3be65]">*</span>
        </label>

        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the activity..."
          className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none resize-none"
        />
      </div>

      {/* Multiple Image Upload */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
          Activity Images
        </label>

        <div className="border border-dashed border-[#f3be65]/30 rounded-xl p-5 bg-[#131316]">
          <input
            id="activity-images"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />

          <label
            htmlFor="activity-images"
            className="flex flex-col items-center justify-center cursor-pointer py-5"
          >
            <div className="text-[#f3be65] text-2xl mb-2">
              +
            </div>

            <p className="text-xs text-[#e4e1e5] font-semibold">
              Select Activity Images
            </p>

            <p className="text-[10px] text-[#a3a1a8] mt-1">
              You can select multiple images • Maximum 10 MB each
            </p>
          </label>
        </div>

        {/* Image Preview */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {previews.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/40"
              >
                <img
                  src={image}
                  alt={`Activity ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/75 text-white text-sm hover:bg-red-500 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {previews.length === 0 && (
          <p className="text-[10px] text-[#a3a1a8]/60 mt-3">
            No images selected yet.
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="pt-4 border-t border-white/10 flex justify-end gap-3">

        {onCancel && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-[#a3a1a8] hover:text-[#e4e1e5] text-xs font-semibold uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg bg-[#f3be65] hover:bg-[#d4a24c] text-[#131316] text-xs font-semibold uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
        >
          {isSubmitting
            ? 'Saving...'
            : isEditMode
              ? 'Save Activity Changes'
              : 'Add Activity'}
        </button>

      </div>
    </form>
  );
}