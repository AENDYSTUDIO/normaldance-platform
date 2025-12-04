import React, { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  History,
  ExternalLink,
  Copy,
  RefreshCw,
  Music,
  Coins,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuthStore } from '../stores/useAuthStore';
import { contractService, NFTToken, StakingPosition } from '../services/contracts';
import { enhancedWeb3Service } from '../services/enhancedWeb3Service';
import { useToastStore } from '../stores/useToastStore';

interface WalletBalance {
  symbol: string;
  currency: string;
  network: string;
  amount: string;
  usdValue: number;
  change24h: number;
  contractAddress?: string;
}

export const Wallet: React.FC = () => {
  const { user, isWeb3Connected, connectWallet, disconnectWallet } = useAuthStore();
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [nfts, setNfts] = useState<NFTToken[]>([]);
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Load wallet data when connected
  const loadWalletData = async () => {
    if (!user?.wallet || !isWeb3Connected) return;

    setIsLoadingData(true);
    try {
      // Load owned NFTs
      const ownedNfts = await contractService.getOwnedNFTs(user.wallet);
      setNfts(ownedNfts);

      // Load staking positions
      const positions = await contractService.getStakingPositions(user.wallet);
      setStakingPositions(positions);

      // Get current balance and network info
      const provider = enhancedWeb3Service.getCurrentProvider();
      if (provider) {
        const balance = await provider.getBalance(user.wallet);
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        // Calculate USD value (mock calculation - in production use real price API)
        const ethBalance = parseFloat(balance.toString()) / 1e18;
        const ethUsdPrice = 2000; // Mock price
        const usdValue = ethBalance * ethUsdPrice;

        setBalances([{
          symbol: 'ETH',
          currency: 'Ethereum',
          network: enhancedWeb3Service.getNetworkName(chainId) || 'Unknown',
          amount: ethBalance.toFixed(4),
          usdValue: usdValue,
          change24h: 2.5 // Mock change
        }]);

        // Add MPT tokens if staking positions exist
        if (positions.length > 0) {
          const totalStaked = positions.reduce((sum, pos) =>
            sum + parseFloat(pos.amount), 0
          );
          setBalances(prev => [...prev, {
            symbol: 'MPT',
            currency: 'Music Platform Token',
            network: 'Ethereum',
            amount: totalStaked.toFixed(2),
            usdValue: totalStaked * 1.5, // Mock price
            change24h: 5.2,
            contractAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      useToastStore.getState().addToast('Failed to load wallet data', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isWeb3Connected && user?.wallet) {
      loadWalletData();
    } else {
      // Reset data when disconnected
      setBalances([]);
      setNfts([]);
      setStakingPositions([]);
    }
  }, [isWeb3Connected, user?.wallet]);

  const handleConnectWallet = async () => {
    if (isWeb3Connected) {
      disconnectWallet();
    } else {
      const success = await connectWallet();
      if (success) {
        useToastStore.getState().addToast('Wallet connected successfully', 'success');
      }
    }
  };

  const handleCopyAddress = async () => {
    if (!user?.wallet) return;

    try {
      await navigator.clipboard.writeText(user.wallet);
      setCopiedAddress(true);
      useToastStore.getState().addToast('Address copied to clipboard', 'success');
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      useToastStore.getState().addToast('Failed to copy address', 'error');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Wallet</h2>
          <p className="text-gray-400 mt-1">
            {isWeb3Connected
              ? `Manage your assets - ${formatAddress(user?.wallet || '')}`
              : 'Connect your wallet to get started'
            }
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          {isWeb3Connected && (
            <button
              onClick={loadWalletData}
              disabled={isLoadingData}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium transition flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
          <button
            onClick={handleConnectWallet}
            className={`px-6 py-2 rounded-xl font-medium transition flex items-center space-x-2 ${
              isWeb3Connected
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-violet-600 hover:bg-violet-500 text-white'
            }`}
          >
            <WalletIcon size={18} />
            <span>{isWeb3Connected ? 'Disconnect' : 'Connect Wallet'}</span>
          </button>
        </div>
      </div>

      {isWeb3Connected ? (
        <>
          {/* Balance Cards */}
          {balances.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {balances.map((balance, index) => (
                <motion.div
                  key={balance.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-panel p-6 rounded-2xl relative overflow-hidden"
                >
                  {/* Background decoration */}
                  <div
                    className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-xl ${
                      balance.symbol === 'MPT' ? 'bg-purple-400' :
                      balance.symbol === 'ETH' ? 'bg-blue-400' : 'bg-blue-600'
                    }`}
                  />

                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      {balance.symbol === 'MPT' ? <Music className="w-5 h-5" /> : 'Ξ'}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{balance.currency}</h3>
                      <span className="text-xs text-gray-400">{balance.network}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-2xl font-bold text-white font-display">
                      {balance.amount} {balance.symbol}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-400">${balance.usdValue.toLocaleString()}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        balance.change24h >= 0
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {balance.change24h > 0 ? '+' : ''}{balance.change24h}%
                      </span>
                    </div>
                  </div>

                  {balance.contractAddress && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <button
                        onClick={() => window.open(
                          `https://etherscan.io/token/${balance.contractAddress}`,
                          '_blank'
                        )}
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View on Etherscan
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* NFT Collection and Staking */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* NFT Collection */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white">Your NFT Collection ({nfts.length})</h3>
                </div>
                {nfts.length > 0 && (
                  <button
                    onClick={loadWalletData}
                    disabled={isLoadingData}
                    className="text-purple-400 text-sm hover:text-purple-300"
                  >
                    <RefreshCw className={`w-4 h-4 inline mr-1 ${isLoadingData ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                )}
              </div>

              {nfts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nfts.map((nft) => (
                    <motion.div
                      key={nft.tokenId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <Music className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-sm">{nft.title}</h4>
                          <p className="text-xs text-gray-400 mb-1">{nft.artist}</p>
                          <p className="text-xs text-purple-400">#{nft.tokenId}</p>
                          {nft.isForSale && (
                            <p className="text-xs text-green-400 mt-1">For sale: {nft.price} ETH</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No NFTs found</p>
                  <p className="text-sm text-gray-500">Mint your first music NFT to see it here</p>
                </div>
              )}
            </div>

            {/* Staking Positions */}
            <div className="glass-panel p-6 rounded-2xl h-fit">
              <div className="flex items-center gap-2 mb-6">
                <Coins className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white">Staking ({stakingPositions.length})</h3>
              </div>

              {stakingPositions.length > 0 ? (
                <div className="space-y-3">
                  {stakingPositions.map((position) => (
                    <div key={position.positionId} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-400">Position #{position.positionId}</span>
                        <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                          {position.apy}% APY
                        </span>
                      </div>
                      <p className="text-white font-semibold">{position.amount} MPT</p>
                      <p className="text-xs text-gray-400">Rewards: {position.rewards} MPT</p>
                      <div className="mt-2 text-xs text-gray-500">
                        Lock period: {Math.floor(position.lockPeriod / 86400)} days
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Coins className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm mb-1">No active stakes</p>
                  <p className="text-xs text-gray-500">Stake MPT tokens to earn rewards</p>
                </div>
              )}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="glass-panel p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <WalletIcon className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Your Address</p>
                  <p className="text-sm font-mono text-white">{formatAddress(user?.wallet || '')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyAddress}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                <a
                  href={`https://etherscan.io/address/${user?.wallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Not Connected State */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-panel p-12 rounded-2xl text-center">
            <WalletIcon className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Connect Your Wallet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Connect your Web3 wallet to view your NFT collection, manage staking positions,
              and track your crypto assets on the Normal Dance platform.
            </p>
            <button
              onClick={handleConnectWallet}
              className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-medium transition flex items-center space-x-2 mx-auto"
            >
              <WalletIcon size={20} />
              <span>Connect Wallet</span>
            </button>
          </div>

          {/* Features */}
          <div className="glass-panel p-6 rounded-2xl h-fit">
            <h3 className="font-bold text-white mb-6">Wallet Features</h3>
            <div className="space-y-4">
              <FeatureItem
                icon={Music}
                title="NFT Collection"
                description="View and manage your music NFTs"
              />
              <FeatureItem
                icon={Coins}
                title="Staking"
                description="Earn rewards by staking MPT tokens"
              />
              <FeatureItem
                icon={TrendingUp}
                title="Portfolio Tracking"
                description="Monitor your crypto assets in real-time"
              />
              <FeatureItem
                icon={ExternalLink}
                title="Blockchain Explorer"
                description="Direct links to Etherscan for all transactions"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureItem = ({ icon: Icon, title, description }: any) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center flex-shrink-0">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-white font-medium text-sm">{title}</p>
      <p className="text-gray-500 text-xs">{description}</p>
    </div>
  </div>
);

const ActionBtn = ({ icon: Icon, label, sub }: any) => (
  <button className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/10 text-left">
    <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-white font-medium text-sm">{label}</p>
      <p className="text-gray-500 text-xs">{sub}</p>
    </div>
  </button>
);
