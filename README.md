# AgentTimer

AgentTimer is a lightweight, localized web application designed for tracking and managing personal agent usage limits and cooldowns. It focuses on providing a clean UI for solitary managers with seamless language switching and secure administrative access.

## Features

- **Agent Management**: Register and manage multiple agents seamlessly.
- **Cooldown Tracking**: Set customizable cooldown timers and visually track progress via intuitive percentage bars.
- **Localization (i18n)**: Instantly switch between Korean, English, and Japanese from the settings menu.
- **Admin Configuration**: First-run setup guarantees privacy by creating an exclusive admin account instantly connected securely to the database.
- **Simple Infrastructure**: Fully containerized and powered by a highly portable SQLite database.

## Quick Start (Docker)

The fastest and most stable way to run AgentTimer is via Docker and Docker Compose.

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/agent-timer.git
   cd agent-timer
   ```
2. Start the container in daemon mode:
   ```bash
   docker-compose up -d --build
   ```
   *(Ensure you have Docker and Docker Compose installed)*
3. Open your browser and navigate to `http://localhost:3000`. On your first visit, you will be automatically prompted to create an admin account.

## Local Development (Without Docker)

You can run the frontend and backend separately for specific development purposes:

1. **Backend**:
   ```bash
   cd server
   cp .env.example .env
   npm install
   npm run dev
   ```
   *(The server will start on port 3000)*

2. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *(You can visit the Vite sandbox, usually at port 5173, and it proxies `/api` to `localhost:3000`)*

## License

This project is open-source and licensed under the [MIT License](LICENSE).
