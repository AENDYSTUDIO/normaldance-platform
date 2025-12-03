/**
 * Performance Monitoring Service
 * Tracks Core Web Vitals and application performance metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  navigationType?: string;
}

interface PerformanceData {
  metrics: PerformanceMetric[];
  navigationCount: number;
  lastNavigation: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private navigationCount = 0;
  private lastNavigation = Date.now();
  private observers: PerformanceObserver[] = [];
  private isSupported = typeof window !== 'undefined' && 'performance' in window;

  private constructor() {
    if (this.isSupported) {
      this.initializeObservers();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    try {
      // Largest Contentful Paint (LCP)
      this.observeMetric('largest-contentful-paint', (entries) => {
        const lastEntry = entries[entries.length - 1];
        this.addMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          rating: this.getLCPRating(lastEntry.startTime),
          timestamp: Date.now(),
          navigationType: this.getNavigationType(),
        });
      });

      // First Input Delay (FID)
      this.observeMetric('first-input', (entries) => {
        const firstEntry = entries[0];
        this.addMetric({
          name: 'FID',
          value: firstEntry.processingStart - firstEntry.startTime,
          rating: this.getFIDRating(firstEntry.processingStart - firstEntry.startTime),
          timestamp: Date.now(),
          navigationType: this.getNavigationType(),
        });
      });

      // Cumulative Layout Shift (CLS)
      this.observeMetric('layout-shift', (entries) => {
        let clsValue = 0;
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        this.addMetric({
          name: 'CLS',
          value: clsValue,
          rating: this.getCLSRating(clsValue),
          timestamp: Date.now(),
          navigationType: this.getNavigationType(),
        });
      });

      // First Contentful Paint (FCP)
      this.observeMetric('paint', (entries) => {
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.addMetric({
              name: 'FCP',
              value: entry.startTime,
              rating: this.getFCPRating(entry.startTime),
              timestamp: Date.now(),
              navigationType: this.getNavigationType(),
            });
          }
        });
      });

      // Time to First Byte (TTFB)
      this.observeMetric('navigation', (entries) => {
        const navEntry = entries[0];
        if (navEntry.entryType === 'navigation') {
          const ttfb = navEntry.responseStart - navEntry.requestStart;
          this.addMetric({
            name: 'TTFB',
            value: ttfb,
            rating: this.getTTFBRating(ttfb),
            timestamp: Date.now(),
            navigationType: this.getNavigationType(),
          });
        }
      });

    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error);
    }
  }

  private observeMetric(type: string, callback: (entries: any[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });

      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      // Silently fail for unsupported metrics
    }
  }

  private getNavigationType(): string {
    if (!this.isSupported) return 'unknown';

    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      switch (navEntries[0].type) {
        case 'navigate': return 'navigation';
        case 'reload': return 'reload';
        case 'back_forward': return 'back_forward';
        case 'prerender': return 'prerender';
        default: return 'unknown';
      }
    }
    return 'unknown';
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }

  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    this.navigationCount++;
    this.lastNavigation = Date.now();

    // Keep only last 100 metrics to prevent memory issues
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log performance warnings
    if (metric.rating === 'poor') {
      console.warn(`Poor performance detected for ${metric.name}: ${metric.value.toFixed(2)}`);
    }

    // Store in localStorage for persistence
    this.saveToLocalStorage();
  }

  private saveToLocalStorage() {
    try {
      const data: PerformanceData = {
        metrics: this.metrics,
        navigationCount: this.navigationCount,
        lastNavigation: this.lastNavigation,
      };
      localStorage.setItem('performance-data', JSON.stringify(data));
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  private loadFromLocalStorage(): PerformanceData {
    try {
      const stored = localStorage.getItem('performance-data');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      // Silently fail if localStorage data is corrupted
    }
    return {
      metrics: [],
      navigationCount: 0,
      lastNavigation: Date.now(),
    };
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getLatestMetrics(): Record<string, PerformanceMetric | undefined> {
    const latest: Record<string, PerformanceMetric> = {};

    this.metrics.forEach((metric) => {
      if (!latest[metric.name] || metric.timestamp > latest[metric.name].timestamp) {
        latest[metric.name] = metric;
      }
    });

    return latest;
  }

  public getPerformanceScore(): number {
    const latest = this.getLatestMetrics();
    const weights = {
      LCP: 0.25,
      FID: 0.25,
      CLS: 0.25,
      FCP: 0.15,
      TTFB: 0.10,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([metric, weight]) => {
      if (latest[metric]) {
        const score = this.getMetricScore(latest[metric]!.rating);
        totalScore += score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? totalScore : 0;
  }

  private getMetricScore(rating: 'good' | 'needs-improvement' | 'poor'): number {
    switch (rating) {
      case 'good': return 100;
      case 'needs-improvement': return 50;
      case 'poor': return 0;
      default: return 0;
    }
  }

  public getPerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const score = this.getPerformanceScore();
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  public clearMetrics(): void {
    this.metrics = [];
    this.navigationCount = 0;
    this.lastNavigation = Date.now();
    this.saveToLocalStorage();
  }

  public exportData(): PerformanceData {
    return {
      metrics: [...this.metrics],
      navigationCount: this.navigationCount,
      lastNavigation: this.lastNavigation,
    };
  }

  public destroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();