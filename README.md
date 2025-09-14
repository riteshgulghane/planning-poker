# Planning Poker - Agile Estimation Tool

A real-time Planning Poker application built with Next.js, Redux Toolkit, and Nest.js WebSocket backend in a monorepo setup.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can join rooms and vote simultaneously
- **Fibonacci Voting Scale**: Standard agile estimation using [1, 2, 3, 5, 8, 13, 21, ?]
- **Story Management**: Create, edit, and manage user stories
- **Role-based Access**: Moderators can control voting sessions and manage stories
- **Vote Reveal & Reset**: Hide votes until moderator reveals, with reset functionality
- **Modern UI**: Built with Tailwind CSS for a responsive, beautiful interface

## 🏗️ Architecture

```
planning-poker/
├── apps/
│   ├── frontend/   (Next.js 14 + React + Redux Toolkit + Tailwind)
│   └── backend/    (Node.js/Nest.js + WebSocket server)
├── shared/         (shared TypeScript types/interfaces)
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time communication
- **TypeScript** - Type safety

### Backend
- **Nest.js** - Node.js framework
- **Socket.IO** - WebSocket server
- **TypeScript** - Type safety
- **UUID** - Unique ID generation

### Shared
- **TypeScript** - Shared types and interfaces
- **Socket event definitions** - Consistent API between frontend and backend

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd planning-poker
```

2. **Install dependencies**
```bash
npm install
```

3. **Build shared types**
```bash
cd shared && npm run build
```

4. **Set up environment variables**
```bash
cp .env.example .env.local
```

### Development

**Start both frontend and backend:**
```bash
npm run dev
```

**Start individually:**
```bash
# Backend only (port 3001)
npm run dev:backend

# Frontend only (port 3000)
npm run dev:frontend
```

### Build & Production

```bash
# Build all packages
npm run build

# Start backend in production
cd apps/backend && npm run start:prod

# Start frontend in production  
cd apps/frontend && npm run start
```

## 📱 Usage

1. **Create a Room**: Enter your name and room name, click "Create Room"
2. **Join a Room**: Enter your name and room ID, click "Join Room"
3. **Add Stories**: Moderators can add user stories to estimate
4. **Vote**: Select a card from the Fibonacci scale [1, 2, 3, 5, 8, 13, 21, ?]
5. **Reveal**: Moderator reveals all votes to see results and statistics
6. **Reset**: Start a new round of voting for the same or next story

## 🎯 User Roles

### Moderator
- First person to create the room
- Can add/edit/delete stories
- Can set active story for voting
- Can reveal and reset votes
- If moderator leaves, role transfers to another participant

### Participant  
- Can join existing rooms
- Can vote on active stories
- Can see other participants and voting status
- Cannot manage stories or control voting flow

## 🔧 API Events

### Room Management
- `createRoom` - Create a new room
- `joinRoom` - Join existing room
- `leaveRoom` - Leave current room

### Story Management
- `createStory` - Add new story
- `updateStory` - Edit existing story  
- `deleteStory` - Remove story
- `setActiveStory` - Set story for voting

### Voting
- `submitVote` - Submit vote for active story
- `revealVotes` - Show all votes (moderator only)
- `resetVotes` - Clear votes and start new round

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd apps/frontend
vercel --prod
```

### Backend (Render)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use the `apps/backend` directory
4. Build command: `npm run build`
5. Start command: `npm run start:prod`

### Environment Variables
```bash
# Backend
NODE_ENV=production
PORT=3001

# Frontend
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Votes are stored in memory only (will reset on server restart)
- No user authentication (users identified by session only)
- Room cleanup happens when all users leave

## 🔮 Future Enhancements

- [ ] Persistent data storage (PostgreSQL/MongoDB)
- [ ] User authentication with NextAuth.js
- [ ] Room history and past voting sessions
- [ ] Custom voting scales
- [ ] Timer for voting sessions
- [ ] Export voting results to CSV/PDF
- [ ] Dark mode theme
- [ ] Mobile app with React Native
