import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderGit2, 
  Award, 
  Trophy, 
  Edit3, 
  FolderPlus, 
  FileUp, 
  Medal, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  AlertCircle,
  User as UserIcon
} from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import ProfileCompletion from '../../components/ProfileCompletion';
import { certsApi, achievementsApi } from '../../api/axios';

/**
 * MemberDashboard Component (Member 7 - M7)
 * 
 * Clean, production-ready Member Dashboard page for the ISEP Archive Portal.
 * Designed for standalone execution and seamless integration into the routing system.
 * 
 * @param {Object} props
 * @param {Object} [props.user] - Optional user object passed from AuthContext / layout
 * @param {Function} [props.setActiveTab] - Routing callback conforming to existing ISEP tab system
 * @param {Function} [props.onNavigate] - Alternative routing callback (e.g. react-router navigate)
 */
export default function MemberDashboard({
  user: userProp,
  setActiveTab,
  onNavigate
}) {
  // State for member data
  const [currentUser, setCurrentUser] = useState(userProp || null);
  const [loadingUser, setLoadingUser] = useState(!userProp);

  // State for metrics and counts
  const [stats, setStats] = useState({
    projects: 0,
    certificates: 0,
    achievements: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Status/feedback notification for actions pending other member deliverables
  const [notice, setNotice] = useState(null);

  // Dynamic user resolution: props -> localStorage -> mock context fallback
  useEffect(() => {
    if (userProp) {
      setCurrentUser(userProp);
      setLoadingUser(false);
      return;
    }

    try {
      // Check existing storage keys used across the platform
      const stored = 
        localStorage.getItem('isep_member') ||
        localStorage.getItem('isep_user') ||
        localStorage.getItem('currentUser') ||
        localStorage.getItem('user');

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setCurrentUser(parsed);
          setLoadingUser(false);
          return;
        }
      }
    } catch (e) {
      console.warn('[MemberDashboard] Error retrieving user from storage:', e);
    }

    // Default member session state if no user session is currently in storage
    setCurrentUser({
      fullName: 'Batch 1 Fellow',
      email: 'fellow@isep.org',
      role: 'member',
      profilePhoto: '',
      branch: 'ISE',
      year: '4th Year',
      bio: 'ISEP Batch 1 Fellow passionate about scalable web platforms, distributed systems, and modern UI engineering.',
      skills: ['React', 'Node.js', 'Tailwind CSS', 'MongoDB'],
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      portfolio: ''
    });
    setLoadingUser(false);
  }, [userProp]);

  // Fetch metrics using existing APIs (certsApi and achievementsApi)
  const fetchDashboardData = async () => {
    setLoadingStats(true);
    setStatsError(null);

    try {
      // Reusing existing API helpers without creating redundant endpoints
      const [certsRes, achsRes] = await Promise.allSettled([
        certsApi.getAll(),
        achievementsApi.getAll()
      ]);

      let certCount = 0;
      let achCount = 0;

      if (certsRes.status === 'fulfilled' && certsRes.value?.data) {
        const data = certsRes.value.data;
        certCount = Array.isArray(data.data) ? data.data.length : (data.count || 0);
      }

      if (achsRes.status === 'fulfilled' && achsRes.value?.data) {
        const data = achsRes.value.data;
        achCount = Array.isArray(data.data) ? data.data.length : (data.count || 0);
      }

      // Projects count comes from user profile data if available
      const projCount = Array.isArray(currentUser?.projects) 
        ? currentUser.projects.length 
        : (currentUser?.projectCount || 1);

      setStats({
        projects: projCount,
        certificates: certCount,
        achievements: achCount
      });
    } catch (err) {
      console.error('[MemberDashboard] Failed to fetch stats:', err);
      setStatsError('Unable to load live repository counts. Showing local profile figures.');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  // Routing helper that adapts to project's activeTab or onNavigate
  const handleNavigation = (destinationTab, fallbackMessage) => {
    if (typeof setActiveTab === 'function') {
      setActiveTab(destinationTab);
      return;
    }

    if (typeof onNavigate === 'function') {
      onNavigate(destinationTab);
      return;
    }

    // If destination page is owned by another member (e.g. M9 Edit Profile, M10 Portfolio)
    // and route is not yet mounted, display a clean, non-intrusive feedback toast
    setNotice(fallbackMessage || `Navigating to ${destinationTab}...`);
    setTimeout(() => setNotice(null), 4000);
  };

  // Quick action items configuration
  const quickActions = [
    {
      id: 'edit-profile',
      label: 'Edit Profile',
      description: 'Update your bio, skills, and links',
      icon: <Edit3 className="w-5 h-5 text-[#f3be65]" />,
      action: () => handleNavigation('edit-profile', 'Edit Profile page is assigned to Member 9.')
    },
    {
      id: 'add-project',
      label: 'Add Project',
      description: 'Showcase a new capstone or contribution',
      icon: <FolderPlus className="w-5 h-5 text-[#f3be65]" />,
      action: () => handleNavigation('add-project', 'Project submission module is scheduled for Member 8 / 9 integration.')
    },
    {
      id: 'upload-certificate',
      label: 'Upload Certificate',
      description: 'Verify and store course credential',
      icon: <FileUp className="w-5 h-5 text-[#f3be65]" />,
      // Navigates directly to existing Certificates page in the portal
      action: () => handleNavigation('certificates', 'Opening official Certifications registry.')
    },
    {
      id: 'add-achievement',
      label: 'Add Achievement',
      description: 'Record an award or hackathon win',
      icon: <Medal className="w-5 h-5 text-[#f3be65]" />,
      // Navigates directly to existing Achievements page in the portal
      action: () => handleNavigation('achievements', 'Opening Achievements timeline.')
    },
    {
      id: 'view-portfolio',
      label: 'View My Portfolio',
      description: 'Preview your public monograph page',
      icon: <ExternalLink className="w-5 h-5 text-[#f3be65]" />,
      action: () => handleNavigation('portfolio', 'Public Portfolio view is assigned to Member 10.')
    }
  ];

  // Full name displayed safely without hardcoding
  const displayName = useMemo(() => {
    if (loadingUser) return 'Loading...';
    return currentUser?.fullName || currentUser?.name || currentUser?.email || 'Fellow';
  }, [loadingUser, currentUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#1b1b1e] via-[#1f1f24] to-[#1b1b1e] border border-[#f3be65]/25 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#f3be65]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f3be65]/30 bg-[#f3be65]/10 text-[#f3be65] text-xs font-mono uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#f3be65] animate-pulse" />
              ISEP Member Portal • Batch 1
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#e4e1e5] tracking-tight">
              Welcome, {displayName}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-[#a3a1a8] max-w-2xl leading-relaxed">
              Manage your profile, projects, certificates, and achievements in one place.
            </p>
          </div>

          {/* Member identity badge */}
          <div className="flex items-center gap-4 bg-[#131316]/90 border border-white/10 rounded-2xl p-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#f3be65]/15 border border-[#f3be65]/30 flex items-center justify-center text-[#f3be65] font-cinzel text-lg font-bold">
              {currentUser?.profilePhoto ? (
                <img 
                  src={currentUser.profilePhoto} 
                  alt={displayName} 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <UserIcon className="w-6 h-6 text-[#f3be65]" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-[#e4e1e5]">{displayName}</div>
              <div className="text-[11px] text-[#a3a1a8] font-mono">
                {currentUser?.branch || 'ISE'} • {currentUser?.year || '4th Year'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Notice / Toast */}
      {notice && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#f3be65]/10 border border-[#f3be65]/30 text-[#f3be65] text-xs font-mono shadow-lg transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
          <button 
            onClick={() => setNotice(null)} 
            className="text-[#f3be65] hover:text-white text-xs px-2 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Error Banner (if any) */}
      {statsError && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{statsError}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* 2. Dynamic Profile Completion Component */}
      <section>
        <ProfileCompletion
          user={currentUser}
          stats={stats}
          loading={loadingUser}
          onActionClick={(action) => handleNavigation(action)}
        />
      </section>

      {/* 3. Reusable Stats Cards Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#f3be65] font-mono">
              Verified Records
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#e4e1e5]">
              My Program Contributions
            </h2>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loadingStats}
            title="Refresh repository statistics"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#f3be65]/20 bg-[#1b1b1e] hover:border-[#f3be65] text-[#a3a1a8] hover:text-[#f3be65] text-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Projects"
            value={stats.projects}
            loading={loadingStats}
            subtitle="Capstones & engineering submissions"
            icon={<FolderGit2 className="w-6 h-6" />}
            onClick={() => handleNavigation('add-project', 'Project management module belongs to Member 8/9.')}
          />
          <StatsCard
            title="Certificates"
            value={stats.certificates}
            loading={loadingStats}
            subtitle="Credential registry & honors"
            icon={<Award className="w-6 h-6" />}
            onClick={() => handleNavigation('certificates', 'Opening official Certifications registry.')}
          />
          <StatsCard
            title="Achievements"
            value={stats.achievements}
            loading={loadingStats}
            subtitle="Hackathons, awards & cohort milestones"
            icon={<Trophy className="w-6 h-6" />}
            onClick={() => handleNavigation('achievements', 'Opening Achievements timeline.')}
          />
        </div>
      </section>

      {/* 4. Quick Actions Section */}
      <section className="space-y-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#f3be65] font-mono">
            Direct Management
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#e4e1e5]">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="group text-left p-5 rounded-2xl bg-[#1b1b1e] border border-[#f3be65]/20 hover:border-[#f3be65] hover:bg-[#25252a] transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-[0_4px_20px_rgba(243,190,101,0.12)] hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f3be65]/10 border border-[#f3be65]/25 flex items-center justify-center group-hover:scale-105 transition-transform">
                {action.icon}
              </div>

              <div>
                <div className="text-xs font-bold text-[#e4e1e5] group-hover:text-[#f3be65] transition-colors flex items-center justify-between">
                  <span>{action.label}</span>
                  <span className="text-[#a3a1a8]/40 group-hover:text-[#f3be65] transition-colors text-sm font-mono">&rarr;</span>
                </div>
                <p className="text-[11px] text-[#a3a1a8] mt-1 leading-normal">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
