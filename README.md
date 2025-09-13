# OPT Lab - Options Trading Simulator

A comprehensive options trading simulator built with modern web technologies. Master options trading with real-time Black-Scholes pricing, portfolio tracking, and interactive learning features.

## Features

- **Real-time Options Trading Simulation** - Practice trading with realistic market conditions
- **Black-Scholes Pricing Model** - Advanced options pricing calculations
- **Portfolio Management** - Track your trading performance and positions
- **Interactive Quizzes** - Learn trading concepts through gamified education
- **Leaderboard System** - Compete with other traders
- **Authentication System** - Secure user accounts and progress tracking

## Technologies Used

This project is built with modern web technologies:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript development
- **React** - Component-based UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Supabase** - Backend-as-a-Service for authentication and data
- **React Query** - Data fetching and state management
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd trade-forge-quest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Configure your Supabase credentials

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── Layout.tsx      # Main layout component
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and stores
├── services/           # API services
└── integrations/       # Third-party integrations
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.