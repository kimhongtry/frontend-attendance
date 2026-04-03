import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalTeachers: 0,
    presentToday: 0,
    absentToday: 0,
    permissionToday: 0,
    records: []
  });
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          // This updates the cards AND the table records
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
}, []);

const rawRate = dashboardData.totalTeachers > 0 
  ? Math.round((dashboardData.presentToday / dashboardData.totalTeachers) * 100) 
  : 0;
const attendanceRate = Math.min(rawRate, 100);

if (loading) return <div className="p-8 text-center">Loading...</div>;

return (
  <div className="p-8 bg-gray-50 min-h-screen">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Teachers" value={dashboardData.totalTeachers.toString()} trend="+0%" icon="👤" iconBg="bg-blue-500" />
        <StatCard title="Present Today" value={dashboardData.presentToday.toString()} trend="+0%" icon="✓" iconBg="bg-green-500" />
        <StatCard title="Absent" value={dashboardData.absentToday.toString()} trend="+0%" icon="✕" iconBg="bg-red-500" />
        <StatCard title="Permission" value={dashboardData.permissionToday.toString()} trend="+0%" icon="🕒" iconBg="bg-yellow-500" />
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <h3 className="text-gray-700 font-bold mb-4">Today's Attendance Rate</h3>
        <div className="flex justify-between items-end mb-2">
          <span className="text-4xl font-black text-gray-800">{attendanceRate}%</span>
          <span className="text-sm text-gray-500">{dashboardData.presentToday} out of {dashboardData.totalTeachers}</span>
        </div>
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div className="bg-indigo-600 h-full transition-all duration-700" style={{ width: `${attendanceRate}%` }}></div>
        </div>
      </div>

      {/* Recent Attendance Table */}
     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
  {/* Changed title to show Yesterday */}
  <h3 className="text-gray-700 font-bold mb-4">Yesterday's Attendance (Apr 2)</h3>
  
  <div className="max-h-[400px] overflow-y-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="text-gray-400 text-sm border-b border-gray-100">
          <th className="pb-4">Teacher</th>
          <th className="pb-4">Status</th>
          <th className="pb-4">Time</th>
          <th className="pb-4">Date</th>
        </tr>
      </thead>
      <tbody>
        {dashboardData.records.map((row: any, idx: number) => (
          <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
            <td className="py-4 font-medium">{row.name}</td>
            <td className="py-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white 
                ${row.status.toLowerCase() === 'present' ? 'bg-green-500' : 
                  row.status.toLowerCase() === 'absent' ? 'bg-red-500' : 'bg-yellow-500'}`}>
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
  </div>
);
};

export default Dashboard;