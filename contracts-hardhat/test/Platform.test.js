const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

describe('MusicPlatform', function () {
  let platform;
  let governanceToken;
  let owner;
  let artist1;
  let artist2;
  let voter1;
  let voter2;

  beforeEach(async function () {
    [owner, artist1, artist2, voter1, voter2] = await ethers.getSigners();

    const Platform = await ethers.getContractFactory('MusicPlatform');
    platform = await Platform.deploy();
    await platform.deployed();

    // Get governance token address
    const governanceTokenAddress = await platform.governanceToken();
    const GovernanceToken = await ethers.getContractFactory('MusicPlatformToken');
    governanceToken = await GovernanceToken.attach(governanceTokenAddress);
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await platform.owner()).to.equal(owner.address);
    });

    it('Should create governance token', async function () {
      const tokenAddress = await platform.governanceToken();
      expect(tokenAddress).to.not.equal(ethers.constants.AddressZero);
    });

    it('Should initialize with correct stats', async function () {
      const stats = await platform.stats();
      expect(stats.totalNFTs).to.equal(0);
      expect(stats.totalArtists).to.equal(0);
      expect(stats.totalRevenue).to.equal(0);
      expect(stats.activeUsers).to.equal(0);
      expect(stats.totalStreams).to.equal(0);
    });

    it('Should initialize with default genres', async function () {
      expect(await platform.genreExistsCheck('Electronic')).to.be.true;
      expect(await platform.genreExistsCheck('Hip Hop')).to.be.true;
      expect(await platform.genreExistsCheck('Rock')).to.be.true;
      expect(await platform.genreExistsCheck('Unknown')).to.be.false;
    });
  });

  describe('Artist Registration', function () {
    const artistData = {
      name: 'Test Artist',
      bio: 'A talented musician',
      avatarHash: 'QmAvatarHash',
    };

    it('Should register a new artist', async function () {
      await expect(
        platform.registerArtist(
          artist1.address,
          artistData.name,
          artistData.bio,
          artistData.avatarHash
        )
      )
        .to.emit(platform, 'ArtistRegistered')
        .withArgs(artist1.address, artistData.name, artistData.bio);

      const artist = await platform.getArtist(artist1.address);
      expect(artist.name).to.equal(artistData.name);
      expect(artist.bio).to.equal(artistData.bio);
      expect(artist.avatarHash).to.equal(artistData.avatarHash);
      expect(artist.isActive).to.be.true;
      expect(artist.totalEarnings).to.equal(0);
      expect(artist.tracksMinted).to.equal(0);

      const stats = await platform.stats();
      expect(stats.totalArtists).to.equal(1);
    });

    it('Should fail to register with invalid address', async function () {
      await expect(
        platform.registerArtist(ethers.constants.AddressZero, 'Artist', 'Bio', 'Avatar')
      ).to.be.revertedWith('Invalid artist address');
    });

    it('Should fail to register duplicate artist', async function () {
      await platform.registerArtist(artist1.address, 'Artist', 'Bio', 'Avatar');

      await expect(
        platform.registerArtist(artist1.address, 'Artist 2', 'Bio 2', 'Avatar 2')
      ).to.be.revertedWith('Artist already registered');
    });

    it('Should fail to register with empty name', async function () {
      await expect(
        platform.registerArtist(artist1.address, '', 'Bio', 'Avatar')
      ).to.be.revertedWith('Name cannot be empty');
    });

    it('Should allow artist to update their information', async function () {
      await platform.registerArtist(
        artist1.address,
        'Original Name',
        'Original Bio',
        'Original Avatar'
      );

      const updatedData = {
        name: 'Updated Artist',
        bio: 'Updated biography',
        avatarHash: 'QmUpdatedAvatar',
      };

      await expect(
        platform
          .connect(artist1)
          .updateArtist(artist1.address, updatedData.name, updatedData.bio, updatedData.avatarHash)
      )
        .to.emit(platform, 'ArtistUpdated')
        .withArgs(artist1.address, updatedData.name, updatedData.bio, updatedData.avatarHash);

      const artist = await platform.getArtist(artist1.address);
      expect(artist.name).to.equal(updatedData.name);
      expect(artist.bio).to.equal(updatedData.bio);
      expect(artist.avatarHash).to.equal(updatedData.avatarHash);
    });

    it('Should prevent non-artists from updating artist info', async function () {
      await platform.registerArtist(artist1.address, 'Artist', 'Bio', 'Avatar');

      await expect(
        platform.connect(artist2).updateArtist(artist1.address, 'Updated', 'Updated', 'Updated')
      ).to.be.revertedWith('Artist not registered');
    });
  });

  describe('Genre Management', function () {
    it('Should allow owner to add new genre', async function () {
      await platform.addGenre('Jazz');
      expect(await platform.genreExistsCheck('Jazz')).to.be.true;
    });

    it('Should prevent adding duplicate genre', async function () {
      await platform.addGenre('Jazz');

      await expect(platform.addGenre('Jazz')).to.be.revertedWith('Genre already exists');
    });

    it('Should allow owner to remove genre', async function () {
      await platform.removeGenre('Electronic');
      expect(await platform.genreExistsCheck('Electronic')).to.be.false;
    });

    it('Should prevent non-owner from adding genre', async function () {
      await expect(platform.connect(artist1).addGenre('Custom Genre')).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
  });

  describe('Platform Statistics', function () {
    it('Should allow owner to update platform stats', async function () {
      const newStats = {
        totalNFTs: 100,
        totalRevenue: ethers.utils.parseEther('10'),
        totalStreams: 1000,
      };

      await platform.updatePlatformStats(
        newStats.totalNFTs,
        newStats.totalRevenue,
        newStats.totalStreams
      );

      const stats = await platform.stats();
      expect(stats.totalNFTs).to.equal(newStats.totalNFTs);
      expect(stats.totalRevenue).to.equal(newStats.totalRevenue);
      expect(stats.totalStreams).to.equal(newStats.totalStreams);
    });

    it('Should allow owner to increment active users', async function () {
      await platform.incrementActiveUsers();
      const stats = await platform.stats();
      expect(stats.activeUsers).to.equal(1);

      await platform.incrementActiveUsers();
      const stats2 = await platform.stats();
      expect(stats2.activeUsers).to.equal(2);
    });
  });

  describe('Governance Proposals', function () {
    const minVotingPower = ethers.utils.parseEther('1000'); // 1000 MPT

    beforeEach(async function () {
      // Transfer tokens to voters
      await governanceToken.transfer(voter1.address, minVotingPower);
      await governanceToken.transfer(voter2.address, minVotingPower);
    });

    it('Should allow token holder to create proposal', async function () {
      const proposalData = {
        title: 'Platform Improvement Proposal',
        description: 'This proposal suggests improvements to the platform',
        requiredVotes: ethers.utils.parseEther('500'),
      };

      const tx = await platform
        .connect(voter1)
        .createProposal(proposalData.title, proposalData.description, proposalData.requiredVotes);

      await expect(tx)
        .to.emit(platform, 'ProposalCreated')
        .withArgs(1, voter1.address, proposalData.title, proposalData.description);

      const proposal = await platform.getProposal(1);
      expect(proposal.proposalId).to.equal(1);
      expect(proposal.proposer).to.equal(voter1.address);
      expect(proposal.title).to.equal(proposalData.title);
      expect(proposal.description).to.equal(proposalData.description);
      expect(proposal.requiredVotes).to.equal(proposalData.requiredVotes);
      expect(proposal.votesFor).to.equal(0);
      expect(proposal.votesAgainst).to.equal(0);
      expect(proposal.executed).to.be.false;
    });

    it('Should prevent user with insufficient voting power from creating proposal', async function () {
      await expect(
        platform
          .connect(artist1)
          .createProposal('Title', 'Description', ethers.utils.parseEther('100'))
      ).to.be.revertedWith('Insufficient voting power');
    });

    it('Should allow voting on active proposal', async function () {
      // Create proposal
      await platform
        .connect(voter1)
        .createProposal('Test Proposal', 'Test Description', ethers.utils.parseEther('500'));

      // Vote in favor
      await expect(platform.connect(voter1).vote(1, true))
        .to.emit(platform, 'Voted')
        .withArgs(1, voter1.address, true, minVotingPower);

      const proposal = await platform.getProposal(1);
      expect(proposal.votesFor).to.equal(minVotingPower);
      expect(proposal.votesAgainst).to.equal(0);
    });

    it('Should prevent double voting', async function () {
      await platform
        .connect(voter1)
        .createProposal('Test Proposal', 'Test Description', ethers.utils.parseEther('500'));

      await platform.connect(voter1).vote(1, true);

      await expect(platform.connect(voter1).vote(1, false)).to.be.revertedWith('Already voted');
    });

    it('Should prevent voting after deadline', async function () {
      await platform
        .connect(voter1)
        .createProposal('Test Proposal', 'Test Description', ethers.utils.parseEther('500'));

      // Fast forward past voting period
      await time.increase(8 * 24 * 60 * 60); // 8 days

      await expect(platform.connect(voter2).vote(1, true)).to.be.revertedWith(
        'Voting period ended'
      );
    });
  });

  describe('Reward Distribution', function () {
    beforeEach(async function () {
      await platform.registerArtist(artist1.address, 'Artist', 'Bio', 'Avatar');
    });

    it('Should allow owner to distribute rewards to artist', async function () {
      const rewardAmount = ethers.utils.parseEther('100');
      const reason = 'Monthly streaming royalties';

      await expect(platform.distributeRewardsToArtist(artist1.address, rewardAmount, reason))
        .to.emit(platform, 'RewardDistributed')
        .withArgs(artist1.address, rewardAmount, reason);

      const artist = await platform.getArtist(artist1.address);
      expect(artist.totalEarnings).to.equal(rewardAmount);
    });

    it('Should prevent distributing rewards to unregistered artist', async function () {
      await expect(
        platform.distributeRewardsToArtist(
          artist2.address,
          ethers.utils.parseEther('100'),
          'Reason'
        )
      ).to.be.revertedWith('Artist not registered');
    });

    it('Should allow owner to manage reward pools', async function () {
      const poolId = 1;
      const amount = ethers.utils.parseEther('1000');

      await platform.addToRewardPool(poolId, amount);

      const rewardPool = await platform.getRewardPool(poolId);
      expect(rewardPool.totalPool).to.equal(amount);
    });

    it('Should allow distributing from reward pool', async function () {
      const poolId = 1;
      const poolAmount = ethers.utils.parseEther('1000');
      const distributeAmount = ethers.utils.parseEther('100');

      // Add to pool first
      await governanceToken.transfer(platform.address, poolAmount);
      await platform.addToRewardPool(poolId, poolAmount);

      await expect(platform.distributeFromPool(poolId, artist1.address, distributeAmount, 'Reward'))
        .to.emit(platform, 'RewardDistributed')
        .withArgs(artist1.address, distributeAmount, 'Reward');

      const rewardPool = await platform.getRewardPool(poolId);
      expect(rewardPool.totalPool).to.equal(poolAmount.sub(distributeAmount));
      expect(rewardPool.distributedRewards).to.equal(distributeAmount);
    });
  });

  describe('Platform Management', function () {
    it('Should allow owner to pause and unpause', async function () {
      await platform.pause();
      expect(await platform.paused()).to.be.true;

      await platform.unpause();
      expect(await platform.paused()).to.be.false;
    });

    it('Should prevent operations when paused', async function () {
      await platform.pause();

      await expect(
        platform.registerArtist(artist1.address, 'Artist', 'Bio', 'Avatar')
      ).to.be.revertedWith('Pausable: paused');
    });

    it('Should prevent non-owner from pausing', async function () {
      await expect(platform.connect(artist1).pause()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
  });

  describe('Artist Discovery', function () {
    it('Should return all registered artists', async function () {
      // Register multiple artists
      await platform.registerArtist(artist1.address, 'Artist 1', 'Bio 1', 'Avatar 1');
      await platform.registerArtist(artist2.address, 'Artist 2', 'Bio 2', 'Avatar 2');

      const artists = await platform.getAllArtists();
      expect(artists.length).to.be.greaterThanOrEqual(2);
      expect(artists).to.include(artist1.address);
      expect(artists).to.include(artist2.address);
    });
  });
});
