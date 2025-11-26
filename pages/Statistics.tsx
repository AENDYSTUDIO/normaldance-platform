import React, { Suspense } from 'react';
import { TREND_DATA } from '../services/mockData';

const RechartsLazy = React.lazy(() => import('./_lazy/RechartsAreaBar'));

export const Statistics: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-display font-bold text-white">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Plays" value="1.2M" change="+12%" />
        <StatCard title="Unique Listeners" value="84.3K" change="+5.4%" />
        <StatCard title="Revenue (NDT)" value="45,200" change="+22%" />
        <StatCard title="NFT Sales" value="142" change="-2%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="glass-panel p-6 rounded-2xl h-80 flex items-center justify-center text-gray-400">Loading charts...</div>}>
          <RechartsLazy trendData={TREND_DATA} />
        </Suspense>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change }: any) => {
  const isPos = change.includes('+');
  return (
    <div className="glass-panel p-6 rounded-2xl">
      <p className="text-gray-400 text-sm">{title}</p>
      <div className="flex items-end justify-between mt-2">
        <h4 className="text-2xl font-bold text-white">{value}</h4>
        <span className={`text-xs font-bold px-2 py-1 rounded ${isPos ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {change}
        </span>
      </div>
    </div>
  );
};
