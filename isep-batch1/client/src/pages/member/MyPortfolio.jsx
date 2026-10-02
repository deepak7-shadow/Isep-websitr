import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit3, ExternalLink, Github, Linkedin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, getProjects, getCertificates, getAchievements } from '../../api/profile';

export default function MyPortfolio({ userId: providedUserId, onEdit, onBack }) {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const userId = providedUserId || currentUserId;
  const isOwnProfile = !providedUserId || String(providedUserId) === String(currentUserId);

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadPortfolio = async () => {
      if (!userId) {
        setLoading(false);
        setError('No member profile was selected.');
        return;
      }

      setLoading(true);
      setError('');

      const results = await Promise.allSettled([
        getProfile(userId),
        getProjects(userId),
        getCertificates(userId),
        getAchievements(userId),
      ]);

      if (!mounted) return;

      const [profileResult, projectResult, certificateResult, achievementResult] = results;

      if (profileResult.status === 'rejected') {
        setError(profileResult.reason?.response?.data?.message || 'Unable to load this profile.');
        setLoading(false);
        return;
      }

      const profileData = profileResult.value?.data || profileResult.value;
      setProfile(profileData);
      setProjects(projectResult.status === 'fulfilled' ? projectResult.value?.data || [] : []);
      setCertificates(certificateResult.status === 'fulfilled' ? certificateResult.value?.data || [] : []);
      setAchievements(achievementResult.status === 'fulfilled' ? achievementResult.value?.data || [] : []);
      setLoading(false);
    };

    loadPortfolio();
    return () => { mounted = false; };
  }, [userId]);

  const navigateToEdit = () => {
    if (typeof onEdit === 'function') onEdit();
    else window.location.href = '/profile/edit';
  };

  const navigateBack = () => {
    if (typeof onBack === 'function') onBack();
    else window.history.back();
  };

  if (loading) return <Shell><div className="py-20 text-center text-sm text-[#a3a1a8]">Loading portfolio...</div></Shell>;

  if (error || !profile) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-center text-sm text-red-300">
          {error || 'Profile not found.'}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-5xl space-y-6">
        {providedUserId && (
          <button type="button" onClick={navigateBack} className="inline-flex items-center gap-2 text-sm text-[#a3a1a8] hover:text-[#f3be65]">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}

        <section className="relative overflow-hidden rounded-3xl border border-[#f3be65]/20 bg-gradient-to-br from-[#1b1b1e] via-[#1b1b1e] to-[#25252a] p-6 shadow-2xl sm:p-8">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#f3be65]/5 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <Avatar profile={profile} large />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#f3be65]">ISEP Member Portfolio</span>
                <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{profile.fullName || 'Member'}</h1>
                <p className="mt-2 text-sm text-[#a3a1a8]">
                  {profile.branch || 'Branch not added'}{profile.year ? ` • ${profile.year}` : ''}
                </p>
              </div>
            </div>
            {isOwnProfile && (
              <button type="button" onClick={navigateToEdit} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f3be65]/30 bg-[#f3be65]/10 px-4 py-2.5 text-sm font-semibold text-[#f3be65] transition hover:bg-[#f3be65]/15">
                <Edit3 className="h-4 w-4" /> Edit Profile
              </button>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card title="About Me">
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#b9b6bd]">{profile.bio || 'No bio added yet.'}</p>
          </Card>
          <Card title="Skills">
            {profile.skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => <span key={skill} className="rounded-full border border-[#f3be65]/30 bg-[#f3be65]/10 px-3 py-1.5 text-xs text-[#f3be65]">{skill}</span>)}
              </div>
            ) : <p className="text-sm text-[#a3a1a8]">No skills added yet.</p>}
          </Card>
        </section>

        <Card title="Projects" count={projects.length}>
          {projects.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <article key={project._id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#131316]">
                  {project.projectImage && <img src={project.projectImage} alt={project.projectName} className="h-44 w-full object-cover" />}
                  <div className="p-5">
                    <h3 className="font-semibold">{project.projectName}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#a3a1a8]">{project.description || 'No description added.'}</p>
                    {project.technologies?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(Array.isArray(project.technologies) ? project.technologies : String(project.technologies).split(',')).map((tech) => (
                          <span key={String(tech).trim()} className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-[#b9b6bd]">{String(tech).trim()}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-4 text-xs">
                      {project.githubLink && <a href={project.githubLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#f3be65] hover:underline"><Github className="h-3.5 w-3.5" /> GitHub</a>}
                      {project.liveLink && <a href={project.liveLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#f3be65] hover:underline"><ExternalLink className="h-3.5 w-3.5" /> Live Project</a>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : <Empty text="No projects added yet." />}
        </Card>

        <Card title="Certificates" count={certificates.length}>
          {certificates.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {certificates.map((certificate) => (
                <article key={certificate._id} className="rounded-2xl border border-white/10 bg-[#131316] p-5">
                  <h3 className="font-semibold">{certificate.certificateName || certificate.title}</h3>
                  <p className="mt-1 text-sm text-[#a3a1a8]">{certificate.issuingOrganization || certificate.organization || 'Issuing organization not added'}</p>
                  {certificate.date && <p className="mt-2 text-xs text-[#77757c]">{formatDate(certificate.date)}</p>}
                  {certificate.credentialLink && <a href={certificate.credentialLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#f3be65] hover:underline"><ExternalLink className="h-3.5 w-3.5" /> View Credential</a>}
                </article>
              ))}
            </div>
          ) : <Empty text="No certificates added yet." />}
        </Card>

        <Card title="Achievements" count={achievements.length}>
          {achievements.length ? (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <article key={achievement._id} className="rounded-2xl border border-white/10 bg-[#131316] p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#a3a1a8]">{achievement.description || 'No description added.'}</p>
                    </div>
                    {achievement.category && <span className="shrink-0 rounded-full border border-[#f3be65]/30 bg-[#f3be65]/10 px-3 py-1 text-[11px] text-[#f3be65]">{achievement.category}</span>}
                  </div>
                  {achievement.date && <p className="mt-3 text-xs text-[#77757c]">{formatDate(achievement.date)}</p>}
                  {achievement.proofImage && <img src={achievement.proofImage} alt="Achievement proof" className="mt-4 max-h-56 rounded-xl object-cover" />}
                </article>
              ))}
            </div>
          ) : <Empty text="No achievements added yet." />}
        </Card>

        <Card title="Social Links">
          <div className="flex flex-wrap gap-3">
            <SocialLink href={profile.github} icon={<Github className="h-4 w-4" />} label="GitHub" />
            <SocialLink href={profile.linkedin} icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
            <SocialLink href={profile.portfolio} icon={<ExternalLink className="h-4 w-4" />} label="Portfolio" />
            {!profile.github && !profile.linkedin && !profile.portfolio && <Empty text="No social links added yet." />}
          </div>
        </Card>
      </div>
    </Shell>
  );
}

function Shell({ children }) { return <div className="min-h-screen bg-[#131316] px-4 py-8 text-[#e4e1e5] sm:px-6 sm:py-10">{children}</div>; }
function Card({ title, count, children }) { return <section className="rounded-3xl border border-white/10 bg-[#1b1b1e] p-5 sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{title}</h2>{typeof count === 'number' && <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-[#a3a1a8]">{count}</span>}</div>{children}</section>; }
function Empty({ text }) { return <p className="text-sm text-[#a3a1a8]">{text}</p>; }
function Avatar({ profile, large = false }) { const size = large ? 'h-24 w-24 text-3xl' : 'h-14 w-14 text-xl'; return profile.profilePhoto ? <img src={profile.profilePhoto} alt={profile.fullName || 'Member'} className={`${size} rounded-2xl border border-[#f3be65]/30 object-cover`} /> : <div className={`${size} flex items-center justify-center rounded-2xl border border-[#f3be65]/30 bg-[#f3be65]/10 font-bold text-[#f3be65]`}>{(profile.fullName || 'M').charAt(0).toUpperCase()}</div>; }
function SocialLink({ href, icon, label }) { if (!href) return null; return <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#131316] px-4 py-2.5 text-sm text-[#b9b6bd] transition hover:border-[#f3be65]/30 hover:text-[#f3be65]">{icon}{label}</a>; }
function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
