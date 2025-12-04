const { ethers, run } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('🔍 Starting Contract Verification...');
  console.log('Network:', network.name);

  // Read deployment info
  const fs = require('fs');
  const deploymentFile = `deployment-${network.name}.json`;

  if (!fs.existsSync(deploymentFile)) {
    console.error('❌ Deployment file not found. Run deploy.js first.');
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const { contracts } = deploymentInfo;

  console.log('\n📋 Contracts to verify:');
  Object.entries(contracts).forEach(([key, contract]) => {
    console.log(`- ${contract.name}: ${contract.address}`);
  });

  // Verify MusicNFT
  if (!contracts.musicNFT.verified) {
    console.log('\n🔍 Verifying MusicNFT...');
    try {
      await run('verify:verify', {
        address: contracts.musicNFT.address,
        constructorArguments: ['https://api.normaldance.io/metadata/', deploymentInfo.deployer],
      });
      contracts.musicNFT.verified = true;
      console.log('✅ MusicNFT verified successfully');
    } catch (error) {
      console.error('❌ MusicNFT verification failed:', error.message);
    }
  }

  // Verify Platform
  if (!contracts.platform.verified) {
    console.log('\n🔍 Verifying Platform...');
    try {
      await run('verify:verify', {
        address: contracts.platform.address,
        constructorArguments: [],
      });
      contracts.platform.verified = true;
      console.log('✅ Platform verified successfully');
    } catch (error) {
      console.error('❌ Platform verification failed:', error.message);
    }
  }

  // Verify Governance Token
  if (!contracts.governanceToken.verified) {
    console.log('\n🔍 Verifying Governance Token...');
    try {
      await run('verify:verify', {
        address: contracts.governanceToken.address,
        constructorArguments: [],
      });
      contracts.governanceToken.verified = true;
      console.log('✅ Governance Token verified successfully');
    } catch (error) {
      console.error('❌ Governance Token verification failed:', error.message);
    }
  }

  // Verify Staking
  if (!contracts.staking.verified) {
    console.log('\n🔍 Verifying Staking...');
    try {
      await run('verify:verify', {
        address: contracts.staking.address,
        constructorArguments: [contracts.governanceToken.address],
      });
      contracts.staking.verified = true;
      console.log('✅ Staking verified successfully');
    } catch (error) {
      console.error('❌ Staking verification failed:', error.message);
    }
  }

  // Update deployment info
  deploymentInfo.contracts = contracts;
  deploymentInfo.verificationTime = new Date().toISOString();
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Print verification summary
  console.log('\n📊 Verification Summary:');
  console.log('='.repeat(50));
  Object.entries(contracts).forEach(([key, contract]) => {
    const status = contract.verified ? '✅ Verified' : '❌ Failed';
    console.log(`${contract.name}: ${status}`);
  });

  const verifiedCount = Object.values(contracts).filter((c) => c.verified).length;
  console.log(`\n🎯 ${verifiedCount}/${Object.keys(contracts).length} contracts verified`);

  if (verifiedCount === Object.keys(contracts).length) {
    console.log('\n🎉 All contracts verified successfully!');
    console.log('📚 Contract documentation available on Etherscan');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
