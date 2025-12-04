// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MusicPlatformToken
 * @dev ERC20 token for platform governance and rewards
 */
contract MusicPlatformToken is ERC20, ERC20Burnable, Ownable, Pausable {
    constructor() ERC20("Music Platform Token", "MPT") {
        // Mint initial supply to contract owner
        _mint(msg.sender, 1000000 * 10**18); // 1 million tokens
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

/**
 * @title MusicPlatform
 * @dev Platform management contract for artist registration, rewards, and governance
 */
contract MusicPlatform is Ownable, Pausable, ReentrancyGuard {
    using ReentrancyGuard for ReentrancyGuard;

    // Platform token instance
    MusicPlatformToken public governanceToken;

    // Artist registration
    struct Artist {
        string name;
        address walletAddress;
        uint256 registrationDate;
        bool isActive;
        uint256 totalEarnings;
        uint256 tracksMinted;
        string bio;
        string avatarHash; // IPFS hash of avatar image
    }

    // Platform statistics
    struct PlatformStats {
        uint256 totalNFTs;
        uint256 totalArtists;
        uint256 totalRevenue;
        uint256 activeUsers;
        uint256 totalStreams;
    }

    // Reward distribution structure
    struct RewardPool {
        uint256 totalPool;
        uint256 distributedRewards;
        uint256 lastDistribution;
    }

    // Governance proposal
    struct Proposal {
        uint256 proposalId;
        address proposer;
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        uint256 requiredVotes;
        bool isCompleted;
    }

    // Mappings
    mapping(address => Artist) public artists;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    mapping(string => bool) public genreExists;
    mapping(uint256 => RewardPool) public rewardPools; // poolId -> reward pool

    // State variables
    PlatformStats public stats;
    uint256 public totalProposals;
    uint256 public votingPeriod = 7 days;
    uint256 public minVotingPower = 1000 * 10**18; // 1000 MPT tokens

    // Events
    event ArtistRegistered(
        address indexed artist,
        string name,
        string bio
    );

    event ArtistUpdated(
        address indexed artist,
        string name,
        string bio,
        string avatarHash
    );

    event RewardDistributed(
        address indexed to,
        uint256 amount,
        string reason
    );

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        string description
    );

    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );

    event ProposalExecuted(
        uint256 indexed proposalId,
        bool passed
    );

    modifier onlyArtist() {
        require(artists[msg.sender].isActive, "Not a registered artist");
        _;
    }

    modifier onlyRegisteredArtist(address _artist) {
        require(artists[_artist].isActive, "Artist not registered");
        _;
    }

    constructor() {
        governanceToken = new MusicPlatformToken();
        stats = PlatformStats(0, 0, 0, 0, 0);

        // Initialize common music genres
        genreExists["Electronic"] = true;
        genreExists["Hip Hop"] = true;
        genreExists["Rock"] = true;
        genreExists["Pop"] = true;
        genreExists["Jazz"] = true;
        genreExists["Classical"] = true;
        genreExists["Country"] = true;
        genreExists["R&B"] = true;
        genreExists["Electronic"] = true;
        genreExists["Latin"] = true;
        genreExists["Reggae"] = true;
    }

    /**
     * @dev Register a new artist on the platform
     * @param artistAddress Artist's wallet address
     * @param name Artist name
     * @param bio Artist biography
     * @param avatarHash IPFS hash of avatar image
     */
    function registerArtist(
        address artistAddress,
        string memory name,
        string memory bio,
        string memory avatarHash
    ) external whenNotPaused {
        require(artistAddress != address(0), "Invalid artist address");
        require(!artists[artistAddress].isActive, "Artist already registered");
        require(bytes(name).length > 0, "Name cannot be empty");

        artists[artistAddress] = Artist({
            name: name,
            walletAddress: artistAddress,
            registrationDate: block.timestamp,
            isActive: true,
            totalEarnings: 0,
            tracksMinted: 0,
            bio: bio,
            avatarHash: avatarHash
        });

        stats.totalArtists++;

        emit ArtistRegistered(artistAddress, name, bio);
    }

    /**
     * @dev Update artist information
     * @param artistAddress Artist's wallet address
     * @param name New artist name
     * @param bio New artist biography
     * @param avatarHash New IPFS hash for avatar
     */
    function updateArtist(
        address artistAddress,
        string memory name,
        string memory bio,
        string memory avatarHash
    ) external onlyRegisteredArtist(artistAddress) {
        artists[artistAddress].name = name;
        artists[artistAddress].bio = bio;
        artists[artistAddress].avatarHash = avatarHash;

        emit ArtistUpdated(artistAddress, name, bio, avatarHash);
    }

    /**
     * @dev Add a new music genre
     * @param genre Genre name
     */
    function addGenre(string memory genre) external onlyOwner {
        require(bytes(genre).length > 0, "Genre cannot be empty");
        require(!genreExists[genre], "Genre already exists");

        genreExists[genre] = true;
    }

    /**
     * @dev Remove a music genre
     * @param genre Genre name to remove
     */
    function removeGenre(string memory genre) external onlyOwner {
        genreExists[genre] = false;
    }

    /**
     * @dev Update platform statistics
     * @param totalNFTs Total NFTs minted
     * @param totalRevenue Total platform revenue
     * @param totalStreams Total streams tracked
     */
    function updatePlatformStats(
        uint256 totalNFTs,
        uint256 totalRevenue,
        uint256 totalStreams
    ) external onlyOwner {
        stats.totalNFTs = totalNFTs;
        stats.totalRevenue = totalRevenue;
        stats.totalStreams = totalStreams;
    }

    /**
     * @dev Increment active users count
     */
    function incrementActiveUsers() external onlyOwner {
        stats.activeUsers++;
    }

    /**
     * @dev Create a new governance proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param requiredVotes Minimum votes required for execution
     */
    function createProposal(
        string memory title,
        string memory description,
        uint256 requiredVotes
    ) external returns (uint256) {
        require(governanceToken.balanceOf(msg.sender) >= minVotingPower, "Insufficient voting power");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");

        totalProposals++;
        uint256 proposalId = totalProposals;

        proposals[proposalId] = Proposal({
            proposalId: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + votingPeriod,
            executed: false,
            requiredVotes: requiredVotes,
            isCompleted: false
        });

        emit ProposalCreated(proposalId, msg.sender, title, description);
        return proposalId;
    }

    /**
     * @dev Vote on a proposal
     * @param proposalId The ID of the proposal
     * @param support Whether to vote for (true) or against (false) the proposal
     */
    function vote(uint256 proposalId, bool support) external nonReentrant {
        require(proposalId <= totalProposals, "Proposal does not exist");
        require(!proposals[proposalId].executed, "Proposal already executed");
        require(block.timestamp <= proposals[proposalId].deadline, "Voting period ended");
        require(!hasVoted[msg.sender][proposalId], "Already voted");

        uint256 votingPower = governanceToken.balanceOf(msg.sender);
        require(votingPower > 0, "No voting power");

        hasVoted[msg.sender][proposalId] = true;

        if (support) {
            proposals[proposalId].votesFor += votingPower;
        } else {
            proposals[proposalId].votesAgainst += votingPower;
        }

        emit Voted(proposalId, msg.sender, support, votingPower);

        // Auto-execute if voting deadline passes and majority reached
        if (block.timestamp >= proposals[proposalId].deadline) &&
            proposals[proposalId].votesFor > proposals[proposalId].votesAgainst) {
            _executeProposal(proposalId);
        }
    }

    /**
     * @dev Execute a proposal that has passed voting
     * @param proposalId The ID of the proposal to execute
     */
    function _executeProposal(uint256 proposalId) internal {
        require(proposals[proposalId].votesFor > proposals[proposalId].votesAgainst, "Proposal did not pass");
        require(!proposals[proposalId].executed, "Proposal already executed");
        require(block.timestamp >= proposals[proposalId].deadline, "Voting period not ended");

        proposals[proposalId].executed = true;
        proposals[proposalId].isCompleted = true;

        emit ProposalExecuted(proposalId, true);
    }

    /**
     * @dev Add rewards to a reward pool
     * @param poolId ID of the reward pool
     * @param amount Amount to add to the pool
     */
    function addToRewardPool(uint256 poolId, uint256 amount) external onlyOwner {
        rewardPools[poolId].totalPool += amount;
        rewardPools[poolId].lastDistribution = block.timestamp;
    }

    /**
     * @dev Distribute rewards from a pool
     * @param poolId ID of the reward pool
     * @param to Recipient address
     * @param amount Amount to distribute
     * @param reason Reason for distribution
     */
    function distributeFromPool(
        uint256 poolId,
        address to,
        uint256 amount,
        string memory reason
    ) external onlyOwner nonReentrant {
        require(rewardPools[poolId].totalPool >= amount, "Insufficient pool balance");

        rewardPools[poolId].totalPool -= amount;
        rewardPools[poolId].distributedRewards += amount;
        rewardPools[poolId].lastDistribution = block.timestamp;

        governanceToken.transfer(to, amount);

        emit RewardDistributed(to, amount, reason);
    }

    /**
     * @dev Distribute rewards to artist
     * @param artist Artist's wallet address
     * @param amount Amount of rewards to distribute
     * @param reason Reason for the rewards
     */
    function distributeRewardsToArtist(
        address artist,
        uint256 amount,
        string memory reason
    ) external onlyOwner nonReentrant {
        require(artists[artist].isActive, "Artist not registered");

        artists[artist].totalEarnings += amount;

        governanceToken.transfer(artist, amount);

        emit RewardDistributed(artist, amount, reason);
    }

    /**
     * @dev Get artist information
     * @param artistAddress Artist's wallet address
     */
    function getArtist(address artistAddress) external view returns (Artist memory) {
        return artists[artistAddress];
    }

    /**
     * @dev Get proposal information
     * @param proposalId The ID of the proposal
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        require(proposalId <= totalProposals, "Proposal does not exist");
        return proposals[proposalId];
    }

    /**
     * @dev Get reward pool information
     * @param poolId ID of the reward pool
     */
    function getRewardPool(uint256 poolId) external view returns (RewardPool memory) {
        return rewardPools[poolId];
    }

    /**
     * @dev Check if genre exists
     * @param genre Genre name
     */
    function genreExistsCheck(string memory genre) external view returns (bool) {
        return genreExists[genre];
    }

    /**
     * @dev Get all registered artists
     */
    function getAllArtists() external view returns (address[] memory) {
        uint256 count = 0;

        // Count active artists
        for (uint256 i = 1; i < 10000; i++) { // Reasonable upper limit
            address potentialArtist = address(uint160(i));
            if (artists[potentialArtist].isActive) {
                count++;
            }
        }

        address[] memory result = new address[](count);
        uint256 index = 0;

        for (uint256 i = 1; i < 10000; i++) {
            address potentialArtist = address(uint160(i));
            if (artists[potentialArtist].isActive) {
                result[index] = potentialArtist;
                index++;
            }
        }

        return result;
    }

    /**
     * @dev Pause all platform operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause platform operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}