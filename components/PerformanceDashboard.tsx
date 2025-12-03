/**
 * Performance Dashboard Component
 * Displays Core Web Vitals and performance metrics
 */

import React, { useState, useEffect } from 'react';
import { performanceMonitor, type PerformanceMetric } from '../services/performance';
import { Activity, AlertCircle, CheckCircle, AlertTriangle, BarChart3, Clock, Zap, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
  icon: React.ReactNode;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, rating, unit, icon, description }) => {
  const getRatingColor = () => {
    switch (rating) {
      case 'good': return 'text-green-400';
      case 'needs-improvement': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRatingIcon = () => {
    switch (rating) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'needs-improvement': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'poor': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-semibold text-white">{title}</h4>
        </div>
        {getRatingIcon()}
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className={`text-2xl font-bold ${getRatingColor()}`}>
          {value.toFixed(0)}
        </span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
};

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [performanceGrade, setPerformanceGrade] = useState<'A' | 'B' | 'C' | 'D' | 'F'>('F');
  const [navigationCount, setNavigationCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = performanceMonitor.getMetrics();
      const latestMetrics = performanceMonitor.getLatestMetrics();
      const score = performanceMonitor.getPerformanceScore();
      const grade = performanceMonitor.getPerformanceGrade();
      const count = performanceMonitor.exportData().navigationCount;

      setMetrics(currentMetrics);
      setPerformanceScore(score);
      setPerformanceGrade(grade);
      setNavigationCount(count);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, []);

  const getLatestMetric = (name: string): PerformanceMetric | undefined => {
    const latest = performanceMonitor.getLatestMetrics();
    return latest[name];
  };

  const getGradeColor = () => {
    switch (performanceGrade) {
      case 'A': return 'text-green-400';
      case 'B': return 'text-green-300';
      case 'C': return 'text-yellow-400';
      case 'D': return 'text-orange-400';
      case 'F': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getGradeBackground = () => {
    switch (performanceGrade) {
      case 'A': return 'bg-green-500/20 border-green-500/30';
      case 'B': return 'bg-green-500/10 border-green-500/20';
      case 'C': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'D': return 'bg-orange-500/20 border-orange-500/30';
      case 'F': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatValue = (name: string, value: number): string => {
    switch (name) {
      case 'LCP':
      case 'FCP':
      case 'TTFB':
        return `${value.toFixed(0)}ms`;
      case 'FID':
        return `${value.toFixed(0)}ms`;
      case 'CLS':
        return value.toFixed(3);
      default:
        return value.toString();
    }
  };

  const latestLCP = getLatestMetric('LCP');
  const latestFID = getLatestMetric('FID');
  const latestCLS = getLatestMetric('CLS');
  const latestFCP = getLatestMetric('FCP');
  const latestTTFB = getLatestMetric('TTFB');

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 glass-panel px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors"
        aria-label="Open Performance Dashboard"
      >
        <Activity className="w-4 h-4" />
        <span className="text-sm">Performance</span>
        <div className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor()} ${getGradeBackground()}`}>
          {performanceGrade}
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel p-6 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Performance Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getGradeColor()}`}>{performanceGrade}</div>
              <div className="text-sm text-gray-400">Performance Grade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{performanceScore.toFixed(0)}</div>
              <div className="text-sm text-gray-400">Performance Score</div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="glass-panel px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close Performance Dashboard"
            >
              ×
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {latestLCP && (
            <MetricCard
              title="Largest Contentful Paint"
              value={latestLCP.value}
              rating={latestLCP.rating}
              unit="ms"
              icon={<Zap className="w-5 h-5 text-blue-400" />}
              description="Time to render the largest content element"
            />
          )}

          {latestFID && (
            <MetricCard
              title="First Input Delay"
              value={latestFID.value}
              rating={latestFID.rating}
              unit="ms"
              icon={<Clock className="w-5 h-5 text-green-400" />}
              description="Delay from user first interaction to browser response"
            />
          )}

          {latestCLS && (
            <MetricCard
              title="Cumulative Layout Shift"
              value={latestCLS.value}
              rating={latestCLS.rating}
              unit=""
              icon={<Activity className="w-5 h-5 text-yellow-400" />}
              description="Unexpected layout movement during page load"
            />
          )}

          {latestFCP && (
            <MetricCard
              title="First Contentful Paint"
              value={latestFCP.value}
              rating={latestFCP.rating}
              unit="ms"
              icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
              description="Time to render the first content element"
            />
          )}

          {latestTTFB && (
            <MetricCard
              title="Time to First Byte"
              value={latestTTFB.value}
              rating={latestTTFB.rating}
              unit="ms"
              icon={<Clock className="w-5 h-5 text-orange-400" />}
              description="Time to receive the first byte of the response"
            />
          )}

          <div className="glass-panel p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-white">Navigation Count</h4>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {navigationCount}
            </div>
            <p className="text-xs text-gray-400">Total page navigations tracked</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <div className="text-sm text-gray-400">
            Core Web Vitals monitoring • Real-time performance tracking
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => performanceMonitor.clearMetrics()}
              className="glass-panel px-3 py-1 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              Clear Data
            </button>
            <button
              onClick={() => {
                const data = performanceMonitor.exportData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `performance-data-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="glass-panel px-3 py-1 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};