import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import PendingApprovals from './PendingApprovals';
import {
  authApi,
  photosApi,
  certsApi,
  achievementsApi,
  thoughtsApi,
  activitiesApi,
  hackathonsApi,
  mockInterviewsApi,
} from '../api/axios';
import api from '../api/axios';

// ─── Sub-panel: Dashboard Overview ──────────────────────────────────────────
function DashboardPanel({ stats }) {
  const cards = [
    { label: 'Total Members', value: stats.members, icon: '👥', color: 'text-sky-400', border: 'border-sky-500/30' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: '⏳', color: 'text-amber-400', border: 'border-amber-500/30' },
    { label: 'Total Activities', value: stats.activities, icon: '🎯', color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { label: 'Hackathons', value: stats.hackathons, icon: '💻', color: 'text-violet-400', border: 'border-violet-500/30' },
    { label: 'Mock Interviews', value: stats.mockInterviews, icon: '🎤', color: 'text-rose-400', border: 'border-rose-500/30' },
    { label: 'Photos Archived', value: stats.photos, icon: '🖼️', color: 'text-[#f3be65]', border: 'border-[#f3be65]/30' },
    { label: 'Certificates Issued', value: stats.certificates, icon: '📜', color: 'text-[#f3be65]', border: 'border-[#f3be65]/30' },
    { label: 'Pending Moderation', value: stats.pendingThoughts, icon: '💭', color: 'text-amber-400', border: 'border-amber-500/30' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#e4e1e5] mb-1">Control Center Overview</h2>
        <p className="text-xs text-[#a3a1a8]">Live snapshot of ISEP Batch 1 portal activity.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`bg-[#1b1b1e] border ${c.border} rounded-2xl p-5 flex flex-col gap-2 hover:scale-[1.02] transition-transform`}
          >
            <span className="text-2xl">{c.icon}</span>
            <div className={`font-cinzel text-4xl font-bold ${c.color}`}>{c.value ?? '—'}</div>
            <span className="text-[11px] uppercase tracking-wider text-[#a3a1a8]">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-panel: Members List ─────────────────────────────────────────────────
function MembersPanel({ showNotification }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/admin/users')
      .then(r => setMembers(r.data.users || r.data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setMembers(prev => prev.map(m => m._id === userId ? { ...m, role: newRole } : m));
      showNotification(`Role updated to ${newRole}.`);
    } catch {
      showNotification('Failed to update role.');
    }
  };

  const filtered = members.filter(m => {
    const matchSearch = m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'approved' ? m.approvalStatus === 'approved' :
      filter === 'pending' ? m.approvalStatus === 'pending' :
      filter === 'rejected' ? m.approvalStatus === 'rejected' : true;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="text-center text-[#a3a1a8] py-20 font-mono text-xs">Loading member records…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#e4e1e5]">All Member Records</h2>
          <p className="text-xs text-[#a3a1a8]">{members.length} registered users in the system.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'approved', 'pending', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                filter === f ? 'bg-[#f3be65] text-[#131316] font-bold' : 'bg-white/5 text-[#a3a1a8] hover:text-[#f3be65]'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full bg-[#1b1b1e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/50 focus:outline-none focus:border-[#f3be65]/50"
      />

      <div className="overflow-x-auto rounded-xl border border-[#f3be65]/20 bg-[#1b1b1e]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#131316] text-[#a3a1a8] uppercase text-[10px] tracking-wider border-b border-white/5">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Branch</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center p-8 text-[#a3a1a8]">No members found.</td></tr>
            ) : filtered.map(m => (
              <tr key={m._id} className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-[#e4e1e5]">{m.fullName || '—'}</td>
                <td className="p-4 text-[#a3a1a8] font-mono">{m.email}</td>
                <td className="p-4 text-[#a3a1a8]">{m.branch || '—'}</td>
                <td className="p-4">
                  <select
                    value={m.role}
                    onChange={e => handleRoleChange(m._id, e.target.value)}
                    className="bg-[#131316] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-[#e4e1e5]"
                  >
                    <option value="member">member</option>
                    <option value="head">head</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                    m.approvalStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    m.approvalStatus === 'pending' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {m.approvalStatus}
                  </span>
                </td>
                <td className="p-4 text-[#a3a1a8] font-mono text-[10px]">
                  {m.registeredAt ? new Date(m.registeredAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sub-panel: Moderate Thoughts ────────────────────────────────────────────
function ModeratePanel({ thoughts, onUpdateStatus, onDelete }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#e4e1e5]">Submitted Reflections</h2>
        <p className="text-xs text-[#a3a1a8]">Moderate visitor thoughts before they appear publicly.</p>
      </div>
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
            {thoughts.length === 0 && (
              <tr><td colSpan={5} className="text-center p-8 text-[#a3a1a8]">No thoughts in the queue.</td></tr>
            )}
            {thoughts.map(t => (
              <tr key={t._id} className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-[#e4e1e5] whitespace-nowrap">{t.name}</td>
                <td className="p-4 text-[#a3a1a8] max-w-xs truncate">{t.message}</td>
                <td className="p-4 text-[#f3be65] font-mono">{t.rating}★</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                    t.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    t.status === 'pending' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>{t.status}</span>
                </td>
                <td className="p-4 text-right space-x-2 whitespace-nowrap">
                  {t.status !== 'approved' && (
                    <button onClick={() => onUpdateStatus(t._id, 'approved')}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px]">
                      Approve
                    </button>
                  )}
                  {t.status !== 'hidden' && (
                    <button onClick={() => onUpdateStatus(t._id, 'hidden')}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px]">
                      Hide
                    </button>
                  )}
                  <button onClick={() => onDelete(t._id)}
                    className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px]">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sub-panel: Add Archive Records ──────────────────────────────────────────
function ArchivePanel({ showNotification, onRefresh }) {
  const [newPhoto, setNewPhoto] = useState({ title: '', caption: '', album: 'Events', imageUrl: '' });
  const [newCert, setNewCert] = useState({ title: '', recipientName: '', issueDate: '2026-06-28', category: 'Completion' });
  const [newAch, setNewAch] = useState({ title: '', description: '', date: '2026-06-28' });

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!newPhoto.title) return;
    try {
      await photosApi.upload(newPhoto);
      showNotification('New photo record archived.');
      setNewPhoto({ title: '', caption: '', album: 'Events', imageUrl: '' });
      onRefresh();
    } catch { showNotification('Photo upload failed.'); }
  };

  const handleCertSubmit = async (e) => {
    e.preventDefault();
    if (!newCert.title || !newCert.recipientName) return;
    try {
      await certsApi.create(newCert);
      showNotification('Certificate record registered.');
      setNewCert({ title: '', recipientName: '', issueDate: '2026-06-28', category: 'Completion' });
      onRefresh();
    } catch { showNotification('Certificate creation failed.'); }
  };

  const handleAchSubmit = async (e) => {
    e.preventDefault();
    if (!newAch.title || !newAch.description) return;
    try {
      await achievementsApi.create(newAch);
      showNotification('Milestone archived.');
      setNewAch({ title: '', description: '', date: '2026-06-28' });
      onRefresh();
    } catch { showNotification('Achievement creation failed.'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#e4e1e5]">Add / Archive Records</h2>
        <p className="text-xs text-[#a3a1a8]">Manually log photos, certificates, and milestones.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Photo */}
        <form onSubmit={handlePhotoSubmit} className="bg-[#1b1b1e] border border-[#f3be65]/20 p-6 rounded-2xl space-y-4">
          <h3 className="font-serif text-base font-bold text-[#e4e1e5]">📷 Add Photo Record</h3>
          <div>
            <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Title</label>
            <input type="text" required value={newPhoto.title}
              onChange={e => setNewPhoto({ ...newPhoto, title: e.target.value })}
              className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
              placeholder="Orientation Day 1" />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Album</label>
            <select value={newPhoto.album} onChange={e => setNewPhoto({ ...newPhoto, album: e.target.value })}
              className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]">
              <option>Events</option>
              <option>Sessions</option>
              <option>Team Activities</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Caption</label>
            <textarea rows={2} value={newPhoto.caption}
              onChange={e => setNewPhoto({ ...newPhoto, caption: e.target.value })}
              className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
              placeholder="Description of the moment…" />
          </div>
          <button type="submit" className="w-full py-2 rounded-lg bg-[#f3be65] text-[#131316] font-semibold text-xs uppercase">
            Save Photo
          </button>
        </form>

        {/* Certificate */}
        <form onSubmit={handleCertSubmit} className="bg-[#1b1b1e] border border-[#f3be65]/20 p-6 rounded-2xl space-y-4">
          <h3 className="font-serif text-base font-bold text-[#e4e1e5]">📜 Issue Certificate</h3>
          <div>
            <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Recipient Name</label>
            <input type="text" required value={newCert.recipientName}
              onChange={e => setNewCert({ ...newCert, recipientName: e.target.value })}
              className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
              placeholder="Full Intern Name" />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Certificate Title</label>
            <input type="text" required value={newCert.title}
              onChange={e => setNewCert({ ...newCert, title: e.target.value })}
              className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
              placeholder="Certificate of Technical Excellence" />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Category</label>
            <select value={newCert.category} onChange={e => setNewCert({ ...newCert, category: e.target.value })}
              className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]">
              <option>Completion</option>
              <option>Excellence</option>
              <option>Participation</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 rounded-lg bg-[#f3be65] text-[#131316] font-semibold text-xs uppercase">
            Issue Record
          </button>
        </form>

        {/* Achievement */}
        <form onSubmit={handleAchSubmit} className="bg-[#1b1b1e] border border-[#f3be65]/20 p-6 rounded-2xl space-y-4">
          <h3 className="font-serif text-base font-bold text-[#e4e1e5]">🏆 Record Milestone</h3>
          <div>
            <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Title</label>
            <input type="text" required value={newAch.title}
              onChange={e => setNewAch({ ...newAch, title: e.target.value })}
              className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
              placeholder="Sprint Milestone" />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#a3a1a8] mb-1">Description</label>
            <textarea rows={2} required value={newAch.description}
              onChange={e => setNewAch({ ...newAch, description: e.target.value })}
              className="w-full bg-[#131316] border border-white/10 rounded-lg p-2 text-xs text-[#e4e1e5]"
              placeholder="Detailed achievement summary…" />
          </div>
          <button type="submit" className="w-full py-2 rounded-lg bg-[#f3be65] text-[#131316] font-semibold text-xs uppercase">
            Archive Milestone
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Sub-panel: ISEP Heads placeholder ───────────────────────────────────────
function HeadsPanel() {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold text-[#e4e1e5]">👑 ISEP Heads</h2>
      <p className="text-xs text-[#a3a1a8]">Manage the hierarchy of ISEP Batch 1 heads and mentors. (M17 — coming soon)</p>
      <div className="bg-[#1b1b1e] border border-[#f3be65]/20 rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
        <span className="text-5xl">👑</span>
        <h3 className="font-serif text-lg font-bold text-[#e4e1e5]">Coming in M17</h3>
        <p className="text-xs text-[#a3a1a8] max-w-sm">The ISEP heads & hierarchy section is being built by another team member.</p>
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function AdminLoginScreen({ onLogin }) {
  const [email, setEmail] = useState('admin@isep.org');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authApi.login({ email, password });
      if (res.data.token) {
        localStorage.setItem('isep_admin_token', res.data.token);
        onLogin({ token: res.data.token, email });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#131316] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1b1b1e] border border-[#f3be65]/30 rounded-2xl p-8 shadow-2xl">
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f3be65] to-amber-600 flex items-center justify-center text-[#131316] font-cinzel font-bold text-sm shadow-md mx-auto mb-4">
            ADM
          </div>
          <span className="font-cinzel text-sm font-bold text-[#f3be65]">ISEP ARCHIVE</span>
          <h1 className="font-serif text-2xl font-bold text-[#e4e1e5]">Admin Authentication</h1>
          <p className="text-xs text-[#a3a1a8]">Restricted portal for ISEP coordinators and curators.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] mb-1">Email Address</label>
            <input type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#131316] border border-[#f3be65]/20 rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] focus:outline-none focus:border-[#f3be65]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] mb-1">Password</label>
            <input type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#131316] border border-[#f3be65]/20 rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] focus:outline-none focus:border-[#f3be65]" />
          </div>
          <button type="submit"
            className="w-full py-3 rounded-lg bg-[#f3be65] hover:bg-[#d4a24c] text-[#131316] font-semibold text-xs uppercase tracking-wider transition-all shadow-md mt-4">
            Sign In to Admin Portal
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/5 text-center text-[11px] text-[#a3a1a8]/60">
          Demo: <span className="font-mono text-[#f3be65]">admin@isep.org</span> / <span className="font-mono text-[#f3be65]">admin123</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Component ─────────────────────────────────────────────────────
export default function Admin({ onSwitchToPublic }) {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('isep_admin_token');
    return token ? { token, email: 'admin@isep.org' } : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    members: 0, pendingApprovals: 0, activities: 0, hackathons: 0,
    mockInterviews: 0, photos: 0, certificates: 0, achievements: 0, pendingThoughts: 0
  });
  const [thoughts, setThoughts] = useState([]);
  const [banner, setBanner] = useState(null);

  const showNotification = useCallback((msg) => {
    setBanner(msg);
    setTimeout(() => setBanner(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [pRes, cRes, aRes, tRes, actRes, hackRes, miRes] = await Promise.all([
        photosApi.getAll().catch(() => ({ data: { count: 0 } })),
        certsApi.getAll().catch(() => ({ data: { count: 0 } })),
        achievementsApi.getAll().catch(() => ({ data: { count: 0 } })),
        thoughtsApi.getAllAdmin().catch(() => ({ data: { data: [] } })),
        activitiesApi.getAll().catch(() => ({ data: { count: 0 } })),
        hackathonsApi.getAll().catch(() => ({ data: { count: 0 } })),
        mockInterviewsApi.getAll().catch(() => ({ data: { count: 0 } })),
      ]);

      const allThoughts = tRes.data.data || [];
      const pendingThoughts = allThoughts.filter(t => t.status === 'pending').length;

      // Try fetching members (admin-only endpoint)
      let memberCount = 0;
      let pendingCount = 0;
      try {
        const usersRes = await api.get('/admin/users');
        const users = usersRes.data.users || usersRes.data || [];
        memberCount = users.filter(u => u.approvalStatus === 'approved').length;
        pendingCount = users.filter(u => u.approvalStatus === 'pending').length;
      } catch { /* non-critical */ }

      setStats({
        members: memberCount,
        pendingApprovals: pendingCount,
        activities: actRes.data.count || (actRes.data.data || actRes.data || []).length || 0,
        hackathons: hackRes.data.count || (hackRes.data.data || hackRes.data || []).length || 0,
        mockInterviews: miRes.data.count || (miRes.data.data || miRes.data || []).length || 0,
        photos: pRes.data.count || 0,
        certificates: cRes.data.count || 0,
        achievements: aRes.data.count || 0,
        pendingThoughts,
      });
      setThoughts(allThoughts);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  const handleLogout = () => {
    localStorage.removeItem('isep_admin_token');
    setSession(null);
  };

  const handleUpdateThoughtStatus = async (id, status) => {
    try {
      await thoughtsApi.updateStatus(id, status);
      showNotification(`Thought marked as ${status}.`);
      loadData();
    } catch { showNotification('Failed to update status.'); }
  };

  const handleDeleteThought = async (id) => {
    if (!window.confirm('Delete this thought permanently?')) return;
    try {
      await thoughtsApi.delete(id);
      showNotification('Thought removed.');
      loadData();
    } catch { showNotification('Failed to delete thought.'); }
  };

  if (!session) {
    return <AdminLoginScreen onLogin={setSession} />;
  }

  const tabTitles = {
    dashboard: 'Dashboard Overview',
    members: 'All Members',
    pendingApprovals: 'Pending Approvals',
    moderate: 'Moderate Thoughts',
    heads: 'ISEP Heads',
    upload: 'Add / Archive Records',
    activities: 'Activities',
    hackathons: 'Hackathons',
    mockInterviews: 'Mock Interviews',
    photos: 'Photo Gallery',
    certificates: 'Certificates',
    achievements: 'Achievements',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPanel stats={stats} />;
      case 'members':
        return <MembersPanel showNotification={showNotification} />;
      case 'pendingApprovals':
        return <PendingApprovals />;
      case 'moderate':
        return (
          <ModeratePanel
            thoughts={thoughts}
            onUpdateStatus={handleUpdateThoughtStatus}
            onDelete={handleDeleteThought}
          />
        );
      case 'heads':
        return <HeadsPanel />;
      case 'upload':
        return <ArchivePanel showNotification={showNotification} onRefresh={loadData} />;
      case 'activities':
        return (
          <div className="text-center py-20 text-[#a3a1a8]">
            <span className="text-5xl block mb-4">🎯</span>
            <h2 className="font-serif text-xl font-bold text-[#e4e1e5] mb-2">Activities Module</h2>
            <p className="text-xs">Full admin CRUD for activities — see the public Activities page for now.</p>
          </div>
        );
      case 'hackathons':
        return (
          <div className="text-center py-20 text-[#a3a1a8]">
            <span className="text-5xl block mb-4">💻</span>
            <h2 className="font-serif text-xl font-bold text-[#e4e1e5] mb-2">Hackathons Module</h2>
            <p className="text-xs">Full admin CRUD for hackathons — see the public Hackathons page for now.</p>
          </div>
        );
      case 'mockInterviews':
        return (
          <div className="text-center py-20 text-[#a3a1a8]">
            <span className="text-5xl block mb-4">🎤</span>
            <h2 className="font-serif text-xl font-bold text-[#e4e1e5] mb-2">Mock Interviews Module</h2>
            <p className="text-xs">Full admin CRUD for mock interviews — see the public Mock Interviews page for now.</p>
          </div>
        );
      default:
        return <DashboardPanel stats={stats} />;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      counts={{
        members: stats.members,
        pendingApprovals: stats.pendingApprovals,
        pendingCount: stats.pendingApprovals,
        activities: stats.activities,
        hackathons: stats.hackathons,
        mockInterviews: stats.mockInterviews,
        photos: stats.photos,
        certificates: stats.certificates,
        achievements: stats.achievements,
        pendingThoughts: stats.pendingThoughts,
      }}
      adminEmail={session.email}
      onLogout={handleLogout}
      onSwitchToPublic={onSwitchToPublic}
      title={tabTitles[activeTab] || 'Admin'}
    >
      {/* Notification Banner */}
      {banner && (
        <div className="p-3 rounded-xl bg-[#f3be65]/10 border border-[#f3be65]/30 text-[#f3be65] text-xs font-mono">
          ✓ {banner}
        </div>
      )}

      {renderContent()}
    </AdminLayout>
  );
}
