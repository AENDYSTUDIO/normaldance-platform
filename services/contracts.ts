import { ethers } from 'ethers';
import { enhancedWeb3Service, TransactionProgress, ProgressCallback } from './enhancedWeb3Service';
import { uploadToIPFS } from './ipfs';
import { useToastStore } from '../stores/useToastStore';

// Type definitions for contract interactions
export interface NFTMetadata {
  title: string;
  artist: string;
  genre: string;
  duration: number;
  audioFile?: File;
  coverImage?: File;
  audioHash?: string;
  coverHash?: string;
  price: string;
  royaltyPercentage: number;
}

export interface MintOptions {
  onProgress?: ProgressCallback;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface StakingPosition {
  positionId: number;
  amount: string;
  lockPeriod: number;
  startTime: number;
  endTime: number;
  rewards: string;
  apy: number;
  isEarlyWithdrawal: boolean;
  earlyWithdrawalPenalty: number;
}

export interface NFTToken {
  tokenId: number;
  owner: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
  audioHash: string;
  coverHash: string;
  price: string;
  royaltyPercentage: number;
  mintedAt: number;
  isForSale: boolean;
}

export interface NFTListing {
  tokenId: number;
  price: string;
  seller: string;
  isActive: boolean;
}

class ContractService {
  /**
   * Get contract instances
   */
  private getMusicNFTContract() {
    return enhancedWeb3Service.getContractInstance('MusicNFT');
  }

  private getPlatformContract() {
    return enhancedWeb3Service.getContractInstance('Platform');
  }

  private getStakingContract() {
    return enhancedWeb3Service.getContractInstance('Staking');
  }

  /**
   * Mint a new Music NFT with IPFS integration
   */
  async mintMusicNFT(
    metadata: NFTMetadata,
    options?: MintOptions
  ): Promise<string> {
    try {
      const contract = this.getMusicNFTContract();
      if (!contract) {
        throw new Error('MusicNFT contract not available');
      }

      // Upload audio and cover to IPFS if provided
      let audioHash = metadata.audioHash;
      let coverHash = metadata.coverHash;

      if (metadata.audioFile && !audioHash) {
        useToastStore.getState().addToast('Uploading audio file to IPFS...', 'info');
        const audioResult = await uploadToIPFS(metadata.audioFile);
        audioHash = audioResult.hash;
      }

      if (metadata.coverImage && !coverHash) {
        useToastStore.getState().addToast('Uploading cover image to IPFS...', 'info');
        const coverResult = await uploadToIPFS(metadata.coverImage);
        coverHash = coverResult.hash;
      }

      // Get current signer address
      const signer = enhancedWeb3Service.getCurrentSigner();
      if (!signer) {
        throw new Error('No wallet connected');
      }
      const minterAddress = await signer.getAddress();

      // Convert price to wei
      const priceWei = ethers.parseEther(metadata.price);
      const royaltyBps = metadata.royaltyPercentage * 10; // Convert percentage to basis points

      // Execute minting transaction
      useToastStore.getState().addToast('Minting NFT...', 'info');

      const tx = await contract.mintMusicNFT(
        minterAddress,
        metadata.title,
        metadata.artist,
        metadata.genre,
        metadata.duration,
        audioHash || '',
        coverHash || '',
        priceWei,
        royaltyBps,
        {
          gasLimit: options?.gasLimit ? BigInt(options.gasLimit) : undefined,
          maxFeePerGas: options?.maxFeePerGas ? BigInt(options.maxFeePerGas) : undefined,
          maxPriorityFeePerGas: options?.maxPriorityFeePerGas ? BigInt(options.maxPriorityFeePerGas) : undefined,
        }
      );

      // Track transaction progress
      if (options?.onProgress) {
        enhancedWeb3Service.trackTransaction(tx.hash, options.onProgress);
      }

      useToastStore.getState().addToast(`NFT minted successfully! TX: ${tx.hash.slice(0, 10)}...`, 'success');
      return tx.hash;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      useToastStore.getState().addToast(`Minting failed: ${errorMessage}`, 'error');
      throw error;
    }
  }

  /**
   * List an NFT for sale
   */
  async listNFT(tokenId: number, price: string): Promise<string> {
    try {
      const contract = this.getMusicNFTContract();
      if (!contract) {
        throw new Error('MusicNFT contract not available');
      }

      const priceWei = ethers.parseEther(price);

      const tx = await contract.setForSale(tokenId, true, priceWei);

      useToastStore.getState().addToast(`NFT listed for sale! TX: ${tx.hash.slice(0, 10)}...`, 'success');
      return tx.hash;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      useToastStore.getState().addToast(`Listing failed: ${errorMessage}`, 'error');
      throw error;
    }
  }

  /**
   * Purchase a music NFT
   */
  async purchaseNFT(tokenId: number, price: string): Promise<string> {
    try {
      const contract = this.getMusicNFTContract();
      if (!contract) {
        throw new Error('MusicNFT contract not available');
      }

      const priceWei = ethers.parseEther(price);

      const tx = await contract.purchaseMusic(tokenId, {
        value: priceWei,
      });

      useToastStore.getState().addToast(`NFT purchased! TX: ${tx.hash.slice(0, 10)}...`, 'success');
      return tx.hash;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      useToastStore.getState().addToast(`Purchase failed: ${errorMessage}`, 'error');
      throw error;
    }
  }

  /**
   * Get NFTs owned by an address
   */
  async getOwnedNFTs(address: string): Promise<NFTToken[]> {
    try {
      const contract = this.getMusicNFTContract();
      if (!contract) {
        return [];
      }

      const tokenIds = await contract.tokensOfOwner(address);
      const nfts: NFTToken[] = [];

      for (const tokenId of tokenIds) {
        const metadata = await contract.getMusicMetadata(tokenId);
        nfts.push({
          tokenId: Number(tokenId),
          owner: metadata.currentOwner,
          title: metadata.title,
          artist: metadata.artist,
          genre: metadata.genre,
          duration: Number(metadata.duration),
          audioHash: metadata.audioHash,
          coverHash: metadata.coverHash,
          price: ethers.formatEther(metadata.price),
          royaltyPercentage: Number(metadata.royaltyPercentage) / 10, // Convert from basis points
          mintedAt: Number(metadata.mintedAt),
          isForSale: metadata.isForSale,
        });
      }

      return nfts;
    } catch (error) {
      console.error('Error getting owned NFTs:', error);
      return [];
    }
  }

  /**
   * Get all NFTs available for sale
   */
  async getMarketplaceNFTs(): Promise<NFTToken[]> {
    try {
      const contract = this.getMusicNFTContract();
      if (!contract) {
        return [];
      }

      const tokenIds = await contract.getTokensForSale();
      const nfts: NFTToken[] = [];

      for (const tokenId of tokenIds) {
        const metadata = await contract.getMusicMetadata(tokenId);
        nfts.push({
          tokenId: Number(tokenId),
          owner: metadata.currentOwner,
          title: metadata.title,
          artist: metadata.artist,
          genre: metadata.genre,
          duration: Number(metadata.duration),
          audioHash: metadata.audioHash,
          coverHash: metadata.coverHash,
          price: ethers.formatEther(metadata.price),
          royaltyPercentage: Number(metadata.royaltyPercentage) / 10,
          mintedAt: Number(metadata.mintedAt),
          isForSale: metadata.isForSale,
        });
      }

      return nfts;
    } catch (error) {
      console.error('Error getting marketplace NFTs:', error);
      return [];
    }
  }

  /**
   * Get NFTs by artist
   */
  async getNFTsByArtist(artist: string): Promise<NFTToken[]> {
    try {
      const contract = this.getMusicNFTContract();
      if (!contract) {
        return [];
      }

      const tokenIds = await contract.getTokensByArtist(artist);
      const nfts: NFTToken[] = [];

      for (const tokenId of tokenIds) {
        const metadata = await contract.getMusicMetadata(tokenId);
        nfts.push({
          tokenId: Number(tokenId),
          owner: metadata.currentOwner,
          title: metadata.title,
          artist: metadata.artist,
          genre: metadata.genre,
          duration: Number(metadata.duration),
          audioHash: metadata.audioHash,
          coverHash: metadata.coverHash,
          price: ethers.formatEther(metadata.price),
          royaltyPercentage: Number(metadata.royaltyPercentage) / 10,
          mintedAt: Number(metadata.mintedAt),
          isForSale: metadata.isForSale,
        });
      }

      return nfts;
    } catch (error) {
      console.error('Error getting NFTs by artist:', error);
      return [];
    }
  }

  /**
   * Stake tokens in the staking contract
   */
  async stake(amount: string, lockPeriod: number): Promise<string> {
    try {
      const contract = this.getStakingContract();
      if (!contract) {
        throw new Error('Staking contract not available');
      }

      const amountWei = ethers.parseEther(amount);

      const tx = await contract.stake(amountWei, lockPeriod);

      useToastStore.getState().addToast(`Tokens staked! TX: ${tx.hash.slice(0, 10)}...`, 'success');
      return tx.hash;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      useToastStore.getState().addToast(`Staking failed: ${errorMessage}`, 'error');
      throw error;
    }
  }

  /**
   * Unstake tokens from the staking contract
   */
  async unstake(positionId: number): Promise<string> {
    try {
      const contract = this.getStakingContract();
      if (!contract) {
        throw new Error('Staking contract not available');
      }

      const tx = await contract.unstake(positionId);

      useToastStore.getState().addToast(`Tokens unstaked! TX: ${tx.hash.slice(0, 10)}...`, 'success');
      return tx.hash;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      useToastStore.getState().addToast(`Unstaking failed: ${errorMessage}`, 'error');
      throw error;
    }
  }

  /**
   * Claim rewards from staking position
   */
  async claimRewards(positionId: number): Promise<string> {
    try {
      const contract = this.getStakingContract();
      if (!contract) {
        throw new Error('Staking contract not available');
      }

      const tx = await contract.claimRewards(positionId);

      useToastStore.getState().addToast(`Rewards claimed! TX: ${tx.hash.slice(0, 10)}...`, 'success');
      return tx.hash;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      useToastStore.getState().addToast(`Claiming rewards failed: ${errorMessage}`, 'error');
      throw error;
    }
  }

  /**
   * Get staking positions for an address
   */
  async getStakingPositions(address: string): Promise<StakingPosition[]> {
    try {
      const contract = this.getStakingContract();
      if (!contract) {
        return [];
      }

      // This would depend on the actual implementation in the Staking contract
      // For now, returning a placeholder implementation
      try {
        const positions = await contract.getUserStakingPositions(address);

        return positions.map((pos: any) => ({
          positionId: Number(pos.positionId),
          amount: ethers.formatEther(pos.amount),
          lockPeriod: Number(pos.lockPeriodSeconds),
          startTime: Number(pos.startTime),
          endTime: Number(pos.endTime),
          rewards: ethers.formatEther(pos.totalRewards),
          apy: Number(pos.rewardRate) * 100, // Convert from basis points
          isEarlyWithdrawal: pos.isEarlyWithdrawalPenalty,
          earlyWithdrawalPenalty: Number(pos.earlyWithdrawalPenalty || 0),
        }));
      } catch (error) {
        console.error('Contract method not available, returning empty positions');
        return [];
      }
    } catch (error) {
      console.error('Error getting staking positions:', error);
      return [];
    }
  }

  /**
   * Register as an artist on the platform
   */
  async registerAsArtist(): Promise<string> {
    try {
      const contract = this.getPlatformContract();
      if (!contract) {
        throw new Error('Platform contract not available');
      }

      const tx = await contract.registerAsArtist();

      useToastStore.getState().addToast(`Registered as artist! TX: ${tx.hash.slice(0, 10)}...`, 'success');
      return tx.hash;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      useToastStore.getState().addToast(`Registration failed: ${errorMessage}`, 'error');
      throw error;
    }
  }

  /**
   * Vote on a platform proposal
   */
  async voteOnProposal(proposalId: number, support: boolean): Promise<string> {
    try {
      const contract = this.getPlatformContract();
      if (!contract) {
        throw new Error('Platform contract not available');
      }

      const tx = await contract.vote(proposalId, support);

      useToastStore.getState().addToast(`Vote submitted! TX: ${tx.hash.slice(0, 10)}...`, 'success');
      return tx.hash;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      useToastStore.getState().addToast(`Voting failed: ${errorMessage}`, 'error');
      throw error;
    }
  }

  /**
   * Generate NFT metadata for IPFS upload
   */
  generateNFTMetadata(audioFile: File, coverImage: File, metadata: NFTMetadata): any {
    return {
      name: metadata.title,
      description: `Music NFT by ${metadata.artist}`,
      external_url: `${window.location.origin}/nft/`, // Will be updated with actual token ID
      attributes: [
        {
          trait_type: 'Artist',
          value: metadata.artist,
        },
        {
          trait_type: 'Genre',
          value: metadata.genre,
        },
        {
          trait_type: 'Duration',
          value: `${metadata.duration}s`,
        },
        {
          trait_type: 'Royalty',
          value: `${metadata.royaltyPercentage}%`,
        },
      ],
      audio: {
        // Audio file will be uploaded separately
        ipfs_hash: metadata.audioHash,
        file_name: audioFile.name,
        file_type: audioFile.type,
      },
      image: {
        // Cover image will be uploaded separately
        ipfs_hash: metadata.coverHash,
        file_name: coverImage.name,
        file_type: coverImage.type,
      },
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Combined upload and mint operation
   */
  async uploadAndMint(metadata: NFTMetadata, options?: MintOptions): Promise<string> {
    try {
      if (!metadata.audioFile || !metadata.coverImage) {
        throw new Error('Audio file and cover image are required');
      }

      // Generate metadata JSON
      const metadataJSON = this.generateNFTMetadata(
        metadata.audioFile,
        metadata.coverImage,
        metadata
      );

      // Upload metadata to IPFS
      useToastStore.getState().addToast('Uploading metadata to IPFS...', 'info');
      const metadataBlob = new Blob([JSON.stringify(metadataJSON, null, 2)], {
        type: 'application/json',
      });
      const metadataFile = new File([metadataBlob], 'metadata.json', {
        type: 'application/json',
      });

      const metadataResult = await uploadToIPFS(metadataFile);

      // Update metadata with IPFS hash
      metadata.audioHash = metadataJSON.audio.ipfs_hash;
      metadata.coverHash = metadataJSON.image.ipfs_hash;

      // Mint the NFT
      return await this.mintMusicNFT(metadata, options);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      useToastStore.getState().addToast(`Upload and mint failed: ${errorMessage}`, 'error');
      throw error;
    }
  }
}

// Export singleton instance
export const contractService = new ContractService();

// Export types for external use
export type {
  NFTMetadata,
  MintOptions,
  StakingPosition,
  NFTToken,
  NFTListing,
};