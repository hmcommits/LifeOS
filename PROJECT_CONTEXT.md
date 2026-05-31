# The Core Engine: How LifeOS Works
At its center, LifeOS is an autonomous data-processing loop. It does not rely on manual data entry. Instead, it uses Coral SQL as the universal extraction layer to pull live information from your digital footprint (Google Calendar, Gmail, GitHub, local files) using standard SQL queries.

Once Coral fetches, filters, and cross-joins this raw data, it is passed to the local AI model (the intelligence layer). The local AI analyzes the cross-platform data, identifies patterns, and automatically triggers actions—like blocking out calendar time, sending alerts, or logging commitments.

## 1. Wealth Tetris (Financial Leak Detector)
**The Concept:** An automated financial audit that catches phantom expenses before they drain your accounts.

**The Data Join (Coral):** `gmail_receipts` + `google_calendar.events`

**How it Works in Practice:**
- **Detection:** Coral periodically runs a SQL query against your live Gmail inbox looking for specific keywords like "receipt", "free trial", or "bill due".
- **Analysis & JOIN:** Coral executes a cross-source JOIN, overlaying these upcoming financial deadlines directly against your current Google Calendar events.
- **Action:** The local AI reads this unified data, extracts the exact rupee amount and due date, and automatically drops a high-priority alert on your dashboard so you never miss a payment or get hit by a sneaky auto-renewal.

## 2. Time-Tetris (Whitespace Optimizer)
**The Concept:** A dynamic, self-healing schedule that adapts to the chaos of life rather than breaking when plans change.

**The Data Join (Coral):** `local_files.daily_habits` + `google_calendar.events`

**How it Works in Practice:**
- **The Baseline:** Your daily non-negotiable habits are logged in a local configuration file. For example, a daily 90-minute gym session.
- **The Conflict:** LifeOS constantly monitors your Google Calendar. If a sudden meeting or college lab is scheduled over your gym time, a static schedule would normally fall apart.
- **The Optimization:** Coral detects the overlap instantly. The local AI scans your evening for open whitespace and automatically reschedules the workout block into a newly freed time slot, ensuring your schedule heals itself.

## 3. Social Capital Keeper (Relationship Manager)
**The Concept:** A personal relationship tracker that ensures you never drop the ball on small commitments made over text.

**The Data Join (Coral):** `local_files.whatsapp_chats`

**How it Works in Practice:**
- **Data Ingestion:** You drop your exported WhatsApp chat logs into the LifeOS dashboard. Coral instantly parses the messy text file and translates it into a neat, read-only SQL table.
- **Context Extraction:** The local AI scans the structured table for implicit commitments (e.g., "I'll look at your resume this weekend" or "Yeah sure!").
- **Action:** The system flags these hidden promises and highlights them on your dashboard so you never unintentionally ghost a friend or colleague.

## 4. Action-Bias Tracker (The Anti-Procrastination Engine)
**The Concept:** A strict accountability system designed to close the gap between passive consumption ("Tutorial Hell") and active execution.

**The Data Join (Coral):** `google_calendar.events` + `github.commits`

**How it Works in Practice:**
- **Tracking Intent:** Coral queries your Google Calendar to count exactly how many hours you scheduled for "Studying" or "Coding Courses."
- **Verifying Execution:** Coral simultaneously queries your live GitHub account to count the number of times you actually saved or pushed new code that day.
- **The Intervention:** The local AI compares the two metrics. If you scheduled three hours of studying but wrote zero lines of code, it catches you slacking. The system intervenes by automatically booking a "Forced Implementation Session" in your next open calendar slot.