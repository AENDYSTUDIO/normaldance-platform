const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('🚀 Starting Music Platform Contract Deployment...');
  console.log('Network:', network.name);

  const [deployer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);

  // Deploy MusicNFT Contract
  console.log('\n📝 Deploying MusicNFT Contract...');
  const baseTokenURI = 'https://api.normaldance.io/metadata/';
  const platformWallet = process.env.PLATFORM_WALLET || deployer.address;

  const MusicNFT = await ethers.getContractFactory('MusicNFT');
  const musicNFT = await MusicNFT.deploy(baseTokenURI, platformWallet);
  await musicNFT.waitForDeployment();

  console.log('✅ MusicNFT deployed to:', await musicNFT.getAddress());
  console.log(
    '🔗 Etherscan:',
    `https://${network.name}.etherscan.io/address/${await musicNFT.getAddress()}`
  );

  // Deploy Governance Token Contract first
  console.log('\n🪙 Deploying MusicPlatformToken Contract...');
  const MusicPlatformToken = await ethers.getContractFactory('MusicPlatformToken');
  const governanceToken = await MusicPlatformToken.deploy();
  await governanceToken.waitForDeployment();

  const governanceTokenAddress = await governanceToken.getAddress();
  console.log('✅ MusicPlatformToken deployed to:', governanceTokenAddress);
  console.log(
    '🔗 Etherscan:',
    `https://${network.name}.etherscan.io/address/${governanceTokenAddress}`
  );

  // Deploy Platform Contract
  console.log('\n🏛️ Deploying Platform Contract...');
  const Platform = await ethers.getContractFactory('MusicPlatform');
  const platform = await Platform.deploy();
  await platform.waitForDeployment();

  const platformAddress = await platform.getAddress();
  console.log('✅ Platform deployed to:', platformAddress);
  console.log('🔗 Etherscan:', `https://${network.name}.etherscan.io/address/${platformAddress}`);

  // Deploy Staking Contract
  console.log('\n💰 Deploying Staking Contract...');
  const Staking = await ethers.getContractFactory('MusicStaking');
  const staking = await Staking.deploy(governanceTokenAddress);
  await staking.waitForDeployment();

  const stakingAddress = await staking.getAddress();
  console.log('✅ Staking deployed to:', stakingAddress);
  console.log('🔗 Etherscan:', `https://${network.name}.etherscan.io/address/${stakingAddress}`);

  // Initialize platform with test data
  console.log('\n🎵 Initializing Platform with Test Data...');

  // Deployer is already defined above

  // Mint a sample NFT (only owner can mint)
  const sampleNFTTx = await musicNFT.mintMusicNFT(
    deployer.address,
    'Summer Vibes',
    'Test Artist',
    'Electronic',
    180, // 3 minutes
    'QmTestAudioHash',
    'QmTestCoverHash',
    ethers.parseEther('0.1'), // 0.1 ETH
    500 // 5% royalty (500 basis points = 5%)
  );
  await sampleNFTTx.wait();
  console.log('🎵 Sample NFT minted successfully');

  // Add tokens to staking reward pool
  const stakingRewardAmount = ethers.parseEther('10000'); // 10,000 tokens

  // Transfer tokens to staking contract
  await governanceToken.transfer(stakingAddress, stakingRewardAmount);
  console.log('💎 Added 10,000 MPT tokens to staking reward pool');

  // Save deployment information
  const musicNFTAddress = await musicNFT.getAddress();
  const deploymentInfo = {
    network: network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      musicNFT: {
        address: musicNFTAddress,
        name: 'MusicNFT',
        verified: false,
      },
      platform: {
        address: platformAddress,
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
        address: stakingAddress,
        name: 'MusicStaking',
        verified: false,
      },
    },
    deployer: deployer.address,
    gasUsed: {
      musicNFT: (await (await musicNFT.deploymentTransaction()).wait()).gasUsed.toString(),
      governanceToken: (
        await (await governanceToken.deploymentTransaction()).wait()
      ).gasUsed.toString(),
      platform: (await (await platform.deploymentTransaction()).wait()).gasUsed.toString(),
      staking: (await (await staking.deploymentTransaction()).wait()).gasUsed.toString(),
    },
  };

  // Save to .env file for frontend use
  const envContent = `
# Contract Addresses - ${network.name}
MUSIC_NFT_ADDRESS=${musicNFTAddress}
PLATFORM_ADDRESS=${platformAddress}
GOVERNANCE_TOKEN_ADDRESS=${governanceTokenAddress}
STAKING_ADDRESS=${stakingAddress}
PLATFORM_WALLET=${platformWallet}

# Network Configuration
NEXT_PUBLIC_NETWORK_ID=${network.config.chainId}
NEXT_PUBLIC_RPC_URL=${network.config.url}
`;

  const fs = require('fs');
  fs.writeFileSync(`.env.${network.name}`, envContent);
  fs.writeFileSync(`deployment-${network.name}.json`, JSON.stringify(deploymentInfo, null, 2));

  console.log('\n📋 Deployment Summary:');
  console.log('='.repeat(50));
  console.log(`MusicNFT: ${musicNFTAddress}`);
  console.log(`Platform: ${platformAddress}`);
  console.log(`Governance Token: ${governanceTokenAddress}`);
  console.log(`Staking: ${stakingAddress}`);
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
