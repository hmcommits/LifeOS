The Data Aggregation Engine: Coral
To fetch user data without writing complex REST API fetch logic, handling pagination, or parsing deeply nested JSON, the project relies on Coral.

What is Coral?
Coral is a Command Line Interface (CLI) tool that acts as a local SQL query engine for external APIs. It maps REST API endpoints to a relational database schema. This allows the application to pull data from platforms like GitHub, Google Calendar, or Notion using standard SELECT SQL queries.

How Coral Works Under the Hood:

No Intermediary Database: Coral does not sync or store API data in a persistent local database. It translates the SQL query into the corresponding HTTP API request on the fly, executes it, and returns the result to the standard output.

Authentication: It securely stores access tokens (like Personal Access Tokens or OAuth credentials) in the host machine's native keychain.

JSON Flattening: APIs often return nested JSON objects. Coral automatically flattens these into SQL columns using double underscores (e.g., author.login becomes author__login).

Local Environment & Current State
The development environment is running on Windows 11.
Because Coral requires specific system-level integrations to run local SQL queries, it has been natively compiled from source.

Build Tools: Compiled using the MSVC v143 toolchain (Microsoft C++ Build Tools) and the Rust stable toolchain (x86_64-pc-windows-msvc).

Executable Location: The coral.exe binary has been successfully built and its directory (target\release) is permanently added to the Windows System PATH.

Global Availability: The coral command is globally available in any terminal session or spawned child process on the host machine.

Configured Data Source: GitHub
The first connected data source for the Action-Bias tracker is GitHub. To protect personal data during development and hackathon demonstrations, the system is currently wired to a dedicated test account.

Test Account Username: hmbitcyber

Target Repository: lifeos-dummy-data

Authentication Method: A classic Personal Access Token (PAT) with repo scope is securely stored in the Coral keychain.

Connection Status: Verified and active. The schema github (containing 362 tables) is fully mapped.

Application Architecture & Execution Flow
The web application must be built to interface with Coral locally and the Gemini API remotely.

The Runtime Flow:

Data Fetching (Child Process): The application backend (Node.js/Python, etc.) will spawn a shell child process to execute a coral sql command.

JSON Formatting: The Coral CLI will output the query results as a formatted string. The application must parse this output (or configure Coral to output raw JSON) into memory.

AI Processing (Gemini API): The application will construct a prompt containing the parsed Coral data (e.g., a list of recent commits) and send it to the Gemini API.

AI Objective: The Gemini API will evaluate the raw data, calculate the "Action-Bias" score based on the frequency and quality of the activity, and return structured insights.

Frontend Delivery: The backend serves the Gemini-processed insights and the raw commit data to the frontend for visualization.

Verified SQL Queries for the Codebase
Antigravity should use the following verified SQL queries when writing the data-fetching logic for the GitHub integration. These queries are confirmed to work with the current schema.

Fetch Test Account Profile Data:

SQL
SELECT login, id, type, name, company FROM github.user LIMIT 1
Verify Target Repository Exists:

SQL
SELECT name, full_name, private, created_at FROM github.repos_get WHERE owner = 'hmbitcyber' AND repo = 'lifeos-dummy-data'
Fetch Recent Commits for Action-Bias Calculation:

Note: The table is github.commits (plural), and filtering requires both owner and repo columns. Nested JSON is flattened using __.

SQL
SELECT sha, author__login, authored_date, message FROM github.commits WHERE owner = 'hmbitcyber' AND repo = 'lifeos-dummy-data' LIMIT 5