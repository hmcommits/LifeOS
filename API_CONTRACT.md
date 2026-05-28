# LifeOS - Internal API Contract

Since LifeOS uses a decoupled architecture (React Frontend + Express Backend) and features are being developed in parallel branches, this document serves as the single source of truth for communication between the UI and the Backend.

**Base URL:** `http://localhost:3001/api`

---

## 1. Action-Bias Tracker

### `GET /agents/action-bias`
Fetches the current action-bias score and recent GitHub/YouTube activity.

**Response:**
```json
{
  "status": "success",
  "data": {
    "score": 45, // 0-100 score calculated by Gemini
    "consumptionHours": 12.5,
    "executionCommits": 3,
    "interventionRequired": true,
    "geminiInsights": "You have spent 12 hours watching React tutorials but only pushed 3 small commits. It is time to build.",
    "recentCommits": [
      { "sha": "abc1234", "message": "init commit", "date": "2026-05-28T10:00:00Z" }
    ]
  }
}
```

---

## 2. Money Sentinel

### `GET /agents/money-sentinel`
Fetches the current status of detected subscriptions and potential budget leaks.

**Response:**
```json
{
  "status": "success",
  "data": {
    "budgetStatus": "Healthy",
    "totalMonthlySubscriptions": 1450.00,
    "detectedRisks": [
      {
        "service": "Adobe Creative Cloud",
        "trialEndDate": "2026-06-02",
        "cost": 3500.00,
        "actionTaken": "Calendar event created for cancellation"
      }
    ],
    "geminiInsights": "Warning: Adobe trial ends in 4 days. If not canceled, it will push your monthly spending 15% over budget."
  }
}
```

---

## 3. Time-Tetris

### `GET /agents/time-tetris`
Fetches today's optimized schedule and highlights any dynamically rescheduled blocks.

**Response:**
```json
{
  "status": "success",
  "data": {
    "rescheduledCount": 1,
    "schedule": [
      { "title": "Database Systems Lecture", "startTime": "10:00", "endTime": "12:00", "status": "delayed" },
      { "title": "Gym (Rescheduled)", "startTime": "12:30", "endTime": "14:00", "status": "optimized_by_gemini" }
    ],
    "geminiInsights": "Your 10 AM lecture ran late. I moved your Gym session to the 12:30 whitespace so you don't miss leg day."
  }
}
```

---

## 4. Social Capital Keeper

### `GET /agents/social-capital`
Fetches upcoming relationship reminders and extracted context.

**Response:**
```json
{
  "status": "success",
  "data": {
    "upcomingReminders": [
      {
        "person": "Rahul",
        "type": "Follow-up",
        "context": "He asked you to review his resume this weekend.",
        "dueDate": "2026-05-30"
      },
      {
        "person": "Aditi",
        "type": "Birthday",
        "context": "Mentioned she really wanted the book 'Atomic Habits' 3 months ago.",
        "dueDate": "2026-06-05"
      }
    ]
  }
}
```
