// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/**
 * @title MusicNFT
 * @dev ERC-721 token representing unique music tracks as NFTs
 * Includes royalty support, metadata management, and marketplace functionality
 */
contract MusicNFT is ERC721, ERC721Enumerable, Ownable, Pausable, ERC2981 {
    using Counters for Counters.Counter;

    // Counter for token IDs
    Counters.Counter private _tokenIdCounter;

    // Struct to store music metadata
    struct MusicMetadata {
        string title;
        string artist;
        string genre;
        uint256 duration; // Duration in seconds
        string audioHash; // IPFS hash of audio file
        string coverHash; // IPFS hash of cover image
        uint256 price; // Price in ETH (wei)
        uint256 royaltyPercentage; // Royalty percentage (0-1000, where 100 = 10%)
        uint256 mintedAt; // Timestamp when minted
        bool isForSale;
        address currentOwner;
    }

    // Events
    event MusicNFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string title,
        string artist,
        string genre,
        uint256 price,
        uint256 royaltyPercentage
    );

    event MusicPurchased(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 price
    );

    event SaleStatusChanged(
        uint256 indexed tokenId,
        bool isForSale,
        uint256 price
    );

    event MetadataUpdated(
        uint256 indexed tokenId,
        string newAudioHash,
        string newCoverHash
    );

    // Mapping from token ID to metadata
    mapping(uint256 => MusicMetadata) public musicMetadata;

    // Mapping to track if token ID exists
    mapping(uint256 => bool) private _tokenExists;

    // Base URI for metadata
    string private _baseTokenURI;

    // Platform fee percentage (0-1000, where 100 = 10%)
    uint256 public platformFeePercentage = 25; // 2.5%

    // Platform wallet for receiving fees
    address public platformWallet;

    constructor(string memory baseTokenURI, address _platformWallet) ERC721("Music NFT", "MUSICNFT") {
        _baseTokenURI = baseTokenURI;
        platformWallet = _platformWallet;
        // Initialize counter to start from 1
        _tokenIdCounter.increment();
    }

    /**
     * @dev Mints a new Music NFT
     * @param to The address that will own the minted NFT
     * @param title Title of the music track
     * @param artist Artist name
     * @param genre Music genre
     * @param duration Duration in seconds
     * @param audioHash IPFS hash of the audio file
     * @param coverHash IPFS hash of the cover image
     * @param price Initial sale price in wei
     * @param royaltyPercentage Royalty percentage (0-1000, where 100 = 10%)
     */
    function mintMusicNFT(
        address to,
        string memory title,
        string memory artist,
        string memory genre,
        uint256 duration,
        string memory audioHash,
        string memory coverHash,
        uint256 price,
        uint256 royaltyPercentage
    ) external onlyOwner whenNotPaused returns (uint256) {
        require(to != address(0), "ERC721: mint to the zero address");
        require(royaltyPercentage <= 1000, "Royalty percentage too high");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(artist).length > 0, "Artist cannot be empty");
        require(duration > 0, "Duration must be greater than 0");

        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);

        // Store metadata
        musicMetadata[tokenId] = MusicMetadata({
            title: title,
            artist: artist,
            genre: genre,
            duration: duration,
            audioHash: audioHash,
            coverHash: coverHash,
            price: price,
            royaltyPercentage: royaltyPercentage,
            mintedAt: block.timestamp,
            isForSale: false,
            currentOwner: to
        });

        // Mark token as exists
        _tokenExists[tokenId] = true;

        // Increment counter for next token
        _tokenIdCounter.increment();

        emit MusicNFTMinted(tokenId, to, title, artist, genre, price, royaltyPercentage);

        return tokenId;
    }

    /**
     * @dev Purchase a music NFT
     * @param tokenId The ID of the NFT to purchase
     */
    function purchaseMusic(uint256 tokenId) external payable whenNotPaused {
        require(_tokenExists[tokenId], "Token does not exist");
        require(musicMetadata[tokenId].isForSale, "Token is not for sale");
        require(msg.value >= musicMetadata[tokenId].price, "Insufficient payment");
        require(musicMetadata[tokenId].currentOwner != msg.sender, "Cannot purchase your own token");

        uint256 price = musicMetadata[tokenId].price;
        address seller = musicMetadata[tokenId].currentOwner;

        // Calculate platform fee
        uint256 platformFee = (price * platformFeePercentage) / 1000;
        uint256 sellerAmount = price - platformFee;

        // Update token ownership
        musicMetadata[tokenId].currentOwner = msg.sender;
        musicMetadata[tokenId].isForSale = false;

        // Transfer the NFT
        _transfer(seller, msg.sender, tokenId);

        // Transfer payments
        if (platformFee > 0) {
            payable(platformWallet).transfer(platformFee);
        }
        if (sellerAmount > 0) {
            payable(seller).transfer(sellerAmount);
        }

        // Refund excess payment
        uint256 excess = msg.value - price;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }

        emit MusicPurchased(tokenId, seller, msg.sender, price);
        emit SaleStatusChanged(tokenId, false, 0);
    }

    /**
     * @dev Set the sale status and price for an NFT
     * @param tokenId The ID of the NFT
     * @param isForSale Whether the token is for sale
     * @param price The sale price in wei
     */
    function setForSale(uint256 tokenId, bool isForSale, uint256 price) external {
        require(_tokenExists[tokenId], "Token does not exist");
        require(musicMetadata[tokenId].currentOwner == msg.sender, "Not token owner");

        musicMetadata[tokenId].isForSale = isForSale;
        musicMetadata[tokenId].price = price;

        emit SaleStatusChanged(tokenId, isForSale, price);
    }

    /**
     * @dev Update metadata for an NFT
     * @param tokenId The ID of the NFT
     * @param newAudioHash New IPFS hash for audio
     * @param newCoverHash New IPFS hash for cover
     */
    function updateMetadata(
        uint256 tokenId,
        string memory newAudioHash,
        string memory newCoverHash
    ) external {
        require(_tokenExists[tokenId], "Token does not exist");
        require(musicMetadata[tokenId].currentOwner == msg.sender, "Not token owner");

        musicMetadata[tokenId].audioHash = newAudioHash;
        musicMetadata[tokenId].coverHash = newCoverHash;

        emit MetadataUpdated(tokenId, newAudioHash, newCoverHash);
    }

    /**
     * @dev Set platform fee percentage
     * @param _platformFeePercentage New fee percentage (0-1000, where 100 = 10%)
     */
    function setPlatformFeePercentage(uint256 _platformFeePercentage) external onlyOwner {
        require(_platformFeePercentage <= 1000, "Platform fee too high");
        platformFeePercentage = _platformFeePercentage;
    }

    /**
     * @dev Update platform wallet address
     * @param _platformWallet New platform wallet address
     */
    function setPlatformWallet(address _platformWallet) external onlyOwner {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }

    /**
     * @dev Pause all NFT operations (emergency use only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause NFT operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() public view override returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }

    /**
     * @dev Get metadata for a specific token
     * @param tokenId The ID of the token
     */
    function getMusicMetadata(uint256 tokenId) external view returns (MusicMetadata memory) {
        require(_tokenExists[tokenId], "Token does not exist");
        return musicMetadata[tokenId];
    }

    /**
     * @dev Check if token exists
     * @param tokenId The ID of the token
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _tokenExists[tokenId];
    }

    /**
     * @dev Get all tokens owned by an address
     * @param owner The address to query
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory result = new uint256[](balance);

        uint256 currentIndex = 0;
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            result[currentIndex] = tokenId;
            currentIndex++;
        }

        return result;
    }

    /**
     * @dev Get tokens for sale
     */
    function getTokensForSale() external view returns (uint256[] memory) {
        uint256 totalTokens = totalSupply();
        uint256[] memory tempResult = new uint256[](totalTokens);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_tokenExists[i] && musicMetadata[i].isForSale) {
                tempResult[currentIndex] = i;
                currentIndex++;
            }
        }

        // Resize array to actual length
        uint256[] memory result = new uint256[](currentIndex);
        for (uint256 i = 0; i < currentIndex; i++) {
            result[i] = tempResult[i];
        }

        return result;
    }

    /**
     * @dev Get tokens by artist
     * @param artist The artist name to search for
     */
    function getTokensByArtist(string memory artist) external view returns (uint256[] memory) {
        uint256 totalTokens = totalSupply();
        uint256[] memory tempResult = new uint256[](totalTokens);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_tokenExists[i] && keccak256(bytes(musicMetadata[i].artist)) == keccak256(bytes(artist))) {
                tempResult[currentIndex] = i;
                currentIndex++;
            }
        }

        // Resize array to actual length
        uint256[] memory result = new uint256[](currentIndex);
        for (uint256 i = 0; i < currentIndex; i++) {
            result[i] = tempResult[i];
        }

        return result;
    }

    /**
     * @dev Get tokens by genre
     * @param genre The genre to search for
     */
    function getTokensByGenre(string memory genre) external view returns (uint256[] memory) {
        uint256 totalTokens = totalSupply();
        uint256[] memory tempResult = new uint256[](totalTokens);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_tokenExists[i] && keccak256(bytes(musicMetadata[i].genre)) == keccak256(bytes(genre))) {
                tempResult[currentIndex] = i;
                currentIndex++;
            }
        }

        // Resize array to actual length
        uint256[] memory result = new uint256[](currentIndex);
        for (uint256 i = 0; i < currentIndex; i++) {
            result[i] = tempResult[i];
        }

        return result;
    }

    // Internal functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        if (from != address(0) && to != address(0)) {
            musicMetadata[tokenId].currentOwner = to;
        }
    }

    /**
     * @dev Set the base URI for token metadata
     * @param baseTokenURI The base URI
     */
    function _setBaseURI(string memory baseTokenURI) internal onlyOwner {
        _baseTokenURI = baseTokenURI;
    }

    /**
     * @dev Base URI for computing {tokenID}.json
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Required for ERC2981
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}