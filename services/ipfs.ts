import { create as createIPFSClient } from 'ipfs-http-client';

// IPFS Configuration
const IPFS_PROJECT_ID = import.meta.env.VITE_IPFS_PROJECT_ID || '';
const IPFS_PROJECT_SECRET = import.meta.env.VITE_IPFS_PROJECT_SECRET || '';
const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';

// Create IPFS client
const auth = IPFS_PROJECT_ID && IPFS_PROJECT_SECRET
    ? 'Basic ' + btoa(IPFS_PROJECT_ID + ':' + IPFS_PROJECT_SECRET)
    : undefined;

let ipfsClient: any = null;

try {
    ipfsClient = createIPFSClient({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: auth ? { authorization: auth } : undefined,
    });
} catch (error) {
    console.error('Failed to create IPFS client:', error);
}

export interface IPFSUploadResult {
    hash: string;
    url: string;
    size: number;
}

// IPFS Service
export const ipfsService = {
    // Upload file to IPFS
    async uploadFile(file: File): Promise<IPFSUploadResult | null> {
        if (!ipfsClient) {
            console.error('IPFS client not initialized');
            return this.uploadToFallbackIPFS(file);
        }

        try {
            const added = await ipfsClient.add(file, {
                progress: (bytes: number) => {
                    console.log(`Uploading: ${bytes} bytes`);
                },
            });

            const hash = added.path || added.cid.toString();

            return {
                hash,
                url: `${IPFS_GATEWAY}${hash}`,
                size: file.size,
            };
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            return this.uploadToFallbackIPFS(file);
        }
    },

    // Fallback: Use Pinata or Web3.Storage
    async uploadToFallbackIPFS(file: File): Promise<IPFSUploadResult | null> {
        try {
            // Use Pinata API as fallback
            const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
            const pinataSecretApiKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

            if (!pinataApiKey || !pinataSecretApiKey) {
                console.warn('No IPFS credentials configured. Using mock upload.');
                return this.mockUpload(file);
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretApiKey,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.IpfsHash) {
                return {
                    hash: data.IpfsHash,
                    url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
                    size: file.size,
                };
            }

            throw new Error('Failed to upload to Pinata');
        } catch (error) {
            console.error('Error in fallback IPFS upload:', error);
            return this.mockUpload(file);
        }
    },

    // Mock upload for development/testing
    mockUpload(file: File): IPFSUploadResult {
        const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        console.log('Using mock IPFS upload for:', file.name);

        return {
            hash: mockHash,
            url: URL.createObjectURL(file), // Use blob URL for testing
            size: file.size,
        };
    },

    // Upload JSON metadata to IPFS
    async uploadJSON(metadata: any): Promise<IPFSUploadResult | null> {
        const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
        const file = new File([blob], 'metadata.json', { type: 'application/json' });
        return this.uploadFile(file);
    },

    // Upload audio with metadata
    async uploadTrackWithMetadata(audioFile: File, metadata: {
        title: string;
        artist: string;
        description?: string;
        coverImage?: File;
    }): Promise<{
        audioHash: string;
        audioUrl: string;
        metadataHash?: string;
        metadataUrl?: string;
        coverHash?: string;
        coverUrl?: string;
    } | null> {
        try {
            // Upload audio file
            const audioResult = await this.uploadFile(audioFile);
            if (!audioResult) throw new Error('Failed to upload audio file');

            let coverResult = null;
            if (metadata.coverImage) {
                coverResult = await this.uploadFile(metadata.coverImage);
            }

            // Create and upload metadata
            const metadataObj = {
                name: metadata.title,
                description: metadata.description || '',
                artist: metadata.artist,
                audio: audioResult.hash,
                image: coverResult?.hash || '',
                properties: {
                    audioUrl: audioResult.url,
                    imageUrl: coverResult?.url || '',
                    fileSize: audioResult.size,
                    uploadedAt: new Date().toISOString(),
                },
            };

            const metadataResult = await this.uploadJSON(metadataObj);

            return {
                audioHash: audioResult.hash,
                audioUrl: audioResult.url,
                metadataHash: metadataResult?.hash,
                metadataUrl: metadataResult?.url,
                coverHash: coverResult?.hash,
                coverUrl: coverResult?.url,
            };
        } catch (error) {
            console.error('Error uploading track with metadata:', error);
            return null;
        }
    },

    // Get IPFS URL from hash
    getUrl(hash: string): string {
        return `${IPFS_GATEWAY}${hash}`;
    },

    // Pin file (keep it on IPFS permanently)
    async pinFile(hash: string): Promise<boolean> {
        if (!ipfsClient) return false;

        try {
            await ipfsClient.pin.add(hash);
            return true;
        } catch (error) {
            console.error('Error pinning file:', error);
            return false;
        }
    },
};
