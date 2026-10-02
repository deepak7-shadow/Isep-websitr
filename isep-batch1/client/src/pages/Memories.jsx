import React, { useEffect, useState, useCallback } from 'react';
import { memoriesApi } from '../api/axios';
import MemoryCard from '../components/MemoryCard';
import MemoryForm from '../components/MemoryForm';

const ADMIN_TOKEN_KEY = 'isep_admin_token';

// Masonry column helper
function MasonryGrid({ items, isAdmin, onDelete, onEdit }) {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCols(1);
      else if (w < 1024) setCols(2);
      else setCols(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Distribute items into columns (top-to-bottom fill for true masonry)
  const columns = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));

  return (
    <div className="flex gap-5 items-start">
      {columns.map((col, ci) => (
        <div key={ci} className="flex-1 flex flex-col gap-5">
          {col.map(memory => (
            <MemoryCard
              key={memory._id}
              memory={memory}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Memories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [banner, setBanner] = useState(null);
  const [search, setSearch] = useState('');
  const [lightbox, setLightbox] = useState(null);

  const isAdmin = Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));

  const showBanner = useCallback((msg, type = 'success') => {
    setBanner({ msg, type });
    setTimeout(() => setBanner(null), 4000);
  }, []);

  const fetchMemories = useCallback(() => {
    setLoading(true);
    memoriesApi.getAll()
      .then(r => setMemories(r.data.data || []))
      .catch(() => setMemories([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleCreate = async (formData) => {
    setFormLoading(true);
    try {
      await memoriesApi.create(formData);
      showBanner('Memory added successfully! 🎉');
      setShowForm(false);
      fetchMemories();
    } catch (err) {
      showBanner(err.response?.data?.message || 'Failed to add memory.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (formData) => {
    setFormLoading(true);
    try {
      await memoriesApi.update(editTarget._id, formData);
      showBanner('Memory updated.');
      setEditTarget(null);
      fetchMemories();
    } catch (err) {
      showBanner(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await memoriesApi.delete(id);
      showBanner('Memory removed.');
      setMemories(prev => prev.filter(m => m._id !== id));
    } catch {
      showBanner('Delete failed.', 'error');
    }
  };

  const filtered = memories.filter(m =>
    !search ||
    m.caption?.toLowerCase().includes(search.toLowerCase()) ||
    m.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

      {/* ── Header ── */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">Archive Pavilion V</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#e4e1e5]">
          Fun & Memories
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a1a8] leading-relaxed">
          Candid moments, team outings, celebrations, and everything in between — captured forever.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
          <div className="inline-flex items-center gap-2 text-[11px] text-[#f3be65] bg-[#f3be65]/10 px-3 py-1 rounded-full border border-[#f3be65]/20">
            🎉 {memories.length} Memories Captured
          </div>
          {isAdmin && (
            <button
              onClick={() => { setShowForm(true); setEditTarget(null); }}
              className="inline-flex items-center gap-2 text-[11px] text-[#131316] bg-[#f3be65] hover:bg-[#d4a24c] px-4 py-1.5 rounded-full font-semibold transition-all shadow-md"
            >
              + Add Memory
            </button>
          )}
        </div>
      </div>

      {/* ── Notification Banner ── */}
      {banner && (
        <div className={`p-3 rounded-xl text-xs font-mono border ${
          banner.type === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-[#f3be65]/10 border-[#f3be65]/30 text-[#f3be65]'
        }`}>
          {banner.msg}
        </div>
      )}

      {/* ── Create Form Modal ── */}
      {(showForm || editTarget) && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { setShowForm(false); setEditTarget(null); }}
        >
          <div
            className="w-full max-w-lg bg-[#1b1b1e] border border-[#f3be65]/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">
                  {editTarget ? 'Edit Memory' : 'Add New Memory'}
                </span>
                <h2 className="font-serif text-xl font-bold text-[#e4e1e5] mt-0.5">
                  {editTarget ? 'Update this moment' : 'Capture a new moment'}
                </h2>
              </div>
              <button
                onClick={() => { setShowForm(false); setEditTarget(null); }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <MemoryForm
              initial={editTarget}
              onSubmit={editTarget ? handleEdit : handleCreate}
              onCancel={() => { setShowForm(false); setEditTarget(null); }}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* ── Search ── */}
      {memories.length > 0 && (
        <div className="max-w-md mx-auto">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search memories…"
            className="w-full bg-[#1b1b1e] border border-[#f3be65]/20 rounded-2xl px-5 py-3 text-sm text-[#e4e1e5] placeholder:text-[#a3a1a8]/50 focus:outline-none focus:border-[#f3be65]/60 transition-colors text-center"
          />
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4 text-[#a3a1a8]">
          <div className="w-10 h-10 border-2 border-[#f3be65]/30 border-t-[#f3be65] rounded-full animate-spin" />
          <span className="text-xs font-mono">Loading memories…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-4 text-center">
          <span className="text-7xl">📸</span>
          <h3 className="font-serif text-2xl font-bold text-[#e4e1e5]">
            {search ? 'No matches found' : 'No Memories Yet'}
          </h3>
          <p className="text-sm text-[#a3a1a8] max-w-xs leading-relaxed">
            {search
              ? 'Try a different search term.'
              : 'Upload images to display memories here — every moment counts!'}
          </p>
          {isAdmin && !search && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 px-6 py-2.5 rounded-xl bg-[#f3be65] hover:bg-[#d4a24c] text-[#131316] font-semibold text-sm transition-all shadow-md"
            >
              + Add First Memory
            </button>
          )}
        </div>
      ) : (
        <MasonryGrid
          items={filtered}
          isAdmin={isAdmin}
          onDelete={handleDelete}
          onEdit={m => { setEditTarget(m); setShowForm(false); }}
        />
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >✕</button>
            <img
              src={lightbox.image}
              alt={lightbox.caption}
              onContextMenu={e => e.preventDefault()}
              className="w-full rounded-2xl object-contain max-h-[80vh] select-none"
            />
            <div className="mt-4 text-center">
              <p className="font-medium text-white">{lightbox.caption}</p>
              {lightbox.description && (
                <p className="text-xs text-[#a3a1a8] mt-1">{lightbox.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
