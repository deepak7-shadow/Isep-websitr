import React, { useState } from 'react';
import axios from '../api/axios';

const ImageUpload = ({ value = [], onChange, multiple = true }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file); // Adjust 'images' if your backend expects a different field name like 'photos' or 'image'
    });

    try {
      setUploading(true);
      setError(null);

      // Adjust endpoint if your backend upload route is different (e.g., /api/upload)
      const res = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Assuming the backend returns an array of file paths or a single path
      const uploadedPaths = res.data.paths || res.data.urls || res.data.filePath || res.data;
      
      if (multiple) {
        const newImages = Array.isArray(uploadedPaths) ? [...value, ...uploadedPaths] : [...value, uploadedPaths];
        onChange(newImages);
      } else {
        onChange(Array.isArray(uploadedPaths) ? uploadedPaths[0] : uploadedPaths);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload image(s). Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (indexToRemove) => {
    if (multiple) {
      onChange(value.filter((_, index) => index !== indexToRemove));
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex flex-wrap gap-3">
        {multiple && Array.isArray(value) && value.map((img, idx) => (
          <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 bg-[#131316]">
            <img 
              src={img.startsWith('http') ? img : `/${img}`} 
              alt="Uploaded Preview" 
              className="w-full h-full object-cover" 
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition"
            >
              &times;
            </button>
          </div>
        ))}

        {!multiple && value && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 bg-[#131316]">
            <img 
              src={value.startsWith('http') ? value : `/${value}`} 
              alt="Uploaded Preview" 
              className="w-full h-full object-cover" 
            />
            <button
              type="button"
              onClick={() => handleRemove(0)}
              className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition"
            >
              &times;
            </button>
          </div>
        )}

        <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-[#131316] hover:border-[#f3be65] transition text-center p-1">
          <span className="text-xs text-[#a3a1a8] mt-1">{uploading ? '...' : '+ Upload'}</span>
          <input 
            type="file" 
            multiple={multiple} 
            accept="image/*" 
            onChange={handleFileChange} 
            disabled={uploading}
            className="hidden" 
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;