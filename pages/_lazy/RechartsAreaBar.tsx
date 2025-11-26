import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid 
} from 'recharts';

export default function RechartsAreaBar({ trendData }: { trendData: { name: string; plays: number }[] }) {
  return (
    <>
      {/* Play History */}
      <div className="glass-panel p-6 rounded-2xl h-80">
        <h3 className="text-lg font-bold text-white mb-4">Listening History</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#171717', border: '1px solid #333' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="plays" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPlays)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* User Demographics (Mock Bar) */}
      <div className="glass-panel p-6 rounded-2xl h-80">
        <h3 className="text-lg font-bold text-white mb-4">Genre Performance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[
            { name: 'House', value: 4000 },
            { name: 'Techno', value: 3000 },
            { name: 'Lofi', value: 2000 },
            { name: 'Pop', value: 2780 },
            { name: 'Rock', value: 1890 },
          ]}>
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ backgroundColor: '#171717', border: '1px solid #333' }}
            />
            <Bar dataKey="value" fill="#4c1d95" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
