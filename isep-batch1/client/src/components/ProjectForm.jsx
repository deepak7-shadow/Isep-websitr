import React, { useState, useEffect } from 'react';

/**
 * ProjectForm (Member 10 - M10 Deliverable)
 * 
 * Reusable project submission/editing form component.
 * Integrates with M8 CRUD APIs via onSubmit/onCancel props,
 * and provides an integration slot (renderUpload) for M11's file uploader.
 */
export default function ProjectForm({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  renderUpload = null
}) {
  const isEditMode = Boolean(initialData && (initialData._id || initialData.projectName));

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState([]);
  const [techInput, setTechInput] = useState('');
  const [projectImage, setProjectImage] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [liveLink, setLiveLink] = useState('');
  const [formError, setFormError] = useState('');

  // Sync initial data when editing
  useEffect(() => {
    if (initialData) {
      setProjectName(initialData.projectName || initialData.title || '');
      setDescription(initialData.description || '');
      setTechnologies(Array.isArray(initialData.technologies) ? initialData.technologies : []);
      setProjectImage(initialData.projectImage || initialData.imageUrl || '');
      setGithubLink(initialData.githubLink || '');
      setLiveLink(initialData.liveLink || '');
    } else {
      setProjectName('');
      setDescription('');
      setTechnologies([]);
      setProjectImage('');
      setGithubLink('');
      setLiveLink('');
    }
  }, [initialData]);

  // Tag interface handlers
  const handleAddTag = (tagToAdd) => {
    const trimmed = (tagToAdd || techInput).trim();
    if (!trimmed) return;
    if (technologies.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTechInput('');
      return;
    }
    setTechnologies([...technologies, trimmed]);
    setTechInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(techInput);
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTechnologies(technologies.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!projectName.trim()) {
      setFormError('Project name is required.');
      return;
    }

    const payload = {
      ...(initialData?._id ? { _id: initialData._id } : {}),
      projectName: projectName.trim(),
      description: description.trim(),
      technologies,
      projectImage: projectImage.trim(),
      githubLink: githubLink.trim(),
      liveLink: liveLink.trim()
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  const suggestedTags = ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'TypeScript', 'Python', 'Supabase'];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1b1b1e] border border-[#f3be65]/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
    >
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">
            {isEditMode ? 'Modify Archival Record' : 'New Capstone Submission'}
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#e4e1e5]">
            {isEditMode ? 'Edit Capstone Project' : 'Register Capstone Project'}
          </h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#f3be65]/10 border border-[#f3be65]/30 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-[#f3be65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
      </div>

      {formError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
          {formError}
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Project Name */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
            Project Name <span className="text-[#f3be65]">*</span>
          </label>
          <input
            type="text"
            required
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. MedVanguard Health Analytics"
            className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
            Project Overview & Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief narrative of the problem solved, architectural choices, and batch impact..."
            className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Technologies Tag-Style Interface */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
            Technologies & Frameworks
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type technology and press Enter (e.g. React)..."
              className="flex-1 bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => handleAddTag(techInput)}
              className="px-4 py-2 rounded-lg bg-[#f3be65]/10 hover:bg-[#f3be65]/20 text-[#f3be65] border border-[#f3be65]/30 text-xs font-semibold transition-all shrink-0"
            >
              + Add
            </button>
          </div>

          {/* Active Tags */}
          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5 p-2.5 bg-[#131316]/60 rounded-lg border border-white/5">
              {technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#f3be65]/10 text-[#f3be65] border border-[#f3be65]/30"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="w-3.5 h-3.5 rounded-full hover:bg-[#f3be65]/20 flex items-center justify-center text-[#f3be65] hover:text-white transition-colors"
                    title={`Remove ${tech}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Suggested Quick Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] uppercase font-mono text-[#a3a1a8]/60 mr-1">Quick Add:</span>
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-[#f3be65]/10 text-[#a3a1a8] hover:text-[#f3be65] transition-colors border border-white/5"
              >
                +{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Project Image: Integration point for M11 Uploader or Fallback URL */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
            Project Screenshot / Banner
          </label>
          {renderUpload ? (
            // Integration slot for Member 11 uploader component
            <div className="m11-uploader-slot">
              {renderUpload({
                value: projectImage,
                onChange: (url) => setProjectImage(url)
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="url"
                value={projectImage}
                onChange={(e) => setProjectImage(e.target.value)}
                placeholder="https://example.com/project-screenshot.jpg"
                className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg px-4 py-2.5 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-[#a3a1a8]/60">
                Direct URL input. M11 image upload component will link here seamlessly.
              </p>
            </div>
          )}

          {projectImage && (
            <div className="mt-2.5 relative aspect-video max-h-36 rounded-lg overflow-hidden border border-white/10 bg-black/40">
              <img
                src={projectImage}
                alt="Preview"
                className="w-full h-full object-cover select-none"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
              GitHub Repository Link
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[#a3a1a8]/60">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </span>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#a3a1a8] font-medium mb-1.5">
              Live Demo / Deployment
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[#a3a1a8]/60">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
              <input
                type="url"
                value={liveLink}
                onChange={(e) => setLiveLink(e.target.value)}
                placeholder="https://myproject.app"
                className="w-full bg-[#131316] border border-[#f3be65]/20 focus:border-[#f3be65] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e4e1e5] placeholder:text-[#a3a1a8]/40 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-[#a3a1a8] hover:text-[#e4e1e5] text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg bg-[#f3be65] hover:bg-[#d4a24c] text-[#131316] text-xs font-semibold uppercase tracking-wider shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && (
            <span className="w-3.5 h-3.5 border-2 border-[#131316] border-t-transparent rounded-full animate-spin"></span>
          )}
          {isEditMode ? 'Save Project Changes' : 'Register Project'}
        </button>
      </div>
    </form>
  );
}
