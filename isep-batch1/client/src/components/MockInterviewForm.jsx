import React, { useEffect, useState } from 'react';
import { membersApi, mockInterviewsApi } from '../api/axios';

const emptyInterview = {
  title: '',
  date: '',
  interviewer: '',
  participant: '',
  description: '',
  notes: '',
  image: ''
};

function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export default function MockInterviewForm({ interview, onSaved, onCancel }) {
  const [form, setForm] = useState(emptyInterview);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setForm(interview ? {
      title: interview.title || '',
      date: toDateInputValue(interview.date),
      interviewer: interview.interviewer || '',
      participant: interview.participant || '',
      description: interview.description || '',
      notes: interview.notes || '',
      image: interview.image || ''
    } : emptyInterview);
    setFeedback(null);
  }, [interview]);

  useEffect(() => {
    let mounted = true;

    membersApi.getAll()
      .then((response) => {
        if (mounted) setMembers(response.data.data || []);
      })
      .catch(() => {
        if (mounted) setFeedback({ type: 'error', text: 'Could not load approved members. Refresh and try again.' });
      })
      .finally(() => {
        if (mounted) setLoadingMembers(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImage = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'Choose a JPG, PNG, WEBP, or GIF image.' });
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'Image size must be 5 MB or less.' });
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result) }));
    reader.onerror = () => setFeedback({ type: 'error', text: 'The selected image could not be read.' });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = interview
        ? await mockInterviewsApi.update(interview._id, form)
        : await mockInterviewsApi.create(form);

      onSaved(response.data.data);
      if (!interview) setForm(emptyInterview);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.response?.data?.message || 'The mock interview record could not be saved.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = 'w-full rounded-lg border border-[#f3be65]/20 bg-[#131316] px-4 py-2.5 text-sm text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 transition-colors focus:border-[#f3be65] focus:outline-none';

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#f3be65]/25 bg-[#1b1b1e] p-6 shadow-xl sm:p-8">
      <div className="mb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#f3be65]">Admin record editor</span>
        <h2 className="mt-1 font-serif text-2xl font-bold text-[#e4e1e5]">
          {interview ? 'Edit Mock Interview' : 'Add Mock Interview'}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[#a3a1a8]">
          Record interviewer feedback and a supporting image for the member archive.
        </p>
      </div>

      {feedback && (
        <div className={`mb-5 rounded-xl border p-3 text-xs ${
          feedback.type === 'error'
            ? 'border-red-500/30 bg-red-500/10 text-red-200'
            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
        }`}>
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">Title *</span>
          <input name="title" value={form.title} onChange={updateField} required placeholder="e.g. Frontend Technical Mock" className={fieldClass} />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">Date</span>
          <input name="date" type="date" value={form.date} onChange={updateField} className={fieldClass} />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">Interviewer *</span>
          <input name="interviewer" value={form.interviewer} onChange={updateField} required placeholder="Mentor or interviewer name" className={fieldClass} />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">Participant *</span>
          <select name="participant" value={form.participant} onChange={updateField} required disabled={loadingMembers || members.length === 0} className={fieldClass}>
            <option value="">{loadingMembers ? 'Loading approved members…' : 'Select a member'}</option>
            {members.map((member) => (
              <option key={member._id || member.id} value={member.fullName}>
                {member.fullName}{member.branch ? ` — ${member.branch}` : ''}
              </option>
            ))}
          </select>
          {!loadingMembers && members.length === 0 && (
            <span className="mt-1 block text-[11px] text-red-300">No approved members are available to select.</span>
          )}
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">Description</span>
          <textarea name="description" value={form.description} onChange={updateField} rows={3} placeholder="What did the interview cover?" className={`${fieldClass} resize-none`} />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">Notes</span>
          <textarea name="notes" value={form.notes} onChange={updateField} rows={4} placeholder="Feedback, evaluation notes, and follow-up actions" className={`${fieldClass} resize-none`} />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">Supporting image</span>
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImage} className="block w-full cursor-pointer rounded-lg border border-dashed border-[#f3be65]/30 bg-[#131316] px-3 py-2 text-xs text-[#a3a1a8] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#f3be65]/15 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#f3be65] hover:file:bg-[#f3be65]/25" />
          <span className="mt-1 block text-[11px] text-[#a3a1a8]/70">Optional. JPG, PNG, WEBP, or GIF up to 5 MB.</span>
        </label>
      </div>

      {form.image && (
        <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/30">
          <img src={form.image} alt="Selected mock interview" className="h-44 w-full object-cover" />
          <button
            type="button"
            onClick={() => setForm((current) => ({ ...current, image: '' }))}
            className="absolute right-3 top-3 rounded-md bg-black/70 px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-black"
          >
            Remove image
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        {interview && (
          <button type="button" onClick={onCancel} className="rounded-lg border border-white/15 px-4 py-2.5 text-xs font-medium text-[#a3a1a8] transition-colors hover:border-white/30 hover:text-[#e4e1e5]">
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting || loadingMembers || members.length === 0} className="rounded-lg bg-[#f3be65] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#131316] shadow-md transition-colors hover:bg-[#d4a24c] disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? 'Saving…' : interview ? 'Save changes' : 'Add interview'}
        </button>
      </div>
    </form>
  );
}
