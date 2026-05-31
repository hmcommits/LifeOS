# LifeOS: A Local AI Assistant Powered by Coral SQL

## What Problems Are Solved
- **Data Fragmentation:** Our digital footprints are scattered across multiple silos (calendars, email clients, messaging platforms) that refuse to talk to each other.
- **Missed Commitments:** Casual promises made in texts, overlooked bills, and mismanaged schedules happen constantly due to this fragmentation.
- **Brittle Integration Code:** Traditionally, unifying these sources requires developers to write extensive, complex API glue code.
- **Privacy & Cloud Costs:** Sending personal, highly sensitive data to cloud-hosted LLMs poses a massive privacy risk and incurs high computational costs.

## What I Built
LifeOS is an intelligent, privacy-first local assistant designed to aggregate scattered digital footprints and transform them into a unified, actionable dashboard. It acts as a relentless personal assistant that connects the dots between your schedule, inbox, and text messages. It operates entirely on your local machine using local AI pipelines, ensuring absolute data privacy.

The system features four main pillars:
1. **Social Capital Keeper:** Translates unstructured WhatsApp chat exports into a database to detect "hidden promises" and commitments made to friends and colleagues.
2. **Wealth Tetris:** Cross-references live Gmail receipts with Google Calendar to detect upcoming utility bills and sneaky auto-renewals before they charge you.
3. **Action-Bias Tracker:** Compares scheduled coding hours (Google Calendar) against actual output (GitHub commits) to prevent procrastination and "tutorial hell."
4. **Time-Tetris:** Autonomously reschedules non-negotiable daily habits (like gym sessions) into available whitespace when surprise calendar events ruin your original routine.

## How We Used Coral
LifeOS relies entirely on **Coral SQL** as its core data orchestration layer, completely eliminating traditional API integration bottlenecks. Coral acts as a universal translator, allowing the local AI assistant to query the user's entire digital life through standardized, cross-source SQL `JOIN` operations.

- **Unstructured Data to SQL Translation:** Coral instantly parses and structures messy WhatsApp chat exports into clean, read-only SQL tables, filtering out formatting junk before it reaches the AI.
- **Cross-Source SQL JOINs:** Coral executes native `CROSS JOIN` operations between live Gmail data and Google Calendar data to overlay bills exactly onto your schedule.
- **Multi-API Simultaneous Querying:** Coral queries Google Calendar and GitHub APIs in parallel, returning merged metrics in a standardized format for easy comparison without brittle pagination logic.
- **High-Frequency State Overlaying:** Coral continuously queries local habit files and live calendar data to rapidly spot scheduling conflicts without burning memory overhead.

## Connected Data Sources
- **Google Calendar API:** For live schedule management, habit tracking, and event detection.
- **Gmail API:** For extracting receipts, auto-renewals, and financial notices.
- **GitHub API:** For tracking live code commits and repository activity.
- **WhatsApp Chat Exports:** Local `.txt` and `.csv` files for relationship and commitment tracking.

## Demo, Repo, Setup

- 📺 **Watch the Demo:** [YouTube Video](https://youtu.be/Cfx1H0I9oGk)
- 📖 **Read the Deep-Dive Blog:** [Medium Article](https://medium.com/@harshmayekar0801/lifeos-i-built-a-local-ai-assistant-to-automate-my-life-powered-by-coral-sql-96fae0747fd5)
- 💼 **Connect with me:** [LinkedIn Post](https://www.linkedin.com/posts/harsh-mayekar_dbms-softwareengineering-localai-activity-7466798276156157952-dRS-?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFjbvRQBJ9K3o0tVvYGaGXi0SWQmecmeC0w)

### Setup Instructions
1. Clone this repository:
   ```bash
   git clone https://github.com/hmcommits/LifeOS.git
   cd LifeOS
   ```
2. Set up environment variables:
   Copy `.env.example` to `.env` in the `backend` directory and fill in your API credentials.
3. Install dependencies for the backend and frontend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Start the application:
   ```bash
   # Terminal 1 (Backend)
   cd backend && npm start
   # Terminal 2 (Frontend)
   cd frontend && npm run dev
   ```
5. **Coral Setup:** Ensure Coral SQL is installed locally ([Setup Guide](https://withcoral.com/docs)) and configured with your data sources.

## What's Next
- **Complete Financial Hub:** Upgrading Wealth Tetris to support smart receipt tracking and utility bill processing via local OCR (PDFs/Images) and local bank SMS alert interception.
- **Voice-Activated Logging:** Introducing Voice-to-Text inputs that instantly translate to organized Coral database entries (e.g., "Hey LifeOS, I just spent ₹500 on groceries").
- **Deepening the Relationship Matrix:** Building an automated pipeline that safely updates communication logs to automatically track fading professional contacts without relying on manual chat exports.
