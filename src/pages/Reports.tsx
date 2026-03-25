import React from 'react';
import { 
  BellIcon, 
  ArrowDownTrayIcon, 
  PaperAirplaneIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const ReportsPage = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900">
      
      {/* --- HEADER & EXPORT ACTIONS --- */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">View attendance reports and analytics</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-green-200 text-green-600 bg-green-50 rounded-xl font-bold text-sm hover:bg-green-100 transition-colors">
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 bg-red-50 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* --- ATTENDANCE ALERTS --- */}
      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-8 flex items-start gap-3 shadow-sm">
        <BellIcon className="w-5 h-5 text-orange-500 mt-0.5" />
        <div>
          <h4 className="text-orange-900 font-bold text-sm">Attendance Alerts</h4>
          <p className="text-orange-800 text-sm">
            3 teacher(s) have been absent this week: Dara, Chenda, Sophea
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- DAILY REPORT CARD --- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Daily Report</h3>
            <p className="text-sm text-gray-400">Date: March 10, 2026</p>
          </div>
          
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
            <span className="text-gray-600 font-medium">Total Teachers</span>
            <span className="text-2xl font-bold text-gray-900">12</span>
          </div>

          <div className="space-y-4">
            {/* Present List */}
            <div className="bg-green-50/50 border border-green-100 p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-green-800 font-bold">Present</span>
                <span className="text-xl font-bold text-green-700">10</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {['Dara', 'Vanna', 'Bopha', 'Chenda', 'Rotha', 'Sreymom', 'Kimheng', 'Sothea', 'Ratana', 'Channary'].map((name) => (
                  <span key={name} className="text-green-600 text-sm flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Absent Item */}
            <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-red-800 font-bold block">Absent</span>
                <span className="text-red-600 text-sm">• Lina</span>
              </div>
              <span className="text-xl font-bold text-red-700">1</span>
            </div>

            {/* Permission Item */}
            <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-orange-800 font-bold block">Permission</span>
                <span className="text-orange-600 text-sm">• Sophea</span>
              </div>
              <span className="text-xl font-bold text-orange-700">1</span>
            </div>
          </div>

          <button className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]">
            <PaperAirplaneIcon className="w-5 h-5 -rotate-12" />
            Send to Telegram
          </button>
        </div>

        {/* --- WEEKLY REPORT CARD --- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Weekly Report</h3>
            <p className="text-sm text-gray-400">March 4 - March 10, 2026 • Sorted by Present Days</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-50">
                  <th className="pb-4 font-semibold">Teacher</th>
                  <th className="pb-4 font-semibold text-center">Present</th>
                  <th className="pb-4 font-semibold text-center">Absent</th>
                  <th className="pb-4 font-semibold text-center">Perm.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: 'Lina', p: 6, a: 0, per: 1 },
                  { name: 'Bopha', p: 6, a: 0, per: 0 },
                  { name: 'Rotha', p: 6, a: 0, per: 0 },
                  { name: 'Dara', p: 5, a: 1, per: 0 },
                  { name: 'Vanna', p: 5, a: 0, per: 0 },
                  { name: 'Chenda', p: 5, a: 1, per: 0 },
                  { name: 'Sreymom', p: 5, a: 0, per: 1 },
                  { name: 'Sophea', p: 4, a: 1, per: 1 },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 text-sm font-medium text-gray-700">{row.name}</td>
                    <td className="py-4 text-center">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{row.p}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">{row.a}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">{row.per}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;