/**
 * MCP Chrome DevTools Setup for Normal Dance Web3 Music Platform
 * Provides utilities and configuration for enhanced browser testing
 */

// MCP Chrome DevTools configuration
export interface MCPConfiguration {
  browserUrl: string;
  headless: boolean;
  viewport: {
    width: number;
    height: number;
  };
  testTimeout: number;
  networkConditions?: {
    offline?: boolean;
    downloadThroughput?: number;
    uploadThroughput?: number;
    latency?: number;
  };
}

// Default MCP configuration
const DEFAULT_MCP_CONFIG: MCPConfiguration = {
  browserUrl: 'http://localhost:3000',
  headless: false,
  viewport: { width: 1920, height: 1080 },
  testTimeout: 30000,
  networkConditions: {
    downloadThroughput: 1000000, // 1 Mbps
    uploadThroughput: 500000, // 0.5 Mbps
    latency: 20, // 20ms
  },
};

// Audio testing utilities
class MCPAudioUtils {
  /**
   * Generate test audio frequencies for equalizer testing
   */
  static generateTestFrequencies(): { frequency: number; name: string; expectedBand: string }[] {
    return [
      { frequency: 60, name: 'Sub Bass Test', expectedBand: 'Sub Bass' },
      { frequency: 250, name: 'Bass Test', expectedBand: 'Bass' },
      { frequency: 1000, name: 'Low Mid Test', expectedBand: 'Low Mid' },
      { frequency: 4000, name: 'High Mid Test', expectedBand: 'High Mid' },
      { frequency: 12000, name: 'Treble Test', expectedBand: 'Treble' },
    ];
  }

  /**
   * Create audio test script for browser evaluation
   */
  static createAudioTestScript(type: 'context' | 'formats' | 'nodes'): string {
    const scripts = {
      context: `
        (async () => {
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const initTime = performance.now();

            if (audioContext.state === 'suspended') {
              await audioContext.resume();
            }

            const readyTime = performance.now();
            return {
              success: true,
              state: audioContext.state,
              sampleRate: audioContext.sampleRate,
              latency: audioContext.baseLatency || 0,
              initTime: readyTime - initTime,
              destination: audioContext.destination ? 'available' : 'unavailable',
              maxChannelCount: audioContext.destination?.maxChannelCount || 2
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `,

      formats: `
        (async () => {
          try {
            const audio = new Audio();
            return {
              success: true,
              formats: {
                mp3: audio.canPlayType('audio/mpeg') !== '',
                wav: audio.canPlayType('audio/wav') !== '',
                ogg: audio.canPlayType('audio/ogg; codecs="vorbis"') !== '',
                flac: audio.canPlayType('audio/flac') !== '',
                aac: audio.canPlayType('audio/aac') !== ''
              },
              supportsAudio: typeof Audio !== 'undefined'
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `,

      nodes: `
        (async () => {
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            return {
              success: true,
              capabilities: {
                gainNode: typeof audioContext.createGain === 'function',
                analyserNode: typeof audioContext.createAnalyser === 'function',
                biquadFilterNode: typeof audioContext.createBiquadFilter === 'function',
                oscillatorNode: typeof audioContext.createOscillator === 'function',
                delayNode: typeof audioContext.createDelay === 'function',
                convolverNode: typeof audioContext.createConvolver === 'function',
                stereoPannerNode: typeof audioContext.createStereoPanner === 'function',
                dynamicsCompressorNode: typeof audioContext.createDynamicsCompressor === 'function',
                waveShaperNode: typeof audioContext.createWaveShaper === 'function'
              },
              maxChannels: audioContext.destination?.maxChannelCount || 2
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `,
    };

    return scripts[type];
  }

  /**
   * Generate performance benchmarks for audio operations
   */
  static getAudioPerformanceBenchmarks(): Record<string, { target: number; threshold: number }> {
    return {
      audioContextInitTime: { target: 50, threshold: 100 }, // ms
      fftProcessingTime: { target: 5, threshold: 10 }, // ms
      visualizationFPS: { target: 60, threshold: 30 }, // fps
      equalizerLatency: { target: 2, threshold: 5 }, // ms
      effectsProcessingTime: { target: 10, threshold: 20 }, // ms
    };
  }
}

// Web3 testing utilities
class MCPWeb3Utils {
  /**
   * Test network configurations for Web3 testing
   */
  static getTestNetworks(): Record<string, { chainId: string; name: string; rpcUrl: string }> {
    return {
      ethereum: {
        chainId: '0x1',
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      },
      sepolia: {
        chainId: '0xaa36a7',
        name: 'Sepolia Testnet',
        rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
      },
      polygon: {
        chainId: '0x89',
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com',
      },
      mumbai: {
        chainId: '0x13881',
        name: 'Mumbai Testnet',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      },
      bsc: {
        chainId: '0x38',
        name: 'BSC Mainnet',
        rpcUrl: 'https://bsc-dataseed.binance.org',
      },
      bscTestnet: {
        chainId: '0x61',
        name: 'BSC Testnet',
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      },
    };
  }

  /**
   * Create Web3 test script for browser evaluation
   */
  static createWeb3TestScript(type: 'wallets' | 'transactions' | 'contracts'): string {
    const scripts = {
      wallets: `
        (async () => {
          try {
            const hasMetaMask = typeof window.ethereum !== 'undefined';
            const hasEthereum = hasMetaMask && window.ethereum.isMetaMask;

            const providers = {
              metamask: hasEthereum,
              coinbase: typeof window.coinbase !== 'undefined',
              trust: typeof window.trustwallet !== 'undefined',
              walletConnect: typeof window.WalletConnectProvider !== 'undefined'
            };

            const libraries = {
              ethers: typeof window.ethers !== 'undefined',
              web3: typeof window.Web3 !== 'undefined'
            };

            return {
              success: true,
              hasMetaMask,
              hasEthereum,
              providers,
              libraries,
              isSecureContext: window.isSecureContext,
              userAgent: navigator.userAgent
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `,

      transactions: `
        (async () => {
          try {
            const hasEthereum = typeof window.ethereum !== 'undefined';
            let networkInfo = null;

            if (hasEthereum) {
              networkInfo = {
                supportsEthRequest: typeof window.ethereum.request === 'function',
                supportsChainId: typeof window.ethereum.chainId !== 'undefined',
                supportsAccounts: typeof window.ethereum.request === 'function',
                supportsPersonalSign: typeof window.ethereum.request === 'function',
                supportsSendTransaction: typeof window.ethereum.request === 'function',
                supportsSwitchChain: typeof window.ethereum.request === 'function',
                currentChainId: window.ethereum.chainId
              };
            }

            return {
              success: true,
              hasEthereum,
              networkInfo,
              testNetworks: ${JSON.stringify(MCPWeb3Utils.getTestNetworks())}
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `,

      contracts: `
        (async () => {
          try {
            // Mock contract ABI for testing
            const mockABI = [
              'function name() view returns (string)',
              'function symbol() view returns (string)',
              'function totalSupply() view returns (uint256)',
              'function balanceOf(address) view returns (uint256)',
              'function transfer(address to, uint256 amount) returns (bool)'
            ];

            const testContractAddress = '0x742d35Cc673C7d23D61e6069' + 'xxxx'; // Mock address

            return {
              success: true,
              hasEthers: typeof window.ethers !== 'undefined',
              mockABI,
              testContractAddress,
              canReadContract: typeof window.ethers?.Contract === 'function',
              canSignTransactions: typeof window.ethereum?.request === 'function'
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `,
    };

    return scripts[type];
  }

  /**
   * Generate Web3 performance benchmarks
   */
  static getWeb3PerformanceBenchmarks(): Record<string, { target: number; threshold: number }> {
    return {
      walletConnectionTime: { target: 3000, threshold: 5000 }, // ms
      networkSwitchTime: { target: 2000, threshold: 3000 }, // ms
      transactionSignTime: { target: 5000, threshold: 10000 }, // ms
      gasEstimationTime: { target: 1000, threshold: 2000 }, // ms
      contractReadTime: { target: 500, threshold: 1000 }, // ms
    };
  }
}

// Performance testing utilities
class MCPPerformanceUtils {
  /**
   * Core Web Vitals thresholds
   */
  static getCoreWebVitalsThresholds(): Record<
    string,
    { good: number; needsImprovement: number; poor: number }
  > {
    return {
      LCP: { good: 2500, needsImprovement: 4000, poor: Infinity },
      FID: { good: 100, needsImprovement: 300, poor: Infinity },
      CLS: { good: 0.1, needsImprovement: 0.25, poor: Infinity },
      FCP: { good: 1800, needsImprovement: 3000, poor: Infinity },
      TTFB: { good: 800, needsImprovement: 1800, poor: Infinity },
    };
  }

  /**
   * Create performance test script
   */
  static createPerformanceTestScript(type: 'vitals' | 'memory' | 'navigation'): string {
    const scripts = {
      vitals: `
        (async () => {
          try {
            const vitals = {};

            // Largest Contentful Paint (LCP)
            const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
            if (lcpEntries.length > 0) {
              const lastEntry = lcpEntries[lcpEntries.length - 1];
              vitals.lcp = {
                value: lastEntry.startTime,
                rating: ${MCPPerformanceUtils.getVitalsRatingFunction('LCP')}
              };
            }

            // First Input Delay (FID)
            vitals.fid = {
              value: 0,
              rating: 'good',
              note: 'Requires real user interaction to measure'
            };

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const layoutShiftEntries = performance.getEntriesByType('layout-shift');
            layoutShiftEntries.forEach(entry => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            vitals.cls = {
              value: clsValue,
              rating: ${MCPPerformanceUtils.getVitalsRatingFunction('CLS')}
            };

            // First Contentful Paint (FCP)
            const fcpEntry = performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint');
            if (fcpEntry) {
              vitals.fcp = {
                value: fcpEntry.startTime,
                rating: ${MCPPerformanceUtils.getVitalsRatingFunction('FCP')}
              };
            }

            // Time to First Byte (TTFB)
            const navEntries = performance.getEntriesByType('navigation');
            if (navEntries.length > 0) {
              const nav = navEntries[0];
              vitals.ttfb = {
                value: nav.responseStart - nav.requestStart,
                rating: ${MCPPerformanceUtils.getVitalsRatingFunction('TTFB')}
              };
            }

            // Calculate overall score
            const ratings = Object.values(vitals).map(v => v.rating);
            const goodCount = ratings.filter(r => r === 'good').length;
            const overallScore = (goodCount / ratings.length) * 100;

            return {
              success: true,
              vitals,
              overallScore,
              grade: overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : overallScore >= 60 ? 'D' : 'F'
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `,

      memory: `
        (async () => {
          try {
            const memoryMetrics = {};

            if (performance.memory) {
              memoryMetrics.usedJSHeapSize = performance.memory.usedJSHeapSize;
              memoryMetrics.totalJSHeapSize = performance.memory.totalJSHeapSize;
              memoryMetrics.jsHeapSizeLimit = performance.memory.jsHeapSizeLimit;
              memoryMetrics.utilization = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
            }

            // Get performance entries for memory analysis
            const entries = performance.getEntriesByType('measure');
            const longTasks = performance.getEntriesByType('longtask');

            return {
              success: true,
              memoryMetrics,
              measureEntries: entries.length,
              longTaskCount: longTasks.length,
              totalLongTaskTime: longTasks.reduce((sum, task) => sum + task.duration, 0)
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `,

      navigation: `
        (async () => {
          try {
            const navEntries = performance.getEntriesByType('navigation');
            const paintEntries = performance.getEntriesByType('paint');

            let navigationTiming = {};
            if (navEntries.length > 0) {
              const nav = navEntries[0];
              navigationTiming = {
                type: nav.type,
                redirectCount: nav.redirectCount,
                transferSize: nav.transferSize,
                encodedBodySize: nav.encodedBodySize,
                decodedBodySize: nav.decodedBodySize,
                domComplete: nav.domComplete,
                loadEventEnd: nav.loadEventEnd,
                domContentLoadedEventEnd: nav.domContentLoadedEventEnd
              };
            }

            let paintTiming = {};
            if (paintEntries.length > 0) {
              paintTiming = paintEntries.reduce((acc, entry) => {
                acc[entry.name] = entry.startTime;
                return acc;
              }, {});
            }

            return {
              success: true,
              navigationTiming,
              paintTiming,
              userAgent: navigator.userAgent,
              deviceMemory: navigator.deviceMemory,
              hardwareConcurrency: navigator.hardwareConcurrency
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `,
    };

    return scripts[type];
  }

  /**
   * Generate rating function for Core Web Vitals
   */
  private static getVitalsRatingFunction(metric: string): string {
    const thresholds = this.getCoreWebVitalsThresholds()[metric];
    return `(lastEntry.startTime <= ${thresholds.good} ? 'good' : lastEntry.startTime <= ${thresholds.needsImprovement} ? 'needs-improvement' : 'poor')`;
  }

  /**
   * Network conditions for testing
   */
  static getNetworkConditions(): Array<{
    name: string;
    download: number;
    upload: number;
    latency: number;
  }> {
    return [
      { name: 'WiFi', download: 50000000, upload: 20000000, latency: 2 }, // 50 Mbps / 20 Mbps
      { name: '4G', download: 4000000, upload: 3000000, latency: 20 }, // 4 Mbps / 3 Mbps
      { name: '3G', download: 750000, upload: 500000, latency: 100 }, // 0.75 Mbps / 0.5 Mbps
      { name: '2G', download: 250000, upload: 50000, latency: 300 }, // 0.25 Mbps / 0.05 Mbps
      { name: 'Offline', download: 0, upload: 0, latency: 0 },
    ];
  }
}

// Cross-browser testing utilities
class MCPCrossBrowserUtils {
  /**
   * Supported browsers for testing
   */
  static getSupportedBrowsers(): Array<{
    name: string;
    userAgent: string;
    viewport: { width: number; height: number };
  }> {
    return [
      {
        name: 'Chrome Desktop',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
      },
      {
        name: 'Firefox Desktop',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        viewport: { width: 1920, height: 1080 },
      },
      {
        name: 'Safari Desktop',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.2 Safari/605.1.15',
        viewport: { width: 1920, height: 1080 },
      },
      {
        name: 'Edge Desktop',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        viewport: { width: 1920, height: 1080 },
      },
      {
        name: 'Chrome Mobile',
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        viewport: { width: 375, height: 667 },
      },
      {
        name: 'Safari Mobile',
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.2 Mobile/15E148 Safari/604.1',
        viewport: { width: 390, height: 844 },
      },
    ];
  }

  /**
   * Browser capability detection script
   */
  static createBrowserCapabilityScript(): string {
    return `
      (async () => {
        try {
          const browserInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory,
            maxTouchPoints: navigator.maxTouchPoints
          };

          const apiSupport = {
            audioContext: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
            canvas: (() => {
              try {
                const canvas = document.createElement('canvas');
                return typeof canvas.getContext === 'function';
              } catch (e) {
                return false;
              }
            })(),
            webGL: (() => {
              try {
                const canvas = document.createElement('canvas');
                return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
              } catch (e) {
                return false;
              }
            })(),
            webWorker: typeof Worker !== 'undefined',
            serviceWorker: 'serviceWorker' in navigator,
            localStorage: typeof localStorage !== 'undefined',
            sessionStorage: typeof sessionStorage !== 'undefined',
            indexedDB: typeof indexedDB !== 'undefined',
            webRTC: typeof RTCPeerConnection !== 'undefined',
            geolocation: 'geolocation' in navigator,
            notifications: 'Notification' in window,
            webSocket: typeof WebSocket !== 'undefined',
            fetch: typeof fetch !== 'undefined'
          };

          let browserType = 'unknown';
          if (browserInfo.userAgent.includes('Chrome')) browserType = 'chrome';
          else if (browserInfo.userAgent.includes('Firefox')) browserType = 'firefox';
          else if (browserInfo.userAgent.includes('Safari')) browserType = 'safari';
          else if (browserInfo.userAgent.includes('Edge')) browserType = 'edge';

          const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(browserInfo.userAgent);

          return {
            success: true,
            browserInfo,
            apiSupport,
            browserType,
            isMobile,
            supportedAPIs: Object.entries(apiSupport).filter(([_, supported]) => supported).length
          };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })()
    `;
  }
}

// Telegram WebApp testing utilities
class MCPTelegramUtils {
  /**
   * Create Telegram WebApp test script
   */
  static createTelegramTestScript(): string {
    return `
      (async () => {
        try {
          const telegramWebApp = window.Telegram?.WebApp;

          if (!telegramWebApp) {
            return {
              success: true,
              isTelegram: false,
              message: 'Not running in Telegram WebApp'
            };
          }

          const telegramInfo = {
            isTelegram: true,
            version: telegramWebApp.version,
            platform: telegramWebApp.platform,
            colorScheme: telegramWebApp.colorScheme,
            themeParams: telegramWebApp.themeParams,
            viewport: {
              width: telegramWebApp.viewportWidth,
              height: telegramWebApp.viewportHeight,
              isExpanded: telegramWebApp.isExpanded,
              stableHeight: telegramWebApp.stableHeight
            },
            features: {
              mainButton: !!telegramWebApp.MainButton,
              backButton: !!telegramWebApp.BackButton,
              haptic: !!telegramWebApp.HapticFeedback,
              cloudStorage: !!telegramWebApp.CloudStorage,
              biometric: !!telegramWebApp.BiometricManager,
              popup: !!telegramWebApp.showPopup,
              showAlert: !!telegramWebApp.showAlert,
              confirm: !!telegramWebApp.showConfirm
            },
            isSafeArea: !!telegramWebApp.SafeAreaInset
          };

          return {
            success: true,
            ...telegramInfo
          };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })()
    `;
  }

  /**
   * Test Telegram WebApp features
   */
  static getTelegramFeatureTests(): Array<{ name: string; testScript: string }> {
    return [
      {
        name: 'Main Button',
        testScript: `
          const mainButton = window.Telegram?.WebApp?.MainButton;
          if (mainButton) {
            mainButton.setText('Test Button');
            return { success: true, visible: mainButton.isVisible, text: mainButton.text };
          }
          return { success: false, error: 'MainButton not available' };
        `,
      },
      {
        name: 'Haptic Feedback',
        testScript: `
          const haptic = window.Telegram?.WebApp?.HapticFeedback;
          if (haptic) {
            haptic.impactOccurred('light');
            return { success: true, message: 'Haptic feedback sent' };
          }
          return { success: false, error: 'HapticFeedback not available' };
        `,
      },
      {
        name: 'Cloud Storage',
        testScript: `
          const cloudStorage = window.Telegram?.WebApp?.CloudStorage;
          if (cloudStorage) {
            return cloudStorage.setItem('test-key', 'test-value')
              .then(() => cloudStorage.getItem('test-key'))
              .then(value => ({ success: true, value }))
              .catch(error => ({ success: false, error: error.message }));
          }
          return { success: false, error: 'CloudStorage not available' };
        `,
      },
    ];
  }
}

// Export all utilities individually
export { DEFAULT_MCP_CONFIG };
export type { MCPConfiguration };
export { MCPAudioUtils };
export { MCPWeb3Utils };
export { MCPPerformanceUtils };
export { MCPCrossBrowserUtils };
export { MCPTelegramUtils };
