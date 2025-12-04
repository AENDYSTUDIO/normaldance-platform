import '@nomicfoundation/hardhat-toolbox';

// Ваш приватный ключ для развертывания на тестнетах
// ВНИМАНИЕ: Используйте только тестовые ключи, никогда не основные!
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x' + '0'.repeat(63, '0');

// RPC URL для различных сетей
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || '';
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || '';
const BSC_TESTNET_RPC_URL =
  process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545';

// Etherscan API ключи для верификации контрактов
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || '';
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || '';

export default {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local development network
    hardhat: {
      chainId: 31337,
    },
    // Ethereum Testnet
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    // Polygon Testnet
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
    },
    // BSC Testnet
    bscTestnet: {
      url: BSC_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 97,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      bsc: BSCSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
};
