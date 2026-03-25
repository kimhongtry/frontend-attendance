import React from 'react';

// Define the "Shape" of the data for TypeScript
interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: string;
  iconBg: string;
  trendType?: 'up' | 'down'; // Optional property
}

// Pass the interface to the component
const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendType, icon, iconBg }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col w-full">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        <div className={`${iconBg} w-8 h-8 rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className={`text-xs font-semibold ${trendType === 'up' ? 'text-green-500' : trendType === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
        {trendType === 'up' ? '↗' : trendType === 'down' ? '↘' : '→'} {trend}
      </div>
    </div>
  );
};

export default StatCard;