import { ethers } from 'ethers';

import { useToastStore } from '../stores/useToastStore';

// Web3 Wallet Types
export interface WalletInfo {
    address: string;
    balance: string;
    chainId: number;
    isConnected: boolean;
}

declare global {
    interface Window {
        ethereum?: any;
    }
}

// Web3 Service
export const web3Service = {
    // Check if MetaMask is installed
    isMetaMaskInstalled(): boolean {
        return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
    },

    // Connect to MetaMask
    async connectMetaMask(): Promise<WalletInfo | null> {
        if (!this.isMetaMaskInstalled()) {
            // Show toast instead of alert for better UX
            try {
                useToastStore.getState().addToast('Please install MetaMask to connect your wallet!', 'warning');
            } catch {
                // Fallback: console.warn if toast store is not available in this context
                console.warn('Please install MetaMask to connect your wallet!');
            }
            return null;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            const address = accounts[0];
            const balance = await provider.getBalance(address);
            const network = await provider.getNetwork();

            return {
                address,
                balance: ethers.formatEther(balance),
                chainId: Number(network.chainId),
                isConnected: true,
            };
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            return null;
        }
    },

    // Disconnect wallet
    async disconnect(): Promise<void> {
        // MetaMask doesn't have a programmatic disconnect
        // We just clear the local state
        console.log('Wallet disconnected');
    },

    // Get current account
    async getCurrentAccount(): Promise<string | null> {
        if (!this.isMetaMaskInstalled()) return null;

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_accounts',
            });
            return accounts.length > 0 ? accounts[0] : null;
        } catch (error) {
            console.error('Error getting current account:', error);
            return null;
        }
    },

    // Listen to account changes
    onAccountsChanged(callback: (accounts: string[]) => void): void {
        if (!this.isMetaMaskInstalled()) return;
        window.ethereum.on('accountsChanged', callback);
    },

    // Listen to chain changes
    onChainChanged(callback: (chainId: string) => void): void {
        if (!this.isMetaMaskInstalled()) return;
        window.ethereum.on('chainChanged', callback);
    },

    // Sign message (for authentication)
    async signMessage(message: string): Promise<string | null> {
        if (!this.isMetaMaskInstalled()) return null;

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const signature = await signer.signMessage(message);
            return signature;
        } catch (error) {
            console.error('Error signing message:', error);
            return null;
        }
    },

    // Verify signature
    verifySignature(message: string, signature: string, address: string): boolean {
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === address.toLowerCase();
        } catch (error) {
            console.error('Error verifying signature:', error);
            return false;
        }
    },

    // Send transaction
    async sendTransaction(to: string, amount: string): Promise<string | null> {
        if (!this.isMetaMaskInstalled()) return null;

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const tx = await signer.sendTransaction({
                to,
                value: ethers.parseEther(amount),
            });

            const receipt = await tx.wait();
            return receipt?.hash || null;
        } catch (error) {
            console.error('Error sending transaction:', error);
            return null;
        }
    },

    // Switch to a specific network
    async switchNetwork(chainId: number): Promise<boolean> {
        if (!this.isMetaMaskInstalled()) return false;

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
            return true;
        } catch (error: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (error.code === 4902) {
                console.error('Please add this network to MetaMask');
            }
            console.error('Error switching network:', error);
            return false;
        }
    },
};

// Supported Networks
export const NETWORKS = {
    ETHEREUM_MAINNET: { chainId: 1, name: 'Ethereum Mainnet' },
    ETHEREUM_SEPOLIA: { chainId: 11155111, name: 'Sepolia Testnet' },
    POLYGON_MAINNET: { chainId: 137, name: 'Polygon Mainnet' },
    POLYGON_MUMBAI: { chainId: 80001, name: 'Mumbai Testnet' },
    BSC_MAINNET: { chainId: 56, name: 'BSC Mainnet' },
    BSC_TESTNET: { chainId: 97, name: 'BSC Testnet' },
};
