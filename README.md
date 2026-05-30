# LifeOS: Autonomous Data-Processing Loop

LifeOS is an intelligent, self-healing operating system for your life. It acts as an autonomous data-processing loop that connects your digital footprint (Google Workspace, GitHub, local messaging data) and uses local AI inference (Ollama Qwen) to automate your life and keep you strictly accountable to your goals.

## How It Works

LifeOS operates on a powerful three-layer architecture:

1. **Extraction Layer (Data Ingestion)**: We use Google OAuth to securely fetch live data from your Gmail and Google Calendar. We also ingest local files like WhatsApp chat exports and CSV habits.
2. **Translation Layer (Coral)**: Coral acts as the universal SQL engine. Instead of writing complex API integrations, Coral allows us to query live internet APIs (like GitHub) and local CSV files using plain SQL. It performs powerful `CROSS JOIN` operations across different data silos instantly.
3. **Intelligence Layer (Qwen)**: The perfectly joined data is fed into a locally hosted instance of **Qwen 2.5 (via Ollama)**. Qwen analyzes the cross-platform data, identifies patterns, and autonomously triggers actions—such as blocking out calendar time or scheduling interventions.

---

## 1. Social Capital Keeper (Relationship CRM)

**The Concept:** A personal CRM that ensures you never drop the ball on small details that build strong relationships.

**How it accesses data:** You upload a raw WhatsApp chat export (`.txt`) via the dashboard, which is parsed into a local `whatsapp_data.csv`.

**The Coral SQL Command:**
```sql
SELECT Date, Time, Sender, Message 
FROM 'whatsapp_data.csv' 
ORDER BY Date DESC, Time DESC 
LIMIT 50;
```

**Example Usage:**
If a friend texts you, *"Can you look at my resume this weekend?"* and you casually reply *"Yeah sure,"* LifeOS extracts this conversation via Coral and feeds it to Qwen. Qwen flags it as an implicit commitment and surfaces this action item on your dashboard so you never forget to review the resume.

---

## 2. Wealth Tetris (Financial Leak Detector)

**The Concept:** An automated financial audit that catches phantom expenses (free trials, auto-renewals) and upcoming bills (like electricity or internet) before they silently charge your bank account or incur late fees.

**How it accesses data:** The backend uses your secure Google OAuth tokens (`googleapis` library) to scan your live Gmail inbox for keywords like "free trial", "receipt", or "bill due". It simultaneously queries your Google Calendar to grab your upcoming schedule. Both datasets are formatted into temporary CSVs to be joined by Coral.

**The Coral SQL Join:**
```sql
SELECT e.Date, e.Sender, e.Snippet, c.title 
FROM 'emails.csv' e 
CROSS JOIN 'calendar.csv' c
LIMIT 50;
```

**Example Usage:**
You sign up for an Adobe Creative Cloud trial. An email arrives: *"Welcome! Your free trial starts now and will auto-renew for Rs. 3500/month on 2026-06-02."* LifeOS catches this email, Coral joins it with your calendar, and Qwen parses the exact cost and expiry date. It flags the upcoming Rs. 3500 charge on your dashboard as an active risk so you can cancel it before being billed.

---

## 3. Action-Bias Tracker (Anti-Procrastination Engine)

**The Concept:** A strict accountability system designed to close the gap between passive consumption (watching tutorials) and active execution (writing code).

**How it accesses data:** LifeOS queries your Google Calendar for events containing keywords like "Study", "Course", or "Java" to calculate your passive consumption hours. It then accesses your live GitHub repository via Coral to pull your recent code commits to measure execution.

**The Coral SQL Command:**
```sql
SELECT sha, commit__message
FROM github.commits
WHERE owner = 'hmbitcyber'
LIMIT 5;
```

**Example Usage:**
You schedule an event titled "3 hours studying Java" on your Google Calendar, but you push exactly 0 commits to GitHub that day. Qwen detects that you are stuck in "Tutorial Hell." Because your consumption-to-execution ratio is critically low, LifeOS automatically makes an API call back to Google Calendar to schedule a **"🚨 Forced Implementation Session"** in your next available time slot, entirely dedicated to writing code.

---

## 4. Time-Tetris (Whitespace Optimizer)

**The Concept:** A dynamic, self-healing schedule that adapts to the chaos of life rather than breaking when plans unexpectedly change.

**How it accesses data:** LifeOS pulls your live daily schedule via the Google Calendar API. It also reads your daily non-negotiable habits (like a 90-minute Gym session) from a local `habits.csv` file.

**The Coral SQL Join:**
```sql
SELECT c.title, h.title, h.preferredTime 
FROM 'calendar.csv' c 
CROSS JOIN 'habits.csv' h;
```

**Example Usage:**
You have a 90-minute Gym session scheduled for 17:00. Suddenly, an unexpected 3-hour College Lab session drops into your calendar from 16:30 to 19:30, completely blocking your workout time. 
LifeOS detects the conflict, queries the whitespace in your evening, and Qwen reschedules your Gym session to 19:30. The backend then autonomously calls the Google Calendar API to insert the new Gym event into your live calendar, successfully healing your schedule!