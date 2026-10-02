import React, { useCallback, useEffect, useState } from 'react';
import MockInterviewCard from '../components/MockInterviewCard';
import MockInterviewForm from '../components/MockInterviewForm';
import { mockInterviewsApi } from '../api/axios';

function hasAdminSession() {
  const token = localStorage.getItem('isep_admin_token') || localStorage.getItem('isep_token');
  if (!token) return false;

  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(window.atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export default function MockInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editingInterview, setEditingInterview] = useState(null);
  const isAdmin = hasAdminSession();

  const loadInterviews = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const response = await mockInterviewsApi.getAll();
      setInterviews(response.data.data || []);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Mock interview records could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  const handleSaved = (savedInterview) => {
    setInterviews((current) => {
      const exists = current.some((entry) => entry._id === savedInterview._id);
      const updated = exists
        ? current.map((entry) => entry._id === savedInterview._id ? savedInterview : entry)
        : [savedInterview, ...current];
      return updated.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    setEditingInterview(null);
  };

  const handleDelete = async (interview) => {
    if (!window.confirm(`Delete “${interview.title}”? This cannot be undone.`)) return;

    try {
      await mockInterviewsApi.delete(interview._id);
      setInterviews((current) => current.filter((entry) => entry._id !== interview._id));
      if (editingInterview?._id === interview._id) setEditingInterview(null);
    } catch (error) {
      window.alert(error.response?.data?.message || 'The mock interview record could not be deleted.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-10 sm:py-14">
      <header className="mx-auto max-w-3xl text-center">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#f3be65]">ISEP member development</span>
        <h1 className="mt-3 font-serif text-3xl font-bold text-[#e4e1e5] sm:text-5xl">Mock Interviews</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#a3a1a8]">
          A record of practice interviews, mentor feedback, and readiness milestones from the ISEP cohort.
        </p>
      </header>

      {isAdmin && (
        <section className="mx-auto max-w-3xl">
          <MockInterviewForm
            interview={editingInterview}
            onSaved={handleSaved}
            onCancel={() => setEditingInterview(null)}
          />
        </section>
      )}

      <section aria-labelledby="interview-archive-heading">
        <div className="mb-6 flex flex-col gap-3 border-b border-[#f3be65]/20 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="interview-archive-heading" className="font-serif text-2xl font-bold text-[#e4e1e5]">Interview archive</h2>
            <p className="mt-1 text-xs text-[#a3a1a8]">{interviews.length} recorded {interviews.length === 1 ? 'session' : 'sessions'}</p>
          </div>
          {isAdmin && <span className="w-fit rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-emerald-300">Admin editing enabled</span>}
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-[#a3a1a8]">Loading mock interview records…</div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-6 text-center">
            <p className="text-sm text-red-200">{loadError}</p>
            <button type="button" onClick={loadInterviews} className="mt-4 rounded-lg border border-red-400/30 px-4 py-2 text-xs text-red-100 transition-colors hover:bg-red-500/10">Try again</button>
          </div>
        ) : interviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#f3be65]/25 bg-[#1b1b1e]/55 px-6 py-16 text-center">
            <div className="text-4xl" aria-hidden="true">🎤</div>
            <h3 className="mt-4 font-serif text-xl font-bold text-[#e4e1e5]">Mock interview details will be added soon.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#a3a1a8]">This archive will document interviewer feedback, participant progress, and practical preparation sessions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {interviews.map((interview, index) => (
              <MockInterviewCard
                key={interview._id}
                interview={interview}
                index={index}
                isAdmin={isAdmin}
                onEdit={setEditingInterview}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
