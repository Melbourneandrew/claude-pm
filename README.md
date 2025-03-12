# Claude PM - Terminal Management System

Check out the [video on X](https://x.com/andrew_melby/status/1899682773905846566)

Special thanks to Andrew Jefferson [@EastlondonDev](https://x.com/EastlondonDev/status/1894791530550026472) for creating [claude-yolo](https://github.com/eastlondoner/claude-yolo) that is used to prevent Claude from stopping to ask for permission.

Claude PM is: A desktop application built with Electron and React that manages multiple [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) terminal sessions. Tickets can be assigned to a Claude and are implemented with a claude code command. Claude pushes a new branch and creates a PR with their changes.

## Features

- Create and manage multiple terminal sessions
- Run commands in individual terminals
- Real-time terminal output
- Ticket management system
- Persists terminal configurations

## Tech Stack

- Electron for cross-platform desktop app
- React with TypeScript for the UI
- Tailwind CSS and DaisyUI for styling
- SQLite for ticket storage
- node-pty for terminal process management

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/claude-pm.git
cd claude-pm
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

## Usage

### Managing Claudes (Terminal Sessions)

1. Click "Add Claude" on the home page
2. Fill in the name, title, and working directory for the terminal
3. Click on a Claude card to open its terminal
4. Run commands in the terminal

### Managing Tickets

1. Navigate to the Tickets page
2. Add tickets with title, description, and optional assignee
3. Assign, start, close, or reopen tickets as needed

## License

MIT# claude-pm
