# 📚 ISEP Batch 1 — Database Models & Schema Specifications (Member 1 Deliverable)

This document provides the complete data contracts and schema definitions for all database collections in the **ISEP Member Portal**.

---

## 1. User (`User.js`)
Stores authentication, role, profile details, and approval workflow status.
- `_id`: ObjectId (Auto)
- `fullName`: String (Required)
- `email`: String (Required, Unique, Lowercase)
- `password`: String (Hashed bcrypt string)
- `role`: String enum (`'member'`, `'head'`, `'admin'`) - Default: `'member'`
- `profilePhoto`: String (URL)
- `branch`: String - Default: `'ISE'`
- `year`: String - Default: `'4th Year'`
- `bio`: String
- `skills`: Array of Strings (`['React', 'Node.js', ...]`)
- `github`: String (URL)
- `linkedin`: String (URL)
- `portfolio`: String (URL)
- `approvalStatus`: String enum (`'pending'`, `'approved'`, `'rejected'`) - Default: `'pending'`
- `approvedBy`: ObjectId ref -> `User`
- `registeredAt`: Date (Default: `Date.now`)
- `approvedAt`: Date

---

## 2. Project (`Project.js`)
Member capstones, projects, and portfolio contributions.
- `_id`: ObjectId (Auto)
- `userId`: ObjectId ref -> `User` (Required)
- `projectName`: String (Required)
- `description`: String
- `technologies`: Array of Strings
- `projectImage`: String (URL)
- `githubLink`: String (URL)
- `liveLink`: String (URL)
- `createdAt`: Date

---

## 3. Certificate (`Certificate.js`)
Student certifications and verifiable credentials.
- `_id`: ObjectId (Auto)
- `userId`: ObjectId ref -> `User`
- `certificateName`: String (Required)
- `issuingOrganization`: String (Required)
- `date`: Date
- `credentialLink`: String (URL)
- `fileUrl`: String (URL to PDF or Image)
- `createdAt`: Date

---

## 4. Achievement (`Achievement.js`)
Awards, honors, milestones, and hackathon wins.
- `_id`: ObjectId (Auto)
- `userId`: ObjectId ref -> `User`
- `title`: String (Required)
- `description`: String
- `date`: Date
- `category`: String (`'Hackathon'`, `'Academic'`, `'Research'`, `'General'`)
- `proofImage`: String (URL)
- `createdAt`: Date

---

## 5. Activity (`Activity.js`)
Chronological feed of ISEP activities, workshops, events, and college milestones.
- `_id`: ObjectId (Auto)
- `title`: String (Required)
- `date`: Date
- `description`: String
- `images`: Array of Strings
- `createdBy`: ObjectId ref -> `User`
- `createdAt`: Date

---

## 6. Hackathon (`Hackathon.js`)
Hackathon entries, participating team members, results, and learning experiences.
- `_id`: ObjectId (Auto)
- `hackathonName`: String (Required)
- `date`: Date
- `description`: String
- `teamMembers`: Array of Strings
- `images`: Array of Strings
- `result`: String (`'1st Place'`, `'Finalist'`, `'Special Mention'`, `'Participated'`)
- `experience`: String
- `createdBy`: ObjectId ref -> `User`
- `createdAt`: Date

---

## 7. MockInterview (`MockInterview.js`)
Records of mock interviews conducted with mentors/TCS partners.
- `_id`: ObjectId (Auto)
- `title`: String (Required)
- `date`: Date
- `interviewer`: String (Required)
- `participant`: String (Required)
- `description`: String
- `notes`: String (Feedback, scoring, evaluation notes)
- `image`: String (URL)
- `createdBy`: ObjectId ref -> `User`
- `createdAt`: Date

---

## 8. TCSMeeting (`TCSMeeting.js`)
Minutes of Meeting (MoMs), enterprise sync notes, and guest lectures.
- `_id`: ObjectId (Auto)
- `meetingTitle`: String (Required)
- `date`: Date
- `guestName`: String (Required)
- `description`: String
- `notes`: String
- `images`: Array of Strings
- `createdBy`: ObjectId ref -> `User`
- `createdAt`: Date

---

## 9. Memory (`Memory.js`)
Casual moments, celebrations, team outings, and gallery photos.
- `_id`: ObjectId (Auto)
- `image`: String (Required URL)
- `caption`: String (Required)
- `date`: Date
- `description`: String
- `uploadedBy`: ObjectId ref -> `User`
- `createdAt`: Date

---

## 10. Announcement (`Announcement.js`)
Portal announcements and administrative notices.
- `_id`: ObjectId (Auto)
- `title`: String (Required)
- `content`: String (Required)
- `createdBy`: ObjectId ref -> `User`
- `createdAt`: Date
