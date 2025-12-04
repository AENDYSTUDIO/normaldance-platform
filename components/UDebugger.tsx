/**
 * Advanced UI Debugger and Monitoring Component
 * Provides real-time debugging tools and state visualization
 */

import React, { useState } from 'react';
import {
  Bug,
  Terminal,
  Eye,
  X,
  Info,
  AlertTriangle,
  Zap,
  BarChart3,
  Database,
  Clock,
} from 'lucide-react';

import { usePlayerStore } from '../stores/usePlayerStore';
import { useTracksStore } from '../stores/useTracksStore';
import { performanceMonitor } from '../services/performance';

interface DebugInfo {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  component?: string;
  props?: Record<string, unknown>;
}

interface SystemMetrics {
  totalComponents: number;
  activeComponents: number;
  renderTime: number;
  stateChanges: number;
  eventListeners: number;
}

export const UDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<DebugInfo[]>([]);
  const [components] = useState<unknown[]>([]);
  const [systemMetrics] = useState<SystemMetrics>({
    totalComponents: 0,
    activeComponents: 0,
    renderTime: 0,
    stateChanges: 0,
    eventListeners: 0,
  });

  const [isLive, setIsLive] = useState(false);
  const [filterLevel, setFilterLevel] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const filterLogs = () => {
    if (filterLevel === 'all') return logs;
    return logs.filter((log) =>
      filterLevel === 'error'
        ? log.level === 'error'
        : filterLevel === 'warn'
          ? log.level === 'warn'
          : true
    );
  };

  const exportDebugData = () => {
    const debugData = {
      timestamp: Date.now(),
      logs: filterLogs(),
      components: components,
      systemMetrics,
      performanceMetrics: performanceMonitor.getMetrics(),
      userStore: usePlayerStore.getState(),
      tracksStore: useTracksStore.getState(),
    };

    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'debug-data.json';
    a.click();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 glass-panel px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors"
        aria-label="Open Debug Panel"
        type="button"
      >
        <Bug className="w-4 h-4 text-red-400" />
        <span className="text-sm text-white">Debug</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="glass-panel p-6 rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white mb-2">Advanced UI Debugger</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`glass-panel px-3 py-2 rounded-lg transition-colors ${
                  autoRefresh ? 'bg-violet-500/20' : 'hover:bg-white/10'
                }`}
                type="button"
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm text-white">Auto Refresh</span>
              </button>

              <button
                onClick={() => setIsLive(!isLive)}
                className={`glass-panel px-3 py-2 rounded-lg transition-colors ${
                  isLive ? 'bg-red-500/20' : 'bg-green-500/20'
                }`}
                type="button"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm text-white">{isLive ? 'Stop' : 'Start'} Monitoring</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="glass-panel px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close Debug Panel"
            type="button"
          >
            <X />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as 'all' | 'error' | 'warn' | 'info')}
              className="glass-panel px-3 py-2 rounded-lg bg-white/10 text-white text-sm"
            >
              <option value="all">All</option>
              <option value="error">Errors</option>
              <option value="warn">Warnings</option>
              <option value="info">Info</option>
            </select>

            <button
              onClick={exportDebugData}
              className="glass-panel px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-600 transition-colors text-sm"
              type="button"
            >
              <Database className="w-4 h-4" />
              <span className="text-sm text-white">Export Debug Data</span>
            </button>
          </div>

          <div className="text-xs text-gray-400 mb-4">
            {logs.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-white">
                  {logs.length} debug entries • {components.filter((c) => c.renders > 0).length}{' '}
                  active components
                </span>
              </div>
            )}

            {systemMetrics && (
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <BarChart3 className="w-4 h-4" />
                <span className="text-white">
                  System: {systemMetrics.totalComponents} components •{' '}
                  {systemMetrics.activeComponents} active • {systemMetrics.renderTime}ms render time
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Debug Log Display */}
        {logs.length > 0 && (
          <div className="h-64 overflow-y-auto bg-black/50 rounded-lg p-4 border border-white/10">
            <div className="text-sm font-medium text-gray-400 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-white">Debug Log</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Filter: </span>
                  <span className="text-white font-medium">{filterLevel.toUpperCase()}</span>
                  <span className="text-gray-400"> ({filterLogs().length} entries)</span>
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="glass-panel px-2 py-1 rounded text-xs hover:bg-white/10 transition-colors"
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filterLogs().map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    log.level === 'error'
                      ? 'border-red-500/30 bg-red-500/10'
                      : log.level === 'warn'
                        ? 'border-yellow-500/30 bg-yellow-500/10'
                        : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          log.level === 'error'
                            ? 'bg-red-500'
                            : log.level === 'warn'
                              ? 'bg-yellow-500'
                              : log.level === 'info'
                                ? 'bg-blue-500'
                                : 'bg-gray-500'
                        }`}
                      />
                      <span className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {log.level === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    {log.level === 'warn' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                    {log.level === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                  </div>

                  <div className="flex-1 text-sm text-gray-300">
                    <span className="font-medium text-white">{log.message}</span>
                    {log.component && <span className="text-gray-400 ml-2">({log.component})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-time Performance Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400 mt-4">
          <div className="glass-panel p-4 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Performance Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Grade</span>
                <span className="text-xl font-bold text-violet-400">
                  {performanceMonitor.getPerformanceGrade()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Score</span>
                <span className="text-xl font-bold text-green-400">
                  {performanceMonitor.getPerformanceScore().toFixed(0)}
                </span>
              </div>
            </div>

            <div className="h-4 w-full bg-violet-500/10 rounded-full my-2">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-1000"
                style={{ width: `${performanceMonitor.getPerformanceScore()}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
