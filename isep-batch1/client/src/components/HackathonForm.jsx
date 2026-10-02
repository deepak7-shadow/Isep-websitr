import React, { useState, useEffect } from 'react';

const COMMON_RESULTS = [
  '1st Place Winner 🥇',
  '2nd Place Runner-Up 🥈',
  '3rd Place 🥉',
  'Finalist / Top 5',
  'Special Category Award',
  'Best Innovation',
  'Best UI/UX Design',
  'Participated & Presented'
];

export default function HackathonForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    hackathonName: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    teamMembersInput: '',
    imagesInput: '',
    result: 'Participated & Presented',
    experience: ''
  });

  const [memberTag, setMemberTag] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [images, setImages] = useState([]);
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        hackathonName: initialData.hackathonName || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        description: initialData.description || '',
        result: initialData.result || 'Participated & Presented',
        experience: initialData.experience || ''
      });
      setTeamMembers(initialData.teamMembers || []);
      setImages(initialData.images || []);
    }
  }, [initialData]);

  const addMember = () => {
    const trimmed = memberTag.trim();
    if (trimmed && !teamMembers.includes(trimmed)) {
      setTeamMembers([...teamMembers, trimmed]);
      setMemberTag('');
    }
  };

  const removeMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const addImage = () => {
    const trimmed = imageInput.trim();
    if (trimmed && !images.includes(trimmed)) {
      setImages([...images, trimmed]);
      setImageInput('');
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hackathonName.trim()) {
      alert('Hackathon name is required.');
      return;
    }

    onSubmit({
      hackathonName: formData.hackathonName.trim(),
      date: formData.date,
      description: formData.description.trim(),
      teamMembers,
      images,
      result: formData.result,
      experience: formData.experience.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1b1b1e] border border-[#f3be65]/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">
            Curator Archival Form
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#e4e1e5]">
            {initialData ? 'Edit Hackathon Record' : 'Archive New Hackathon'}
          </h2>
        </div>
        <span className="text-xs text-[#a3a1a8] font-mono">ISEP Milestone M14</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hackathon Name */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#a3a1a8] mb-2">
            Hackathon Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Smart India Hackathon 2024"
            value={formData.hackathonName}
            onChange={(e) => setFormData({ ...formData, hackathonName: e.target.value })}
            className="w-full bg-[#131316] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#e4e1e5] focus:outline-none focus:border-[#f3be65] transition-colors"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#a3a1a8] mb-2">
            Event Date *
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full bg-[#131316] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#e4e1e5] focus:outline-none focus:border-[#f3be65] transition-colors"
          />
        </div>
      </div>

      {/* Result / Achievement */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-[#a3a1a8] mb-2">
          Result / Outcome 🏆
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMMON_RESULTS.map((res) => (
            <button
              type="button"
              key={res}
              onClick={() => setFormData({ ...formData, result: res })}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                formData.result === res
                  ? 'bg-[#f3be65] text-[#131316] font-semibold'
                  : 'bg-white/5 text-[#a3a1a8] hover:text-[#e4e1e5] hover:bg-white/10'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Custom result (e.g. Winner of FinTech Track)"
          value={formData.result}
          onChange={(e) => setFormData({ ...formData, result: e.target.value })}
          className="w-full bg-[#131316] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#e4e1e5] focus:outline-none focus:border-[#f3be65] transition-colors"
        />
      </div>

      {/* Team Members Input */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-[#a3a1a8] mb-2">
          Team Members 👥
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Add member name (e.g. Deepak R)"
            value={memberTag}
            onChange={(e) => setMemberTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addMember();
              }
            }}
            className="flex-1 bg-[#131316] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#e4e1e5] focus:outline-none focus:border-[#f3be65] transition-colors"
          />
          <button
            type="button"
            onClick={addMember}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#e4e1e5] text-xs font-mono"
          >
            + Add
          </button>
        </div>

        {teamMembers.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[#131316] border border-white/5">
            {teamMembers.map((member, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#f3be65]/10 text-[#f3be65] border border-[#f3be65]/30 text-xs font-mono"
              >
                {member}
                <button
                  type="button"
                  onClick={() => removeMember(idx)}
                  className="hover:text-red-400 font-bold ml-1"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Images Input */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-[#a3a1a8] mb-2">
          Photos / URLs 📸
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            placeholder="Paste image URL (https://...)"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImage();
              }
            }}
            className="flex-1 bg-[#131316] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#e4e1e5] focus:outline-none focus:border-[#f3be65] transition-colors"
          />
          <button
            type="button"
            onClick={addImage}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#e4e1e5] text-xs font-mono"
          >
            + Add Photo
          </button>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-[#131316] border border-white/5">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group">
                <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/80 text-red-400 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-[#a3a1a8] mb-2">
          Description & Project Challenge 📝
        </label>
        <textarea
          rows={3}
          placeholder="Brief description of the challenge statement, solution architecture, and technologies used..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-[#131316] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#e4e1e5] focus:outline-none focus:border-[#f3be65] transition-colors leading-relaxed"
        />
      </div>

      {/* Experience / Story */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-[#a3a1a8] mb-2">
          Experience, Defense & Learnings 📖
        </label>
        <textarea
          rows={3}
          placeholder="Share the team's live experience, jury interactions, late-night debugging, and biggest takeaways..."
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          className="w-full bg-[#131316] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#e4e1e5] focus:outline-none focus:border-[#f3be65] transition-colors leading-relaxed"
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-mono text-[#a3a1a8] hover:text-[#e4e1e5] hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-[#f3be65] text-[#131316] font-semibold text-xs uppercase tracking-wider hover:bg-[#f3be65]/90 transition-transform active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Archiving...' : initialData ? 'Save Changes' : 'Archive Hackathon'}
        </button>
      </div>
    </form>
  );
}
