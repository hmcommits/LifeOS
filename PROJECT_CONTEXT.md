The Core Engine: How LifeOS Works
At its center, LifeOS is an autonomous data-processing loop. It does not rely on manual data entry. Instead, it uses Coral as the extraction layer to pull live information from your digital footprint (Google Workspace, GitHub, local files) using standard SQL queries.

Once Coral fetches and formats this raw data, it is passed to the Gemini API (the intelligence layer). Gemini analyzes the cross-platform data, identifies patterns, and automatically triggers actions—like blocking out calendar time, sending alerts, or updating your budget spreadsheet.

1. The "Money Sentinel" (Financial Leak Detector)
The Concept: An automated financial audit that catches phantom expenses before they drain your accounts.

The Data Join (Coral): gmail.messages + google_calendar.events + google_sheets.rows

How it Works in Practice:

Detection: Coral periodically runs a SQL query against your gmail.messages looking for specific keywords like "Your free trial starts now," "Welcome to Pro," or "Auto-renewal receipt."

Analysis: When a match is found, Gemini parses the email text to extract the exact date the free trial ends and the cost of the subscription.

Action: The system immediately checks your current monthly budget in google_sheets.rows. If the upcoming charge pushes you over budget, Gemini proactively creates a high-priority event in google_calendar.events 48 hours before the trial ends, titled: "ACTION REQUIRED: Cancel [Service] Free Trial to save ₹X."

2. "Time-Tetris" (Whitespace Optimizer)
The Concept: A dynamic, self-healing schedule that adapts to the chaos of a student's life rather than breaking when plans change.

The Data Join (Coral): google_calendar.events + google_sheets.rows

How it Works in Practice:

The Baseline: Your daily non-negotiable habits are logged in Google Sheets. For example, the daily 1.5-hour gym session required for your 6-day split to hit your physical goals.

The Conflict: LifeOS constantly monitors your Google Calendar. If a morning lecture at Datta Meghe College of Engineering runs late, or an afternoon lab gets canceled, a static schedule would normally fall apart.

The Optimization: The moment a schedule shift creates a new gap, Gemini analyzes the available "whitespace" in your day. It automatically reschedules your 90-minute workout block into the newly freed time slot, ensuring you never miss a session due to unexpected academic changes.

3. The "Social Capital" Keeper (Relationship Manager)
The Concept: A personal CRM that ensures you never drop the ball on the small details that build strong relationships.

The Data Join (Coral): local_files.whatsapp_chats + google_calendar.events + notion.pages

How it Works in Practice:

Data Ingestion: You periodically export key WhatsApp conversations as CSV files. Coral queries these local files.

Context Extraction: Gemini scans the chat logs for implicit commitments or preferences. If a friend mentions, "I've been dying to read [Book Name]" or you reply, "I'll look at your resume this weekend," the system flags it.

Storage & Prompting: These details are automatically appended to that person's dedicated profile in your notion.pages. Simultaneously, LifeOS drops a reminder in your google_calendar.events to follow up on the resume, or alerts you a week before their birthday with the exact book recommendation they mentioned months ago.

4. The "Action-Bias" Tracker (The Anti-Procrastination Engine)
The Concept: A strict accountability system designed to close the gap between passive consumption (watching tutorials) and active execution (writing code).

The Data Join (Coral): youtube.watch_history + github.commits + google_calendar.events

How it Works in Practice:

Tracking Consumption: Coral queries your YouTube history to see what you are studying. If you spend three hours watching videos on the MERN stack or Flutter development, LifeOS logs the topic and duration.

Verifying Execution: Coral then queries github.commits (like the dummy repository we set up, or your live projects).

The Intervention: Gemini calculates the ratio of consumption to execution. If it detects "tutorial hell"—meaning you have logged hours of tutorial watch-time but pushed zero code toward your eight-month timeline goals—it intervenes. LifeOS will automatically block out your next available Calendar slot as a forced "Implementation Session," entirely dedicated to writing code based on what you just watched.