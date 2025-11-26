import { Track, WalletBalance, StakingPosition } from '../types';

export const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Nights',
    artist: 'Cyber Soul',
    duration: '3:45',
    coverUrl: 'https://picsum.photos/300/300?random=1',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    plays: 12500,
    likes: 850,
    isNft: true
  },
  {
    id: '2',
    title: 'Ether Dreams',
    artist: 'Vitalik & The Nodes',
    duration: '4:12',
    coverUrl: 'https://picsum.photos/300/300?random=2',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    plays: 8900,
    likes: 420
  },
  {
    id: '3',
    title: 'Protocol Error',
    artist: 'Glitch Mob Proxy',
    duration: '2:58',
    coverUrl: 'https://picsum.photos/300/300?random=3',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    plays: 34000,
    likes: 2100,
    isNft: true
  },
  {
    id: '4',
    title: 'Violet Haze',
    artist: 'Deep State Audio',
    duration: '5:20',
    coverUrl: 'https://picsum.photos/300/300?random=4',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    plays: 5600,
    likes: 330
  }
];

export const MOCK_BALANCES: WalletBalance[] = [
  {
    currency: 'Solana',
    symbol: 'SOL',
    amount: 145.5,
    usdValue: 21825,
    change24h: 5.2,
    network: 'Solana'
  },
  {
    currency: 'Ethereum',
    symbol: 'ETH',
    amount: 2.4,
    usdValue: 7200,
    change24h: -1.2,
    network: 'Ethereum'
  },
  {
    currency: 'Toncoin',
    symbol: 'TON',
    amount: 5000,
    usdValue: 35000,
    change24h: 12.8,
    network: 'TON'
  }
];

export const MOCK_STAKING: StakingPosition[] = [
  {
    id: 'pos_1',
    amount: 10000,
    apy: 18,
    lockedUntil: '2024-12-31',
    rewardsEarned: 450
  }
];

export const TREND_DATA = [
  { name: 'Mon', plays: 4000 },
  { name: 'Tue', plays: 3000 },
  { name: 'Wed', plays: 5000 },
  { name: 'Thu', plays: 2780 },
  { name: 'Fri', plays: 8890 },
  { name: 'Sat', plays: 12390 },
  { name: 'Sun', plays: 9490 },
];
