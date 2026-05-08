#  MultiBranch ATS — Applicant Tracking System

A full-stack web application built for a software house operating across multiple branches (Islamabad, Lahore, Karachi, Remote). This system automates the entire hiring process — from job postings to interview scheduling — for both candidates and HR teams.

> **Live Demo:** `[Add your deployment URL here]`
> **Backend API:** `[Add your backend URL here]`

---


##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + React Router |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| File Storage | Cloudinary |
| Authentication | JWT (JSON Web Tokens) |
| Email | Gmail SMTP (Nodemailer) |
| Deployment (FE) | Vercel |
| Deployment (BE) | Render |

---

##  Project Structure

```
MultiBranch-ATS/
│
├── client/                          # React frontend
│   ├── public/
│   └── src/
│       ├── assets/                  # Images, icons, fonts
│       ├── components/
│       │   └── shared/              # Navbar, Footer, Loader, ProtectedRoute
│       │
│       ├── pages/
│       │   ├── public/              # Accessible without login
│       │   │   ├── Home.jsx         # Landing / job board
│       │   │   ├── JobDetails.jsx   # Single job view
│       │   │   ├── Login.jsx
│       │   │   └── Register.jsx
│       │   │
│       │   ├── applicant/           # Logged-in candidates only
│       │   │   ├── Dashboard.jsx    # Overview of applications
│       │   │   ├── Profile.jsx      # Edit profile & upload docs
│       │   │   ├── MyApplications.jsx
│       │   │   └── ApplyJob.jsx
│       │   │
│       │   └── admin/               # HR / Admin only
│       │       ├── Dashboard.jsx    # Stats & overview
│       │       ├── Jobs.jsx         # Manage job postings
│       │       ├── Applicants.jsx   # View & manage applicants
│       │       ├── Interviews.jsx   # Schedule interviews
│       │       └── Branches.jsx     # Manage branch locations
│       │
│       ├── context/                 # AuthContext (JWT + role)
│       ├── services/                # Axios API call functions
│       ├── hooks/                   # Custom React hooks
│       ├── utils/                   # Helpers (format date, etc.)
│       └── App.jsx                  # Routes + layout
│
├── server/                          # Express backend
│   ├── config/                      # DB & Cloudinary connection
│   ├── controllers/                 # Business logic per resource
│   ├── middleware/                  # JWT auth, role guard
│   ├── models/                      # Mongoose schemas
│   ├── routes/                      # API route definitions
│   ├── utils/                       # Email sender, helpers
│   └── server.js                    # Entry point
│
├── .gitignore
└── README.md
```

---

##  Database Collections

| Collection | Description |
|------------|-------------|
| `users` | Candidates and HR/Admin accounts |
| `jobs` | Job postings with branch and seat info |
| `branches` | Company branch locations |
| `applications` | Candidate applications with Cloudinary URLs |
| `interviews` | Scheduled interviews with date, time & messages |

---

##  User Roles

| Role | Access |
|------|--------|
| **Candidate** | Register, apply for jobs, track status, upload resume |
| **HR / Admin** | Manage jobs, review applicants, schedule interviews, send emails |

---

##  Key Features

###  Candidate Portal
- Register & login with JWT authentication
- Edit profile information
- Upload Resume (PDF) and Cover Letter (PDF/DOCX) via Cloudinary
- Apply for jobs across branches
- Track application status in real-time:
  - `Submitted` → `Under Review` → `Shortlisted` → `Interview Scheduled` → `Selected / Rejected`

###  HR / Admin Portal
- Post, edit, and delete job openings
- Assign jobs to specific branches with seat limits
- View and manage all applicants
- Shortlist or reject candidates
- Schedule interviews with custom date/time and messages
- Send email notifications (shortlist, interview invite, rejection)

###  Branch Support
- Islamabad | Lahore | Karachi | Remote

---

##  Email Notifications

All emails are sent via **Gmail SMTP** using Nodemailer. The system triggers emails for:

-  Application received confirmation
-  Shortlisting notification
-  Interview invitation (with date, time & location)
-  Rejection notification
-  Custom HR message

---

##  File Uploads

All files are stored on **Cloudinary** — no local file storage is used.

| File Type | Format | Storage |
|-----------|--------|---------|
| Resume | PDF | Cloudinary |
| Cover Letter | PDF / DOCX | Cloudinary |
| Profile Picture | JPG / PNG | Cloudinary |

Only the **Cloudinary URL** is saved in MongoDB.

---

##  Deployment

| Layer | Platform | URL |
|-------|----------|-----|
| Frontend | Vercel | `[Add frontend URL here]` |
| Backend | Render | `[Add backend URL here]` |

---

##  Git Branching Strategy

We follow a feature-branch workflow:

```
main
└── feature/auth-jwt
└── feature/job-listings
└── feature/candidate-portal
└── feature/hr-dashboard
└── feature/email-notifications
└── feature/cloudinary-upload
```

All features are merged into `main` via **Pull Requests**.

---

##  API Documentation

Full API docs are available in [`/docs/api.md`](./docs/api.md) *(to be added)*

Base URL: `https://your-backend.onrender.com/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT |
| GET | `/jobs` | Get all job listings |
| POST | `/jobs` | Create a new job (HR only) |
| POST | `/applications` | Submit a job application |
| GET | `/applications/:id` | Get application details |
| PUT | `/applications/:id/status` | Update application status (HR) |
| POST | `/interviews` | Schedule an interview (HR) |
| POST | `/email/send` | Send email notification |

---

##  Contact

For questions or issues, reach out via GitHub Issues or contact any team member.

---

*Built with ❤️ for Web Programming — BSCS Semester Project*