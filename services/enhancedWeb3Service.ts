import { ethers } from 'ethers';
import { web3Service, WalletInfo, NETWORKS } from './web3';
import { useToastStore } from '../stores/useToastStore';

// Enhanced Web3 Service with Multi-Wallet Support
export interface TransactionProgress {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed' | 'replaced';
  confirmations: number;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  timestamp: number;
  error?: string;
}

export interface TransactionConfig {
  to?: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface ProgressCallback {
  (progress: TransactionProgress): void;
}

export interface WalletConnectionInfo {
  walletType: string;
  address: string;
  balance: string;
  chainId: number;
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
}

// Hardhat network addresses (from successful deployment)
export const CONTRACT_ADDRESSES = {
  [31337]: { // Hardhat network
    MusicNFT: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    Platform: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    Staking: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  },
  [NETWORKS.ETHEREUM_SEPOLIA.chainId]: {
    MusicNFT: '',
    Platform: '',
    Staking: '',
  },
  [NETWORKS.POLYGON_MUMBAI.chainId]: {
    MusicNFT: '',
    Platform: '',
    Staking: '',
  },
  [NETWORKS.BSC_TESTNET.chainId]: {
    MusicNFT: '',
    Platform: '',
    Staking: '',
  },
};

// Contract ABIs - will be loaded dynamically
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CONTRACT_ABIS: Record<string, any[]> = {
  MusicNFT: [],
  Platform: [],
  Staking: [],
};

// Load contract ABIs from artifacts (only in browser environment)
const loadContractABIs = async () => {
  if (typeof window === 'undefined') return;

  try {
    // For now, we'll use minimal ABIs for key functions
    // In a production environment, you would import the full ABIs from the artifacts
    CONTRACT_ABIS.MusicNFT = [
      "function mintMusicNFT(address to, string title, string artist, string genre, uint256 duration, string audioHash, string coverHash, uint256 price, uint256 royaltyPercentage) external returns (uint256)",
      "function purchaseMusic(uint256 tokenId) external payable",
      "function setForSale(uint256 tokenId, bool isForSale, uint256 price) external",
      "function getMusicMetadata(uint256 tokenId) external view returns (tuple(string title, string artist, string genre, uint256 duration, string audioHash, string coverHash, uint256 price, uint256 royaltyPercentage, uint256 mintedAt, bool isForSale, address currentOwner))",
      "function tokensOfOwner(address owner) external view returns (uint256[])",
      "function getTokensForSale() external view returns (uint256[])",
      "event MusicNFTMinted(uint256 indexed tokenId, address indexed to, string title, string artist, string genre, uint256 price, uint256 royaltyPercentage)",
      "event MusicPurchased(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price)"
    ];

    CONTRACT_ABIS.Platform = [
      "function registerAsArtist() external returns (bool)",
      "function voteOnProposal(uint256 proposalId, bool support) external returns (bool)",
      "event ArtistRegistered(address indexed artist, string name)",
      "event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower)"
    ];

    CONTRACT_ABIS.Staking = [
      "function stake(uint256 amount, uint256 lockPeriod) external returns (uint256)",
      "function unstake(uint256 positionId) external returns (bool)",
      "function claimRewards(uint256 positionId) external returns (bool)",
      "function getUserStakingPositions(address user) external view returns (tuple(uint256 positionId, address staker, uint256 amount, uint256 lockPeriodSeconds, uint256 startTime, uint256 endTime, uint256 lastClaimTime, uint256 totalRewards, uint256 rewardRate, bool isActive, bool isEarlyWithdrawalPenalty, uint8 lockPeriod)[])",
      "event Staked(uint256 indexed positionId, address indexed staker, uint256 amount, uint256 lockPeriod)",
      "event Unstaked(uint256 indexed positionId, address indexed staker, uint256 amount, uint256 rewards)"
    ];

    console.log('Contract ABIs loaded successfully');
  } catch (error) {
    console.error('Failed to load contract ABIs:', error);
  }
};

// Initialize ABIs
loadContractABIs();

class EnhancedWeb3Service {
  private providers: Map<string, ethers.BrowserProvider> = new Map();
  private signers: Map<string, ethers.JsonRpcSigner> = new Map();
  private contracts: Map<string, ethers.Contract> = new Map();
  private currentWallet: string | null = null;
  private currentChainId: number | null = null;
  private transactionCallbacks: Map<string, ProgressCallback[]> = new Map();
  private eventListeners: Map<string, ethers.Contract[]> = new Map();

  /**
   * Initialize a wallet connection
   */
  async initializeWallet(walletType: 'metamask' | 'walletconnect' | 'coinbase'): Promise<boolean> {
    try {
      switch (walletType) {
        case 'metamask':
          return await this.initializeMetaMask();
        case 'walletconnect':
          return await this.initializeWalletConnect();
        case 'coinbase':
          return await this.initializeCoinbase();
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }
    } catch (error) {
      console.error(`Failed to initialize ${walletType}:`, error);
      useToastStore.getState().addToast(
        `Failed to connect to ${walletType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
      return false;
    }
  }

  /**
   * Initialize MetaMask wallet
   */
  private async initializeMetaMask(): Promise<boolean> {
    if (!web3Service.isMetaMaskInstalled()) {
      useToastStore.getState().addToast('MetaMask is not installed', 'warning');
      return false;
    }

    try {
      // Request account access
      await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const address = await signer.getAddress();

      // Store provider and signer
      this.providers.set('metamask', provider);
      this.signers.set('metamask', signer);
      this.currentWallet = 'metamask';
      this.currentChainId = Number(network.chainId);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const ethBalance = await provider.getBalance(address);

      // Initialize contracts for this network
      await this.initializeContracts(Number(network.chainId));

      // Setup event listeners
      this.setupMetaMaskEventListeners();

      useToastStore.getState().addToast('MetaMask connected successfully', 'success');
      return true;
    } catch (error) {
      console.error('MetaMask initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize WalletConnect (placeholder for future implementation)
   */
  private async initializeWalletConnect(): Promise<boolean> {
    // TODO: Implement WalletConnect v2 integration
    useToastStore.getState().addToast('WalletConnect integration coming soon', 'info');
    return false;
  }

  /**
   * Initialize Coinbase Wallet (placeholder for future implementation)
   */
  private async initializeCoinbase(): Promise<boolean> {
    // TODO: Implement Coinbase Wallet SDK integration
    useToastStore.getState().addToast('Coinbase Wallet integration coming soon', 'info');
    return false;
  }

  /**
   * Setup MetaMask event listeners
   */
  private setupMetaMaskEventListeners(): void {
    if (!window.ethereum) return;

    // Account change
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        // Refresh connection with new account
        this.initializeMetaMask();
      }
    });

    // Chain change
    window.ethereum.on('chainChanged', (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      if (newChainId !== this.currentChainId) {
        this.currentChainId = newChainId;
        this.initializeContracts(newChainId);
      }
    });
  }

  /**
   * Initialize contracts for a specific network
   */
  async initializeContracts(chainId: number): Promise<void> {
    const provider = this.getCurrentProvider();
    if (!provider) {
      throw new Error('No provider available');
    }

    const signer = this.getCurrentSigner();
    if (!signer) {
      throw new Error('No signer available');
    }

    const networkAddresses = CONTRACT_ADDRESSES[chainId];
    if (!networkAddresses) {
      console.warn(`No contract addresses configured for network ${chainId}`);
      return;
    }

    // Clear existing contracts
    this.contracts.clear();

    // Initialize MusicNFT contract
    if (networkAddresses.MusicNFT && CONTRACT_ABIS.MusicNFT.length > 0) {
      const musicNFTContract = new ethers.Contract(
        networkAddresses.MusicNFT,
        CONTRACT_ABIS.MusicNFT,
        signer
      );
      this.contracts.set('MusicNFT', musicNFTContract);
      this.setupContractEventListeners('MusicNFT', musicNFTContract);
    }

    // Initialize Platform contract
    if (networkAddresses.Platform && CONTRACT_ABIS.Platform.length > 0) {
      const platformContract = new ethers.Contract(
        networkAddresses.Platform,
        CONTRACT_ABIS.Platform,
        signer
      );
      this.contracts.set('Platform', platformContract);
      this.setupContractEventListeners('Platform', platformContract);
    }

    // Initialize Staking contract
    if (networkAddresses.Staking && CONTRACT_ABIS.Staking.length > 0) {
      const stakingContract = new ethers.Contract(
        networkAddresses.Staking,
        CONTRACT_ABIS.Staking,
        signer
      );
      this.contracts.set('Staking', stakingContract);
      this.setupContractEventListeners('Staking', stakingContract);
    }
  }

  /**
   * Setup event listeners for a contract
   */
  private setupContractEventListeners(contractName: string, contract: ethers.Contract): void {
    // Store contract for event cleanup
    if (!this.eventListeners.has(contractName)) {
      this.eventListeners.set(contractName, []);
    }
    this.eventListeners.get(contractName)!.push(contract);

    // Example event listeners (to be customized based on contract events)
    contract.on('*', (event: ethers.EventLog) => {
      console.log(`${contractName} event:`, event);
    });
  }

  /**
   * Execute a transaction with progress tracking
   */
  async executeTransaction(config: TransactionConfig): Promise<TransactionProgress> {
    const signer = this.getCurrentSigner();
    if (!signer) {
      throw new Error('No signer available');
    }

    try {
      const tx = await signer.sendTransaction({
        to: config.to,
        value: config.value ? ethers.parseEther(config.value) : undefined,
        data: config.data,
        gasLimit: config.gasLimit ? BigInt(config.gasLimit) : undefined,
        gasPrice: config.gasPrice ? BigInt(config.gasPrice) : undefined,
        maxFeePerGas: config.maxFeePerGas ? BigInt(config.maxFeePerGas) : undefined,
        maxPriorityFeePerGas: config.maxPriorityFeePerGas ? BigInt(config.maxPriorityFeePerGas) : undefined,
      });

      const progress: TransactionProgress = {
        hash: tx.hash,
        status: 'pending',
        confirmations: 0,
        timestamp: Date.now(),
      };

      // Start tracking transaction
      this.trackTransaction(tx.hash);

      useToastStore.getState().addToast(
        `Transaction submitted: ${tx.hash.slice(0, 10)}...`,
        'info'
      );

      return progress;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      useToastStore.getState().addToast(`Transaction failed: ${errorMessage}`, 'error');

      return {
        hash: '',
        status: 'failed',
        confirmations: 0,
        timestamp: Date.now(),
        error: errorMessage,
      };
    }
  }

  /**
   * Track a transaction for confirmations
   */
  async trackTransaction(hash: string, callback?: ProgressCallback): Promise<void> {
    if (callback) {
      if (!this.transactionCallbacks.has(hash)) {
        this.transactionCallbacks.set(hash, []);
      }
      this.transactionCallbacks.get(hash)!.push(callback);
    }

    const provider = this.getCurrentProvider();
    if (!provider) return;

    try {
      const receipt = await provider.getTransactionReceipt(hash);

      if (receipt) {
        const progress: TransactionProgress = {
          hash,
          status: receipt.status === 1 ? 'confirmed' : 'failed',
          confirmations: receipt.confirmations || 0,
          gasUsed: receipt.gasUsed?.toString(),
          gasPrice: receipt.gasPrice?.toString(),
          blockNumber: receipt.blockNumber || undefined,
          timestamp: Date.now(),
        };

        // Notify all callbacks
        const callbacks = this.transactionCallbacks.get(hash) || [];
        callbacks.forEach(cb => cb(progress));

        // Clean up callbacks
        this.transactionCallbacks.delete(hash);

        // Update UI
        if (receipt.status === 1) {
          useToastStore.getState().addToast(
            `Transaction confirmed: ${hash.slice(0, 10)}...`,
            'success'
          );
        } else {
          useToastStore.getState().addToast(
            `Transaction failed: ${hash.slice(0, 10)}...`,
            'error'
          );
        }
      }
    } catch (error) {
      console.error('Error tracking transaction:', error);
    }
  }

  /**
   * Get gas estimation for a transaction
   */
  async estimateGas(tx: TransactionConfig): Promise<bigint> {
    const signer = this.getCurrentSigner();
    if (!signer) {
      throw new Error('No signer available');
    }

    try {
      const gasEstimate = await signer.estimateGas({
        to: tx.to,
        value: tx.value ? ethers.parseEther(tx.value) : undefined,
        data: tx.data,
      });

      return gasEstimate;
    } catch (error) {
      console.error('Gas estimation failed:', error);
      throw error;
    }
  }

  /**
   * Get optimized gas price for current network
   */
  async optimizeGasPrice(): Promise<string> {
    const provider = this.getCurrentProvider();
    if (!provider) {
      throw new Error('No provider available');
    }

    try {
      const feeData = await provider.getFeeData();

      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        // EIP-1559 transaction
        return feeData.maxFeePerGas.toString();
      } else if (feeData.gasPrice) {
        // Legacy transaction
        return feeData.gasPrice.toString();
      } else {
        throw new Error('Unable to get gas price');
      }
    } catch (error) {
      console.error('Gas price optimization failed:', error);
      throw error;
    }
  }

  /**
   * Switch to a different network
   */
  async switchNetwork(chainId: number): Promise<boolean> {
    return await web3Service.switchNetwork(chainId);
  }

  /**
   * Get contract instance
   */
  getContractInstance(contractName: string): ethers.Contract | null {
    return this.contracts.get(contractName) || null;
  }

  /**
   * Get current provider
   */
  getCurrentProvider(): ethers.BrowserProvider | null {
    return this.currentWallet ? this.providers.get(this.currentWallet) || null : null;
  }

  /**
   * Get current signer
   */
  getCurrentSigner(): ethers.JsonRpcSigner | null {
    return this.currentWallet ? this.signers.get(this.currentWallet) || null : null;
  }

  /**
   * Get wallet connection info
   */
  getWalletInfo(): WalletInfo | null {
    const provider = this.getCurrentProvider();
    const signer = this.getCurrentSigner();

    if (!provider || !signer) {
      return null;
    }

    // Return cached info or fetch new
    return web3Service.connectMetaMask();
  }

  /**
   * Get all connected wallets
   */
  getConnectedWallets(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Switch between connected wallets
   */
  async switchWallet(targetWallet: string): Promise<boolean> {
    if (!this.providers.has(targetWallet)) {
      throw new Error(`Wallet ${targetWallet} is not connected`);
    }

    this.currentWallet = targetWallet;
    const provider = this.providers.get(targetWallet)!;
    const network = await provider.getNetwork();

    await this.initializeContracts(Number(network.chainId));

    useToastStore.getState().addToast(`Switched to ${targetWallet}`, 'success');
    return true;
  }

  /**
   * Subscribe to contract events
   */
  subscribeToContractEvents(
    contract: string,
    eventName: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    callback: Function
  ): void {
    const contractInstance = this.contracts.get(contract);
    if (!contractInstance) {
      console.error(`Contract ${contract} not found`);
      return;
    }

    contractInstance.on(eventName, callback);
  }

  /**
   * Unsubscribe from contract events
   */
  unsubscribeFromEvents(contract: string): void {
    const contracts = this.eventListeners.get(contract) || [];
    contracts.forEach(c => c.removeAllListeners());
    this.eventListeners.delete(contract);
  }

  /**
   * Get network name from chain ID
   */
  getNetworkName(chainId: number): string {
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      3: 'Ropsten Testnet',
      4: 'Rinkeby Testnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet',
      56: 'BSC Mainnet',
      97: 'BSC Testnet',
      31337: 'Hardhat Network',
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.providers.clear();
    this.signers.clear();
    this.contracts.clear();
    this.currentWallet = null;
    this.currentChainId = null;
    this.transactionCallbacks.clear();

    // Remove all event listeners
    this.eventListeners.forEach(contracts => {
      contracts.forEach(contract => contract.removeAllListeners());
    });
    this.eventListeners.clear();

    useToastStore.getState().addToast('Wallet disconnected', 'info');
  }
}

// Export singleton instance
export const enhancedWeb3Service = new EnhancedWeb3Service();

// Export types for external use
export type {
  WalletConnectionInfo,
  TransactionConfig,
  ProgressCallback,
};