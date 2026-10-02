import React, { useState } from 'react';

export default function SkillTags({ skills = [], onChange = () => {}, editable = true }) {
  const [input, setInput] = useState('');

  const addSkill = () => {
    const skill = input.trim();
    if (!skill) return;

    const alreadyExists = skills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (!alreadyExists) onChange([...skills, skill]);
    setInput('');
  };

  const removeSkill = (skillToRemove) => {
    onChange(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSkill();
    }

    if (event.key === 'Backspace' && input === '' && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      {editable && (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill and press Enter"
            className="flex-1 rounded-xl border border-white/10 bg-[#1b1b1e] px-4 py-3 text-sm text-[#e4e1e5] outline-none transition focus:border-[#f3be65]/60"
          />
          <button
            type="button"
            onClick={addSkill}
            className="rounded-xl bg-[#f3be65] px-4 py-3 text-sm font-semibold text-[#131316] transition hover:opacity-90"
          >
            Add
          </button>
        </div>
      )}

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-2 rounded-full border border-[#f3be65]/30 bg-[#f3be65]/10 px-3 py-1.5 text-xs text-[#f3be65]"
            >
              {skill}
              {editable && (
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-[#f3be65]/70 transition hover:text-[#f3be65]"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#a3a1a8]">No skills added yet.</p>
      )}
    </div>
  );
}
