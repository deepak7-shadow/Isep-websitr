import React from 'react';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';

/**
 * ProfileCompletion Component (Member 7 - M7)
 * 
 * Dynamically computes and displays the profile completion meter and checklist
 * based on the EXACT 8 profile items with equal weight (12.5% each):
 * 1. Photo
 * 2. Bio
 * 3. Skills
 * 4. GitHub
 * 5. LinkedIn
 * 6. Projects
 * 7. Certificates
 * 8. Achievements
 * 
 * @param {Object} props
 * @param {Object} [props.user] - Logged in user profile data
 * @param {Object} [props.stats] - Counts object { projects, certificates, achievements }
 * @param {number} [props.projectsCount] - Explicit project count override
 * @param {number} [props.certificatesCount] - Explicit certificates count override
 * @param {number} [props.achievementsCount] - Explicit achievements count override
 * @param {boolean} [props.loading] - Whether data is still loading
 * @param {Function} [props.onActionClick] - Optional callback when user clicks an incomplete item
 */
export default function ProfileCompletion({
  user,
  stats = {},
  projectsCount,
  certificatesCount,
  achievementsCount,
  loading = false,
  onActionClick
}) {
  if (loading) {
    return (
      <div className="bg-[#1b1b1e] border border-[#f3be65]/20 rounded-2xl p-6 sm:p-8 animate-pulse space-y-4">
        <div className="h-5 w-48 bg-white/5 rounded" />
        <div className="h-3 w-full bg-white/5 rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Safe checks for each of the EXACT 8 profile items
  const hasPhoto = Boolean(
    (typeof user?.profilePhoto === 'string' && user.profilePhoto.trim()) ||
    (typeof user?.avatar === 'string' && user.avatar.trim()) ||
    (typeof user?.photo === 'string' && user.photo.trim())
  );

  const hasBio = Boolean(
    typeof user?.bio === 'string' && user.bio.trim().length > 0
  );

  const hasSkills = Boolean(
    (Array.isArray(user?.skills) && user.skills.length > 0) ||
    (typeof user?.skills === 'string' && user.skills.trim().length > 0)
  );

  const hasGitHub = Boolean(
    (typeof user?.github === 'string' && user.github.trim().length > 0) ||
    (typeof user?.githubLink === 'string' && user.githubLink.trim().length > 0)
  );

  const hasLinkedIn = Boolean(
    (typeof user?.linkedin === 'string' && user.linkedin.trim().length > 0) ||
    (typeof user?.linkedinLink === 'string' && user.linkedinLink.trim().length > 0)
  );

  // Projects check: from explicit prop, stats object, or user's projects array
  const effectiveProjects = Number(projectsCount ?? stats.projects ?? (Array.isArray(user?.projects) ? user.projects.length : 0));
  const hasProjects = effectiveProjects > 0;

  // Certificates check: from explicit prop, stats object, or user's certificates array
  const effectiveCerts = Number(certificatesCount ?? stats.certificates ?? (Array.isArray(user?.certificates) ? user.certificates.length : 0));
  const hasCertificates = effectiveCerts > 0;

  // Achievements check: from explicit prop, stats object, or user's achievements array
  const effectiveAchievements = Number(achievementsCount ?? stats.achievements ?? (Array.isArray(user?.achievements) ? user.achievements.length : 0));
  const hasAchievements = effectiveAchievements > 0;

  // The EXACT 8 items configuration
  const checklistItems = [
    { id: 'photo', label: 'Photo', completed: hasPhoto, targetAction: 'edit-profile' },
    { id: 'bio', label: 'Bio', completed: hasBio, targetAction: 'edit-profile' },
    { id: 'skills', label: 'Skills', completed: hasSkills, targetAction: 'edit-profile' },
    { id: 'github', label: 'GitHub', completed: hasGitHub, targetAction: 'edit-profile' },
    { id: 'linkedin', label: 'LinkedIn', completed: hasLinkedIn, targetAction: 'edit-profile' },
    { id: 'projects', label: 'Projects', completed: hasProjects, targetAction: 'add-project' },
    { id: 'certificates', label: 'Certificates', completed: hasCertificates, targetAction: 'upload-certificate' },
    { id: 'achievements', label: 'Achievements', completed: hasAchievements, targetAction: 'add-achievement' }
  ];

  // Equal weight: each item is 1/8 (12.5%) of the total 100%
  const completedCount = checklistItems.filter((item) => item.completed).length;
  const percentage = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="bg-[#1b1b1e] border border-[#f3be65]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#f3be65]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Percentage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#f3be65] font-mono mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Profile Strength</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#e4e1e5]">
            Profile Completion
          </h3>
          <p className="text-xs text-[#a3a1a8] mt-1">
            {completedCount === 8 ? (
              <span className="text-emerald-400 font-medium">All 8 profile items completed! Profile is fully verified.</span>
            ) : (
              <span>Complete all 8 milestones to maximize visibility in the ISEP archive.</span>
            )}
          </p>
        </div>

        {/* Dynamic percentage badge */}
        <div className="flex items-baseline gap-2 bg-[#131316] border border-[#f3be65]/25 px-5 py-3 rounded-2xl self-start sm:self-auto shrink-0 shadow-inner">
          <span className="font-cinzel text-3xl sm:text-4xl font-extrabold text-[#f3be65]">
            {percentage}%
          </span>
          <span className="text-xs text-[#a3a1a8] font-mono uppercase tracking-wider">
            ({completedCount}/8)
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-2">
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile completion progress"
          className="w-full h-3 bg-[#131316] border border-white/5 rounded-full overflow-hidden p-0.5"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f3be65]/80 via-[#f3be65] to-[#d4a24c] transition-all duration-700 ease-out shadow-[0_0_12px_rgba(243,190,101,0.4)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 8 Items Breakdown Grid */}
      <div className="pt-2">
        <div className="text-[11px] uppercase tracking-widest text-[#a3a1a8]/70 font-mono mb-3">
          8 Evaluation Items (12.5% Each)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {checklistItems.map((item, index) => {
            const isClickable = !item.completed && typeof onActionClick === 'function';

            return (
              <div
                key={item.id}
                onClick={() => isClickable && onActionClick(item.targetAction, item.id)}
                className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2 ${
                  item.completed
                    ? 'bg-[#131316]/80 border-emerald-500/25 text-[#e4e1e5]'
                    : isClickable
                    ? 'bg-[#131316]/40 border-white/5 text-[#a3a1a8] hover:border-[#f3be65]/40 hover:text-[#e4e1e5] cursor-pointer'
                    : 'bg-[#131316]/40 border-white/5 text-[#a3a1a8]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-[#a3a1a8]/60">
                    {index + 1}.
                  </span>
                  <span className="text-xs font-medium truncate">
                    {item.label}
                  </span>
                </div>

                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-[#a3a1a8]/40 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
