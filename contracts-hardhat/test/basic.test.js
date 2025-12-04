import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Basic Contract Tests', function () {
  it('Should deploy MusicNFT contract', async function () {
    const MusicNFT = await ethers.getContractFactory('MusicNFT');
    const musicNFT = await MusicNFT.deploy('https://api.test.com/', ethers.constants.AddressZero);
    await musicNFT.deployed();

    expect(await musicNFT.name()).to.equal('Music NFT');
    expect(await musicNFT.symbol()).to.equal('MUSICNFT');
  });

  it('Should deploy Platform contract', async function () {
    const Platform = await ethers.getContractFactory('MusicPlatform');
    const platform = await Platform.deploy();
    await platform.deployed();

    const stats = await platform.stats();
    expect(stats.totalArtists).to.equal(0);
    expect(stats.totalNFTs).to.equal(0);
  });

  it('Should deploy Staking contract', async function () {
    // Deploy a simple ERC20 token for testing
    const MockToken = await ethers.getContractFactory('contracts/test/MockToken.sol:MockToken');
    const token = await MockToken.deploy();
    await token.deployed();

    const Staking = await ethers.getContractFactory('MusicStaking');
    const staking = await Staking.deploy(token.address);
    await staking.deployed();

    expect(await staking.stakingToken()).to.equal(token.address);
  });
});
