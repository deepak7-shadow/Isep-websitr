import React, { useEffect, useState } from 'react';
import { memoriesApi } from '../api/axios';
import MemoryCard from '../components/MemoryCard';
import MemoryForm from '../components/MemoryForm';

export default function Memories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [error, setError] = useState('');

  const token =
    localStorage.getItem('isep_admin_token') ||
    localStorage.getItem('isep_token');

  const loadMemories = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await memoriesApi.getAll();
      setMemories(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load memories:', err);
      setError('Unable to load memories right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setError('');

      if (editingMemory) {
        await memoriesApi.update(editingMemory._id, formData);
      } else {
        await memoriesApi.create(formData);
      }

      setShowForm(false);
      setEditingMemory(null);

      await loadMemories();
    } catch (err) {
      console.error('Failed to save memory:', err);

      const message =
        err.response?.data?.message ||
        'Unable to save the memory. Please try again.';

      setError(message);
      throw err;
    }
  };

  const handleEdit = (memory) => {
    setEditingMemory(memory);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (memory) => {
    const confirmed = window.confirm(
      `Delete "${memory.caption}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError('');
      await memoriesApi.delete(memory._id);
      await loadMemories();
    } catch (err) {
      console.error('Failed to delete memory:', err);

      const message =
        err.response?.data?.message ||
        'Unable to delete the memory.';

      setError(message);
    }
  };

  const handleCancel = () => {
    setEditingMemory(null);
    setShowForm(false);
  };

  /*
   * The backend protects create/edit/delete using authentication.
   * We therefore show the form to authenticated users and let the
   * backend decide whether the requested action is allowed.
   */
  const isAuthenticated = Boolean(token);
  const isAdmin = Boolean(localStorage.getItem('isep_admin_token'));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">
          Archive Pavilion II
        </span>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#e4e1e5]">
          ISEP Memories
        </h1>

        <p className="text-xs sm:text-sm text-[#a3a1a8] leading-relaxed">
          A casual collection of team moments, celebrations, workshops,
          hackathons, and little memories from the ISEP journey. ✨
        </p>

        <div className="inline-flex items-center gap-2 text-[11px] text-[#f3be65] bg-[#f3be65]/10 px-3 py-1 rounded-full border border-[#f3be65]/20">
          📸 Moments worth remembering
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-3xl mx-auto rounded-xl border border-red-300/20 bg-red-300/5 px-4 py-3 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Add Memory Button */}
      {isAuthenticated && !showForm && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              setEditingMemory(null);
              setShowForm(true);
            }}
            className="rounded-xl bg-[#f3be65] text-[#131316] px-5 py-3 text-sm font-semibold hover:bg-[#ffd486] transition-colors shadow-lg"
          >
            + Add a Memory
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && isAuthenticated && (
        <div className="max-w-2xl mx-auto">
          <MemoryForm
            onSubmit={handleSubmit}
            editingMemory={editingMemory}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Memories */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#a3a1a8]">
          Loading memories...
        </div>
      ) : memories.length === 0 ? (
        <div className="py-20 text-center bg-[#1b1b1e]/50 rounded-2xl border border-white/5">
          <div className="text-4xl mb-4">📸</div>

          <h2 className="font-serif text-xl text-[#e4e1e5]">
            No memories yet
          </h2>

          <p className="text-xs text-[#a3a1a8] mt-2">
            Upload images to display memories.
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {memories.map((memory) => (
            <MemoryCard
              key={memory._id}
              memory={memory}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={isAuthenticated}
              canDelete={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}