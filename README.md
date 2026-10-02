# ISEP Batch 1 Archive — Digital Monograph & Real-Time Exhibition (2026)

An official archival exhibition and digital monograph commemorating the scholars, research breakthroughs, certificates, milestones, and memories of the inaugural **ISEP Batch 1** residency (2026).

Reconstructed directly from Stitch project `11606814950829122029` and backed by a live **Supabase** backend.

---

## 🏛️ System Features & Objectives

### 1. Monograph Home (`#home`)
- **3D Parallax Memory Deck**: Layered archival photo stack responding to cursor movement with depth perspective.
- **Dynamic Pedestal Statistics**: Real-time counters directly reflecting live Supabase rows for Curated Photos, Certifications, and Public Approved Thoughts.
- **Archival Directorate Overview**: Mission monograph outlining the permanent record of learning, innovation, and community.
- **Pavilion Gateways**: Direct portals into Pavilion I (Gallery), Pavilion II (Certifications), and Pavilion III (Thoughts Wall).

### 2. Pavilion I: The Gallery Hall (`#gallery` / `gallery.html`)
- **Organized Albums**: Filter by *News*, *Classroom Activities*, *Classes*, *Self-Study Sessions*, *Fun Memories*, *Hackathons*, *Meetings / Events*, or search dynamically by title and caption.
- **Device Photo Upload**: Direct file picker supporting PNG, JPG, WEBP, and GIF with preview.
- **Full-Screen Lightbox**: High-fidelity view-only inspection modal.
- **View-Only Protection**: Context menu, right-click, image dragging, and hotkey downloads (`Ctrl+S`, `Ctrl+P`) disabled to preserve archival integrity.

### 3. Pavilion II: Hall of Certifications (`#certificates` / `certificates.html`)
- **Searchable Credentials Registry**: Filter by Category (*Completion*, *Excellence*, *Leadership*, *Special Recognition*) or search recipient name.
- **Device Certificate Attachment**: Direct attachment of official PDF/image certificates from local device.
- **Cryptographic Certificate Dossier**: Inspection modal featuring verification ledger hashes, academic council dual-verification, and formatted view.

### 4. Pavilion III: The Living Thoughts Wall (`#thoughts-wall` / `thoughts-wall.html`)
- **Community Thoughts Wall**: Displays approved reflections and 5-star ratings left by fellows, mentors, and visitors.
- **Pin a Thought Modal**: Visitors can submit their name, message, and rating. Submissions default to `pending` status awaiting coordinator moderation.

### 5. Archival Directorate Control Room (`#admin-portal` / `admin-portal.html`)
- **Coordinator Registration**: New coordinators request access by submitting their full name, email, and password via the "Request Access" tab. Supabase Auth sends a verification email automatically.
- **Email Verification**: The coordinator must click the link in their email to verify their address before sign-in is permitted.
- **Database Approval Gate**: After email verification, a database administrator must set `is_approved = true` in the `public.admin_users` table before the coordinator can log in. Unapproved users are signed out automatically with a clear explanation.
- **Supabase Authentication**: Secure coordinator sign-in backed by Supabase Auth with session persistence.
- **Real-Time Moderation**: Review pending visitor thoughts with one-click **Approve**, **Hide**, or **Delete**.
- **Content Administration**: Upload new photos from device with album assignment and confer certificates directly to Supabase.
- **Responsive Form Layout**: Centered, viewport-safe modals with sticky headers and scrollable containers on desktop, tablet, and mobile.

---

## ⚡ Supabase Backend Details

- **Supabase Project URL**: `https://qilreacksziadajadkji.supabase.co`
- **Tables**:
  - `public.photos`: id, title, caption, album, image_url, uploaded_at
  - `public.certificates`: id, title, recipient_name, issue_date, category, file_url
  - `public.thoughts`: id, name, message, rating, status (`pending`, `approved`, `hidden`), created_at
- **Storage Bucket**:
  - `archive-media`: Public storage bucket for direct device uploads of photos and certificate attachments.
  - `public.admin_users`: id, user_id (auth ref), email, full_name, is_approved (default false), created_at, approved_at
- **Security & RLS**:
  - Public `SELECT` allowed on photos, certificates, and approved thoughts.
  - Public `INSERT` allowed on thoughts with `status = 'pending'`.
  - Coordinators `INSERT` into `admin_users` on registration; public `SELECT` for approval check.
  - Admin `ALL` (insert, update, delete, moderate) authenticated via Supabase Auth (approved coordinators only).

---

## 🚀 Running the Website

The local development server is currently serving at:
```
http://localhost:5173/
```

To run manually:
```powershell
python -m http.server 5173
```
Or open [index.html](file:///c:/Users/Admin/Downloads/ISEP%20PROJECT/index.html) directly in any browser.

---

## 🔑 Coordinator Access & Approval Workflow

Coordinators access the Admin Portal via the **ISEP Coordinator Portal** card.

### Registering a new coordinator
1. Click the **"Request Access"** tab on the login card.
2. Fill in Full Name, Official Email, and Password, then click **Submit Request & Register**.
3. A verification email is sent to the coordinator's inbox — they must click the link.
4. The database administrator approves the coordinator in the **Supabase Table Editor** or via SQL:

```sql
-- Approve a coordinator in Supabase
UPDATE public.admin_users
   SET is_approved = true, approved_at = now()
 WHERE email = 'coordinator@example.com';
```

5. Once approved, the coordinator can sign in using the **"Sign In"** tab.

> **Note:** Unapproved or unverified users are automatically signed out with a clear message. There are no demo/hardcoded credentials.

## Member directory and portfolios

The deployed SPA now includes `#members`, `/members/<slug>` public portfolios,
and `#dashboard` for authenticated members. Profiles and portfolio records are
stored in Supabase; the required tables and row-level security policies are in
[`SUPABASE_SCHEMA.md`](SUPABASE_SCHEMA.md). Apply that SQL before enabling
member accounts. Members can update only the profile linked to their Supabase
Auth user, while approved profiles and portfolio records remain publicly
readable.

## Expanded ISEP workflows

The root SPA also provides pending member registration, approval/rejection,
member search, role-aware ISEP Head access, and the public sections
`#activities`, `#memories`, `#hackathons`, `#mock-interviews`, and
`#tcs-meetings`. Admin Portal tabs create records in Supabase as `pending`;
an approved coordinator/head publishes them. Empty sections intentionally show
an empty state until real ISEP records are entered.

Run the complete, rerunnable migration in
[`SUPABASE_SCHEMA.md`](SUPABASE_SCHEMA.md). It creates the five shared content
tables, approval status fields, member-owned portfolio policies, admin policies,
and the helper used by RLS. Create the existing `archive-media` public bucket
and apply Storage policies before uploading images or documents. The browser
requires only the project URL and public anon key already configured in
`app.js`; never expose a service-role key.

After creating the two Auth accounts, set their `admin_users.role` to `head`
and approve them with the SQL shown in `SUPABASE_SCHEMA.md`. Link exactly the
18 verified member Auth users through `members.auth_user_id` and approve them
after review; the app does not seed invented names or events. Deploy the root
branch with `vercel --prod` (or connect the repository in Vercel); `vercel.json`
keeps the SPA fallback required by `/members/<slug>`.
