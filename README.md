# VYBE — Spontaneous Activity Finder

VYBE is a privacy-first, spontaneous real-world activity finder. Discover, create, and join meetups happening near you right now.

## Features

- **Spontaneous Activity Radar**: Real-time interactive map with nearby activities.
- **Privacy-First Location**: Exact venues hidden until joined; approximate coordinates for public viewing.
- **100% Free**: No payments, subscriptions, or transaction fees.
- **Attendance Verification**: Free Host QR Pass & Attendee Camera QR Scanner.
- **Karma & Reliability System**: Attendance rewards reliability score; unexcused no-shows trigger a Karma penalty.
- **Real-Time Squad Chat**: Dedicated group chat for participants with quick prompt suggestions.
- **Communities & Hubs**: Create and join local activity groups.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Installation

1. Unzip the repository (if downloaded as `VYBEE.zip`):
   ```bash
   unzip VYBEE.zip -d vybe
   cd vybe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` directory.

### Push to GitHub

To push this codebase to a new GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit of VYBE application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```
