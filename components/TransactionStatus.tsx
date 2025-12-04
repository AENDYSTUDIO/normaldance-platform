import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Copy,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { enhancedWeb3Service, TransactionProgress } from '../services/enhancedWeb3Service';
import { useToastStore } from '../stores/useToastStore';

interface TransactionStatusProps {
  txHash: string;
  onComplete?: (progress: TransactionProgress) => void;
  onError?: (progress: TransactionProgress) => void;
  showDetails?: boolean;
  compact?: boolean;
}

interface TransactionInfo {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed' | 'replaced';
  confirmations: number;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  timestamp: number;
  error?: string;
  from: string;
  to?: string;
  value?: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  txHash,
  onComplete,
  onError,
  showDetails = true,
  compact = false
}) => {
  const [transaction, setTransaction] = useState<TransactionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadTransactionStatus = async () => {
    if (!txHash) return;

    try {
      const provider = enhancedWeb3Service.getCurrentProvider();
      if (!provider) return;

      const receipt = await provider.getTransactionReceipt(txHash);
      const tx = await provider.getTransaction(txHash);

      if (receipt && tx) {
        const txInfo: TransactionInfo = {
          hash: txHash,
          status: receipt.status === 1 ? 'confirmed' : 'failed',
          confirmations: receipt.confirmations || 0,
          gasUsed: receipt.gasUsed?.toString(),
          gasPrice: receipt.gasPrice?.toString(),
          blockNumber: receipt.blockNumber || undefined,
          timestamp: Date.now(),
          from: tx.from,
          to: tx.to || undefined,
          value: tx.value ? (parseFloat(tx.value.toString()) / 1e18).toString() : undefined
        };

        setTransaction(txInfo);

        if (receipt.status === 1 && onComplete) {
          onComplete({
            hash: txHash,
            status: 'confirmed',
            confirmations: receipt.confirmations || 0,
            gasUsed: receipt.gasUsed?.toString(),
            gasPrice: receipt.gasPrice?.toString(),
            blockNumber: receipt.blockNumber,
            timestamp: Date.now()
          });
        } else if (receipt.status === 0 && onError) {
          onError({
            hash: txHash,
            status: 'failed',
            confirmations: 0,
            timestamp: Date.now(),
            error: 'Transaction failed'
          });
        }
      }
    } catch (error) {
      console.error('Failed to load transaction status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactionStatus();

    // Set up polling for pending transactions
    let interval: NodeJS.Timeout;
    if (!transaction || transaction.status === 'pending') {
      interval = setInterval(loadTransactionStatus, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [txHash, transaction?.status]);

  const copyTransactionHash = async () => {
    if (!txHash) return;

    try {
      await navigator.clipboard.writeText(txHash);
      setCopied(true);
      useToastStore.getState().addToast('Transaction hash copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      useToastStore.getState().addToast('Failed to copy transaction hash', 'error');
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-400" />;
    }

    switch (transaction?.status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'replaced':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (isLoading) return 'Loading...';

    switch (transaction?.status) {
      case 'confirmed':
        return `Confirmed (${transaction.confirmations} confirmations)`;
      case 'failed':
        return transaction.error || 'Transaction Failed';
      case 'pending':
        return 'Pending';
      case 'replaced':
        return 'Replaced';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (isLoading) return 'text-blue-400';

    switch (transaction?.status) {
      case 'confirmed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      case 'replaced':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatGas = (gas?: string, gasPrice?: string) => {
    if (!gas || !gasPrice) return 'Unknown';
    const gasUsed = parseFloat(gas);
    const priceGwei = parseFloat(gasPrice) / 1e9;
    const ethCost = (gasUsed * priceGwei) / 1e9;
    return `${gasUsed.toLocaleString()} gas (${ethCost.toFixed(6)} ETH)`;
  };

  const etherscanUrl = transaction?.hash
    ? `https://etherscan.io/tx/${transaction.hash}`
    : undefined;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
      >
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {txHash && formatAddress(txHash)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyTransactionHash}
            className="p-1 hover:bg-white/10 rounded transition"
            title="Copy transaction hash"
          >
            <Copy className={`w-4 h-4 ${copied ? 'text-green-400' : 'text-gray-400'}`} />
          </button>
          {etherscanUrl && (
            <a
              href={etherscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-white/10 rounded transition"
              title="View on Etherscan"
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-2xl border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-white">Transaction Status</h3>
            <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadTransactionStatus}
            disabled={isLoading}
            className="p-2 hover:bg-white/10 rounded-lg transition disabled:opacity-50"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {etherscanUrl && (
            <a
              href={etherscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/10 rounded-lg transition"
              title="View on Etherscan"
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          )}
        </div>
      </div>

      {/* Transaction Hash */}
      <div className="bg-black/20 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Transaction Hash</span>
          <button
            onClick={copyTransactionHash}
            className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition"
          >
            {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="mt-2 font-mono text-sm text-white break-all">
          {txHash}
        </div>
      </div>

      {/* Transaction Details */}
      {showDetails && transaction && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From */}
            <div>
              <span className="text-sm text-gray-400">From</span>
              <div className="text-sm text-white font-mono">
                {formatAddress(transaction.from)}
              </div>
            </div>

            {/* To */}
            {transaction.to && (
              <div>
                <span className="text-sm text-gray-400">To</span>
                <div className="text-sm text-white font-mono">
                  {formatAddress(transaction.to)}
                </div>
              </div>
            )}

            {/* Value */}
            {transaction.value && parseFloat(transaction.value) > 0 && (
              <div>
                <span className="text-sm text-gray-400">Value</span>
                <div className="text-sm text-white font-semibold">
                  {transaction.value} ETH
                </div>
              </div>
            )}

            {/* Block Number */}
            {transaction.blockNumber && (
              <div>
                <span className="text-sm text-gray-400">Block</span>
                <div className="text-sm text-white">
                  #{transaction.blockNumber.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Gas Information */}
          {(transaction.gasUsed || transaction.gasPrice) && (
            <div>
              <span className="text-sm text-gray-400">Gas Used</span>
              <div className="text-sm text-white">
                {formatGas(transaction.gasUsed, transaction.gasPrice)}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div>
            <span className="text-sm text-gray-400">Timestamp</span>
            <div className="text-sm text-white">
              {new Date(transaction.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Confirmations */}
          {transaction.status === 'confirmed' && (
            <div>
              <span className="text-sm text-gray-400">Confirmations</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((transaction.confirmations / 12) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-white font-medium">
                  {transaction.confirmations}/12
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {transaction.error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Transaction Error</p>
              <p className="text-red-300 text-sm mt-1">{transaction.error}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Transaction Queue Component
interface TransactionQueueProps {
  transactions: Array<{
    id: string;
    hash: string;
    description: string;
    timestamp: number;
  }>;
  onRemove?: (id: string) => void;
}

export const TransactionQueue: React.FC<TransactionQueueProps> = ({
  transactions,
  onRemove
}) => {
  const [completedTxs, setCompletedTxs] = useState<Set<string>>(new Set());

  const handleTransactionComplete = (txId: string) => {
    setCompletedTxs(prev => new Set(prev).add(txId));
  };

  const handleTransactionError = (txId: string) => {
    setCompletedTxs(prev => new Set(prev).add(txId));
  };

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <motion.div
          key={tx.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="relative"
        >
          <TransactionStatus
            txHash={tx.hash}
            compact={true}
            onComplete={() => handleTransactionComplete(tx.id)}
            onError={() => handleTransactionError(tx.id)}
          />
          <div className="absolute top-2 left-2 -translate-x-full">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          </div>
          <div className="text-xs text-gray-400 ml-8 mb-1">
            {tx.description}
          </div>
          {onRemove && (
            <button
              onClick={() => onRemove(tx.id)}
              className="absolute top-2 right-2 p-1 hover:bg-red-500/20 rounded transition"
              title="Remove from queue"
            >
              <XCircle className="w-3 h-3 text-red-400 opacity-0 hover:opacity-100" />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
};