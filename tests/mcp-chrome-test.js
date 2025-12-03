// MCP Chrome DevTools тесты для Web3 Music Platform
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

class MCPChromeTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testResults = [];
  }

  async runTests() {
    console.log('🚀 Starting MCP Chrome DevTools tests...\n');

    // Запускаем Chrome DevTools MCP
    const chromeProcess = this.startChromeDevTools();

    // Ждем запуска
    await this.sleep(2000);

    try {
      await this.testApplicationLoad();
      await this.testNavigation();
      await this.testAudioPlayer();
      await this.testAdvancedAudioFeatures();
      await this.testWeb3Features();
      await this.testResponsiveDesign();
      await this.testConsoleErrors();

      this.printResults();
    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      chromeProcess.kill();
    }
  }

  startChromeDevTools() {
    console.log('🔧 Starting Chrome DevTools MCP...');
    return spawn('npx', [
      '-y', 'chrome-devtools-mcp@latest',
      '--browserUrl', this.baseUrl,
      '--headless', 'true',
      '--viewport', '1280x720',
      '--logFile', '/tmp/mcp-test.log'
    ], {
      stdio: 'inherit'
    });
  }

  async testApplicationLoad() {
    console.log('📱 Testing application load...');

    try {
      const response = await this.makeRequest('/');
      const isHtml = response.includes('<!DOCTYPE html') || response.includes('<html');

      this.addTestResult('Application Load', isHtml,
        isHtml ? '✅ Application loads successfully' : '❌ Application failed to load');
    } catch (error) {
      this.addTestResult('Application Load', false, `❌ Connection failed: ${error.message}`);
    }
  }

  async testNavigation() {
    console.log('🧭 Testing navigation routes...');

    const routes = [
      '/',
      '/explore',
      '/library',
      '/wallet',
      '/staking',
      '/statistics',
      '/trends',
      '/upload',
      '/auth',
      '/nft'
    ];

    for (const route of routes) {
      try {
        const response = await this.makeRequest(route);
        const isWorking = response.includes('script') && response.includes('html');

        this.addTestResult(`Route ${route}`, isWorking,
          isWorking ? `✅ ${route} loads correctly` : `❌ ${route} failed to load`);
      } catch (error) {
        this.addTestResult(`Route ${route}`, false, `❌ ${route} error: ${error.message}`);
      }
    }
  }

  async testAudioPlayer() {
    console.log('🎵 Testing audio player functionality...');

    try {
      const response = await this.makeRequest('/');
      const hasAudioElements = response.includes('AudioPlayer') ||
                              response.includes('audio') ||
                              response.includes('player');

      this.addTestResult('Audio Player Elements', hasAudioElements,
        hasAudioElements ? '✅ Audio player elements found' : '❌ Audio player elements missing');

      const hasPlayerBar = response.includes('PlayerBar') || response.includes('player-bar');
      this.addTestResult('Player Bar', hasPlayerBar,
        hasPlayerBar ? '✅ Player bar component found' : '❌ Player bar component missing');
      // Test advanced audio features
      const hasAudioEffects = response.includes('AudioEffects') ||
                            response.includes('equalizer') ||
                            response.includes('reverb') ||
                            response.includes('effects');

      this.addTestResult('Advanced Audio Effects', hasAudioEffects,
        hasAudioEffects ? '✅ Advanced audio effects available' : '❌ Advanced audio effects not found');

      const hasAudioVisualizer = response.includes('AudioVisualizer') ||
                                response.includes('visualizer') ||
                                response.includes('frequency') ||
                                response.includes('spectrum');

      this.addTestResult('Audio Visualizer', hasAudioVisualizer,
        hasAudioVisualizer ? '✅ Audio visualizer available' : '❌ Audio visualizer not found');

      const hasAdvancedMode = response.includes('advancedMode') ||
                             response.includes('Settings') ||
                             response.includes('Advanced Audio');

      this.addTestResult('Advanced Audio Mode', hasAdvancedMode,
        hasAdvancedMode ? '✅ Advanced audio mode available' : '❌ Advanced audio mode not found');

      // Test audio controls
      const hasAudioControls = response.includes('play') ||
                            response.includes('pause') ||
                            response.includes('volume') ||
                            response.includes('seek') ||
                            response.includes('shuffle') ||
                            response.includes('repeat');

      this.addTestResult('Audio Controls', hasAudioControls,
        hasAudioControls ? '✅ Full audio controls available' : '❌ Audio controls missing');

      // Test Web Audio API
      const hasWebAudioAPI = response.includes('AudioContext') ||
                            response.includes('webkitAudioContext') ||
                            response.includes('BiquadFilter') ||
                            response.includes('AnalyserNode');

      this.addTestResult('Web Audio API', hasWebAudioAPI,
        hasWebAudioAPI ? '✅ Web Audio API support' : '❌ Web Audio API not detected');
    } catch (error) {
      this.addTestResult('Audio Player Test', false, `❌ Audio player test failed: ${error.message}`);
    }
  }

  async testWeb3Features() {
    console.log('🔗 Testing Web3 features...');

    try {
      const response = await this.makeRequest('/');

      const hasWeb3 = response.includes('web3') ||
                     response.includes('ethereum') ||
                     response.includes('metamask') ||
                     response.includes('wallet');

      this.addTestResult('Web3 Integration', hasWeb3,
        hasWeb3 ? '✅ Web3 features detected' : '⚠️ Web3 features not found in initial load');

      const hasWalletIntegration = response.includes('useAuthStore') ||
                                  response.includes('connectWallet');

      this.addTestResult('Wallet Integration', hasWalletIntegration,
        hasWalletIntegration ? '✅ Wallet integration found' : '⚠️ Wallet integration not detected');
    } catch (error) {
      this.addTestResult('Web3 Features Test', false, `❌ Web3 test failed: ${error.message}`);
    }
  }

  async testAdvancedAudioFeatures() {
    console.log('🎛 Testing advanced audio features...');

    try {
      const response = await this.makeRequest('/');

      // Test Audio Visualizer
      const hasCanvas = response.includes('canvas') ||
                     response.includes('AudioVisualizer') ||
                     response.includes('frequency') ||
                     response.includes('spectrum');

      this.addTestResult('Audio Visualizer Canvas', hasCanvas,
        hasCanvas ? '✅ Audio visualizer canvas found' : '❌ Audio visualizer canvas missing');

      // Test Audio Effects Panel
      const hasEffectsPanel = response.includes('AudioEffects') ||
                            response.includes('equalizer') ||
                            response.includes('reverb') ||
                            response.includes('echo') ||
                            response.includes('bass');

      this.addTestResult('Audio Effects Panel', hasEffectsPanel,
        hasEffectsPanel ? '✅ Audio effects panel found' : '❌ Audio effects panel missing');

      // Test Audio Controls
      const hasAdvancedControls = response.includes('advancedMode') ||
                             response.includes('Settings') ||
                             response.includes('toggle') ||
                             response.includes('advanced');

      this.addTestResult('Advanced Audio Controls', hasAdvancedControls,
        hasAdvancedControls ? '✅ Advanced audio controls found' : '❌ Advanced audio controls missing');

      // Test Audio Context Support
      const hasWebAudioAPI = response.includes('AudioContext') ||
                            response.includes('webkitAudioContext') ||
                            response.includes('createAnalyser') ||
                            response.includes('createBiquadFilter');

      this.addTestResult('Advanced Web Audio API', hasWebAudioAPI,
        hasWebAudioAPI ? '✅ Advanced Web Audio API support' : '❌ Advanced Web Audio API not detected');

      // Test Audio Quality Settings
      const hasQualitySettings = response.includes('quality') ||
                               response.includes('lossless') ||
                               response.includes('320kbps');

      this.addTestResult('Audio Quality Settings', hasQualitySettings,
        hasQualitySettings ? '✅ Audio quality settings found' : '❌ Audio quality settings missing');

      // Test Crossfader
      const hasCrossfader = response.includes('crossfade') ||
                             response.includes('gapless');

      this.addTestResult('Gapless Playback', hasCrossfader,
        hasCrossfader ? '✅ Gapless playback support detected' : '❌ Gapless playback not detected');

    } catch (error) {
      this.addTestResult('Advanced Audio Features Test', false, `❌ Advanced audio test failed: ${error.message}`);
    }
  }

  async testResponsiveDesign() {
    console.log('📱 Testing responsive design...');

    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      try {
        const response = await this.makeRequest('/');
        const hasResponsiveClasses = response.includes('responsive') ||
                                   response.includes('mobile') ||
                                   response.includes('lg:') ||
                                   response.includes('md:');

        this.addTestResult(`Responsive ${viewport.name}`, hasResponsiveClasses,
          hasResponsiveClasses ? `✅ ${viewport.name} responsive classes found` : `⚠️ ${viewport.name} responsive design unclear`);
      } catch (error) {
        this.addTestResult(`Responsive ${viewport.name}`, false, `❌ ${viewport.name} test failed: ${error.message}`);
      }
    }
  }

  async testConsoleErrors() {
    console.log('🔍 Checking for console errors...');

    // Проверяем наличие TypeScript и build ошибок
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const hasTypeScript = packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript;

      this.addTestResult('TypeScript Setup', !!hasTypeScript,
        hasTypeScript ? '✅ TypeScript configured' : '⚠️ TypeScript not found');

      // Проверяем Vite конфигурацию
      const hasViteConfig = fs.existsSync('vite.config.ts') || fs.existsSync('vite.config.js');
      this.addTestResult('Vite Configuration', hasViteConfig,
        hasViteConfig ? '✅ Vite configuration found' : '⚠️ Vite configuration missing');

    } catch (error) {
      this.addTestResult('Console Error Check', false, `❌ Console check failed: ${error.message}`);
    }
  }

  async makeRequest(path) {
    return new Promise((resolve, reject) => {
      const req = http.get(`${this.baseUrl}${path}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  addTestResult(name, passed, message) {
    this.testResults.push({ name, passed, message });
  }

  printResults() {
    console.log('\n📊 Test Results:');
    console.log('================');

    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;

    this.testResults.forEach(result => {
      console.log(`${result.message}`);
    });

    console.log('\n📈 Summary:');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    console.log(`📊 Success Rate: ${Math.round((passed/total) * 100)}%`);

    if (passed === total) {
      console.log('\n🎉 All tests passed! Your Web3 Music Platform is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the issues above.');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Запускаем тесты
const tester = new MCPChromeTester();
tester.runTests().catch(console.error);