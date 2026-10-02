import React, { useState, useEffect } from 'react';
import { hackathonsApi } from '../api/axios';
import HackathonCard from '../components/HackathonCard';
import HackathonForm from '../components/HackathonForm';

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResultFilter, setSelectedResultFilter] = useState('ALL');

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // Check if current user is admin via stored token or role
    const adminToken = localStorage.getItem('isep_admin_token') || localStorage.getItem('isep_token');
    const userRole = localStorage.getItem('isep_user_role');
    if (adminToken && (userRole === 'admin' || localStorage.getItem('isep_admin_token'))) {
      setIsAdmin(true);
    }

    loadHackathons();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadHackathons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await hackathonsApi.getAll();
      const list = res.data?.data || res.data || [];
      setHackathons(list);
    } catch (err) {
      console.error('Error fetching hackathons:', err);
      setError('Failed to load hackathon archives. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (payload) => {
    setIsSubmitting(true);
    try {
      if (editingItem && editingItem._id) {
        await hackathonsApi.update(editingItem._id, payload);
        showToast('Hackathon record updated successfully!');
      } else {
        await hackathonsApi.create(payload);
        showToast('New hackathon record archived successfully!');
      }
      setShowForm(false);
      setEditingItem(null);
      loadHackathons();
    } catch (err) {
      console.error('Save hackathon error:', err);
      alert(err.response?.data?.message || 'Failed to save hackathon record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hackathon record?')) return;
    try {
      await hackathonsApi.delete(id);
      showToast('Hackathon record deleted.');
      setHackathons((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete hackathon record.');
    }
  };

  // Filter hackathons
  const filteredHackathons = hackathons.filter((item) => {
    const matchesSearch =
      (item.hackathonName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.teamMembers || []).some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedResultFilter === 'WINNERS') {
      return /winner|1st|first|gold|champion/i.test(item.result || '');
    }
    if (selectedResultFilter === 'FINALISTS') {
      return /finalist|top|2nd|3rd|runner/i.test(item.result || '');
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#f3be65] text-[#131316] font-mono text-xs px-5 py-3 rounded-xl shadow-2xl font-bold animate-bounce border border-black/20">
          ✓ {toastMessage}
        </div>
      )}

      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#1b1b1e] via-[#131316] to-[#1b1b1e] p-8 sm:p-12 border border-[#f3be65]/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#f3be65]/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f3be65] animate-ping"></span>
              <span className="text-[11px] uppercase font-mono tracking-[0.25em] text-[#f3be65]">
                Competitive Arenas & Hackathons
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#e4e1e5] tracking-tight">
              Hackathon Showcases
            </h1>
            <p className="text-sm text-[#a3a1a8] mt-3 max-w-2xl leading-relaxed">
              Explore the intense 24-48 hour hackathons, prototypes, national defenses, and podium finishes achieved by the ISEP Batch 1 cohort.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowForm(!showForm);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#f3be65] text-[#131316] font-semibold text-xs tracking-wider uppercase transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(243,190,101,0.25)] flex items-center gap-2"
              >
                <span>{showForm ? '✕ Close Form' : '+ Archive Hackathon'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-bold font-serif text-[#f3be65] block">{hackathons.length}</span>
            <span className="text-[10px] uppercase font-mono text-[#a3a1a8]">Total Competitions</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-bold font-serif text-emerald-400 block">
              {hackathons.filter((h) => /winner|1st|first|gold/i.test(h.result || '')).length}
            </span>
            <span className="text-[10px] uppercase font-mono text-[#a3a1a8]">Podium Finishes</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-bold font-serif text-amber-300 block">
              {hackathons.filter((h) => /finalist|top/i.test(h.result || '')).length}
            </span>
            <span className="text-[10px] uppercase font-mono text-[#a3a1a8]">National Finalists</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-bold font-serif text-[#e4e1e5] block">Batch 1</span>
            <span className="text-[10px] uppercase font-mono text-[#a3a1a8]">Cohort Defense</span>
          </div>
        </div>
      </div>

      {/* Form Drawer (Admin) */}
      {showForm && (
        <div className="transition-all duration-300">
          <HackathonForm
            initialData={editingItem}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#1b1b1e] border border-white/10">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by hackathon or member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131316] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#e4e1e5] focus:outline-none focus:border-[#f3be65] transition-colors"
          />
          <span className="absolute left-3 top-2.5 text-xs text-[#a3a1a8]">🔍</span>
        </div>

        {/* Result Filter Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Hackathons' },
            { id: 'WINNERS', label: '🏆 Winners' },
            { id: 'FINALISTS', label: '🥈 Finalists' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedResultFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
                selectedResultFilter === tab.id
                  ? 'bg-[#f3be65] text-[#131316] font-semibold'
                  : 'bg-white/5 text-[#a3a1a8] hover:text-[#e4e1e5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-2 border-[#f3be65] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs font-mono text-[#a3a1a8]">Loading competitive archives...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center text-red-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Empty State with Required Placeholder */}
      {!loading && !error && filteredHackathons.length === 0 && (
        <div className="py-20 text-center rounded-3xl bg-[#1b1b1e]/50 border border-dashed border-[#f3be65]/30 p-12">
          <span className="text-5xl block mb-4">💻</span>
          <h3 className="font-serif text-xl font-bold text-[#e4e1e5] mb-2">
            Hackathon details will be added soon.
          </h3>
          <p className="text-xs text-[#a3a1a8] max-w-md mx-auto">
            {searchQuery
              ? 'No hackathons matched your current search filters. Try clearing the filter.'
              : 'Our cohort members are currently curating and documenting their hackathon projects and awards.'}
          </p>
          {isAdmin && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 px-5 py-2.5 rounded-xl bg-[#f3be65] text-[#131316] font-semibold text-xs tracking-wider uppercase"
            >
              + Be First to Archive a Hackathon
            </button>
          )}
        </div>
      )}

      {/* Cards Grid */}
      {!loading && !error && filteredHackathons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => (
            <HackathonCard
              key={hackathon._id}
              hackathon={hackathon}
              onEdit={
                isAdmin
                  ? (item) => {
                      setEditingItem(item);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  : undefined
              }
              onDelete={isAdmin ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
