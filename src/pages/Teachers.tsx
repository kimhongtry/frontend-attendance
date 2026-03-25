import React from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PencilSquareIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

const TeachersPage = () => {
  // Data fixed with staffId to avoid duplicate key errors
  const teachers = [
    { id: 1, name: 'Dara', subject: 'English', phone: '012 345 678', room: 'Room f2b5', staffId: '23045-5' },
    { id: 2, name: 'Lina', subject: 'Khmer', phone: '011 234 567', room: 'Room f2c3', staffId: '23045-6' },
    { id: 3, name: 'Vanna', subject: 'Mathematics', phone: '015 678 901', room: 'Room f2b3', staffId: '23045-7' },
    { id: 4, name: 'Sophea', subject: 'Science', phone: '017 890 123', room: 'Room f1c3', staffId: '23045-8' },
    { id: 5, name: 'Bopha', subject: 'History', phone: '012 456 789', room: 'Room f1c1', staffId: '23045-9' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-gray-500 mt-1">Manage teacher information and schedules</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95">
          <PlusIcon className="w-5 h-5 stroke-[2.5px]" />
          <span className="font-semibold">Add Teacher</span>
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, subject, or staff ID..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm border-gray-100">
          <FunnelIcon className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Teaching Staff List</h2>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            {teachers.length} Total Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest bg-gray-50/50">
                <th className="px-6 py-4 font-semibold">Staff ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Room</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400 font-bold">{teacher.staffId}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md font-medium">
                      {teacher.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 italic">{teacher.room}</td>
                  
                  {/* Integrated Action Buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Teacher"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Teacher"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeachersPage;