import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  QrCodeIcon, 
  PencilSquareIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState('qr');
  const [showQRModal, setShowQRModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40); // Initial 40s from mockup

  // Logic for the countdown timer in the modal
  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (showQRModal && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQRModal, timeLeft]);

  const teachers = [
    { id: 1, name: 'Dara' }, { id: 2, name: 'Lina' }, { id: 3, name: 'Vanna' },
    { id: 4, name: 'Sophea' }, { id: 5, name: 'Bopha' }, { id: 6, name: 'Chenda' },
    { id: 7, name: 'Rotha' }, { id: 8, name: 'Sreymom' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900 relative">
      
      {/* 1. Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 mt-1">March 10, 2026</p>
      </div>
      {/* 3. Reminder Bar */}
      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3 mb-8 shadow-sm">
        <div className="bg-white p-2 rounded-lg shadow-sm">
          <BellIcon className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h4 className="text-orange-900 font-bold">⚠️ Reminder: 8 Teacher(s) Not Marked</h4>
          <p className="text-orange-800 text-xs mt-1">
            Dara, Lina, Vanna, Sophea, Bopha, Chenda, Rotha, Sreymom have not been marked for attendance yet.
          </p>
        </div>
      </div>

      {/* 4. Tab Switcher */}
      <div className="bg-gray-200/50 p-1 rounded-xl inline-flex mb-8">
        <button 
          onClick={() => setActiveTab('manual')}
          className={`px-10 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <PencilSquareIcon className="w-4 h-4" />
          Manual Entry
        </button>
        <button 
          onClick={() => setActiveTab('qr')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'qr' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <QrCodeIcon className="w-4 h-4" />
          QR Scan
        </button>
      </div>

      {/* 5. Main Content Area */}
      {activeTab === 'manual' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Mark Attendance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-50 bg-gray-50/30">
                  <th className="px-8 py-5 font-semibold">Teacher</th>
                  <th className="px-8 py-5 font-semibold text-center">Present</th>
                  <th className="px-8 py-5 font-semibold text-center">Absent</th>
                  <th className="px-8 py-5 font-semibold text-center">Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 font-medium text-gray-700">{t.name}</td>
                    <td className="px-8 py-4 text-center"><input type="radio" name={`s-${t.id}`} className="w-5 h-5 accent-indigo-600 cursor-pointer" /></td>
                    <td className="px-8 py-4 text-center"><input type="radio" name={`s-${t.id}`} className="w-5 h-5 accent-indigo-600 cursor-pointer" /></td>
                    <td className="px-8 py-4 text-center"><input type="radio" name={`s-${t.id}`} className="w-5 h-5 accent-indigo-600 cursor-pointer" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-gray-50/30 flex justify-end border-t border-gray-50">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95">
              Save Attendance
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300">
          <h2 className="text-lg font-bold text-gray-800 mb-2">QR Code Attendance</h2>
          <p className="text-gray-500 text-sm mb-6">
            Teachers who have already scanned the QR code today will appear here with their timestamp.
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-green-800 font-bold mb-1">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Checked In via QR (0)</span>
              </div>
              <p className="text-green-600 text-sm italic ml-7">No teachers have scanned yet</p>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                <ClockIcon className="w-5 h-5 text-gray-400" />
                <span>Not Checked In (8)</span>
              </div>
              <p className="text-gray-500 text-sm ml-7 leading-relaxed font-medium">
                Dara, Lina, Vanna, Sophea, Bopha, Chenda, Rotha, Sreymom
              </p>
            </div>
          </div>

          <button 
            onClick={() => { setTimeLeft(40); setShowQRModal(true); }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.98]"
          >
            <QrCodeIcon className="w-6 h-6" />
            Generate Secure QR Code
          </button>
        </div>
      )}

      {/* --- QR MODAL OVERLAY --- */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 pb-0 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Secure Attendance QR Code</h2>
                <p className="text-sm text-gray-500 mt-1">This QR code is time-limited and auto-refreshes for security.</p>
              </div>
              <button 
                onClick={() => setShowQRModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="flex justify-center p-4">
              <div className="bg-white p-4 border border-gray-100 rounded-3xl shadow-sm">
                 <div className="w-48 h-48 bg-gray-50 flex items-center justify-center relative overflow-hidden rounded-xl">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=secure-attendance-2026" 
                      alt="QR Code" 
                      className="w-40 h-40 opacity-90"
                    />
                 </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 space-y-3 mb-6">
              <button className="w-full border border-gray-200 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <ArrowPathIcon className="w-4 h-4 text-gray-500" />
                Generate New Code Now
              </button>
              <button className="w-full border border-gray-200 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
                Download QR Code
              </button>
            </div>

            {/* Security Notice */}
           

          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;