import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, Settings } from 'lucide-react';

const Profile: React.FC = () => {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return navigate('/login');

        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setAdmin(response.data.data);
        }
      } catch (err) {
        localStorage.removeItem('admin_token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  if (loading) return <div className="p-10 text-center text-[#6366f1] font-bold">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-start pt-12">
      <div className="w-full max-w-md bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
        {/* Purple Banner */}
        <div className="h-32 bg-[#6366f1] relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 bg-white rounded-2xl p-1 shadow-lg">
              <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center text-[#6366f1]">
                <User size={40} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-14 px-8 pb-10">
          <h1 className="text-2xl font-black text-gray-800">{admin?.username || "Admin"}</h1>
          <p className="text-gray-400 text-sm mb-8">System Administrator</p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <Mail className="text-[#6366f1]" size={18} />
              <span className="text-sm font-bold text-gray-700">{admin?.email}</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <Shield className="text-green-500" size={18} />
              <span className="text-sm font-bold text-gray-700">Verified Account</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button className="w-full py-4 bg-[#6366f1] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
              <Settings size={18} /> Edit Settings
            </button>
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;