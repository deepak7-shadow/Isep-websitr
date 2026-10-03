/**
 * ISEP Batch 1 Archive — Supabase-Powered Real-Time Archive
 * - All data stored and fetched from Supabase (no local mock data)
 * - View-Only Protection (no download buttons, right-click disabled)
 * - Thoughts moderation: pending → approved by admin before appearing publicly
 * - Admin CRUD via Supabase authenticated operations
 */

// ================= SUPABASE CLIENT INIT =================
const SUPABASE_URL = 'https://qilreacksziadajadkji.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XYWwdW2zKUnKdpjedRxc2Q_Y4fXRscw';

// Initialize Supabase client (loaded via CDN in index.html). A public key may
// be supplied before this script as window.__ISEP_SUPABASE_ANON_KEY__.
const _sbKey = window.__ISEP_SUPABASE_ANON_KEY__ || SUPABASE_ANON_KEY;
const _sb = window.supabase && _sbKey && _sbKey !== '******'
  ? window.supabase.createClient(SUPABASE_URL, _sbKey)
  : null;

// Helper: fetch from Supabase table with optional filter
async function sbFetch(table, filter = {}) {
  if (!_sb) return [];
  let q = _sb.from(table).select('*');
  Object.entries(filter).forEach(([col, val]) => { q = q.eq(col, val); });
  const { data, error } = await q;
  if (error) { console.warn(`[Supabase] ${table}:`, error.message); return []; }
  return data || [];
}

// Helper: insert a row
async function sbInsert(table, row) {
  if (!_sb) return null;
  const { data, error } = await _sb.from(table).insert([row]).select().single();
  if (error) { console.warn(`[Supabase Insert] ${table}:`, error.message); return null; }
  return data;
}

// Helper: update a row by id
async function sbUpdate(table, id, changes) {
  if (!_sb) return null;
  const { data, error } = await _sb.from(table).update(changes).eq('id', id).select().single();
  if (error) { console.warn(`[Supabase Update] ${table}:`, error.message); return null; }
  return data;
}

// Helper: delete a row by id
async function sbDelete(table, id) {
  if (!_sb) return false;
  const { error } = await _sb.from(table).delete().eq('id', id);
  if (error) { console.warn(`[Supabase Delete] ${table}:`, error.message); return false; }
  return true;
}

// Uploads a File object to Supabase Storage ('archive-media' bucket).
async function uploadMediaFile(file, folder = 'general') {
  if (!file) return '';

  const ext = file.name.split('.').pop() || 'bin';
  const cleanBaseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filePath = `${folder}/${Date.now()}_${cleanBaseName}.${ext}`;

  if (_sb && _sb.storage) {
    try {
      const { data, error } = await _sb.storage.from('archive-media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      if (!error && data) {
        const { data: { publicUrl } } = _sb.storage.from('archive-media').getPublicUrl(filePath);
        if (publicUrl) return publicUrl;
      } else if (error) {
        console.warn('[Supabase Storage upload warning]:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase Storage upload exception]:', err);
    }
  }

  return '';
}

// Map Supabase snake_case rows → app camelCase shape
function mapPhoto(r) { return { _id: r.id, title: r.title, caption: r.caption || '', album: r.album, imageUrl: r.image_url, uploadedAt: r.uploaded_at }; }
function mapCert(r) { return { _id: r.id, title: r.title, recipientName: r.recipient_name, issueDate: r.issue_date, category: r.category, fileUrl: r.file_url }; }

function mapThought(r) { return { _id: r.id, name: r.name, message: r.message, rating: r.rating, status: r.status, createdAt: r.created_at, authorId: r.author_id, photo: r.profile_photo || '' }; }
function mapMember(r) {
  return {
    _id: r.id,
    fullName: r.full_name || r.name || '',
    slug: r.slug || (r.full_name || r.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    photo: r.photo_url || r.profile_photo || '',
    bio: r.bio || '',
    skills: Array.isArray(r.skills) ? r.skills : [],
    branch: r.branch || '',
    year: r.year || '',
    github: r.github || '',
    linkedin: r.linkedin || '',
    portfolio: r.portfolio || ''
  };
}

const CONTENT_TYPES = {
  activities: { table: 'activities', label: 'Activities / ISEP Memories', description: 'Workshops, classes, meetings, and ISEP program activities.' },
  memories: { table: 'memories', label: 'Fun & Memories', description: 'Informal cohort memories and approved archive moments.' },
  hackathons: { table: 'hackathons', label: 'Hackathons', description: 'Hackathon records, outcomes, and reflections.' },
  'mock-interviews': { table: 'mock_interviews', label: 'Mock Interviews', description: 'Mock interview sessions and feedback records.' },
  'tcs-meetings': { table: 'tcs_meetings', label: 'TCS Meetings', description: 'TCS meetings, guest sessions, and minutes.' }
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
}

async function sbTable(table, columns = '*') {
  if (!_sb) return [];
  const { data, error } = await _sb.from(table).select(columns);
  if (error) {
    console.warn(`[Supabase] ${table}:`, error.message);
    return [];
  }
  return data || [];
}

// Clear any stale localStorage cache
['isep_photos','isep_certificates','isep_thoughts'].forEach(k => localStorage.removeItem(k));


// ================= APP CLASS =================

class IsepArchiveApp {
  constructor() {
    this.currentRoute = 'home';
    this.exhibitMode = 'warm-amber';
    this.isAdmin = localStorage.getItem('isep_admin_token') ? true : false;
    this.adminProfile = null;
    this.currentUserId = null;
    this.adminContentType = 'activities';
    this.selectedRating = 5;

    // Start empty — data loads async from Supabase
    this.photos = [];
    this.certificates = [];
    this.thoughts = [];
    this.members = [];
    this.profileSlug = null;

    this.init();
  }

  init() {
    this.initRouter();
    this.initExhibitMode();
    this.initViewOnlyProtection();
    this.initHeroParallax();
    this.initHeroAlbumModal();
    this.initGallery();
    this.initCertificates();
    this.initThoughtsWall();
    this.initAdminPortal();
    this.initMemberFeatures();
    if (_sb) {
      _sb.auth.getSession().then(async ({ data }) => {
        if (data?.session) {
          this.currentUserId = data.session.user?.id || null;
          // Verify the user is still approved before restoring admin session
          const userEmail = data.session.user?.email;
          try {
            const { data: adminRow } = await _sb
              .from('admin_users')
              .select('is_approved, role, full_name')
              .eq('email', userEmail)
              .single();
            if (adminRow?.is_approved === true) {
              this.isAdmin = true;
              this.adminProfile = adminRow;
              const emailEl = document.getElementById('admin-active-email');
              if (emailEl) emailEl.textContent = userEmail;
              this.updateAdminHeaderStatus();
              this.renderAdminView();
            } else if (adminRow) {
              // Not yet approved — sign out silently
              await _sb.auth.signOut();
              localStorage.removeItem('isep_admin_token');
            }
          } catch(e) {
            console.warn('[Auth restore] approval check failed', e);
          }
        }
      }).catch(() => {});
    }
    this.loadAllFromSupabase(); // async: fetches real data then re-renders
    this.updateAdminHeaderStatus();
  }

  async loadAllFromSupabase() {
    this.showLoadingState(true);
    try {
      const [photos, certs, thoughts] = await Promise.all([
        sbFetch('photos').then(rows => rows.map(mapPhoto)),
        sbFetch('certificates').then(rows => rows.map(mapCert)),
        sbFetch('thoughts', { status: 'approved' }).then(rows => rows.map(mapThought))
      ]);
      this.photos = photos;
      this.certificates = certs;
      this.thoughts = thoughts;
      this.members = (await sbTable('members')).map(mapMember);
    } catch(e) {
      console.error('[Supabase] Load error:', e);
    }
    this.showLoadingState(false);
    this.renderAll();
    this.updateHomeStats();
  }

  async loadAllThoughtsForAdmin() {
    // Admin sees all thoughts (pending + approved + hidden)
    const rows = await sbFetch('thoughts');
    return rows.map(mapThought);
  }

  showLoadingState(on) {
    const el = document.getElementById('global-loading-indicator');
    if (el) el.classList.toggle('hidden', !on);
  }

  // saveData is now a no-op — writes go directly to Supabase per operation
  saveData(key) { /* Supabase handles persistence */ }

  // --- Router & History Navigation ---
  initRouter() {
    const handleRoute = () => {
      const memberMatch = window.location.pathname.match(/^\/members\/([^/]+)\/?$/i);
      if (memberMatch) {
        this.profileSlug = decodeURIComponent(memberMatch[1]).toLowerCase();
        this.navigateTo('member-profile', false);
        this.renderMemberProfile(this.profileSlug);
        return;
      }
      const hash = window.location.hash.replace('#', '') || 'home';
      const valid = ['home', 'gallery', 'certificates', 'thoughts-wall', 'members', 'heads', 'dashboard', 'member-profile', 'admin-portal', ...Object.keys(CONTENT_TYPES)];
      this.navigateTo(valid.includes(hash) ? hash : 'home', false);
    };

    window.addEventListener('hashchange', handleRoute);

    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-path]');
      if (el) {
        e.preventDefault();
        const path = el.getAttribute('data-path');
        this.navigateTo(path, true);
      }
    });

    handleRoute();
  }

  navigateTo(route, updateHistory = true) {
    this.currentRoute = route;
    if (updateHistory) {
      window.location.hash = route;
    }

    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(`view-${route}`);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Active classes on desktop nav
    document.querySelectorAll('nav [data-path]').forEach(link => {
      if (link.getAttribute('data-path') === route) {
        link.className = "px-space-md py-space-xs transition-all bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-sm";
        link.setAttribute('aria-current', 'page');
      } else {
        link.className = "px-space-md py-space-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-body-sm text-body-sm transition-all rounded-lg";
        link.removeAttribute('aria-current');
      }
    });

    // Active classes on mobile / responsive sub-navigation
    document.querySelectorAll('.xl\\:hidden [data-path]').forEach(link => {
      if (link.getAttribute('data-path') === route) {
        link.className = "text-xs uppercase tracking-wider text-primary px-2.5 py-1 rounded bg-surface-container whitespace-nowrap font-semibold";
        link.setAttribute('aria-current', 'page');
      } else {
        link.className = "text-xs uppercase tracking-wider text-on-surface-variant hover:text-on-surface px-2.5 py-1 rounded whitespace-nowrap";
        link.removeAttribute('aria-current');
      }
    });

    // Refresh dynamic views on route enter
    if (route === 'admin-portal') {
      this.renderAdminView();
    } else if (route === 'members') {
      this.renderMembers();
    } else if (route === 'heads') {
      this.renderHeads();
    } else if (route === 'dashboard') {
      this.renderMemberDashboard();
    } else if (route === 'member-profile') {
      this.renderMemberProfile(this.profileSlug);
    } else if (route === 'home') {
      this.updateHomeStats();
    } else if (CONTENT_TYPES[route]) {
      this.renderContentSection(route);
    }
  }

  initMemberFeatures() {
      document.addEventListener('click', (event) => {
        const profileLink = event.target.closest('[data-member-slug]');
        if (!profileLink) return;
        event.preventDefault();
        const slug = profileLink.getAttribute('data-member-slug');
        history.pushState({}, '', `/members/${encodeURIComponent(slug)}`);
        this.profileSlug = slug;
        this.navigateTo('member-profile', false);
        this.renderMemberProfile(slug);
      });
      window.addEventListener('popstate', () => {
        const match = window.location.pathname.match(/^\/members\/([^/]+)\/?$/i);
        if (match) {
          this.profileSlug = decodeURIComponent(match[1]).toLowerCase();
          this.navigateTo('member-profile', false);
          this.renderMemberProfile(this.profileSlug);
        }
      });
    }

  async renderMembers() {
          const container = document.getElementById('members-grid');
          if (!container) return;
          if (!this.members.length) {
            this.members = (await sbTable('members')).map(mapMember);
          }

          container.innerHTML = this.members.length ? this.members.map((member) => `
            <article class="bg-surface-container rounded-xl border border-outline-variant/20 p-space-md flex flex-col gap-space-sm">
              <div class="flex items-center gap-space-sm">
                ${member.photo ? `<img src="${escapeHtml(member.photo)}" alt="${escapeHtml(member.fullName)}" class="w-14 h-14 rounded-full object-cover border border-primary/30"/>` : `<div class="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xl font-bold">${escapeHtml((member.fullName || 'M').charAt(0))}</div>`}
                <div><h2 class="font-serif text-lg text-on-surface font-bold">${escapeHtml(member.fullName)}</h2><p class="text-xs text-on-surface-variant">${escapeHtml([member.branch, member.year].filter(Boolean).join(' • '))}</p></div>
              </div>
              <p class="text-sm text-on-surface-variant line-clamp-3">${escapeHtml(member.bio || 'ISEP member portfolio')}</p>
              <div class="flex flex-wrap gap-1">${member.skills.slice(0, 4).map((skill) => `<span class="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary">${escapeHtml(skill)}</span>`).join('')}</div>
              <a href="/members/${encodeURIComponent(member.slug)}" data-member-slug="${escapeHtml(member.slug)}" class="mt-auto text-sm text-primary font-semibold hover:underline">View portfolio →</a>
            </article>
          `).join('') : '<div class="col-span-full rounded-xl border border-outline-variant/20 bg-surface-container p-space-lg text-center text-on-surface-variant">No approved member profiles are available yet.</div>';
        }

        async renderHeads() {
          const container = document.getElementById('heads-content');
          if (!container) return;
          container.innerHTML = '<div class="py-space-xl text-center text-on-surface-variant">Loading ISEP Heads...</div>';
          const { data: rows = [], error } = _sb ? await _sb.from('admin_users').select('full_name, role, description, image_url').in('role', ['head', 'mentor']).eq('is_approved', true).order('full_name') : { data: [], error: null };
          if (error) console.warn('[Supabase] admin head profiles:', error.message);
          container.innerHTML = `<div class="mb-space-lg"><span class="text-xs text-primary uppercase tracking-widest">ISEP structure</span><h1 class="font-serif text-4xl text-on-surface font-bold mt-1">ISEP Heads / Admins</h1><p class="text-on-surface-variant mt-2">The two elevated ISEP accounts responsible for member approvals and portal stewardship.</p></div><div class="grid gap-space-md md:grid-cols-2">${rows.length ? rows.map(row => `<article class="bg-surface-container rounded-2xl border border-primary/20 p-space-lg flex gap-space-md items-start">${row.image_url ? `<img src="${escapeHtml(row.image_url)}" alt="${escapeHtml(row.full_name || '')}" class="w-24 h-24 rounded-2xl object-cover"/>` : `<div class="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-3xl font-bold">${escapeHtml((row.full_name || 'H').charAt(0))}</div>`}<div><span class="text-xs text-primary uppercase tracking-widest">ISEP Head / Admin</span><h2 class="font-serif text-2xl text-on-surface font-bold mt-1">${escapeHtml(row.full_name || 'ISEP Head')}</h2><p class="text-sm text-on-surface-variant mt-2">${escapeHtml(row.description || 'Elevated ISEP member approval and portal administration.')}</p></div></article>`).join('') : '<div class="col-span-full rounded-xl border border-outline-variant/20 bg-surface-container p-space-lg text-center text-on-surface-variant">Head profiles will appear here after the two approved ISEP Head accounts and images are configured.</div>'}</div><div class="mt-space-xl rounded-xl border border-outline-variant/20 bg-surface-container p-space-lg text-center text-on-surface-variant">ISEP structure: Main Mentors / Main Admins → ISEP Heads / Admins → 18 ISEP Members.</div>`;
        }

        async renderMemberProfile(slug) {
          const container = document.getElementById('member-profile');
          if (!container || !slug) return;
          container.innerHTML = '<div class="py-space-xl text-center text-on-surface-variant">Loading member portfolio…</div>';
          if (!this.members.length) this.members = (await sbTable('members')).map(mapMember);
          const member = this.members.find((item) => item.slug === slug);
          if (!member) {
            container.innerHTML = '<div class="rounded-xl border border-outline-variant/20 bg-surface-container p-space-lg text-center text-on-surface-variant">Member profile not found.</div>';
            return;
          }
          const [projects, certificates, achievements, activities, hackathons] = await Promise.all([
            sbFetch('member_projects', { member_id: member._id }),
            sbFetch('member_certificates', { member_id: member._id }),
            sbFetch('member_achievements', { member_id: member._id }),
            sbFetch('member_activities', { member_id: member._id }),
            sbFetch('member_hackathons', { member_id: member._id })
          ]);
          const section = (title, rows, renderer) => rows.length ? `<section class="bg-surface-container rounded-xl border border-outline-variant/20 p-space-md"><h2 class="font-serif text-2xl text-on-surface font-bold mb-space-sm">${title}</h2><div class="grid gap-space-sm md:grid-cols-2">${rows.map(renderer).join('')}</div></section>` : '';
          container.innerHTML = `
            <a href="/#members" class="text-sm text-primary hover:underline">← Back to members</a>
            <section class="mt-space-md bg-surface-container rounded-2xl border border-primary/20 p-space-lg flex flex-col sm:flex-row gap-space-md items-start">
              ${member.photo ? `<img src="${escapeHtml(member.photo)}" alt="${escapeHtml(member.fullName)}" class="w-28 h-28 rounded-2xl object-cover border border-primary/30"/>` : `<div class="w-28 h-28 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-4xl font-bold">${escapeHtml((member.fullName || 'M').charAt(0))}</div>`}
              <div><span class="text-xs text-primary uppercase tracking-widest">ISEP Member Portfolio</span><h1 class="font-serif text-4xl text-on-surface font-bold">${escapeHtml(member.fullName)}</h1><p class="text-on-surface-variant mt-1">${escapeHtml([member.branch, member.year].filter(Boolean).join(' • '))}</p><p class="text-on-surface-variant mt-space-sm max-w-2xl">${escapeHtml(member.bio || 'No biography added yet.')}</p><div class="flex flex-wrap gap-2 mt-space-sm">${member.skills.map((skill) => `<span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs">${escapeHtml(skill)}</span>`).join('')}</div></div>
            </section>
            ${section('Projects', projects, (row) => `<article class="rounded-lg bg-surface-container-high p-space-sm"><h3 class="font-semibold text-on-surface">${escapeHtml(row.title || row.name)}</h3><p class="text-sm text-on-surface-variant mt-1">${escapeHtml(row.description || '')}</p>${row.project_url ? `<a class="text-xs text-primary hover:underline" href="${escapeHtml(row.project_url)}" target="_blank" rel="noreferrer">Open project</a>` : ''}</article>`)}
            ${section('Certificates', certificates, (row) => `<article class="rounded-lg bg-surface-container-high p-space-sm"><h3 class="font-semibold text-on-surface">${escapeHtml(row.title || row.name)}</h3><p class="text-sm text-on-surface-variant">${escapeHtml(row.issuer || '')}</p>${row.file_url ? `<a class="text-xs text-primary hover:underline" href="${escapeHtml(row.file_url)}" target="_blank" rel="noreferrer">View certificate</a>` : ''}</article>`)}
            ${section('Achievements', achievements, (row) => `<article class="rounded-lg bg-surface-container-high p-space-sm"><h3 class="font-semibold text-on-surface">${escapeHtml(row.title)}</h3><p class="text-sm text-on-surface-variant">${escapeHtml(row.description || '')}</p></article>`)}
            ${section('ISEP Activities', activities, (row) => `<article class="rounded-lg bg-surface-container-high p-space-sm"><h3 class="font-semibold text-on-surface">${escapeHtml(row.title)}</h3><p class="text-sm text-on-surface-variant">${escapeHtml(row.description || '')}</p></article>`)}
            ${section('Hackathons', hackathons, (row) => `<article class="rounded-lg bg-surface-container-high p-space-sm"><h3 class="font-semibold text-on-surface">${escapeHtml(row.title || row.name)}</h3><p class="text-sm text-on-surface-variant">${escapeHtml(row.result || row.description || '')}</p></article>`)}
            <section class="bg-surface-container rounded-xl border border-outline-variant/20 p-space-md"><h2 class="font-serif text-2xl text-on-surface font-bold mb-space-sm">Social Links</h2><div class="flex flex-wrap gap-space-sm">${[['GitHub', member.github], ['LinkedIn', member.linkedin], ['Portfolio', member.portfolio]].filter(([, url]) => url).map(([label, url]) => `<a class="text-primary hover:underline" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${label} ↗</a>`).join('') || '<span class="text-sm text-on-surface-variant">No social links added yet.</span>'}</div></section>
          `;
        }

        async renderContentSection(type) {
          const config = CONTENT_TYPES[type];
          const container = document.getElementById(`${type}-content`);
          if (!config || !container) return;
          container.innerHTML = `<div class="py-space-xl text-center text-on-surface-variant">Loading ${escapeHtml(config.label)}…</div>`;
          const rows = (await sbFetch(config.table, { status: 'approved' })).sort((a, b) => String(b.event_date || b.created_at || '').localeCompare(String(a.event_date || a.created_at || '')));
          container.innerHTML = `
            <div class="mb-space-lg"><span class="text-xs text-primary uppercase tracking-widest">ISEP Archive</span><h1 class="font-serif text-4xl text-on-surface font-bold mt-1">${escapeHtml(config.label)}</h1><p class="text-on-surface-variant mt-2">${escapeHtml(config.description)}</p></div>
            <div class="grid gap-space-md md:grid-cols-2 lg:grid-cols-3">
              ${rows.length ? rows.map(row => `<article class="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">${row.image_url ? `<img src="${escapeHtml(row.image_url)}" alt="" class="w-full h-44 object-cover"/>` : ''}<div class="p-space-md"><h2 class="font-serif text-xl text-on-surface font-bold">${escapeHtml(row.title || '')}</h2><p class="text-xs text-primary mt-1">${escapeHtml(row.event_date || '')}</p><p class="text-sm text-on-surface-variant mt-space-sm whitespace-pre-line">${escapeHtml(row.description || '')}</p>${row.extra ? `<p class="text-xs text-on-surface-variant mt-space-sm">${escapeHtml(row.extra)}</p>` : ''}</div></article>`).join('') : `<div class="col-span-full rounded-xl border border-outline-variant/20 bg-surface-container p-space-lg text-center text-on-surface-variant">No approved ${escapeHtml(config.label.toLowerCase())} have been published yet.</div>`}
            </div>`;
        }

        async renderMemberDashboard() {
          const container = document.getElementById('member-dashboard');
          if (!container) return;
          const { data } = _sb ? await _sb.auth.getSession() : { data: {} };
          if (!data?.session) {
            container.innerHTML = '<div class="rounded-2xl border border-primary/20 bg-surface-container p-space-lg max-w-xl mx-auto"><h1 class="font-serif text-3xl text-on-surface font-bold">Member Login</h1><p class="text-on-surface-variant mt-space-sm">Sign in or submit a member registration request. New profiles remain pending until an ISEP Head approves them.</p><form id="member-login-form" class="space-y-space-sm mt-space-md"><input id="member-login-email" type="email" required placeholder="Email" class="w-full px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><input id="member-login-password" type="password" required placeholder="Password" class="w-full px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><button class="w-full py-2.5 rounded bg-primary text-on-primary font-semibold">Sign in</button><p id="member-login-message" class="text-sm text-on-surface-variant"></p></form><form id="member-register-form" class="space-y-space-sm mt-space-lg pt-space-lg border-t border-outline-variant/20"><h2 class="font-semibold text-on-surface">Request member access</h2><input id="member-register-name" required placeholder="Full name" class="w-full px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><input id="member-register-email" type="email" required placeholder="Email" class="w-full px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><input id="member-register-password" type="password" minlength="6" required placeholder="Password (6+ characters)" class="w-full px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><button class="w-full py-2.5 rounded border border-primary/40 text-primary font-semibold">Submit registration</button><p id="member-register-message" class="text-sm text-on-surface-variant"></p></form></div>';
            document.getElementById('member-login-form')?.addEventListener('submit', async (event) => {
              event.preventDefault();
              const message = document.getElementById('member-login-message');
              if (!_sb) { message.textContent = 'Login is unavailable until the Supabase public anon key is configured.'; return; }
              const { data: loginData, error } = await _sb.auth.signInWithPassword({ email: document.getElementById('member-login-email').value.trim(), password: document.getElementById('member-login-password').value });
              if (error) { message.textContent = error.message; return; }
              this.currentUserId = loginData.user?.id || null;
              this.renderMemberDashboard();
            });
            document.getElementById('member-register-form')?.addEventListener('submit', async (event) => {
              event.preventDefault();
              const message = document.getElementById('member-register-message');
              if (!_sb) { message.textContent = 'Registration is unavailable until the Supabase public anon key is configured.'; return; }
              const email = document.getElementById('member-register-email').value.trim().toLowerCase();
              const fullName = document.getElementById('member-register-name').value.trim();
              const password = document.getElementById('member-register-password').value;
              const { data, error } = await _sb.auth.signUp({ email, password, options: { data: { full_name: fullName, portal_role: 'member' } } });
              if (error) { message.textContent = error.message; return; }
              message.textContent = 'Registration submitted. Verify your email, then wait for ISEP Head approval.';
              event.currentTarget.reset();
            });
            return;
          }
          const user = data.session.user;
          const { data: member } = await _sb.from('members').select('*').eq('auth_user_id', user.id).maybeSingle();
          if (!member) {
            container.innerHTML = '<div class="rounded-xl border border-primary/20 bg-surface-container p-space-lg text-on-surface-variant">Your registration is awaiting an ISEP Head decision, or no profile has been linked yet. Contact an administrator if this status is unexpected.</div>';
            return;
          }
          if (member.approval_status && member.approval_status !== 'approved' && member.is_approved !== true) {
            container.innerHTML = `<div class="rounded-xl border border-primary/20 bg-surface-container p-space-lg text-on-surface-variant"><h1 class="font-serif text-2xl text-on-surface font-bold">Registration ${escapeHtml(member.approval_status)}</h1><p class="mt-space-sm">Your profile is not public until it is approved by an ISEP Head.</p></div>`;
            return;
          }
          const profile = mapMember(member);
          const completionFields = [profile.fullName, profile.bio, profile.photo, profile.skills.length, profile.github || profile.linkedin || profile.portfolio];
          const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);
          const [memberProjects, memberCertificates, memberAchievements] = await Promise.all([sbFetch('member_projects', { member_id: member.id }), sbFetch('member_certificates', { member_id: member.id }), sbFetch('member_achievements', { member_id: member.id })]);
          const recordList = (rows, type) => rows.length ? rows.map(row => `<div class="flex items-center justify-between gap-space-sm rounded bg-surface-container-high p-space-sm"><span class="text-sm text-on-surface">${escapeHtml(row.title)}</span><button data-member-record-delete="${type}:${row.id}" class="text-xs text-error hover:underline">Delete</button></div>`).join('') : '<p class="text-sm text-on-surface-variant mt-space-sm">No records added yet.</p>';
          container.innerHTML = `<div class="space-y-space-lg"><div><span class="text-xs text-primary uppercase tracking-widest">Member Workspace</span><h1 class="font-serif text-4xl text-on-surface font-bold">Welcome, ${escapeHtml(profile.fullName)}</h1><p class="text-on-surface-variant mt-1">Profile completion: ${completion}%</p></div><form id="member-profile-form" class="bg-surface-container rounded-2xl border border-primary/20 p-space-lg space-y-space-sm"><input name="full_name" value="${escapeHtml(member.full_name || '')}" required placeholder="Full name" class="w-full px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><textarea name="bio" rows="4" placeholder="About you" class="w-full px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface">${escapeHtml(member.bio || '')}</textarea><input name="skills" value="${escapeHtml(profile.skills.join(', '))}" placeholder="Skills, comma separated" class="w-full px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><input name="photo_url" type="url" value="${escapeHtml(member.photo_url || '')}" placeholder="Profile photo URL (optional)" class="w-full px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><input name="photo_file" type="file" accept="image/*" class="w-full px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><div class="flex gap-space-sm"><input name="github" type="url" value="${escapeHtml(member.github || '')}" placeholder="GitHub URL" class="w-full px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><input name="linkedin" type="url" value="${escapeHtml(member.linkedin || '')}" placeholder="LinkedIn URL" class="w-full px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/></div><button class="px-space-lg py-2.5 rounded bg-primary text-on-primary font-semibold">Save profile</button><p id="member-save-message" class="text-sm text-on-surface-variant"></p></form><section class="bg-surface-container rounded-2xl border border-primary/20 p-space-lg"><h2 class="font-serif text-2xl text-on-surface font-bold">Projects</h2><form id="member-project-form" class="grid gap-space-sm md:grid-cols-2 mt-space-sm"><input name="title" required placeholder="Project title" class="px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><input name="project_url" type="url" placeholder="Project URL" class="px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><textarea name="description" placeholder="Description" class="md:col-span-2 px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"></textarea><button class="md:col-span-2 justify-self-start px-space-md py-2 rounded bg-primary text-on-primary">Add project</button></form><div class="mt-space-md space-y-space-xs">${recordList(memberProjects, 'member_projects')}</div></section><section class="bg-surface-container rounded-2xl border border-primary/20 p-space-lg"><h2 class="font-serif text-2xl text-on-surface font-bold">Certificates</h2><form id="member-certificate-form" class="grid gap-space-sm md:grid-cols-2 mt-space-sm"><input name="title" required placeholder="Certificate title" class="px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><input name="issuer" placeholder="Issuer" class="px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><button class="md:col-span-2 justify-self-start px-space-md py-2 rounded bg-primary text-on-primary">Add certificate</button></form><div class="mt-space-md space-y-space-xs">${recordList(memberCertificates, 'member_certificates')}</div></section><section class="bg-surface-container rounded-2xl border border-primary/20 p-space-lg"><h2 class="font-serif text-2xl text-on-surface font-bold">Achievements</h2><form id="member-achievement-form" class="grid gap-space-sm md:grid-cols-2 mt-space-sm"><input name="title" required placeholder="Achievement title" class="px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"/><textarea name="description" placeholder="Description" class="md:col-span-2 px-space-md py-2.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface"></textarea><button class="md:col-span-2 justify-self-start px-space-md py-2 rounded bg-primary text-on-primary">Add achievement</button></form><div class="mt-space-md space-y-space-xs">${recordList(memberAchievements, 'member_achievements')}</div></section><a data-member-slug="${escapeHtml(profile.slug)}" href="/members/${encodeURIComponent(profile.slug)}" class="inline-flex px-space-lg py-2.5 rounded border border-primary/30 text-primary">View public portfolio →</a></div>`;
          document.getElementById('member-profile-form')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const uploadedPhoto = form.get('photo_file')?.size ? await uploadMediaFile(form.get('photo_file'), `members/${user.id}`) : '';
            const changes = { full_name: form.get('full_name'), bio: form.get('bio'), skills: String(form.get('skills') || '').split(',').map((item) => item.trim()).filter(Boolean), photo_url: uploadedPhoto || form.get('photo_url'), github: form.get('github'), linkedin: form.get('linkedin') };
            const { error } = await _sb.from('members').update(changes).eq('auth_user_id', user.id);
            document.getElementById('member-save-message').textContent = error ? error.message : 'Profile saved.';
            if (!error) { this.members = []; this.renderMemberDashboard(); }
          });
          document.getElementById('member-project-form')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const saved = await sbInsert('member_projects', { member_id: member.id, title: String(form.get('title') || '').trim(), description: String(form.get('description') || '').trim(), project_url: String(form.get('project_url') || '').trim() });
            if (saved) this.renderMemberDashboard();
          });
          document.querySelectorAll('[data-member-project-delete]').forEach(button => button.addEventListener('click', async () => {
            if (await sbDelete('member_projects', button.getAttribute('data-member-project-delete'))) this.renderMemberDashboard();
          }));
          const addRecord = (id, table, fields) => document.getElementById(id)?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const row = { member_id: member.id };
            fields.forEach(field => { row[field] = String(form.get(field) || '').trim(); });
            if (await sbInsert(table, row)) this.renderMemberDashboard();
          });
          addRecord('member-certificate-form', 'member_certificates', ['title', 'issuer']);
          addRecord('member-achievement-form', 'member_achievements', ['title', 'description']);
          document.querySelectorAll('[data-member-record-delete]').forEach(button => button.addEventListener('click', async () => {
            const [table, id] = button.getAttribute('data-member-record-delete').split(':');
            if (await sbDelete(table, id)) this.renderMemberDashboard();
          }));
  }

  // --- View-Only Protection Feature (Security Requirement) ---
  initViewOnlyProtection() {
    // Disable right-click menu on all images to prevent casual downloading
    document.addEventListener('contextmenu', (e) => {
      if (e.target.tagName === 'IMG' || e.target.closest('.view-only-image') || e.target.closest('.modal-view-only')) {
        e.preventDefault();
        this.showToast('View-only archive: direct file saving is restricted.');
      }
    });

    // Disable dragging on images
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    });
  }

  // --- Exhibit Mode Toggle ---
  initExhibitMode() {
    // Restore saved theme preference if present
    const savedMode = localStorage.getItem('isep_theme_mode');
    if (savedMode === 'moonlight') {
      this.exhibitMode = 'moonlight';
      document.body.classList.remove('mode-warm-amber');
      document.body.classList.add('mode-moonlight');
      document.querySelectorAll('.exhibit-mode-label').forEach(el => {
        el.textContent = 'Moonlight Blue';
      });
    } else {
      this.exhibitMode = 'warm-amber';
      document.body.classList.remove('mode-moonlight');
      document.body.classList.add('mode-warm-amber');
      document.querySelectorAll('.exhibit-mode-label').forEach(el => {
        el.textContent = 'Warm Amber';
      });
    }

    document.querySelectorAll('.toggle-exhibit-lighting').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.exhibitMode === 'warm-amber') {
          this.exhibitMode = 'moonlight';
          document.body.classList.remove('mode-warm-amber');
          document.body.classList.add('mode-moonlight');
        } else {
          this.exhibitMode = 'warm-amber';
          document.body.classList.remove('mode-moonlight');
          document.body.classList.add('mode-warm-amber');
        }

        try {
          localStorage.setItem('isep_theme_mode', this.exhibitMode);
        } catch (e) {
          console.warn('Could not save theme preference:', e);
        }

        document.querySelectorAll('.exhibit-mode-label').forEach(el => {
          el.textContent = this.exhibitMode === 'warm-amber' ? 'Warm Amber' : 'Moonlight Blue';
        });
      });
    });
  }

  // --- 3D Hero Parallax Interaction ---
  initHeroParallax() {
    const deck = document.getElementById('memory-deck-wrapper');
    const heroCard = document.getElementById('interactive-hero-card');

    if (deck && heroCard) {
      deck.addEventListener('mousemove', (e) => {
        const rect = deck.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 14;

        heroCard.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(1deg) scale(1.02)`;
      });

      deck.addEventListener('mouseleave', () => {
        heroCard.style.transform = 'rotateY(-10deg) rotateX(6deg) rotateZ(2deg) scale(1)';
      });
    }

    // Scroll-reveal for group photo section
    const groupPhoto = document.getElementById('group-photo-reveal');
    if (groupPhoto) {
      groupPhoto.style.opacity = '0';
      groupPhoto.style.transform = 'translateY(48px)';
      groupPhoto.style.transition = 'opacity 0.85s cubic-bezier(0.22,1,0.36,1), transform 0.85s cubic-bezier(0.22,1,0.36,1)';
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            groupPhoto.style.opacity = '1';
            groupPhoto.style.transform = 'translateY(0)';
            revealObserver.unobserve(groupPhoto);
          }
        });
      }, { threshold: 0.12 });
      revealObserver.observe(groupPhoto);
    }
  }

  // --- Hero 3-Photo Album Modal Viewer ---
  initHeroAlbumModal() {
    const modal = document.getElementById('hero-album-modal');
    if (!modal) return;

    const albumPhotos = [
      {
        src: 'assets/images/photo-card-4.png',
        album: 'Album: Memories',
        tag: 'Inaugural Cohort',
        title: 'Batch 1 Fellowship',
        caption: 'Cherishing the shared moments, friendships, and milestones of our first batch.',
        date: 'Conferred: August 2026'
      },
      {
        src: 'assets/images/photo-card-3.jpg',
        album: 'Album: Sessions',
        tag: 'Hands-on Workshops',
        title: 'Technical Sessions',
        caption: 'Deep dive technical labs and engineering colloquiums conducted during Batch 1.',
        date: 'Conferred: July 2026'
      },
      {
        src: 'assets/images/photo-card-2.jpg',
        album: 'Album: Team Activities',
        tag: 'Colloquium Sprints',
        title: 'Team Activities Sprint',
        caption: 'Collaborative team problem-solving and peer development sprint sessions.',
        date: 'Conferred: June 2026'
      }
    ];

    let currentIndex = 0;

    const imgEl = document.getElementById('hero-album-active-img');
    const counterEl = document.getElementById('hero-album-counter');
    const badgeEl = document.getElementById('hero-album-badge');
    const tagEl = document.getElementById('hero-album-tag');
    const titleEl = document.getElementById('hero-album-title');
    const captionEl = document.getElementById('hero-album-caption');
    const dateEl = document.getElementById('hero-album-date');
    const prevBtn = document.getElementById('hero-album-prev-btn');
    const nextBtn = document.getElementById('hero-album-next-btn');
    const closeBtn = document.getElementById('close-hero-album-btn');
    const closeXBtn = document.getElementById('close-hero-album-x-btn');
    const thumbBtns = document.querySelectorAll('.hero-thumb-btn');

    const renderPhoto = (index) => {
      currentIndex = (index + albumPhotos.length) % albumPhotos.length;
      const photo = albumPhotos[currentIndex];

      if (imgEl) {
        imgEl.style.opacity = '0';
        setTimeout(() => {
          imgEl.src = photo.src;
          imgEl.alt = photo.title;
          imgEl.style.opacity = '1';
        }, 120);
      }

      if (counterEl) counterEl.textContent = `Photo ${currentIndex + 1} of ${albumPhotos.length}`;
      if (badgeEl) badgeEl.textContent = photo.album;
      if (tagEl) tagEl.textContent = photo.tag;
      if (titleEl) titleEl.textContent = photo.title;
      if (captionEl) captionEl.textContent = photo.caption;
      if (dateEl) dateEl.textContent = photo.date;

      thumbBtns.forEach((btn, idx) => {
        if (idx === currentIndex) {
          btn.className = 'hero-thumb-btn group relative rounded-lg overflow-hidden border-2 border-primary shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.5)] scale-105 transition-all cursor-pointer p-0.5';
        } else {
          btn.className = 'hero-thumb-btn group relative rounded-lg overflow-hidden border-2 border-outline-variant/30 opacity-60 hover:opacity-100 hover:border-primary/50 transition-all cursor-pointer p-0.5';
        }
      });
    };

    const openModal = (initialIndex = 0) => {
      renderPhoto(initialIndex);
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    };

    const closeModal = () => {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    };

    // Attach click handlers to deck trigger cards/elements
    document.querySelectorAll('[data-album-photo-index]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(el.getAttribute('data-album-photo-index'), 10) || 0;
        openModal(idx);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderPhoto(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderPhoto(currentIndex + 1);
      });
    }

    thumbBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-thumb-index'), 10) || 0;
        renderPhoto(idx);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeXBtn) closeXBtn.addEventListener('click', closeModal);

    // Click backdrop to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Keyboard navigation (arrow keys & Escape)
    document.addEventListener('keydown', (e) => {
      if (modal.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') renderPhoto(currentIndex - 1);
      if (e.key === 'ArrowRight') renderPhoto(currentIndex + 1);
    });
  }

  // --- Home Stats Sync ---
  updateHomeStats() {
    const photosCountEl = document.getElementById('home-stat-photos');
    const certsCountEl = document.getElementById('home-stat-certs');
    const thoughtsCountEl = document.getElementById('home-stat-thoughts');

    if (photosCountEl) photosCountEl.textContent = this.photos.length;
    if (certsCountEl) certsCountEl.textContent = this.certificates.length;
    if (thoughtsCountEl) thoughtsCountEl.textContent = this.thoughts.filter(t => t.status === 'approved').length;
  }

  // --- Photo Gallery Logic (Pavilion I) ---
  initGallery() {
    const searchInput = document.getElementById('gallery-search-input');
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');

    const filterGallery = () => {
      const q = (searchInput?.value || '').toLowerCase().trim();
      const activeBtn = document.querySelector('.gallery-filter-btn.active-gallery-filter');
      const activeAlbum = activeBtn ? activeBtn.getAttribute('data-album') : 'all';

      const filtered = this.photos.filter(p => {
        const matchesAlbum = activeAlbum === 'all' || p.album.toLowerCase() === activeAlbum.toLowerCase();
        const matchesQuery = !q ||
          p.title.toLowerCase().includes(q) ||
          p.caption.toLowerCase().includes(q) ||
          p.album.toLowerCase().includes(q);
        return matchesAlbum && matchesQuery;
      });

      this.renderGalleryGrid(filtered);
    };

    if (searchInput) searchInput.addEventListener('input', filterGallery);

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
          b.className = "gallery-filter-btn flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider transition-all flex-shrink-0 cursor-pointer";
        });
        btn.className = "gallery-filter-btn active-gallery-filter flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md uppercase tracking-wider shadow-sm transition-all flex-shrink-0 cursor-pointer";
        filterGallery();
      });
    });

    // Lightbox modal close
    const modal = document.getElementById('museum-lightbox-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('[data-close-lightbox]')) {
          modal.classList.add('hidden');
        }
      });
    }
  }

  renderGalleryGrid(photos) {
    const container = document.getElementById('gallery-masonry-grid');
    if (!container) return;

    if (photos.length === 0) {
      container.innerHTML = `
        <div class="col-span-12 py-space-xl text-center flex flex-col items-center justify-center">
          <span class="material-symbols-outlined text-outline text-[48px] mb-space-sm">photo_library</span>
          <p class="font-headline-sm text-on-surface font-serif">No archive photos match this query</p>
          <p class="font-body-sm text-on-surface-variant mt-1">Try another search keyword or switch to 'All Photos'.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = photos.map((p, index) => {
      const isWide = index % 3 === 0;
      const colSpan = isWide ? 'lg:col-span-7' : 'lg:col-span-5';
      const aspect = isWide ? 'aspect-[16/10]' : 'aspect-[4/3]';

      return `
        <article class="${colSpan} flex flex-col bg-surface-container rounded-xl overflow-hidden shadow-[0_16px_36px_-8px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_40px_-4px_rgba(212,162,76,0.22)] transition-all group border border-outline-variant/15 cursor-pointer" onclick="window.app.openLightbox('${p._id}')">
          <div class="relative bg-surface-container-lowest p-space-sm corner-reticle view-only-image">
            <div class="overflow-hidden rounded-lg ${aspect} bg-surface-container-high relative">
              <img alt="${p.title}" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 brightness-95 group-hover:brightness-100 select-none pointer-events-none" src="${p.imageUrl}" loading="lazy" draggable="false"/>
              <!-- Click-to-view overlay -->
              <div class="absolute inset-0 bg-surface/0 group-hover:bg-surface/20 transition-all duration-300 flex items-center justify-center">
                <div class="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-surface-container-lowest/90 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 shadow-xl border border-primary/30">
                  <span class="material-symbols-outlined text-primary text-[20px]">open_in_full</span>
                  <span class="font-label-md text-label-md text-primary font-semibold uppercase tracking-wider">View Photo</span>
                </div>
              </div>
              <div class="absolute bottom-space-xs right-space-xs px-2 py-0.5 rounded bg-surface/85 backdrop-blur-md text-[10px] font-mono tracking-widest text-primary/80 uppercase">
                ${p.album}
              </div>
            </div>
          </div>
          <div class="p-space-md flex flex-col justify-between flex-1 bg-surface-container">
            <div class="flex flex-col gap-space-xs">
              <div class="flex items-center justify-between text-outline">
                <span class="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">${p.album}</span>
                <span class="font-label-sm text-label-sm uppercase tracking-widest">${p.uploadedAt}</span>
              </div>
              <h2 class="font-headline-md text-headline-md text-on-surface font-serif font-bold">
                ${p.title}
              </h2>
              <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                ${p.caption}
              </p>
            </div>
            <div class="mt-space-md pt-space-sm flex items-center justify-between bg-surface-container-low px-space-sm py-space-xs rounded-lg border border-outline-variant/15">
              <span class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px] text-primary">visibility</span>
                View-Only Public Access
              </span>
              <span class="flex items-center gap-1 font-label-md text-label-md uppercase tracking-wider text-primary">
                <span>View Full Screen</span>
                <span class="material-symbols-outlined text-[16px]">fullscreen</span>
              </span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  openLightbox(photoId) {
    const photo = this.photos.find(p => p._id === photoId);
    if (!photo) return;

    const modal = document.getElementById('museum-lightbox-modal');
    if (!modal) return;

    document.getElementById('lightbox-image').src = photo.imageUrl;
    document.getElementById('lightbox-plate-id').textContent = photo.title;
    document.getElementById('lightbox-recorded').textContent = photo.uploadedAt;
    document.getElementById('lightbox-location').textContent = photo.album;
    document.getElementById('lightbox-caption').textContent = photo.caption;

    modal.classList.remove('hidden');
  }

  // --- Certificates Logic (Pavilion II) ---
  initCertificates() {
    const searchInput = document.getElementById('fellowSearchInput');
    const filterButtons = document.querySelectorAll('.cert-filter-chip');

    const filterCerts = () => {
      const q = (searchInput?.value || '').toLowerCase().trim();
      const activeBtn = document.querySelector('.cert-filter-chip.active');
      const activeCat = activeBtn ? activeBtn.getAttribute('data-cat') : 'all';

      const filtered = this.certificates.filter(c => {
        const matchesCat = activeCat === 'all' || (c.category && c.category.toLowerCase() === activeCat.toLowerCase());
        const matchesQuery = !q ||
          c.recipientName.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
      });

      this.renderCertificatesGrid(filtered);
    };

    if (searchInput) searchInput.addEventListener('input', filterCerts);

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
          b.className = "cert-filter-chip px-space-md py-space-xs rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md font-medium transition-all whitespace-nowrap cursor-pointer";
        });
        btn.className = "cert-filter-chip active px-space-md py-space-xs rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold transition-all whitespace-nowrap shadow-md cursor-pointer";
        filterCerts();
      });
    });

    const certModal = document.getElementById('certificate-inspect-modal');
    if (certModal) {
      certModal.addEventListener('click', (e) => {
        if (e.target === certModal || e.target.closest('[data-close-cert-modal]')) {
          certModal.classList.add('hidden');
        }
      });
    }
  }

  renderCertificatesGrid(certs) {
    const container = document.getElementById('certificates-grid-container');
    if (!container) return;

    if (certs.length === 0) {
      container.innerHTML = `
        <div class="col-span-2 py-space-xl text-center flex flex-col items-center justify-center">
          <span class="material-symbols-outlined text-outline text-[48px] mb-space-sm">school</span>
          <p class="font-headline-sm text-on-surface font-serif">No certificates match your query</p>
          <p class="font-body-sm text-on-surface-variant mt-1">Please try searching by a different intern or award title.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = certs.map(c => `
      <div class="group relative flex flex-col bg-surface-container rounded-xl p-2 shadow-[0_20px_45px_rgba(0,0,0,0.65)] hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(212,162,76,0.18)] transition-all duration-300 border border-outline-variant/15">
        <div class="relative w-full rounded-lg bg-surface-container-low p-space-lg flex flex-col justify-between overflow-hidden min-h-[440px]">
          <!-- Inner Corner Filigree Accents -->
          <div class="absolute top-3 left-3 w-4 h-4 bg-primary/20 rounded-tl-sm pointer-events-none"></div>
          <div class="absolute top-3 right-3 w-4 h-4 bg-primary/20 rounded-tr-sm pointer-events-none"></div>
          <div class="absolute bottom-3 left-3 w-4 h-4 bg-primary/20 rounded-bl-sm pointer-events-none"></div>
          <div class="absolute bottom-3 right-3 w-4 h-4 bg-primary/20 rounded-br-sm pointer-events-none"></div>

          <!-- Document Top: Organization & Emblem -->
          <div class="flex items-start justify-between relative z-10">
            <div class="flex items-center gap-space-sm">
              <div class="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div class="flex flex-col">
                <span class="font-label-sm text-label-sm tracking-widest uppercase text-primary font-bold">ISEP Internship Program</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant font-mono">RECORD ID: ${c._id.toUpperCase()}</span>
              </div>
            </div>
            
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-tertiary-container to-on-primary-container flex items-center justify-center shadow-lg relative">
              <span class="material-symbols-outlined text-on-primary text-[22px]">verified</span>
              <div class="absolute -bottom-2 w-3 h-5 bg-tertiary-container rounded-b-sm shadow-sm"></div>
            </div>
          </div>

          <!-- Document Middle: Recipient & Award -->
          <div class="my-space-lg relative z-10 flex flex-col items-center text-center px-space-md">
            <span class="font-label-sm text-label-sm uppercase tracking-[0.25em] text-on-surface-variant mb-space-xs font-semibold">${c.title}</span>
            <h2 class="font-headline-lg text-headline-lg text-primary tracking-tight mb-space-xs font-serif font-bold">
              ${c.recipientName}
            </h2>
            <div class="w-16 h-[2px] bg-primary/30 my-space-xs"></div>
            <p class="font-body-md text-body-md text-on-surface max-w-lg mb-space-sm">
              Presented in recognition of dedicated contribution, rigorous engineering excellence, and successful completion of the ISEP Batch 1 Internship Program.
            </p>
          </div>

          <!-- Document Footer: Issue Date & View Only Modal Action -->
          <div class="relative z-10 pt-space-md mt-auto border-t border-outline-variant/20 flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-on-surface-variant">Conferred: <span class="text-on-surface font-medium">${c.issueDate}</span></span>
            <button class="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-highest hover:bg-primary-container hover:text-on-primary-container text-on-surface text-body-sm font-body-sm transition-all group-hover:bg-primary group-hover:text-on-primary font-medium cursor-pointer" onclick="window.app.inspectCertificate('${c._id}')">
              <span class="material-symbols-outlined text-[16px]">visibility</span>
              <span>View-Only Preview</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  inspectCertificate(certId) {
    const cert = this.certificates.find(c => c._id === certId);
    if (!cert) return;

    const modal = document.getElementById('certificate-inspect-modal');
    if (!modal) return;

    document.getElementById('inspect-modal-name').textContent = cert.recipientName;
    document.getElementById('inspect-modal-id').textContent = cert._id.toUpperCase();
    document.getElementById('inspect-modal-title').textContent = cert.title;
    document.getElementById('inspect-modal-date').textContent = cert.issueDate;

    const fileWrapper = document.getElementById('inspect-modal-file-wrapper');
    const fileImg = document.getElementById('inspect-modal-file-img');
    const filePdf = document.getElementById('inspect-modal-file-pdf');

    if (fileWrapper && fileImg && filePdf) {
      if (cert.fileUrl) {
        fileWrapper.classList.remove('hidden');
        if (cert.fileUrl.endsWith('.pdf') || cert.fileUrl.includes('application/pdf')) {
          fileImg.classList.add('hidden');
          filePdf.classList.remove('hidden');
          filePdf.src = cert.fileUrl;
        } else {
          filePdf.classList.add('hidden');
          fileImg.classList.remove('hidden');
          fileImg.src = cert.fileUrl;
        }
      } else {
        fileWrapper.classList.add('hidden');
        fileImg.src = '';
        filePdf.src = '';
      }
    }

    modal.classList.remove('hidden');
  }

  // --- (Pavilion III: Achievements/Milestones feature removed per user request) ---
  renderAchievements() { /* no-op: achievements feature removed */ }


  // --- Thoughts Wall Logic (Pavilion IV) ---
  initThoughtsWall() {
    const openPinBtn = document.getElementById('open-pin-drawer-btn');
    const pinModal = document.getElementById('pin-reflection-modal');
    const pinForm = document.getElementById('pin-reflection-form');

    if (openPinBtn && pinModal) {
      openPinBtn.addEventListener('click', () => pinModal.classList.remove('hidden'));
      pinModal.addEventListener('click', (e) => {
        if (e.target === pinModal || e.target.closest('[data-close-pin-modal]')) {
          pinModal.classList.add('hidden');
        }
      });
    }

    // Star rating picker
    const starButtons = document.querySelectorAll('.star-rating-select-btn');
    starButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.getAttribute('data-star'), 10);
        this.selectedRating = rating;
        starButtons.forEach(b => {
          const val = parseInt(b.getAttribute('data-star'), 10);
          b.classList.toggle('text-primary', val <= rating);
          b.classList.toggle('text-outline', val > rating);
        });
      });
    });

    if (pinForm) {
      pinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('pin-author').value.trim();
        const message = document.getElementById('pin-quote').value.trim();
        if (!name || !message) return;

        // Thoughts default to 'pending' — go live only after admin approval
        const saved = await sbInsert('thoughts', {
          name,
          message,
          rating: this.selectedRating || 5,
          status: 'pending',
          author_id: (await _sb?.auth.getUser())?.data?.user?.id || null,
          profile_photo: ''
        });

        pinForm.reset();
        pinModal.classList.add('hidden');

        if (saved) {
          this.showToast('Thank you! Your thought has been submitted for coordinator review and will be published once approved.');
        } else {
          this.showToast('Submission failed — please try again.');
        }
      });
    }
  }

  renderThoughtsWall() {
    const container = document.getElementById('memos-grid');
    if (!container) return;

    // Visitors only see APPROVED thoughts
    const approved = this.thoughts.filter(t => t.status === 'approved');

    if (approved.length === 0) {
      container.innerHTML = `
        <div class="col-span-3 py-space-xl text-center flex flex-col items-center justify-center">
          <span class="material-symbols-outlined text-outline text-[48px] mb-space-sm">forum</span>
          <p class="font-headline-sm text-on-surface font-serif">The Thoughts Wall is waiting for reflections</p>
          <p class="font-body-sm text-on-surface-variant mt-1">Be the first visitor to share your message with Batch 1.</p>
        </div>
      `;
      return;
    }

    const rotations = ['-1.5deg', '1.2deg', '-2deg', '2deg', '-0.8deg', '1.5deg'];

    container.innerHTML = approved.map((t, idx) => {
      const rot = rotations[idx % rotations.length];
      const isEven = idx % 2 === 0;
      const cardBg = isEven ? 'bg-surface-container text-on-surface' : 'parchment-card text-on-secondary-fixed';
      const authorColor = isEven ? 'text-primary' : 'text-on-secondary-fixed font-bold';
      const roleColor = isEven ? 'text-on-surface-variant' : 'text-on-secondary-fixed/70';

      const stars = '★'.repeat(t.rating || 5) + '☆'.repeat(5 - (t.rating || 5));

      return `
        <div class="memo-item group relative ${cardBg} p-space-lg rounded-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style="transform: rotate(${rot}); transform-origin: top center;">
          <!-- Brass Pushpin -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center shadow-md border-2 border-surface-container-lowest">
            <div class="w-1.5 h-1.5 rounded-full bg-on-primary"></div>
          </div>
          
          <div class="flex items-center justify-between gap-space-xs mb-space-sm">
            <span class="text-primary font-mono text-sm tracking-wider">${stars}</span>
            <span class="font-label-sm text-label-sm ${roleColor}">${t.createdAt}</span>
          </div>

          <p class="font-headline-sm text-[18px] leading-snug mb-space-md italic font-serif">
            “${t.message}”
          </p>

          <div class="flex items-center justify-between pt-space-sm border-t ${isEven ? 'border-outline-variant/20' : 'border-on-secondary-fixed/20'}">
            <div class="flex flex-col">
            <div class="flex items-center gap-2">${t.photo ? `<img src="${escapeHtml(t.photo)}" alt="" class="w-7 h-7 rounded-full object-cover"/>` : ''}<span class="font-headline-sm text-[16px] ${authorColor}">${escapeHtml(t.name)}</span></div>
              <span class="font-body-sm text-body-sm ${roleColor}">Verified Visitor / Scholar</span>
            </div>
            <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary/70 text-[20px]">format_quote</span>${t.authorId && t.authorId === this.currentUserId ? `<button data-thought-edit="${t._id}" class="text-xs text-primary hover:underline">Edit</button><button data-thought-delete="${t._id}" class="text-xs text-error hover:underline">Delete</button>` : ''}</span>
          </div>
        </div>
      `;
    }).join('');
    container.querySelectorAll('[data-thought-edit]').forEach(button => button.addEventListener('click', async () => {
      const thought = approved.find(item => item._id === button.getAttribute('data-thought-edit'));
      if (!thought) return;
      const message = window.prompt('Edit your thought', thought.message);
      if (message === null || !message.trim()) return;
      if (await sbUpdate('thoughts', thought._id, { message: message.trim(), status: 'pending' })) {
        thought.message = message.trim();
        thought.status = 'pending';
        this.renderThoughtsWall();
        this.showToast('Your edit was submitted for moderation.');
      }
    }));
    container.querySelectorAll('[data-thought-delete]').forEach(button => button.addEventListener('click', async () => {
      if (window.confirm('Delete your thought?') && await sbDelete('thoughts', button.getAttribute('data-thought-delete'))) {
        this.thoughts = this.thoughts.filter(item => item._id !== button.getAttribute('data-thought-delete'));
        this.renderThoughtsWall();
      }
    }));

    const countEl = document.getElementById('thoughts-count-indicator');
    if (countEl) countEl.textContent = `${approved.length} Public Reflections`;
  }

  // --- Admin Portal Logic (Auth, CRUD, Moderation) ---

  // Helper: show a feedback alert inside the auth card
  _showAuthAlert(msg, type = 'error') {
    const el = document.getElementById('admin-auth-alert');
    if (!el) return;
    const colors = {
      error:   'bg-error-container border-error/40 text-on-error-container',
      success: 'bg-primary/10 border-primary/40 text-on-surface',
      warn:    'bg-surface-container-low border-outline-variant/40 text-on-surface-variant'
    };
    const icon = { error: 'error', success: 'check_circle', warn: 'info' };
    el.className = `mb-space-md p-3 rounded-lg text-xs flex items-start gap-2 border ${colors[type] || colors.error}`;
    el.innerHTML = `<span class="material-symbols-outlined text-[16px] shrink-0">${icon[type] || 'error'}</span><span>${msg}</span>`;
    el.classList.remove('hidden');
  }
  _hideAuthAlert() {
    const el = document.getElementById('admin-auth-alert');
    if (el) el.classList.add('hidden');
  }

  initAdminPortal() {
    // --- Auth Tab Switching ---
    const switchToLogin = () => {
      this._hideAuthAlert();
      document.getElementById('admin-login-form')?.classList.remove('hidden');
      document.getElementById('admin-register-form')?.classList.add('hidden');
      document.getElementById('auth-tab-login')?.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
      document.getElementById('auth-tab-login')?.classList.remove('text-on-surface-variant');
      document.getElementById('auth-tab-register')?.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
      document.getElementById('auth-tab-register')?.classList.add('text-on-surface-variant');
    };
    const switchToRegister = () => {
      this._hideAuthAlert();
      document.getElementById('admin-login-form')?.classList.add('hidden');
      document.getElementById('admin-register-form')?.classList.remove('hidden');
      document.getElementById('auth-tab-register')?.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
      document.getElementById('auth-tab-register')?.classList.remove('text-on-surface-variant');
      document.getElementById('auth-tab-login')?.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
      document.getElementById('auth-tab-login')?.classList.add('text-on-surface-variant');
    };
    document.getElementById('auth-tab-login')?.addEventListener('click', switchToLogin);
    document.getElementById('auth-tab-register')?.addEventListener('click', switchToRegister);
    document.getElementById('auth-link-login')?.addEventListener('click', switchToLogin);
    document.getElementById('auth-link-register')?.addEventListener('click', switchToRegister);

    // --- Sign In Form ---
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        this._hideAuthAlert();
        const email = document.getElementById('admin-email').value.trim().toLowerCase();
        const pass  = document.getElementById('admin-password').value;
        const btn   = document.getElementById('admin-login-submit-btn');
        if (btn) { btn.disabled = true; btn.querySelector('.btn-text').textContent = 'Signing in…'; }

        try {
          if (!_sb) throw new Error('Supabase not available.');

          // 1. Sign in with Supabase Auth
          const { data, error } = await _sb.auth.signInWithPassword({ email, password: pass });
          if (error) throw error;

          // 2. Check database approval
          const { data: adminRow, error: dbErr } = await _sb
            .from('admin_users')
            .select('is_approved, role, full_name')
            .eq('email', email)
            .single();

          if (dbErr || !adminRow) {
            this._showAuthAlert('This account is not an approved coordinator account. Use the Member Dashboard for member access.', 'warn');
            await _sb.auth.signOut();
            return;
          }

          if (!adminRow.is_approved) {
            // Not yet approved — sign out and explain
            await _sb.auth.signOut();
            this._showAuthAlert(
              'Your account is pending approval by the database administrator. Once approved, you can sign in here. Please contact the administrator to approve your access in the <strong>admin_users</strong> table.',
              'warn'
            );
            return;
          }

          // 3. Approved — grant access
          localStorage.setItem('isep_admin_token', data.session.access_token);
          this.isAdmin = true;
          this.adminProfile = adminRow;
          const emailEl = document.getElementById('admin-active-email');
          if (emailEl) emailEl.textContent = email;
          this.updateAdminHeaderStatus();
          await this.loadAllThoughtsForAdmin();
          this.renderAdminView();
          this.showToast(`Welcome, ${adminRow.full_name || 'Coordinator'}. ${adminRow.role === 'head' ? 'ISEP Head access enabled.' : 'Coordinator access enabled.'}`);

        } catch (err) {
          console.warn('[Admin Login]', err.message);
          const msg = err.message?.includes('Email not confirmed')
            ? 'Please verify your email address before signing in. Check your inbox for the verification link.'
            : err.message?.includes('Invalid login credentials')
            ? 'Incorrect email or password. Please try again.'
            : `Sign-in failed: ${err.message}`;
          this._showAuthAlert(msg, 'error');
        } finally {
          if (btn) { btn.disabled = false; btn.querySelector('.btn-text').textContent = 'Sign In to Control Panel'; }
        }
      });
    }

    // --- Request Access / Register Form ---
    const registerForm = document.getElementById('admin-register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        this._hideAuthAlert();
        const fullName = document.getElementById('admin-reg-name').value.trim();
        const email    = document.getElementById('admin-reg-email').value.trim().toLowerCase();
        const pass     = document.getElementById('admin-reg-password').value;
        const confirm  = document.getElementById('admin-reg-confirm').value;
        const btn      = document.getElementById('admin-register-submit-btn');

        if (pass !== confirm) {
          this._showAuthAlert('Passwords do not match. Please re-enter.', 'error');
          return;
        }

        if (btn) { btn.disabled = true; btn.querySelector('.btn-text').textContent = 'Registering…'; }

        try {
          if (!_sb) throw new Error('Supabase not available.');

          // Sign up via Supabase Auth (sends verification email automatically)
          const { data, error } = await _sb.auth.signUp({
            email,
            password: pass,
            options: { data: { full_name: fullName } }
          });

          if (error) throw error;

          // Upsert into admin_users (trigger may also do this, but we ensure full_name is saved)
          if (_sb && data?.user) {
            await _sb.from('admin_users').upsert([
              { user_id: data.user.id, email, full_name: fullName, is_approved: false }
            ], { onConflict: 'email' });
          }

          // Show success message — user must verify email next
          this._showAuthAlert(
            `<strong>Registration submitted!</strong><br>A verification email has been sent to <strong>${email}</strong>.<br><br>Steps to gain access:<br>1. Click the verification link in your email.<br>2. Ask the database administrator to approve your account in the <strong>admin_users</strong> table.<br>3. Return here and sign in.`,
            'success'
          );
          registerForm.reset();

        } catch(err) {
          console.warn('[Admin Register]', err.message);
          const msg = err.message?.includes('already registered')
            ? 'This email is already registered. Please sign in instead.'
            : `Registration failed: ${err.message}`;
          this._showAuthAlert(msg, 'error');
        } finally {
          if (btn) { btn.disabled = false; btn.querySelector('.btn-text').textContent = 'Submit Request & Register'; }
        }
      });
    }

    // Admin Logout
    document.querySelectorAll('.btn-admin-logout').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (_sb) {
          try { await _sb.auth.signOut(); } catch(e) {}
        }
        this.isAdmin = false;
        localStorage.removeItem('isep_admin_token');
        this.updateAdminHeaderStatus();
        this.renderAdminView();
        this.showToast('Logged out of Admin Portal.');
      });
    });

    // Admin Tabs
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        document.querySelectorAll('.admin-tab-btn').forEach(b => {
          b.className = "admin-tab-btn px-space-md py-space-xs text-on-surface-variant hover:text-on-surface rounded-lg font-body-sm transition-all";
        });
        btn.className = "admin-tab-btn px-space-md py-space-xs bg-primary text-on-primary font-semibold rounded-lg shadow-sm transition-all";

        document.querySelectorAll('.admin-tab-panel').forEach(p => p.classList.add('hidden'));
        const contentTab = CONTENT_TYPES[tab] ? 'content' : tab;
        const activePanel = document.getElementById(`admin-panel-${contentTab}`);
        if (activePanel) activePanel.classList.remove('hidden');
        if (tab === 'members') this.loadAdminMembers();
        if (CONTENT_TYPES[tab]) this.setAdminContentType(tab);
      });
    });
    this.initAdminContentManagement();
    this.initAdminLegacyControls();

  }

  async loadAdminMembers() {
    const body = document.getElementById('admin-members-table-body');
    if (!body || !this.isAdmin) return;
    const search = (document.getElementById('admin-member-search')?.value || '').trim().toLowerCase();
    const rows = (await sbFetch('members')).filter(row => !search || `${row.full_name || ''} ${row.email || ''}`.toLowerCase().includes(search));
    body.innerHTML = rows.length ? rows.map(row => `<tr><td class="py-2.5 px-3 text-on-surface">${escapeHtml(row.full_name || row.email || 'Unnamed')}</td><td class="py-2.5 px-3">${escapeHtml(row.email || '')}</td><td class="py-2.5 px-3">${escapeHtml(row.created_at ? new Date(row.created_at).toLocaleDateString() : '')}</td><td class="py-2.5 px-3">${escapeHtml(row.approval_status || (row.is_approved ? 'approved' : 'pending'))}</td><td class="py-2.5 px-3">${escapeHtml(row.role || 'member')}</td><td class="py-2.5 px-3 text-right"><button data-member-approval="${row.id}" data-status="approved" class="text-primary hover:underline mr-3">Approve</button><button data-member-approval="${row.id}" data-status="rejected" class="text-error hover:underline">Reject</button></td></tr>`).join('') : '<tr><td colspan="6" class="py-space-lg text-center text-on-surface-variant">No member registrations found.</td></tr>';
    body.querySelectorAll('[data-member-approval]').forEach(button => button.addEventListener('click', async () => {
      const id = button.getAttribute('data-member-approval');
      const status = button.getAttribute('data-status');
      const ok = await sbUpdate('members', id, { approval_status: status, is_approved: status === 'approved', approved: status === 'approved' });
      if (ok) { this.showToast(`Member ${status}.`); this.loadAdminMembers(); this.members = []; }
    }));
  }

  async setAdminContentType(type) {
    if (!CONTENT_TYPES[type]) return;
    this.adminContentType = type;
    const config = CONTENT_TYPES[type];
    const title = document.getElementById('admin-content-title');
    const help = document.getElementById('admin-content-help');
    if (title) title.textContent = config.label;
    if (help) help.textContent = `${config.description} Only approved records appear publicly.`;
    const body = document.getElementById('admin-content-table-body');
    if (!body) return;
    const rows = await sbFetch(config.table);
    body.innerHTML = rows.length ? rows.map(row => `<tr><td class="py-2.5 px-3 text-on-surface">${escapeHtml(row.title || '')}</td><td class="py-2.5 px-3">${escapeHtml(row.event_date || '')}</td><td class="py-2.5 px-3 max-w-sm truncate">${escapeHtml(row.description || '')}</td><td class="py-2.5 px-3 text-right"><button data-content-edit="${row.id}" class="text-primary hover:underline mr-3">Edit</button><button data-content-approve="${row.id}" class="text-primary hover:underline mr-3">${row.status === 'approved' ? 'Hide' : 'Approve'}</button><button data-content-delete="${row.id}" class="text-error hover:underline">Delete</button></td></tr>`).join('') : '<tr><td colspan="4" class="py-space-lg text-center text-on-surface-variant">No records yet. Add the first real record above.</td></tr>';
    body.querySelectorAll('[data-content-edit]').forEach(button => button.addEventListener('click', async () => {
      const row = rows.find(item => item.id === button.getAttribute('data-content-edit'));
      if (!row) return;
      const title = window.prompt('Title', row.title || '');
      if (title === null) return;
      const description = window.prompt('Description', row.description || '');
      if (description === null) return;
      const extra = window.prompt('Additional details', row.extra || '');
      if (extra === null) return;
      if (await sbUpdate(config.table, row.id, { title: title.trim(), description: description.trim(), extra: extra.trim() })) {
        this.showToast('Record updated.');
        this.setAdminContentType(type);
      }
    }));
    body.querySelectorAll('[data-content-approve]').forEach(button => button.addEventListener('click', async () => {
      const row = rows.find(item => item.id === button.getAttribute('data-content-approve'));
      if (row && await sbUpdate(config.table, row.id, { status: row.status === 'approved' ? 'hidden' : 'approved' })) this.setAdminContentType(type);
    }));
    body.querySelectorAll('[data-content-delete]').forEach(button => button.addEventListener('click', async () => {
      if (await sbDelete(config.table, button.getAttribute('data-content-delete'))) { this.showToast('Record deleted.'); this.setAdminContentType(type); }
    }));
  }

  initAdminContentManagement() {
    document.getElementById('admin-member-search')?.addEventListener('input', () => this.loadAdminMembers());
    const form = document.getElementById('admin-content-form');
    if (!form) return;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!this.isAdmin) return;
      const message = document.getElementById('admin-content-message');
      const file = document.getElementById('admin-content-file')?.files?.[0];
      const imageUrl = file ? await uploadMediaFile(file, this.adminContentType) : '';
      if (file && !imageUrl) { if (message) message.textContent = 'Upload failed. Check the archive-media bucket and storage policies.'; return; }
      const row = {
        title: document.getElementById('admin-content-title-input').value.trim(),
        event_date: document.getElementById('admin-content-date').value || null,
        description: document.getElementById('admin-content-description').value.trim(),
        extra: document.getElementById('admin-content-extra').value.trim(),
        image_url: imageUrl || null,
        status: 'pending',
        created_by: this.adminProfile?.user_id || null
      };
      const saved = await sbInsert(CONTENT_TYPES[this.adminContentType].table, row);
      if (!saved) { if (message) message.textContent = 'Could not save this record. Check the schema and RLS policies.'; return; }
      form.reset();
      if (message) message.textContent = 'Saved as pending. Approve it from this panel to publish.';
      this.setAdminContentType(this.adminContentType);
    });
  }

  initAdminLegacyControls() {
    // Setup Photo Dropzone & Device File Picker
    const photoFileInput = document.getElementById('new-photo-file');
    const photoEmptyState = document.getElementById('photo-file-empty-state');
    const photoPreviewState = document.getElementById('photo-file-preview-state');
    const photoPreviewImg = document.getElementById('photo-file-preview-img');
    const photoFileName = document.getElementById('photo-file-name');
    const photoFileSize = document.getElementById('photo-file-size');
    const photoRemoveBtn = document.getElementById('photo-file-remove-btn');

    const formatBytes = (bytes) => {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handlePhotoFileSelect = (file) => {
      if (!file || !file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, WEBP, or GIF).');
        return;
      }

      if (photoFileName) photoFileName.textContent = file.name;
      if (photoFileSize) photoFileSize.textContent = formatBytes(file.size);
      if (photoPreviewImg) {
        photoPreviewImg.src = URL.createObjectURL(file);
      }
      if (photoEmptyState) photoEmptyState.classList.add('hidden');
      if (photoPreviewState) photoPreviewState.classList.remove('hidden');
    };

    const resetPhotoPicker = () => {
      if (photoFileInput) photoFileInput.value = '';
      if (photoPreviewImg) photoPreviewImg.src = '';
      if (photoEmptyState) photoEmptyState.classList.remove('hidden');
      if (photoPreviewState) photoPreviewState.classList.add('hidden');
    };

    if (photoFileInput) {
      photoFileInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) handlePhotoFileSelect(file);
      });
    }

    if (photoRemoveBtn) {
      photoRemoveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetPhotoPicker();
      });
    }

    // Setup Certificate Dropzone & Device File Picker
    const certFileInput = document.getElementById('new-cert-file');
    const certEmptyState = document.getElementById('cert-file-empty-state');
    const certPreviewState = document.getElementById('cert-file-preview-state');
    const certPreviewImg = document.getElementById('cert-file-preview-img');
    const certIconBox = document.getElementById('cert-file-icon-box');
    const certFileName = document.getElementById('cert-file-name');
    const certFileSize = document.getElementById('cert-file-size');
    const certRemoveBtn = document.getElementById('cert-file-remove-btn');

    const handleCertFileSelect = (file) => {
      if (!file) return;
      if (certFileName) certFileName.textContent = file.name;
      if (certFileSize) certFileSize.textContent = formatBytes(file.size);
      if (file.type.startsWith('image/')) {
        if (certPreviewImg) {
          certPreviewImg.src = URL.createObjectURL(file);
          certPreviewImg.classList.remove('hidden');
        }
        if (certIconBox) certIconBox.classList.add('hidden');
      } else {
        if (certPreviewImg) certPreviewImg.classList.add('hidden');
        if (certIconBox) certIconBox.classList.remove('hidden');
      }
      if (certEmptyState) certEmptyState.classList.add('hidden');
      if (certPreviewState) certPreviewState.classList.remove('hidden');
    };

    const resetCertPicker = () => {
      if (certFileInput) certFileInput.value = '';
      if (certPreviewImg) certPreviewImg.src = '';
      if (certEmptyState) certEmptyState.classList.remove('hidden');
      if (certPreviewState) certPreviewState.classList.add('hidden');
    };

    if (certFileInput) {
      certFileInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) handleCertFileSelect(file);
      });
    }

    if (certRemoveBtn) {
      certRemoveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetCertPicker();
      });
    }

    // Admin Upload Photo Form (From Device)
    const uploadPhotoForm = document.getElementById('admin-upload-photo-form');
    if (uploadPhotoForm) {
      uploadPhotoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('new-photo-title').value.trim();
        const album = document.getElementById('new-photo-album').value;
        const caption = document.getElementById('new-photo-caption').value.trim();
        const file = photoFileInput?.files?.[0];

        if (!title) {
          alert('Please enter a photo title.');
          return;
        }
        if (!file) {
          alert('Please select a photo from your device.');
          return;
        }

        const submitBtn = uploadPhotoForm.querySelector('button[type="submit"]');
        const origText = submitBtn ? submitBtn.innerHTML : 'Upload Photo';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="inline-block animate-spin mr-1">⌛</span> Uploading...';
        }

        try {
          const imageUrl = await uploadMediaFile(file, 'photos');
          if (!imageUrl) throw new Error('Could not process photo file.');

          const saved = await sbInsert('photos', {
            title,
            caption: caption || '',
            album,
            image_url: imageUrl
          });

          if (saved) {
            const newPhoto = mapPhoto(saved);
            this.photos.unshift(newPhoto);
            this.renderGalleryGrid(this.photos);
            this.renderAdminPhotosTable();
            this.updateHomeStats();
            uploadPhotoForm.reset();
            resetPhotoPicker();
            document.getElementById('admin-upload-photo-modal').classList.add('hidden');
            this.showToast(`Photo uploaded from device to ${album} album.`);
          } else {
            this.showToast('Error uploading photo to database. Check console.');
          }
        } catch (err) {
          console.error(err);
          this.showToast('Upload error: ' + err.message);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
          }
        }
      });
    }

    // Admin Add Certificate Form (From Device)
    const addCertForm = document.getElementById('admin-add-cert-form');
    if (addCertForm) {
      addCertForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const recipientName = document.getElementById('new-cert-recipient').value.trim();
        const title = document.getElementById('new-cert-title').value.trim();
        const issueDate = document.getElementById('new-cert-date').value || '2026-06-28';
        const category = document.getElementById('new-cert-category').value;
        const file = certFileInput?.files?.[0];

        if (!recipientName || !title) {
          alert('Please provide recipient name and certificate title.');
          return;
        }

        const submitBtn = addCertForm.querySelector('button[type="submit"]');
        const origText = submitBtn ? submitBtn.innerHTML : 'Confer Certificate';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="inline-block animate-spin mr-1">⌛</span> Conferring...';
        }

        try {
          let fileUrl = '';
          if (file) {
            fileUrl = await uploadMediaFile(file, 'certificates');
          }

          const saved = await sbInsert('certificates', {
            title,
            recipient_name: recipientName,
            issue_date: issueDate,
            category,
            file_url: fileUrl || ''
          });

          if (saved) {
            const newCert = mapCert(saved);
            this.certificates.unshift(newCert);
            this.renderCertificatesGrid(this.certificates);
            this.renderAdminCertsTable();
            this.updateHomeStats();
            addCertForm.reset();
            resetCertPicker();
            document.getElementById('admin-add-cert-modal').classList.add('hidden');
            this.showToast(`Certificate conferred for ${recipientName}.`);
          } else {
            this.showToast('Error issuing certificate. Check console.');
          }
        } catch (err) {
          console.error(err);
          this.showToast('Error issuing certificate: ' + err.message);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
          }
        }
      });
    }

    // Dismiss modals on backdrop click
    const certModal = document.getElementById('admin-add-cert-modal');
    if (certModal) {
      certModal.addEventListener('click', (e) => {
        if (e.target === certModal || e.target.classList.contains('admin-modal-dialog')) {
          certModal.classList.add('hidden');
        }
      });
    }

    const photoModal = document.getElementById('admin-upload-photo-modal');
    if (photoModal) {
      photoModal.addEventListener('click', (e) => {
        if (e.target === photoModal || e.target.classList.contains('admin-modal-dialog')) {
          photoModal.classList.add('hidden');
        }
      });
    }
  }

  updateAdminHeaderStatus() {
    const adminBtn = document.getElementById('header-admin-btn');
    if (!adminBtn) return;

    if (this.isAdmin) {
      adminBtn.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        <span class="font-label-sm text-xs font-semibold text-primary">Coordinator Active</span>
      `;
    } else {
      adminBtn.innerHTML = `
        <span class="material-symbols-outlined text-[16px] text-on-surface-variant">lock</span>
        <span class="font-label-sm text-xs text-on-surface-variant">Admin Login</span>
      `;
    }
  }

  renderAdminView() {
    const authWrapper = document.getElementById('admin-auth-wrapper');
    const dashboardWrapper = document.getElementById('admin-dashboard-wrapper');

    if (!authWrapper || !dashboardWrapper) return;

    if (!this.isAdmin) {
      authWrapper.classList.remove('hidden');
      dashboardWrapper.classList.add('hidden');
    } else {
      authWrapper.classList.add('hidden');
      dashboardWrapper.classList.remove('hidden');
      const dashboardTitle = document.getElementById('admin-dashboard-title');
      if (dashboardTitle) dashboardTitle.textContent = this.adminProfile?.role === 'mentor' ? `Main Mentor Console - ${this.adminProfile.full_name || 'ISEP Admin'}` : `ISEP ${this.adminProfile?.role === 'head' ? 'Head' : 'Admin'} Console`;

      // Update counters — load fresh from Supabase for admin
      this.loadAllThoughtsForAdmin().then(allThoughts => {
        this.thoughts = allThoughts;
        const pendingCount = allThoughts.filter(t => t.status === 'pending').length;
        document.getElementById('admin-count-photos').textContent = this.photos.length;
        document.getElementById('admin-count-certs').textContent = this.certificates.length;
        document.getElementById('admin-count-pending').textContent = pendingCount;
        const membersCount = document.getElementById('admin-count-members');
        if (membersCount) {
          sbTable('members').then(rows => { membersCount.textContent = rows.filter(row => row.approved).length; });
        }
        this.renderAdminThoughtsTable();
      });

      this.renderAdminPhotosTable();
      this.renderAdminCertsTable();
    }
  }

  renderAdminPhotosTable() {
    const tbody = document.getElementById('admin-photos-table-body');
    if (!tbody) return;

    tbody.innerHTML = this.photos.map(p => `
      <tr class="border-b border-outline-variant/15 text-sm text-on-surface">
        <td class="py-2.5 px-3">
          <img src="${p.imageUrl}" alt="" class="w-12 h-9 object-cover rounded bg-surface-container"/>
        </td>
        <td class="py-2.5 px-3 font-medium text-on-surface">${p.title}</td>
        <td class="py-2.5 px-3 text-xs font-mono text-primary">${p.album}</td>
        <td class="py-2.5 px-3 text-xs text-on-surface-variant">${p.uploadedAt}</td>
        <td class="py-2.5 px-3 text-right">
          <button class="text-xs text-error hover:underline cursor-pointer" onclick="window.app.deletePhoto('${p._id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  async deletePhoto(id) {
    if (confirm('Delete this photo from the ISEP archive?')) {
      const ok = await sbDelete('photos', id);
      if (ok) {
        this.photos = this.photos.filter(p => p._id !== id);
        this.renderGalleryGrid(this.photos);
        this.renderAdminPhotosTable();
        this.updateHomeStats();
        this.showToast('Photo removed.');
      } else {
        this.showToast('Delete failed. Check console.');
      }
    }
  }

  renderAdminCertsTable() {
    const tbody = document.getElementById('admin-certs-table-body');
    if (!tbody) return;

    tbody.innerHTML = this.certificates.map(c => `
      <tr class="border-b border-outline-variant/15 text-sm text-on-surface">
        <td class="py-2.5 px-3 font-semibold text-primary">${c.recipientName}</td>
        <td class="py-2.5 px-3">${c.title}</td>
        <td class="py-2.5 px-3 text-xs font-mono text-on-surface-variant">${c.issueDate}</td>
        <td class="py-2.5 px-3 text-right">
          <button class="text-xs text-error hover:underline cursor-pointer" onclick="window.app.deleteCertificate('${c._id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  async deleteCertificate(id) {
    if (confirm('Delete this certificate record?')) {
      const ok = await sbDelete('certificates', id);
      if (ok) {
        this.certificates = this.certificates.filter(c => c._id !== id);
        this.renderCertificatesGrid(this.certificates);
        this.renderAdminCertsTable();
        this.updateHomeStats();
        this.showToast('Certificate record deleted.');
      } else {
        this.showToast('Delete failed. Check console.');
      }
    }
  }


  renderAdminThoughtsTable() {
    const tbody = document.getElementById('admin-thoughts-table-body');
    if (!tbody) return;

    tbody.innerHTML = this.thoughts.map(t => {
      let statusBadge = '<span class="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400 font-medium">Pending</span>';
      if (t.status === 'approved') statusBadge = '<span class="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 font-medium">Approved</span>';
      if (t.status === 'hidden') statusBadge = '<span class="px-2 py-0.5 rounded text-xs bg-gray-500/20 text-gray-400 font-medium">Hidden</span>';

      return `
        <tr class="border-b border-outline-variant/15 text-sm text-on-surface">
          <td class="py-3 px-3 font-medium text-primary">${t.name}</td>
          <td class="py-3 px-3 text-xs italic text-on-surface-variant max-w-sm">"${t.message}"</td>
          <td class="py-3 px-3 text-xs text-primary font-mono">${'★'.repeat(t.rating || 5)}</td>
          <td class="py-3 px-3">${statusBadge}</td>
          <td class="py-3 px-3 text-right space-x-2">
            ${t.status !== 'approved' ? `
              <button class="text-xs text-primary hover:underline cursor-pointer" onclick="window.app.setThoughtStatus('${t._id}', 'approved')">Approve</button>
            ` : `
              <button class="text-xs text-on-surface-variant hover:underline cursor-pointer" onclick="window.app.setThoughtStatus('${t._id}', 'hidden')">Hide</button>
            `}
            <button class="text-xs text-error hover:underline cursor-pointer" onclick="window.app.deleteThought('${t._id}')">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async setThoughtStatus(id, newStatus) {
    const saved = await sbUpdate('thoughts', id, { status: newStatus });
    if (saved) {
      const t = this.thoughts.find(item => item._id === id);
      if (t) t.status = newStatus;
      this.renderThoughtsWall();
      this.renderAdminThoughtsTable();
      this.updateHomeStats();
      this.showToast(`Thought marked as ${newStatus}.`);
    } else {
      this.showToast('Update failed. Check console.');
    }
  }

  async deleteThought(id) {
    if (confirm('Permanently delete this submitted thought?')) {
      const ok = await sbDelete('thoughts', id);
      if (ok) {
        this.thoughts = this.thoughts.filter(t => t._id !== id);
        this.renderThoughtsWall();
        this.renderAdminThoughtsTable();
        this.updateHomeStats();
        this.showToast('Thought deleted.');
      } else {
        this.showToast('Delete failed. Check console.');
      }
    }
  }

  // --- Notification Toast ---
  showToast(msg) {
    const toast = document.getElementById('archive-toast');
    if (!toast) return;

    toast.querySelector('.toast-text').textContent = msg;
    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.add('translate-y-24', 'opacity-0');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 4000);
  }

  renderAll() {
    this.renderGalleryGrid(this.photos);
    this.renderCertificatesGrid(this.certificates);
    this.renderThoughtsWall();
    this.updateHomeStats();
  }
}

// Global launch on load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new IsepArchiveApp();
});
