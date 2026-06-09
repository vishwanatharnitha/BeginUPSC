# BeginUPSC – Free UPSC Preparation Platform

BeginUPSC is a completely free, modern, professional, scalable, and multilingual UPSC preparation platform designed to help beginners start their UPSC journey from zero and prepare systematically.

---

## 🌟 Key Features

1. **Mandatory Study Pledge**: Interactive glassmorphic screen setting up discipline vows before material loading.
2. **UPSC Beginner Guide**: Details services (IAS/IPS/IFS/IRS), attempts, eligibility relaxations, and interactive flowchart timelines of Prelims, Mains, and Interview.
3. **Smart Eligibility Checker**: Computes remaining attempts and age limit alerts based on categories (General, OBC, SC, ST, PwD).
4. **Custom Study Roadmaps**: Focus timelines customized for College Students, Working Professionals, Full-time Aspirants, and Beginners.
5. **Subject Library**: Notes, references, mind maps, and checkbox tracking that rewards XP.
6. **PYQ Explorer**: Previous year prelims and mains question panels containing answers and detailed explanation cards.
7. **Mock Exam Simulator**: Active countdown timer, UPSC prelims grading rules (+2 / -0.66 negative score), rank forecasts, and review solutions.
8. **Daily Current Affairs**: Categorized updates and downloadable monthly digests.
9. **Motivation Center**: Study hours logger and active consistency streaks tracker.
10. **Peer Forum Discussions**: Doubt clearances and answers sections.
11. **AI Assistant chatbot**: Quick buttons and guidance counseling matching UPSC syllabus terminology.
12. **Student Dashboard**: Streak flame indicators, XP level meter, performance records, and achievements badge list.
13. **Admin Control Room**: Analytics summaries, unresolved feedback lists, and notification / PDF notes / mock test creator forms.

---

## ⚙️ Tech Stack & Architecture

- **Frontend**: Vite + React, Tailwind CSS v3, PostCSS, Framer Motion, and Lucide React icons.
- **Backend**: Node.js + Express.js, JWT authentication, and Bcrypt password hashing.
- **Database**: Dual SQL connection. Connects to MySQL if parameters exist in `.env`, otherwise automatically initiates an offline self-seeding SQLite database file (`begin_upsc.sqlite`).

---

## 🚀 How to Run the Application

### 1. Start the Backend Server
```bash
cd backend
npm install
npm start
```
*App will start on `http://localhost:5000` and automatically load the schema & seed database.*

### 2. Start the Frontend client
```bash
cd ../frontend
npm install
npm run dev
```
*App will start on `http://localhost:5173`.*
