// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MusicStaking
 * @dev Staking contract for Music Platform Token with dynamic rewards and multipliers
 */
contract MusicStaking is Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Staking token interface
    IERC20 public stakingToken;

    // Counter for staking IDs
    Counters.Counter private _stakeIds;

    // Staking periods and multipliers
    enum LockPeriod { ONE_MONTH, THREE_MONTHS, SIX_MONTHS, TWELVE_MONTHS }

    struct StakingTier {
        uint256 minAmount;
        uint256 baseAPY; // Basis points (10000 = 100%)
        uint256 bonusMultiplier; // Multiplier in basis points
    }

    struct StakingPosition {
        uint256 stakeId;
        address staker;
        uint256 amount;
        uint256 lockPeriodSeconds;
        uint256 startTime;
        uint256 endTime;
        uint256 lastClaimTime;
        uint256 totalRewards;
        uint256 rewardRate; // Rewards per second in basis points
        bool isActive;
        bool isEarlyWithdrawalPenalty;
        LockPeriod lockPeriod;
    }

    struct RewardPool {
        uint256 totalPool;
        uint256 distributedRewards;
        uint256 lastUpdate;
        uint256 totalStaked;
        uint256 rewardRate; // Annual rate in basis points
    }

    // Events
    event Staked(
        uint256 indexed stakeId,
        address indexed staker,
        uint256 amount,
        uint256 lockPeriodSeconds,
        uint256 rewardRate
    );

    event Withdrawn(
        uint256 indexed stakeId,
        address indexed staker,
        uint256 principalAmount,
        uint256 rewardAmount
    );

    event RewardsClaimed(
        uint256 indexed stakeId,
        address indexed staker,
        uint256 rewardAmount
    );

    event RewardPoolUpdated(
        uint256 newPoolAmount,
        uint256 newRewardRate
    );

    event StakingTierUpdated(
        LockPeriod indexed period,
        uint256 minAmount,
        uint256 baseAPY,
        uint256 bonusMultiplier
    );

    // Mappings
    mapping(uint256 => StakingPosition) public stakingPositions;
    mapping(address => uint256[]) public userStakes;
    mapping(LockPeriod => StakingTier) public stakingTiers;
    mapping(address => uint256) public totalStakedByUser;
    mapping(address => uint256) public totalRewardsEarned;

    // State variables
    RewardPool public rewardPool;
    uint256 public constant PRECISION = 10000;
    uint256 public constant SECONDS_PER_YEAR = 31536000;
    uint256 public earlyWithdrawalPenalty = 1000; // 10% penalty

    // Staking tier configurations
    uint256[] public lockPeriodDurations = [
        30 * 24 * 60 * 60,      // 1 month
        90 * 24 * 60 * 60,      // 3 months
        180 * 24 * 60 * 60,     // 6 months
        365 * 24 * 60 * 60      // 12 months
    ];

    constructor(address _stakingToken) {
        require(_stakingToken != address(0), "Invalid staking token address");
        stakingToken = IERC20(_stakingToken);

        // Initialize reward pool
        rewardPool = RewardPool({
            totalPool: 0,
            distributedRewards: 0,
            lastUpdate: block.timestamp,
            totalStaked: 0,
            rewardRate: 2000 // 20% base rate
        });

        // Initialize staking tiers
        _initializeStakingTiers();
    }

    /**
     * @dev Initialize default staking tiers
     */
    function _initializeStakingTiers() internal {
        stakingTiers[LockPeriod.ONE_MONTH] = StakingTier({
            minAmount: 100 * 10**18, // 100 tokens
            baseAPY: 1500, // 15% APY
            bonusMultiplier: 1100 // 1.1x multiplier
        });

        stakingTiers[LockPeriod.THREE_MONTHS] = StakingTier({
            minAmount: 500 * 10**18, // 500 tokens
            baseAPY: 2000, // 20% APY
            bonusMultiplier: 1300 // 1.3x multiplier
        });

        stakingTiers[LockPeriod.SIX_MONTHS] = StakingTier({
            minAmount: 1000 * 10**18, // 1000 tokens
            baseAPY: 2500, // 25% APY
            bonusMultiplier: 1600 // 1.6x multiplier
        });

        stakingTiers[LockPeriod.TWELVE_MONTHS] = StakingTier({
            minAmount: 2500 * 10**18, // 2500 tokens
            baseAPY: 3500, // 35% APY
            bonusMultiplier: 2000 // 2.0x multiplier
        });
    }

    /**
     * @dev Stake tokens for a specific lock period
     * @param amount Amount of tokens to stake
     * @param lockPeriod Lock period duration
     */
    function stake(
        uint256 amount,
        LockPeriod lockPeriod
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");

        StakingTier memory tier = stakingTiers[lockPeriod];
        require(amount >= tier.minAmount, "Amount below minimum for tier");

        // Calculate reward rate
        uint256 effectiveAPY = (tier.baseAPY * tier.bonusMultiplier) / PRECISION;
        uint256 rewardRate = (amount * effectiveAPY) / SECONDS_PER_YEAR / PRECISION;

        // Transfer tokens to this contract
        require(
            stakingToken.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        // Create staking position
        _stakeIds.increment();
        uint256 stakeId = _stakeIds.current();
        uint256 lockPeriodSeconds = lockPeriodDurations[uint256(lockPeriod)];
        uint256 endTime = block.timestamp + lockPeriodSeconds;

        stakingPositions[stakeId] = StakingPosition({
            stakeId: stakeId,
            staker: msg.sender,
            amount: amount,
            lockPeriodSeconds: lockPeriodSeconds,
            startTime: block.timestamp,
            endTime: endTime,
            lastClaimTime: block.timestamp,
            totalRewards: 0,
            rewardRate: rewardRate,
            isActive: true,
            isEarlyWithdrawalPenalty: false,
            lockPeriod: lockPeriod
        });

        // Update user's stake list
        userStakes[msg.sender].push(stakeId);
        totalStakedByUser[msg.sender] += amount;

        // Update global staking metrics
        rewardPool.totalStaked += amount;
        rewardPool.lastUpdate = block.timestamp;

        emit Staked(stakeId, msg.sender, amount, lockPeriodSeconds, rewardRate);
        return stakeId;
    }

    /**
     * @dev Withdraw staked tokens and rewards
     * @param stakeId ID of the staking position
     */
    function withdraw(uint256 stakeId) external nonReentrant {
        require(stakeId <= _stakeIds.current(), "Invalid stake ID");

        StakingPosition storage position = stakingPositions[stakeId];
        require(position.staker == msg.sender, "Not stake owner");
        require(position.isActive, "Position already withdrawn");

        // Calculate rewards
        uint256 rewards = _calculateRewards(position);
        uint256 withdrawalAmount = position.amount;

        // Apply early withdrawal penalty if applicable
        if (block.timestamp < position.endTime) {
            position.isEarlyWithdrawalPenalty = true;
            uint256 penalty = (position.amount * earlyWithdrawalPenalty) / PRECISION;
            withdrawalAmount -= penalty;
            rewardPool.totalPool += penalty; // Penalty goes to reward pool
        }

        // Update position state
        position.isActive = false;
        position.totalRewards += rewards;
        totalStakedByUser[msg.sender] -= position.amount;
        totalRewardsEarned[msg.sender] += rewards;

        // Update global metrics
        rewardPool.totalStaked -= position.amount;
        rewardPool.distributedRewards += rewards;
        rewardPool.lastUpdate = block.timestamp;

        // Transfer tokens
        if (withdrawalAmount > 0) {
            require(
                stakingToken.transfer(msg.sender, withdrawalAmount),
                "Principal transfer failed"
            );
        }

        if (rewards > 0 && rewardPool.totalPool >= rewards) {
            rewardPool.totalPool -= rewards;
            require(
                stakingToken.transfer(msg.sender, rewards),
                "Reward transfer failed"
            );
        }

        emit Withdrawn(stakeId, msg.sender, withdrawalAmount, rewards);
    }

    /**
     * @dev Claim rewards without withdrawing principal
     * @param stakeId ID of the staking position
     */
    function claimRewards(uint256 stakeId) external nonReentrant {
        require(stakeId <= _stakeIds.current(), "Invalid stake ID");

        StakingPosition storage position = stakingPositions[stakeId];
        require(position.staker == msg.sender, "Not stake owner");
        require(position.isActive, "Position not active");

        uint256 rewards = _calculateRewards(position);
        require(rewards > 0, "No rewards to claim");
        require(rewardPool.totalPool >= rewards, "Insufficient reward pool");

        // Update position and global state
        position.lastClaimTime = block.timestamp;
        position.totalRewards += rewards;
        totalRewardsEarned[msg.sender] += rewards;
        rewardPool.distributedRewards += rewards;
        rewardPool.totalPool -= rewards;

        // Transfer rewards
        require(
            stakingToken.transfer(msg.sender, rewards),
            "Reward transfer failed"
        );

        emit RewardsClaimed(stakeId, msg.sender, rewards);
    }

    /**
     * @dev Calculate rewards for a staking position
     * @param position Staking position to calculate rewards for
     */
    function _calculateRewards(StakingPosition storage position) internal view returns (uint256) {
        if (!position.isActive) return 0;

        uint256 timeElapsed = block.timestamp - position.lastClaimTime;
        if (timeElapsed <= 0) return 0;

        // Calculate base rewards
        uint256 baseRewards = (position.rewardRate * timeElapsed) / PRECISION;

        // Apply bonus multiplier based on lock period
        StakingTier memory tier = stakingTiers[position.lockPeriod];
        uint256 bonusRewards = (baseRewards * (tier.bonusMultiplier - PRECISION)) / PRECISION;

        return baseRewards + bonusRewards;
    }

    /**
     * @dev Get staking position information
     * @param stakeId ID of the staking position
     */
    function getStakingPosition(uint256 stakeId) external view returns (StakingPosition memory) {
        require(stakeId <= _stakeIds.current(), "Invalid stake ID");
        return stakingPositions[stakeId];
    }

    /**
     * @dev Get all staking positions for a user
     * @param user Address of the user
     */
    function getUserStakes(address user) external view returns (uint256[] memory) {
        return userStakes[user];
    }

    /**
     * @dev Get pending rewards for a staking position
     * @param stakeId ID of the staking position
     */
    function getPendingRewards(uint256 stakeId) external view returns (uint256) {
        require(stakeId <= _stakeIds.current(), "Invalid stake ID");
        StakingPosition storage position = stakingPositions[stakeId];
        return _calculateRewards(position);
    }

    /**
     * @dev Get user's total staked amount and pending rewards
     * @param user Address of the user
     */
    function getUserStakingInfo(address user) external view returns (
        uint256 totalStaked,
        uint256 totalPendingRewards
    ) {
        totalStaked = totalStakedByUser[user];

        uint256[] memory stakeIds = userStakes[user];
        for (uint256 i = 0; i < stakeIds.length; i++) {
            if (stakingPositions[stakeIds[i]].isActive) {
                totalPendingRewards += _calculateRewards(stakingPositions[stakeIds[i]]);
            }
        }
    }

    /**
     * @dev Add tokens to reward pool
     * @param amount Amount to add to reward pool
     */
    function addToRewardPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");

        require(
            stakingToken.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        rewardPool.totalPool += amount;
        rewardPool.lastUpdate = block.timestamp;

        emit RewardPoolUpdated(rewardPool.totalPool, rewardPool.rewardRate);
    }

    /**
     * @dev Update reward pool parameters
     * @param newRewardRate New annual reward rate in basis points
     */
    function updateRewardPool(uint256 newRewardRate) external onlyOwner {
        require(newRewardRate <= 10000, "Reward rate too high");

        rewardPool.rewardRate = newRewardRate;
        rewardPool.lastUpdate = block.timestamp;

        emit RewardPoolUpdated(rewardPool.totalPool, newRewardRate);
    }

    /**
     * @dev Update staking tier parameters
     * @param lockPeriod Lock period to update
     * @param minAmount New minimum amount
     * @param baseAPY New base APY in basis points
     * @param bonusMultiplier New bonus multiplier in basis points
     */
    function updateStakingTier(
        LockPeriod lockPeriod,
        uint256 minAmount,
        uint256 baseAPY,
        uint256 bonusMultiplier
    ) external onlyOwner {
        require(minAmount > 0, "Minimum amount must be greater than 0");
        require(baseAPY <= 10000, "Base APY too high");
        require(bonusMultiplier >= 1000, "Bonus multiplier too low");
        require(bonusMultiplier <= 5000, "Bonus multiplier too high");

        stakingTiers[lockPeriod] = StakingTier({
            minAmount: minAmount,
            baseAPY: baseAPY,
            bonusMultiplier: bonusMultiplier
        });

        emit StakingTierUpdated(lockPeriod, minAmount, baseAPY, bonusMultiplier);
    }

    /**
     * @dev Update early withdrawal penalty
     * @param newPenalty New penalty rate in basis points (1000 = 10%)
     */
    function updateEarlyWithdrawalPenalty(uint256 newPenalty) external onlyOwner {
        require(newPenalty <= 5000, "Penalty too high");
        earlyWithdrawalPenalty = newPenalty;
    }

    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency token recovery (for tokens other than staking token)
     * @param token Address of token to recover
     * @param amount Amount to recover
     */
    function emergencyTokenRecovery(address token, uint256 amount) external onlyOwner {
        require(token != address(stakingToken), "Cannot recover staking token");

        IERC20(token).transfer(owner(), amount);
    }
}