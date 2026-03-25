import React from 'react';
import StatCard from '../components/StatCard';

const Dashboard = () => {
  // Static data for mockups
  const attendanceData = [
    { name: 'Dara', status: 'Present', time: '8:05 AM', date: 'Mar 10' },
    { name: 'Lina', status: 'Absent', time: '-', date: 'Mar 10' },
    { name: 'Vanna', status: 'Present', time: '8:12 AM', date: 'Mar 10' },
    { name: 'Sophea', status: 'Permission', time: '9:00 AM', date: 'Mar 10' },
    { name: 'Bopha', status: 'Present', time: '8:18 AM', date: 'Mar 10' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      
      {/* --- Dashboard Header Section --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Overview of teacher attendance for today</p>
      </div>

      {/* 1. Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Teachers" value="12" trend="+0% from last week" icon="👤" iconBg="bg-blue-500" />
        <StatCard title="Present Today" value="10" trend="+10% from last week" trendType="up" icon="✓" iconBg="bg-green-500" />
        <StatCard title="Absent" value="1" trend="-5% from last week" trendType="down" icon="✕" iconBg="bg-red-500" />
        <StatCard title="Permission" value="1" trend="0% from last week" icon="🕒" iconBg="bg-yellow-500" />
      </div>

      {/* 2. Progress Bar Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <h3 className="text-gray-700 font-bold mb-4">Today's Attendance Rate</h3>
        <div className="flex justify-between items-end mb-2">
          <span className="text-4xl font-black text-gray-800">83%</span>
          <span className="text-sm text-gray-500">10 out of 12 teachers</span>
        </div>
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: '83%' }}></div>
        </div>
      </div>

      {/* 3. Recent Attendance Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-700 font-bold">Recent Attendance</h3>
            <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-100">
              <th className="pb-4 font-medium">Teacher</th>
              <th className="pb-4 font-medium">Status</th>
              <th className="pb-4 font-medium">Check-in Time</th>
              <th className="pb-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {attendanceData.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-4 font-medium">{row.name}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white 
                    ${row.status === 'Present' ? 'bg-green-500' : 
                      row.status === 'Absent' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 text-gray-500">{row.time}</td>
                <td className="py-4 text-gray-500">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;