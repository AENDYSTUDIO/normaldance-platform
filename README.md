<div align="center">
<img width="1200" height="475" alt="Normal Dance Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎵 Normal Dance - Web3 Music Platform

<div align="center">
  <strong>Decentralized Music Streaming & NFT Platform</strong><br/>
  Built with React, Web3, and TypeScript
</div>

<br/>

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Web3-Ethers-green" alt="Web3">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3.4.15-cyan" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Vitest-Testing-orange" alt="Testing">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</div>

<br/>

<p align="center">
  <a href="#features">✨ Features</a> •
  <a href="#getting-started">🚀 Getting Started</a> •
  <a href="#tech-stack">🛠 Tech Stack</a> •
  <a href="#documentation">📚 Documentation</a> •
  <a href="#testing">🧪 Testing</a>
</p>

---

## 🌟 About Normal Dance

Normal Dance is a complete Web3 music platform that allows artists to mint their music as NFTs and share them with fans. The platform combines modern web technologies with blockchain capabilities to create a decentralized music streaming and NFT marketplace.

**Key Features:**
- 🎵 **Audio Streaming**: Full HTML5 audio player with advanced controls
- 🏷️ **NFT Minting**: Music NFT creation with smart contracts
- 🛡️ **Authentication**: Clerk-based authentication with Web3 wallet support
- 📱 **Modern UI**: Glass morphism design with dark mode
- 🧪 **Testing**: Comprehensive test coverage with Vitest

---

## ✨ Features

### 🎵 Audio & Player
- **Full HTML5 Audio Player**: Play/pause, seek, volume, repeat modes
- **Player Controls**: Shuffle, repeat, like/heart functionality
- **Virtualized Track List**: Optimized for large music libraries
- **Lazy Loading**: Performance-optimized component loading
- **NFT Indicators**: Visual indicators for NFT-minted tracks

### 🛡️ Authentication & Security
- **Clerk Integration**: Email and social authentication
- **Web3 Wallets**: MetaMask and Phantom wallet support
- **Browser Guards**: SSR compatibility and security checks
- **Toast Notifications**: Modern UX replacing alert() calls
- **Protected Routes**: Authentication-based navigation

### 🌐 Web3 & Blockchain
- **Smart Contracts**: MusicNFT contract with OpenZeppelin
- **Multi-Network Support**: Ethereum, Polygon, BSC
- **IPFS Integration**: Decentralized file storage
- **NFT Minting**: Complete NFT creation workflow
- **Wallet Connectivity**: Ethers.js integration

### 🎨 UI/UX Design
- **Glass Morphism**: Modern frosted glass design patterns
- **Dark Mode**: Full dark/light theme support
- **Responsive Design**: Mobile-optimized interface
- **Smooth Animations**: Framer Motion integration
- **Accessibility**: Skip links and ARIA compliance

### 🧪 Testing & Quality
- **Component Testing**: React Testing Library
- **Store Testing**: Zustand state management tests
- **Integration Tests**: Player transitions and routes
- **Coverage Reports**: Detailed HTML coverage output
- **Type Safety**: TypeScript strict mode

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AENDYSTUDIO/normaldance-v2.git
   cd normaldance-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure Required Services** (see [Environment Setup](#environment-setup))

### Environment Setup

Create a `.env.local` file based on `.env.local.example`:

```env
# Supabase (Required for backend features)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Clerk Authentication (Required for auth)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-key-here

# IPFS (Optional - for NFT storage)
VITE_IPFS_PROJECT_ID=your-infura-id
VITE_IPFS_PROJECT_SECRET=your-infura-secret
VITE_PINATA_API_KEY=your-pinata-key
VITE_PINATA_SECRET_API_KEY=your-pinata-secret
```

### Service Configuration

#### 1. Supabase Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Get your project URL and anon key from settings
4. Create tables for tracks, users, and playlists

#### 2. Clerk Setup
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy your publishable key
4. Follow instructions in `SETUP_CLERK.md`

#### 3. IPFS Setup (Optional)
1. Sign up for [Infura](https://infura.io/) or [Pinata](https://pinata.cloud/)
2. Get API keys for IPFS storage
3. Configure in environment variables

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

---

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** - UI library with TypeScript
- **Vite 6.2.0** - Build tool and development server
- **TypeScript 5.0+** - Static type checking
- **Tailwind CSS 3.4.15** - Utility-first CSS framework
- **Zustand 5.0.2** - State management
- **React Router DOM 6.28.0** - Client-side routing

### UI/UX
- **Framer Motion 12.23.24** - Animation library
- **Lucide React** - Icon library
- **Testing Library** - Testing utilities

### Web3 & Blockchain
- **Ethers 6.13.4** - Ethereum library
- **Hardhat** - Smart contract development
- **OpenZeppelin** - Secure smart contract templates

### Backend & Database
- **Supabase 2.47.7** - Backend as a Service
- **IPFS** - Decentralized file storage

### Testing
- **Vitest** - Unit and integration testing
- **React Testing Library** - Component testing
- **jsdom** - DOM environment for tests

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Prettier** - Code formatting

---

## 📚 Documentation

### Core Documentation
- [**CLAUDE.md**](./CLAUDE.md) - Complete project setup and development guide
- [**SETUP_CLERK.md**](./SETUP_CLERK.md) - Clerk authentication setup instructions

### Smart Contracts
- **Contract**: `contracts/MusicNFT.sol`
- **Compilation**: `npm run compile`
- **Deployment**: `npm run deploy [network]`

### Deployment
- **Vercel**: Configuration in `vercel.json`
- **Netlify**: Configuration in `netlify.toml`
- **Static Output**: `dist/` directory

### API & Services
- **Supabase**: Database and auth backend
- **IPFS**: Decentralized file storage
- **Clerk**: Frontend authentication

---

## 🧪 Testing

### Test Coverage
The project includes comprehensive test coverage:

- **Component Tests**: AudioPlayer, Authentication, UI components
- **Store Tests**: Zustand state management
- **Integration Tests**: Player transitions, route protection
- **Service Tests**: IPFS, Web3, authentication services

### Running Tests
```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test -- --coverage
```

### Test Structure
```
test/
├── components/          # Component tests
├── stores/            # Store tests
├── integration/       # Integration tests
└── services/          # Service tests
```

---

## 🎯 Project Structure

```
├── components/          # React components
├── pages/              # Application pages
├── services/           # API and service layer
├── stores/             # Zustand state stores
├── contracts/          # Smart contracts
├── test/               # Test files
├── scripts/            # Build and deployment scripts
└── materials/          # Documentation and materials
```

Key directories:
- `components/` - Reusable UI components
- `pages/` - Page components with routing
- `services/` - API and external service integrations
- `stores/` - Zustand state management
- `contracts/` - Solidity smart contracts
- `test/` - Test files and utilities

---

## 🔧 Development Commands

### Core Development
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run typecheck` - TypeScript type checking

### Code Quality
- `npm run lint` - ESLint checking
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier

### Testing
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

### Smart Contracts
- `npm run compile` - Compile MusicNFT contract
- `npm run deploy [network]` - Deploy to network

---

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main

### Netlify
1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist/`
4. Configure environment variables

### Static Hosting
```bash
npm run build
# Deploy dist/ directory to any static host
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm run test`
5. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Use existing component structure
- Implement proper error handling
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React** and **TypeScript** communities
- **Ethers.js** for Web3 integration
- **Supabase** for backend services
- **Clerk** for authentication
- **OpenZeppelin** for secure smart contracts

---

## 📞 Support

For support and questions:

- 📧 **Email**: Create an issue on GitHub
- 📖 **Documentation**: See [CLAUDE.md](./CLAUDE.md)
- 🐛 **Bugs**: Report issues in the GitHub Issues tab

---

<div align="center">
  <strong>Made with ❤️ by Normal Dance Team</strong><br/>
  <em>Decentralizing music, one NFT at a time 🎵</em>
</div>
