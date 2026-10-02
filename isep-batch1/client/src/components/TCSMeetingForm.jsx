import React, { useState, useEffect } from 'react';
import { tcsMeetingsApi } from '../api/axios';
import ImageUpload from './ImageUpload';

const TCSMeetingForm = ({ meeting, onSuccess }) => {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [date, setDate] = useState('');
  const [guestName, setGuestName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (meeting) {
      setMeetingTitle(meeting.meetingTitle || '');
      setDate(meeting.date ? meeting.date.substring(0, 10) : '');
      setGuestName(meeting.guestName || '');
      setDescription(meeting.description || '');
      setNotes(meeting.notes || '');
      setImages(meeting.images || []);
    } else {
      setMeetingTitle('');
      setDate('');
      setGuestName('');
      setDescription('');
      setNotes('');
      setImages([]);
    }
  }, [meeting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meetingTitle || !date || !guestName) {
      setError('Meeting Title, Date, and Guest Name are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        meetingTitle,
        date,
        guestName,
        description,
        notes,
        images
      };

      if (meeting && meeting._id) {
        await tcsMeetingsApi.update(meeting._id, payload);
      } else {
        await tcsMeetingsApi.create(payload);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save TCS meeting record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#e4e1e5] mb-1">Meeting Title *</label>
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          required
          placeholder="e.g., Interaction with TCS Leadership"
          className="w-full px-3 py-2 bg-[#131316] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3be65] text-sm text-[#e4e1e5]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#e4e1e5] mb-1">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 bg-[#131316] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3be65] text-sm text-[#e4e1e5]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#e4e1e5] mb-1">Guest Name *</label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
            placeholder="e.g., Mr. Rajesh Kumar"
            className="w-full px-3 py-2 bg-[#131316] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3be65] text-sm text-[#e4e1e5]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#e4e1e5] mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Summary of the interaction..."
          className="w-full px-3 py-2 bg-[#131316] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3be65] text-sm text-[#e4e1e5]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#e4e1e5] mb-1">Notes / Guidance</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Key guidance, motivational points, feedback..."
          className="w-full px-3 py-2 bg-[#131316] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3be65] text-sm text-[#e4e1e5]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#e4e1e5] mb-1">Images</label>
        <ImageUpload
          value={images}
          onChange={(newImages) => setImages(newImages)}
          multiple={true}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => onSuccess && onSuccess()}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[#e4e1e5] font-medium rounded-lg text-sm transition border border-white/10"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 bg-[#f3be65] hover:bg-[#f3be65]/90 text-[#131316] font-semibold rounded-lg text-sm shadow transition disabled:opacity-50"
        >
          {submitting ? 'Saving...' : meeting ? 'Update Meeting' : 'Create Meeting'}
        </button>
      </div>
    </form>
  );
};

export default TCSMeetingForm;