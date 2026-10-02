import React, { useState, useRef } from 'react';
import api from '../api/axios';

export default function FileUpload({
  value = '',
  onChange,
  onUpload,
  accept = '.pdf,image/*',
  label = 'Upload File',
  maxSizeMB = 5
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const fileInputRef = useRef(null);

  const handleCallback = (url) => {
    if (onUpload) onUpload(url);
    if (onChange) onChange(url);
  };

  const processFile = async (file) => {
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB} MB limit.`);
      return;
    }

    setError('');
    setFileName(file.name);
    setFileType(file.type);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const uploadedUrl = res.data.url || res.data.filePath || (res.data.urls && res.data.urls[0]);
      handleCallback(uploadedUrl);
    } catch (err) {
      console.error('File upload error:', err);
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    handleCallback('');
    setFileName('');
    setFileType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isPdf = value?.toLowerCase().endsWith('.pdf') || fileType === 'application/pdf';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[11px] uppercase tracking-wider text-[#a3a1a8]">
          {label}
        </label>
      )}

      {error && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all p-5 flex flex-col items-center justify-center text-center cursor-pointer ${
          value
            ? 'border-[#f3be65]/40 bg-[#1b1b1e]'
            : 'border-white/10 hover:border-[#f3be65]/40 bg-[#131316]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-8 h-8 border-2 border-[#f3be65]/30 border-t-[#f3be65] rounded-full animate-spin" />
            <span className="text-xs font-mono text-[#a3a1a8]">Uploading file…</span>
          </div>
        ) : value ? (
          <div className="w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              {isPdf ? (
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl shrink-0">
                  📄
                </div>
              ) : (
                <img
                  src={value.startsWith('http') ? value : value}
                  alt="Preview"
                  className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                />
              )}
              <div className="text-left truncate">
                <span className="text-xs font-medium text-[#e4e1e5] block truncate">
                  {fileName || value.split('/').pop()}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  ✓ Uploaded successfully
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-xs text-[#a3a1a8] hover:text-red-300 font-mono transition-colors"
            >
              Replace
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3 text-[#a3a1a8]">
            <span className="text-3xl">📤</span>
            <div>
              <span className="text-xs font-medium text-[#e4e1e5]">Click or drag & drop</span>
              <p className="text-[10px] text-[#a3a1a8]/60 mt-0.5">
                Supports PDF documents & images (PNG, JPG, WEBP) up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
