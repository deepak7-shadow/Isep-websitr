import React, { useEffect, useState } from 'react';
import PendingApprovals from './PendingApprovals';
import { authApi, photosApi, certsApi, achievementsApi, thoughtsApi } from '../api/axios';

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('isep_admin_token') || '');
  const [email, setEmail] = useState('admin@isep.org');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');

  // Stats
  const [stats, setStats] = useState({ photos: 0, certificates: 0, achievements: 0, pendingThoughts: 0 });

  // Moderate thoughts list
  const [thoughts, setThoughts] = useState([]);

  // Forms
  const [newPhoto, setNewPhoto] = useState({ title: '', caption: '', album: 'Events', imageUrl: '' });
  const [newCert, setNewCert] = useState({ title: '', recipientName: '', issueDate: '2026-06-28', category: 'Completion' });
  const [newAch, setNewAch] = useState({ title: '', description: '', date: '2026-06-28' });

  // Status banners
  const [banner, setBanner] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await authApi.login({ email, password });
      if (res.data.token) {
        localStorage.setItem('isep_admin_token', res.data.token);
        setToken(res.data.token);
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed. Invalid administrator credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isep_admin_token');
    setToken('');
  };

  const loadData = async () => {
    try {
      const [pRes, cRes, aRes, tRes] = await Promise.all([
        photosApi.getAll(),
        certsApi.getAll(),
        achievementsApi.getAll(),
        thoughtsApi.getAllAdmin()
      ]);

      const allThoughts = tRes.data.data || [];
      const pendingCount = allThoughts.filter(t => t.status === 'pending').length;

      setStats({
        photos: pRes.data.count || 0,
        certificates: cRes.data.count || 0,
        achievements: aRes.data.count || 0,
        pendingThoughts: pendingCount
      });

      setThoughts(allThoughts);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const showNotification = (msg) => {
    setBanner(msg);
    setTimeout(() => setBanner(null), 4000);
  };

  // Moderate Thought
  const updateThoughtStatus = async (id, status) => {
    try {
      await thoughtsApi.updateStatus(id, status);
      showNotification(`Thought status updated to ${status}.`);
      loadData();
    } catch (e) {
      showNotification('Failed to update status.');
    }
  };

  const deleteThought = async (id) => {
    if (!window.confirm('Delete this thought permanently?')) return;
    try {
      await thoughtsApi.delete(id);
      showNotification('Thought removed.');
      loadData();
    } catch (e) {
      showNotification('Failed to delete thought.');
    }
  };

  // Photo Creation
  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!newPhoto.title) return;
    try {
      await photosApi.upload(newPhoto);
      showNotification('New photo record archived.');
      setNewPhoto({ title: '', caption: '', album: 'Events', imageUrl: '' });
      loadData();
    } catch (e) {
      showNotification('Photo upload failed.');
    }
  };

  // Certificate Creation
  const handleCertSubmit = async (e) => {
    e.preventDefault();
    if (!newCert.title || !newCert.recipientName) return;
    try {
      await certsApi.create(newCert);
      showNotification('Certificate record registered.');
      setNewCert({ title: '', recipientName: '', issueDate: '2026-06-28', category: 'Completion' });
      loadData();
    } catch (e) {
      showNotification('Certificate creation failed.');
    }
  };

  // Achievement Creation
  const handleAchSubmit = async (e) => {
    e.preventDefault();
    if (!newAch.title || !newAch.description) return;
    try {
      await achievementsApi.create(newAch);
      showNotification('Milestone archived.');
      setNewAch({ title: '', description: '', date: '2026-06-28' });
      loadData();
    } catch (e) {
      showNotification('Achievement creation failed.');
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="bg-[#1b1b1e] border border-[#f3be65]/30 rounded-2xl p-8 shadow-2xl">
          <div className="text-center space-y-2 mb-8">
            <span className="font-cinzel text-sm font-bold text-[#f3be65]">ISEP ARCHIVE</span>
            <h1 className="font-serif text-2xl font-bold text-[#e4e1e5]">Admin Authentication</h1>
            <p className="text-xs text-[#a3a1a8]">Restricted portal for ISEP coordinators and curators.</p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs mb-6">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131316] border border-[#f3be65]/20 rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] focus:outline-none focus:border-[#f3be65]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#131316] border border-[#f3be65]/20 rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] focus:outline-none focus:border-[#f3be65]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#f3be65] hover:bg-[#d4a24c] text-[#131316] font-semibold text-xs uppercase tracking-wider transition-all shadow-md mt-4"
            >
              Sign In to Admin Portal
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-center text-[11px] text-[#a3a1a8]/60">
            Demo Credentials: <span className="font-mono text-[#f3be65]">admin@isep.org</span> / <span className="font-mono text-[#f3be65]">admin123</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f3be65]/20">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">Archive Administration</span>
          <h1 className="font-serif text-3xl font-bold text-[#e4e1e5]">Curator Control Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#a3a1a8] font-mono">Signed in as {email}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {banner && (
        <div className="p-3 rounded-xl bg-[#f3be65]/10 border border-[#f3be65]/30 text-[#f3be65] text-xs font-mono">
          {banner}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveAdminTab('dashboard')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeAdminTab === 'dashboard' ? 'bg-[#f3be65] text-[#131316] font-semibold' : 'text-[#a3a1a8] hover:text-[#e4e1e5]'
          }`}
        >
          Overview & Counts
        </button>
        <button
          onClick={() => setActiveAdminTab('moderate')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
            activeAdminTab === 'moderate' ? 'bg-[#f3be65] text-[#131316] font-semibold' : 'text-[#a3a1a8] hover:text-[#e4e1e5]'
          }`}
        >
          Moderate Thoughts
          {stats.pendingThoughts > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold">
              {stats.pendingThoughts}
            </span>
          )}
        </button>
        <button
  onClick={() => setActiveAdminTab('pendingApprovals')}
  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
    activeAdminTab === 'pendingApprovals'
      ? 'bg-[#f3be65] text-[#131316] font-semibold'
      : 'text-white/70 hover:bg-white/10'
  }`}
>
  Pending Approvals
</button>
        <button
          onClick={() => setActiveAdminTab('upload')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeAdminTab === 'upload' ? 'bg-[#f3be65] text-[#131316] font-semibold' : 'text-[#a3a1a8] hover:text-[#e4e1e5]'
          }`}
        >
          Add / Archive Records
        </button>
      </div>

      {/* Tab: Dashboard Counts */}
      {activeAdminTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-[#1b1b1e] border border-[#f3be65]/20 p-6 rounded-2xl">
              <span className="text-[11px] uppercase tracking-wider text-[#a3a1a8]">Total Photos</span>
              <div className="font-cinzel text-3xl font-bold text-[#f3be65] mt-2">{stats.photos}</div>
            </div>
            <div className="bg-[#1b1b1e] border border-[#f3be65]/20 p-6 rounded-2xl">
              <span className="text-[11px] uppercase tracking-wider text-[#a3a1a8]">Certificates Issued</span>
              <div className="font-cinzel text-3xl font-bold text-[#f3be65] mt-2">{stats.certificates}</div>
            </div>
            <div className="bg-[#1b1b1e] border border-[#f3be65]/20 p-6 rounded-2xl">
              <span className="text-[11px] uppercase tracking-wider text-[#a3a1a8]">Milestones Recorded</span>
              <div className="font-cinzel text-3xl font-bold text-[#f3be65] mt-2">{stats.achievements}</div>
            </div>
            <div className="bg-[#1b1b1e] border border-amber-500/30 p-6 rounded-2xl">
              <span className="text-[11px] uppercase tracking-wider text-amber-300">Pending Moderation</span>
              <div className="font-cinzel text-3xl font-bold text-amber-400 mt-2">{stats.pendingThoughts}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Moderate Thoughts */}
      {activeAdminTab === 'moderate' && (
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#e4e1e5]">Submitted Reflections Queue</h2>
          <div className="overflow-x-auto rounded-xl border border-[#f3be65]/20 bg-[#1b1b1e]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#131316] text-[#a3a1a8] uppercase text-[10px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="p-4">Visitor</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {thoughts.map((t) => (
                  <tr key={t._id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-semibold text-[#e4e1e5] whitespace-nowrap">{t.name}</td>
                    <td className="p-4 text-[#a3a1a8] max-w-xs truncate">{t.message}</td>
                    <td className="p-4 text-[#f3be65] font-mono">{t.rating}★</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        t.status === 'approved' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : t.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      {t.status !== 'approved' && (
                        <button
                          onClick={() => updateThoughtStatus(t._id, 'approved')}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px]"
                        >
                          Approve
                        </button>
                      )}
                      {t.status !== 'hidden' && (
                        <button
                          onClick={() => updateThoughtStatus(t._id, 'hidden')}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px]"
                        >
                          Hide
                        </button>
                      )}
                      <button
                        onClick={() => deleteThought(t._id)}
                        className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Tab: Pending Approvals */}
{activeAdminTab === 'pendingApprovals' && (
  <PendingApprovals />
)}

      {/* Tab: Add Records */}
      {activeAdminTab === 'upload' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Photo Upload */}
          <form onSubmit={handlePhotoSubmit} className="bg-[#1b1b1e] border border-[#f3be65]/20 p-6 rounded-2xl space-y-4">
            <h3 className="font-serif text-base font-bold text-[#e4e1e5]">Add Photo Record</h3>
            <div>
              <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Title</label>
              <input
                type="text"
                required
                value={newPhoto.title}
                onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
                placeholder="Orientation Day 1"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Album</label>
              <select
                value={newPhoto.album}
                onChange={(e) => setNewPhoto({ ...newPhoto, album: e.target.value })}
                className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
              >
                <option value="Events">Events</option>
                <option value="Sessions">Sessions</option>
                <option value="Team Activities">Team Activities</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Caption</label>
              <textarea
                rows={2}
                value={newPhoto.caption}
                onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
                placeholder="Description of the moment..."
              />
            </div>
            <button type="submit" className="w-full py-2 rounded-lg bg-[#f3be65] text-[#131316] font-semibold text-xs uppercase">
              Save Photo
            </button>
          </form>

          {/* Certificate Registration */}
          <form onSubmit={handleCertSubmit} className="bg-[#1b1b1e] border border-[#f3be65]/20 p-6 rounded-2xl space-y-4">
            <h3 className="font-serif text-base font-bold text-[#e4e1e5]">Issue Certificate</h3>
            <div>
              <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Recipient Name</label>
              <input
                type="text"
                required
                value={newCert.recipientName}
                onChange={(e) => setNewCert({ ...newCert, recipientName: e.target.value })}
                className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
                placeholder="Full Intern Name"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Title</label>
              <input
                type="text"
                required
                value={newCert.title}
                onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
                placeholder="Certificate of Technical Excellence"
              />
            </div>
            <button type="submit" className="w-full py-2 rounded-lg bg-[#f3be65] text-[#131316] font-semibold text-xs uppercase">
              Issue Record
            </button>
          </form>

          {/* Milestone Recording */}
          <form onSubmit={handleAchSubmit} className="bg-[#1b1b1e] border border-[#f3be65]/20 p-6 rounded-2xl space-y-4">
            <h3 className="font-serif text-base font-bold text-[#e4e1e5]">Record Milestone</h3>
            <div>
              <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Title</label>
              <input
                type="text"
                required
                value={newAch.title}
                onChange={(e) => setNewAch({ ...newAch, title: e.target.value })}
                className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
                placeholder="Sprint Milestone"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Description</label>
              <textarea
                rows={2}
                required
                value={newAch.description}
                onChange={(e) => setNewAch({ ...newAch, description: e.target.value })}
                className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
                placeholder="Detailed achievement summary..."
              />
            </div>
            <button type="submit" className="w-full py-2 rounded-lg bg-[#f3be65] text-[#131316] font-semibold text-xs uppercase">
              Archive Milestone
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
