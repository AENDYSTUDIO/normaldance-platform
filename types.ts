
export enum PageView {
  FEED = 'FEED',
  TRENDS = 'TRENDS',
  EXPLORE = 'EXPLORE',
  LIBRARY = 'LIBRARY',
  UPLOAD = 'UPLOAD',
  WALLET = 'WALLET',
  NFT = 'NFT',
  STAKING = 'STAKING',
  STATISTICS = 'STATISTICS',
  GRAVE = 'GRAVE',
  SETTINGS = 'SETTINGS',
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  coverUrl: string;
  plays: number;
  likes: number;
  isNft?: boolean;
  dateAdded?: string; // ISO Date string
  description?: string;
  audioUrl?: string; // For the actual file
}

export interface WalletBalance {
  currency: string;
  symbol: string;
  amount: number;
  usdValue: number;
  change24h: number; // Percentage
  network: 'Solana' | 'Ethereum' | 'TON';
}

export interface StakingPosition {
  id: string;
  amount: number;
  apy: number;
  lockedUntil: string;
  rewardsEarned: number;
}
