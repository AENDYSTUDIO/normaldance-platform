import { ethers } from 'hardhat';
import 'dotenv/config';

async function main() {
  console.log('🚀 Starting Music Platform Contract Deployment...');
  console.log('Network:', network.name);
  console.log('Deployer:', (await ethers.getSigner()).address);

  // Deploy MusicNFT Contract
  console.log('\n📝 Deploying MusicNFT Contract...');
  const baseTokenURI = 'https://api.normaldance.io/metadata/';
  const platformWallet = process.env.PLATFORM_WALLET || (await ethers.getSigner()).address;

  const MusicNFT = await ethers.getContractFactory('MusicNFT');
  const musicNFT = await MusicNFT.deploy(baseTokenURI, platformWallet);
  await musicNFT.deployed();

  console.log('✅ MusicNFT deployed to:', musicNFT.address);
  console.log('🔗 Etherscan:', `https://${network.name}.etherscan.io/address/${musicNFT.address}`);

  // Deploy Platform Contract
  console.log('\n🏛️ Deploying Platform Contract...');
  const Platform = await ethers.getContractFactory('MusicPlatform');
  const platform = await Platform.deploy();
  await platform.deployed();

  console.log('✅ Platform deployed to:', platform.address);
  console.log('🔗 Etherscan:', `https://${network.name}.etherscan.io/address/${platform.address}`);

  // Get governance token address from platform contract
  const governanceTokenAddress = await platform.governanceToken();
  console.log('🪙 Governance Token (MPT) deployed to:', governanceTokenAddress);

  // Deploy Staking Contract
  console.log('\n💰 Deploying Staking Contract...');
  const Staking = await ethers.getContractFactory('MusicStaking');
  const staking = await Staking.deploy(governanceTokenAddress);
  await staking.deployed();

  console.log('✅ Staking deployed to:', staking.address);
  console.log('🔗 Etherscan:', `https://${network.name}.etherscan.io/address/${staking.address}`);

  // Initialize platform with test data
  console.log('\n🎵 Initializing Platform with Test Data...');

  // Register a test artist
  const testArtist = await ethers.getSigner();
  await platform.registerArtist(
    testArtist.address,
    'Test Artist',
    'A test artist for demonstration purposes',
    'QmTestArtistAvatarHash'
  );
  console.log('👤 Test artist registered:', testArtist.address);

  // Mint a sample NFT
  const sampleNFTTx = await musicNFT.mintMusicNFT(
    testArtist.address,
    'Summer Vibes',
    'Test Artist',
    'Electronic',
    180, // 3 minutes
    'QmTestAudioHash',
    'QmTestCoverHash',
    ethers.utils.parseEther('0.1'), // 0.1 ETH
    500 // 5% royalty
  );
  await sampleNFTTx.wait();
  console.log('🎵 Sample NFT minted successfully');

  // Add tokens to staking reward pool
  const stakingRewardAmount = ethers.utils.parseEther('10000'); // 10,000 tokens
  const governanceToken = await ethers.getContractAt('MusicPlatformToken', governanceTokenAddress);

  // First transfer tokens to this contract so it can add to reward pool
  await governanceToken.transfer(staking.address, stakingRewardAmount);
  console.log('💎 Added 10,000 MPT tokens to staking reward pool');

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      musicNFT: {
        address: musicNFT.address,
        name: 'MusicNFT',
        verified: false,
      },
      platform: {
        address: platform.address,
        name: 'MusicPlatform',
        verified: false,
      },
      governanceToken: {
        address: governanceTokenAddress,
        name: 'MusicPlatformToken',
        symbol: 'MPT',
        verified: false,
      },
      staking: {
        address: staking.address,
        name: 'MusicStaking',
        verified: false,
      },
    },
    deployer: (await ethers.getSigner()).address,
    gasUsed: {
      musicNFT: (await musicNFT.deployTransaction.wait()).gasUsed.toString(),
      platform: (await platform.deployTransaction.wait()).gasUsed.toString(),
      staking: (await staking.deployTransaction.wait()).gasUsed.toString(),
    },
  };

  // Save to .env file for frontend use
  const envContent = `
# Contract Addresses - ${network.name}
MUSIC_NFT_ADDRESS=${musicNFT.address}
PLATFORM_ADDRESS=${platform.address}
GOVERNANCE_TOKEN_ADDRESS=${governanceTokenAddress}
STAKING_ADDRESS=${staking.address}
PLATFORM_WALLET=${platformWallet}

# Network Configuration
NEXT_PUBLIC_NETWORK_ID=${network.config.chainId}
NEXT_PUBLIC_RPC_URL=${network.config.url}
`;

  import { writeFileSync } from 'fs';
  writeFileSync(`.env.${network.name}`, envContent);
  writeFileSync(`deployment-${network.name}.json`, JSON.stringify(deploymentInfo, null, 2));

  console.log('\n📋 Deployment Summary:');
  console.log('='.repeat(50));
  console.log(`MusicNFT: ${musicNFT.address}`);
  console.log(`Platform: ${platform.address}`);
  console.log(`Governance Token: ${governanceTokenAddress}`);
  console.log(`Staking: ${staking.address}`);
  console.log(`Platform Wallet: ${platformWallet}`);
  console.log('='.repeat(50));

  console.log('\n🔧 Configuration files created:');
  console.log(`- .env.${network.name}`);
  console.log(`- deployment-${network.name}.json`);

  console.log('\n🎉 Deployment completed successfully!');
  console.log('💡 Next steps:');
  console.log('1. Verify contracts on Etherscan');
  console.log('2. Update frontend configuration');
  console.log('3. Test contract interactions');
  console.log('4. Set up monitoring and analytics');

  return deploymentInfo;
}

// Handle errors and run deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
