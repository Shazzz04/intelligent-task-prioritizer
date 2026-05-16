# Intelligent Task Prioritization System

BSc Software Engineering Final Year Project
CIS3425 Research and Development Project
Asian Institute of Business and Science, 2025/2026
Student: Shaza Faizer | Supervisor: Deshan Cooray

---

## Overview

A full-stack web application that automatically prioritizes academic
tasks using a formally derived MCDM algorithm:

P = 100 × (0.65I + 0.25U + 0.10E)

- Importance (I) — AHP pairwise derivation (Saaty, 1980)
- Urgency (U) — Temporal Motivation Theory (Steel, 2007)
- Effort (E) — Cognitive Load Theory (Sweller, 1994)

---

## System Architecture

- Frontend: React.js — runs locally on localhost:3000
- Backend: Django — runs locally on localhost:8000
- Database: SQLite via Django ORM

Note: The system was deployed on Railway (backend) and Netlify
(frontend) throughout the participant evaluation period
(24 March – 7 April 2026). Following evaluation, both layers
were transitioned to a local environment for the viva
demonstration. The MCDM logic, database, and interface
remain identical across both environments.

---

## Local Setup

### Backend

```bash
git clone https://github.com/Shazzz04/intelligent-task-prioritizer
cd intelligent-task-prioritizer/backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Runs at http://localhost:8000 — keep terminal open.

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs at http://localhost:3000 — keep terminal open.

---

## Access

Open browser and go to:
http://localhost:3000?user=student1

Replace student1 with your assigned identifier.

---

## Project Structure
intelligent-task-prioritizer/
├── backend/
│   ├── prioritization/
│   │   ├── models.py        # MCDM engine in save() method
│   │   ├── serializers.py   # REST serialization
│   │   ├── views.py         # Student filtering ViewSet
│   │   └── urls.py
│   ├── core/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── TaskDashboard.jsx
│   │   └── services/
│   │       └── api.js
│   └── package.json
└── README.md

---

## API Endpoints

| Method | Endpoint | Action |
|---|---|---|
| GET | /api/tasks/?user=X | Get tasks for student X |
| POST | /api/tasks/?user=X | Create task for student X |
| PUT | /api/tasks/{id}/?user=X | Update and recalculate |
| DELETE | /api/tasks/{id}/?user=X | Delete task |

---

## Testing

Manual: 10 black-box test cases — all passed
Automated: 4 Selenium WebDriver tests — all passed

```bash
cd backend
python selenium_tests.py
```

---

## Known Issues

| ID | Issue | Proposed Fix |
|---|---|---|
| KI01 | Mobile layout issues | CSS media queries |
| KI02 | No onboarding guide | About modal |
| KI03 | No push notifications | Web-Push API |
| KI04 | URL parameter isolation | JWT authentication |

---

## Evaluation Results

- SUS Mean: 72.07 (benchmark 68.0) ✅
- PSS-4 reduction: t(22)=2.472, p=.022 ✅
- 91.3% rated system better than previous method ✅
