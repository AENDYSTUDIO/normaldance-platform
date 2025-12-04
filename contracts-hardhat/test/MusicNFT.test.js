const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

describe('MusicNFT', function () {
  let musicNFT;
  let owner;
  let artist1;
  let artist2;
  let buyer;
  let platformWallet;

  const baseTokenURI = 'https://api.normaldance.io/metadata/';

  beforeEach(async function () {
    [owner, artist1, artist2, buyer, platformWallet] = await ethers.getSigners();

    const MusicNFT = await ethers.getContractFactory('MusicNFT');
    musicNFT = await MusicNFT.deploy(baseTokenURI, platformWallet.address);
    await musicNFT.deployed();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await musicNFT.owner()).to.equal(owner.address);
    });

    it('Should set the right base token URI', async function () {
      expect(await musicNFT._baseURI()).to.equal(baseTokenURI);
    });

    it('Should set the right platform wallet', async function () {
      expect(await musicNFT.platformWallet()).to.equal(platformWallet.address);
    });
  });

  describe('Minting', function () {
    const musicMetadata = {
      title: 'Summer Vibes',
      artist: 'Test Artist',
      genre: 'Electronic',
      duration: 180,
      audioHash: 'QmTestAudioHash',
      coverHash: 'QmTestCoverHash',
      price: ethers.utils.parseEther('0.1'),
      royaltyPercentage: 500, // 5%
    };

    it('Should mint a new Music NFT', async function () {
      const tx = await musicNFT.mintMusicNFT(
        artist1.address,
        musicMetadata.title,
        musicMetadata.artist,
        musicMetadata.genre,
        musicMetadata.duration,
        musicMetadata.audioHash,
        musicMetadata.coverHash,
        musicMetadata.price,
        musicMetadata.royaltyPercentage
      );

      await expect(tx)
        .to.emit(musicNFT, 'MusicNFTMinted')
        .withArgs(
          1,
          artist1.address,
          musicMetadata.title,
          musicMetadata.artist,
          musicMetadata.genre,
          musicMetadata.price,
          musicMetadata.royaltyPercentage
        );

      expect(await musicNFT.ownerOf(1)).to.equal(artist1.address);
      expect(await musicNFT.totalSupply()).to.equal(1);
    });

    it('Should fail to mint with invalid royalty percentage', async function () {
      await expect(
        musicNFT.mintMusicNFT(
          artist1.address,
          musicMetadata.title,
          musicMetadata.artist,
          musicMetadata.genre,
          musicMetadata.duration,
          musicMetadata.audioHash,
          musicMetadata.coverHash,
          musicMetadata.price,
          1500 // 15% - too high
        )
      ).to.be.revertedWith('Royalty percentage too high');
    });

    it('Should fail to mint with empty title', async function () {
      await expect(
        musicNFT.mintMusicNFT(
          artist1.address,
          '',
          musicMetadata.artist,
          musicMetadata.genre,
          musicMetadata.duration,
          musicMetadata.audioHash,
          musicMetadata.coverHash,
          musicMetadata.price,
          musicMetadata.royaltyPercentage
        )
      ).to.be.revertedWith('Title cannot be empty');
    });

    it('Should store metadata correctly', async function () {
      await musicNFT.mintMusicNFT(
        artist1.address,
        musicMetadata.title,
        musicMetadata.artist,
        musicMetadata.genre,
        musicMetadata.duration,
        musicMetadata.audioHash,
        musicMetadata.coverHash,
        musicMetadata.price,
        musicMetadata.royaltyPercentage
      );

      const metadata = await musicNFT.getMusicMetadata(1);
      expect(metadata.title).to.equal(musicMetadata.title);
      expect(metadata.artist).to.equal(musicMetadata.artist);
      expect(metadata.genre).to.equal(musicMetadata.genre);
      expect(metadata.duration).to.equal(musicMetadata.duration);
      expect(metadata.audioHash).to.equal(musicMetadata.audioHash);
      expect(metadata.coverHash).to.equal(musicMetadata.coverHash);
      expect(metadata.price).to.equal(musicMetadata.price);
      expect(metadata.royaltyPercentage).to.equal(musicMetadata.royaltyPercentage);
      expect(metadata.currentOwner).to.equal(artist1.address);
      expect(metadata.isForSale).to.be.false;
    });
  });

  describe('Purchasing', function () {
    const price = ethers.utils.parseEther('0.1');

    beforeEach(async function () {
      await musicNFT.mintMusicNFT(
        artist1.address,
        'Test Song',
        'Test Artist',
        'Electronic',
        180,
        'QmTestAudio',
        'QmTestCover',
        price,
        500
      );
    });

    it('Should allow setting NFT for sale', async function () {
      await musicNFT.connect(artist1).setForSale(1, true, price);
      const metadata = await musicNFT.getMusicMetadata(1);
      expect(metadata.isForSale).to.be.true;
      expect(metadata.price).to.equal(price);
    });

    it('Should allow purchasing NFT when for sale', async function () {
      await musicNFT.connect(artist1).setForSale(1, true, price);

      const platformFee = price.mul(25).div(1000); // 2.5%
      const sellerAmount = price.sub(platformFee);

      await expect(musicNFT.connect(buyer).purchaseMusic(1, { value: price }))
        .to.emit(musicNFT, 'MusicPurchased')
        .withArgs(1, artist1.address, buyer.address, price);

      expect(await musicNFT.ownerOf(1)).to.equal(buyer.address);

      // Check platform fee was transferred
      expect(await ethers.provider.getBalance(platformWallet.address)).to.be.above(
        ethers.provider.getBalance(platformWallet.address).sub(platformFee)
      );
    });

    it('Should fail to purchase NFT not for sale', async function () {
      await expect(musicNFT.connect(buyer).purchaseMusic(1, { value: price })).to.be.revertedWith(
        'Token is not for sale'
      );
    });

    it('Should fail to purchase with insufficient payment', async function () {
      await musicNFT.connect(artist1).setForSale(1, true, price);

      await expect(
        musicNFT.connect(buyer).purchaseMusic(1, { value: ethers.utils.parseEther('0.05') })
      ).to.be.revertedWith('Insufficient payment');
    });

    it('Should refund excess payment', async function () {
      await musicNFT.connect(artist1).setForSale(1, true, price);
      const excessAmount = ethers.utils.parseEther('0.02');
      const totalPayment = price.add(excessAmount);

      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

      const tx = await musicNFT.connect(buyer).purchaseMusic(1, {
        value: totalPayment,
      });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);

      // Buyer should pay price + gas - excess refund
      expect(buyerBalanceBefore).to.equal(buyerBalanceAfter.add(price).add(gasUsed));
    });
  });

  describe('Token Management', function () {
    it('Should return tokens owned by address', async function () {
      // Mint multiple tokens to artist1
      for (let i = 1; i <= 3; i++) {
        await musicNFT.mintMusicNFT(
          artist1.address,
          `Song ${i}`,
          'Artist',
          'Pop',
          180,
          `hash${i}`,
          `cover${i}`,
          ethers.utils.parseEther('0.1'),
          500
        );
      }

      const tokens = await musicNFT.tokensOfOwner(artist1.address);
      expect(tokens.length).to.equal(3);
      expect(tokens[0]).to.equal(1);
      expect(tokens[1]).to.equal(2);
      expect(tokens[2]).to.equal(3);
    });

    it('Should filter tokens for sale correctly', async function () {
      // Mint 3 tokens
      for (let i = 1; i <= 3; i++) {
        await musicNFT.mintMusicNFT(
          artist1.address,
          `Song ${i}`,
          'Artist',
          'Pop',
          180,
          `hash${i}`,
          `cover${i}`,
          ethers.utils.parseEther('0.1'),
          500
        );
      }

      // Set first 2 for sale
      await musicNFT.connect(artist1).setForSale(1, true, ethers.utils.parseEther('0.1'));
      await musicNFT.connect(artist1).setForSale(2, true, ethers.utils.parseEther('0.2'));

      const tokensForSale = await musicNFT.getTokensForSale();
      expect(tokensForSale.length).to.equal(2);
      expect(tokensForSale).to.include(1);
      expect(tokensForSale).to.include(2);
    });

    it('Should filter tokens by artist correctly', async function () {
      // Mint tokens for different artists
      await musicNFT.mintMusicNFT(
        artist1.address,
        'Song 1',
        'Artist A',
        'Pop',
        180,
        'hash1',
        'cover1',
        ethers.utils.parseEther('0.1'),
        500
      );

      await musicNFT.mintMusicNFT(
        artist2.address,
        'Song 2',
        'Artist B',
        'Rock',
        240,
        'hash2',
        'cover2',
        ethers.utils.parseEther('0.1'),
        500
      );

      await musicNFT.mintMusicNFT(
        artist1.address,
        'Song 3',
        'Artist A',
        'Electronic',
        200,
        'hash3',
        'cover3',
        ethers.utils.parseEther('0.1'),
        500
      );

      const artistATokens = await musicNFT.getTokensByArtist('Artist A');
      expect(artistATokens.length).to.equal(2);
      expect(artistATokens).to.include(1);
      expect(artistATokens).to.include(3);

      const artistBTokens = await musicNFT.getTokensByArtist('Artist B');
      expect(artistBTokens.length).to.equal(1);
      expect(artistBTokens[0]).to.equal(2);
    });
  });

  describe('Platform Management', function () {
    it('Should allow owner to update platform fee', async function () {
      await musicNFT.setPlatformFeePercentage(500); // 5%
      expect(await musicNFT.platformFeePercentage()).to.equal(500);
    });

    it('Should fail to set platform fee too high', async function () {
      await expect(
        musicNFT.setPlatformFeePercentage(1500) // 15% - too high
      ).to.be.revertedWith('Platform fee too high');
    });

    it('Should allow owner to update platform wallet', async function () {
      await musicNFT.setPlatformWallet(artist1.address);
      expect(await musicNFT.platformWallet()).to.equal(artist1.address);
    });

    it('Should fail to set invalid platform wallet', async function () {
      await expect(musicNFT.setPlatformWallet(ethers.constants.AddressZero)).to.be.revertedWith(
        'Invalid platform wallet'
      );
    });

    it('Should allow pausing and unpausing', async function () {
      await musicNFT.pause();
      expect(await musicNFT.paused()).to.be.true;

      await musicNFT.unpause();
      expect(await musicNFT.paused()).to.be.false;
    });

    it('Should prevent operations when paused', async function () {
      await musicNFT.pause();

      await expect(
        musicNFT.mintMusicNFT(
          artist1.address,
          'Test Song',
          'Artist',
          'Pop',
          180,
          'hash',
          'cover',
          ethers.utils.parseEther('0.1'),
          500
        )
      ).to.be.revertedWith('Pausable: paused');
    });
  });
});
