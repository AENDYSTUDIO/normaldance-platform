# GEMINI.md - Normal Dance Project Context

This document provides an instructional context for the Gemini CLI agent, summarizing the Normal Dance project based on its existing documentation and codebase analysis.

## Project Overview

Normal Dance is a decentralized Web3 music platform that enables artists to mint their music as NFTs and share them with fans. It combines modern web technologies with blockchain capabilities to offer a decentralized music streaming and NFT marketplace.

**Key Features:**
*   **Audio Streaming**: HTML5 audio player with advanced controls.
*   **NFT Minting**: Music NFT creation using smart contracts.
*   **Authentication**: Clerk-based authentication with Web3 wallet support (MetaMask, Phantom).
*   **Modern UI**: Glass morphism design with dark mode and responsive interface.
*   **Testing**: Comprehensive test coverage with Vitest and React Testing Library.

**Main Technologies:**
*   **Frontend**: React 18.3.1, Vite 6.2.0, TypeScript 5.0+, Tailwind CSS 3.4.15, Zustand 5.0.2, React Router DOM 6.28.0.
*   **UI/UX**: Framer Motion 12.23.24, Lucide React.
*   **Web3 & Blockchain**: Ethers 6.13.4, Hardhat, OpenZeppelin for smart contracts.
*   **Backend & Database**: Supabase 2.47.7 (BaaS), IPFS (Decentralized file storage).
*   **Testing**: Vitest, React Testing Library, jsdom.
*   **Development Tools**: ESLint, Prettier, Husky.

The project structure includes:
*   `components/`: Reusable React UI components.
*   `pages/`: Application page components with routing.
*   `services/`: API and external service integrations (Supabase, IPFS, Web3).
*   `stores/`: Zustand state management stores.
*   `contracts/`: Solidity smart contracts.
*   `test/`: Test files for components, stores, integration, and services.
*   `supabase/`: Supabase related files, including SQL schemas.
*   `utils/`: Utility functions.

## Building and Running

**Prerequisites:**
*   Node.js v18+
*   npm or yarn
*   Git

**Installation:**
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AENDYSTUDIO/normaldance-v2.git
    cd normaldance-v2
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup:** Create a `.env.local` file from `.env.local.example` and configure required services (Supabase, Clerk, IPFS).
    ```bash
    cp .env.local.example .env.local
    ```

**Development Commands:**
*   **Start development server:** `npm run dev`
*   **Build for production:** `npm run build`
*   **Preview production build:** `npm run preview`
*   **Run tests:** `npm run test`
*   **Run tests in watch mode:** `npm run test:watch`
*   **Type checking:** `npm run typecheck`
*   **Linting:** `npm run lint`
*   **Format code:** `npm run format`
*   **Compile Smart Contracts:** `npm run compile`
*   **Deploy Smart Contracts:** `npm run deploy [network]`

## Development Conventions

*   **Language:** TypeScript (strict mode enforced).
*   **Styling:** Tailwind CSS, with a focus on Glass Morphism design principles. Dark mode is supported.
*   **State Management:** Zustand for global state.
*   **Routing:** React Router DOM.
*   **Animations:** Framer Motion.
*   **Linting:** ESLint is configured for code quality.
*   **Formatting:** Prettier is used for consistent code formatting.
*   **Version Control:** Git with Husky pre-commit hooks.
*   **Testing:**
    *   Vitest for unit and integration testing.
    *   React Testing Library for component testing.
    *   Comprehensive test coverage is expected for new features.
    *   Test files are typically located in the `test/` directory, mirroring the project structure.
*   **Error Handling:** Proper error handling should be implemented.
*   **Documentation:** Updates to documentation are expected for new features or significant changes.
*   **Deployment:** Supports deployment to Vercel and Netlify, or static hosting of the `dist/` directory.

This `GEMINI.md` serves as a condensed guide to the Normal Dance project, facilitating understanding and interaction for the Gemini CLI agent.
