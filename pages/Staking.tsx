import React, { useState, useEffect } from 'react';
import {
  Coins,
  Lock,
  TrendingUp,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Wallet as WalletIcon,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '../stores/useAuthStore';
import { contractService, StakingPosition } from '../services/contracts';
import { enhancedWeb3Service } from '../services/enhancedWeb3Service';
import { useToastStore } from '../stores/useToastStore';

interface LockPeriodOption {
  days: number;
  seconds: number;
  label: string;
  apy: number;
}

const LOCK_PERIODS: LockPeriodOption[] = [
  { days: 30, seconds: 30 * 24 * 60 * 60, label: '30 Days', apy: 5 },
  { days: 90, seconds: 90 * 24 * 60 * 60, label: '90 Days', apy: 10 },
  { days: 180, seconds: 180 * 24 * 60 * 60, label: '180 Days', apy: 15 },
  { days: 365, seconds: 365 * 24 * 60 * 60, label: '365 Days', apy: 25 },
];

export const Staking: React.FC = () => {
  const { user, isWeb3Connected } = useAuthStore();

  const [positions, setPositions] = useState<StakingPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedLockPeriod, setSelectedLockPeriod] = useState<LockPeriodOption>(LOCK_PERIODS[0]);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState<number | null>(null);
  const [isClaiming, setIsClaiming] = useState<number | null>(null);
  const [mptBalance, setMptBalance] = useState<string>('0');
  const [totalRewards, setTotalRewards] = useState<string>('0');
  const [totalValueLocked, setTotalValueLocked] = useState<string>('0');

  // Load staking data
  const loadStakingData = async () => {
    if (!user?.wallet || !isWeb3Connected) return;

    setIsLoading(true);
    try {
      // Load user's staking positions
      const userPositions = await contractService.getStakingPositions(user.wallet);
      setPositions(userPositions);

      // Calculate total rewards
      const rewards = userPositions.reduce((sum, pos) => sum + parseFloat(pos.rewards), 0);
      setTotalRewards(rewards.toFixed(4));

      // Get MPT balance (mock implementation - in production would query token contract)
      const provider = enhancedWeb3Service.getCurrentProvider();
      if (provider) {
        const balance = await provider.getBalance(user.wallet);
        const ethBalance = parseFloat(balance.toString()) / 1e18;
        setMptBalance(ethBalance.toFixed(4));
      }

      // Mock TVL calculation (in production would get from contract)
      const mockTVL = 4250920;
      setTotalValueLocked(mockTVL.toLocaleString());

    } catch (error) {
      console.error('Failed to load staking data:', error);
      useToastStore.getState().addToast('Failed to load staking data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isWeb3Connected && user?.wallet) {
      loadStakingData();
    } else {
      // Reset data when disconnected
      setPositions([]);
      setTotalRewards('0');
      setMptBalance('0');
    }
  }, [isWeb3Connected, user?.wallet]);

  const handleStake = async () => {
    if (!isWeb3Connected || !user?.wallet) {
      useToastStore.getState().addToast('Please connect your wallet first', 'error');
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      useToastStore.getState().addToast('Please enter a valid amount', 'error');
      return;
    }

    if (amount > parseFloat(mptBalance)) {
      useToastStore.getState().addToast('Insufficient balance', 'error');
      return;
    }

    setIsStaking(true);
    try {
      const txHash = await contractService.stake(amount.toString(), selectedLockPeriod.seconds);
      useToastStore.getState().addToast(
        `Successfully staked ${amount} MPT! Transaction: ${txHash.slice(0, 10)}...`,
        'success'
      );

      // Reset form and reload data
      setStakeAmount('');
      await loadStakingData();
    } catch (error) {
      console.error('Staking failed:', error);
      useToastStore.getState().addToast(
        `Staking failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async (positionId: number) => {
    if (!isWeb3Connected || !user?.wallet) return;

    setIsUnstaking(positionId);
    try {
      const txHash = await contractService.unstake(positionId);
      useToastStore.getState().addToast(
        `Successfully unstaked position #${positionId}! Transaction: ${txHash.slice(0, 10)}...`,
        'success'
      );

      await loadStakingData();
    } catch (error) {
      console.error('Unstaking failed:', error);
      useToastStore.getState().addToast(
        `Unstaking failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsUnstaking(null);
    }
  };

  const handleClaimRewards = async (positionId: number) => {
    if (!isWeb3Connected || !user?.wallet) return;

    setIsClaiming(positionId);
    try {
      const txHash = await contractService.claimRewards(positionId);
      useToastStore.getState().addToast(
        `Successfully claimed rewards! Transaction: ${txHash.slice(0, 10)}...`,
        'success'
      );

      await loadStakingData();
    } catch (error) {
      console.error('Claiming rewards failed:', error);
      useToastStore.getState().addToast(
        `Claiming rewards failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsClaiming(null);
    }
  };

  const getMaxAmount = () => {
    setStakeAmount(mptBalance);
  };

  const calculateEstimatedRewards = () => {
    const amount = parseFloat(stakeAmount) || 0;
    const dailyRate = selectedLockPeriod.apy / 100 / 365;
    const estimatedRewards = amount * dailyRate * selectedLockPeriod.days;
    return estimatedRewards.toFixed(4);
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));

    if (days > 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      return `${years}y ${remainingDays}d`;
    }
    return `${days}d`;
  };

  const currentAPY = positions.length > 0
    ? positions.reduce((sum, pos) => sum + pos.apy, 0) / positions.length
    : selectedLockPeriod.apy;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center py-8">
        <h2 className="text-4xl font-display font-bold text-white mb-2">Stake MPT Tokens</h2>
        <p className="text-gray-400">Earn passive income while supporting the music ecosystem.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
            <p className="text-gray-400 text-sm">Total Value Locked</p>
          </div>
          <p className="text-3xl font-bold text-white">${totalValueLocked}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-2xl text-center border border-violet-500/30 bg-violet-500/5"
        >
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-violet-400 mr-2" />
            <p className="text-violet-300 text-sm">Current APY</p>
          </div>
          <p className="text-3xl font-bold text-violet-400">{currentAPY.toFixed(1)}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 rounded-2xl text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <Coins className="w-5 h-5 text-yellow-400 mr-2" />
            <p className="text-gray-400 text-sm">Your Rewards</p>
          </div>
          <p className="text-3xl font-bold text-white">{totalRewards} MPT</p>
        </motion.div>
      </div>

      {isWeb3Connected ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-8 rounded-2xl"
        >
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Staking Form */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Stake Assets</h3>
                <button
                  onClick={loadStakingData}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-white transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Amount Input */}
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Amount</span>
                  <span>Balance: {mptBalance} MPT</span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.001"
                    min="0"
                    max={mptBalance}
                    className="bg-transparent text-2xl font-bold text-white focus:outline-none w-full"
                  />
                  <button
                    onClick={getMaxAmount}
                    className="px-3 py-1 bg-violet-500/20 text-violet-400 text-xs rounded-md hover:bg-violet-500/30 transition"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Lock Period Selection */}
              <div className="space-y-3">
                <label className="text-sm text-gray-400">Lock Duration</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {LOCK_PERIODS.map((period) => (
                    <button
                      key={period.seconds}
                      onClick={() => setSelectedLockPeriod(period)}
                      className={`py-3 rounded-lg border transition-all ${
                        selectedLockPeriod.seconds === period.seconds
                          ? 'border-violet-500 bg-violet-500/20 text-white'
                          : 'border-white/10 hover:bg-violet-600/10 hover:border-violet-600 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-medium">{period.label}</div>
                      <div className="text-xs opacity-75">{period.apy}% APY</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rewards Estimation */}
              {stakeAmount && parseFloat(stakeAmount) > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-violet-300">Estimated Rewards</span>
                    <span className="text-white font-bold">{calculateEstimatedRewards()} MPT</span>
                  </div>
                </motion.div>
              )}

              {/* Stake Button */}
              <button
                onClick={handleStake}
                disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || isStaking || parseFloat(stakeAmount) > parseFloat(mptBalance)}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:from-violet-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isStaking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Approve & Stake'
                )}
              </button>
            </div>

            {/* Your Positions */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Your Positions ({positions.length})
                </h4>

                {positions.length === 0 ? (
                  <div className="text-center py-8">
                    <Coins className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-1">No active stakes</p>
                    <p className="text-gray-500 text-xs">Stake MPT tokens to start earning rewards</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {positions.map((position) => (
                      <motion.div
                        key={position.positionId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/20 rounded-xl p-4 border border-white/10"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-white font-bold text-lg">
                              {parseFloat(position.amount).toFixed(2)} MPT
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                {position.isActive ? 'Active' : 'Completed'}
                              </span>
                              <span className="text-xs text-gray-400">
                                #{position.positionId}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-bold">
                              +{parseFloat(position.rewards).toFixed(4)} MPT
                            </div>
                            <div className="text-xs text-gray-400">
                              {position.apy}% APY
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeRemaining(position.endTime)}
                          </span>
                          <span>
                            {Math.floor(position.lockPeriod / 86400)} days
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {parseFloat(position.rewards) > 0 && (
                            <button
                              onClick={() => handleClaimRewards(position.positionId)}
                              disabled={isClaiming === position.positionId}
                              className="flex-1 px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30 transition disabled:opacity-50"
                            >
                              {isClaiming === position.positionId ? (
                                <RefreshCw className="w-3 h-3 animate-spin mx-auto" />
                              ) : (
                                'Claim'
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleUnstake(position.positionId)}
                            disabled={isUnstaking === position.positionId || position.isActive}
                            className="flex-1 px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUnstaking === position.positionId ? (
                              <RefreshCw className="w-3 h-3 animate-spin mx-auto" />
                            ) : (
                              'Unstake'
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Contract Link */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <a
                    href="https://etherscan.io/address/0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-purple-400 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Staking Contract
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Not Connected State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 rounded-2xl text-center"
        >
          <WalletIcon className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">Connect Your Wallet to Stake</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Connect your Web3 wallet to start staking MPT tokens and earning rewards.
            Support the music ecosystem while earning passive income.
          </p>
          <button
            onClick={() => window.location.href = '/wallet'}
            className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:from-violet-600 hover:to-purple-600 transition"
          >
            Connect Wallet
          </button>
        </motion.div>
      )}
    </div>
  );
};
