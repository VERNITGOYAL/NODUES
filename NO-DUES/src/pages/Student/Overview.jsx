import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, FiFileText, FiActivity, FiShield, 
  FiChevronRight, FiCheckCircle, FiClock 
} from 'react-icons/fi';

const SCHOOL_CODE_MAP = {
  1: 'SOICT', 2: 'SOM', 3: 'SOE', 
  4: 'SOBT', 5: 'SOVSAS', 6: 'SOHSS',
};

function getSchoolCode(schoolId) {
  if (!schoolId) return 'N/A';
  return SCHOOL_CODE_MAP[Number(schoolId)] || 'N/A';
}

const StatCard = ({ label, value, highlight, icon: Icon }) => (
  <div className={`relative overflow-hidden p-5 rounded-[2rem] border transition-all duration-300 ${
    highlight 
    ? 'bg-emerald-50 border-emerald-100 shadow-emerald-100/50 shadow-lg' 
    : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
  }`}>
    <div className="relative z-10">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
        highlight ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
      }`}>
        <Icon size={16} />
      </div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-lg font-black truncate ${highlight ? 'text-emerald-700' : 'text-slate-900'}`}>
        {value || '—'}
      </div>
    </div>
  </div>
);

const Overview = ({ user, formData, stepStatuses = [], setActive }) => {
  const isFullyCleared = stepStatuses.length > 0 && stepStatuses.every(s => s.status === 'completed');
  const firstName = formData.fullName?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 🚀 WELCOME HERO SECTION */}
      <div className="relative bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 overflow-hidden shadow-2xl shadow-blue-900/20">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-10 translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6"
            >
              <FiShield size={12} /> University Registry Verified
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
              Greetings, <span className="text-blue-400">{firstName}</span>.
            </h1>
            <p className="text-slate-400 text-base font-medium leading-relaxed mb-0">
              Your digital clearance dashboard is active. Monitor your departmental approvals and manage your academic standing in real-time.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 min-w-[200px]">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Overall Progress</div>
             <div className="text-4xl font-black text-white mb-1">
               {isFullyCleared ? '100%' : 'Active'}
             </div>
             <div className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${isFullyCleared ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
               {isFullyCleared ? 'System Cleared' : 'In Review'}
             </div>
          </div>
        </div>
      </div>

      {/* 📊 CORE METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Enrollment ID" value={formData.enrollmentNumber || user?.enrollment_number} icon={FiUser} />
        <StatCard label="Registry Roll" value={formData.rollNumber || user?.roll_number} icon={FiFileText} />
        <StatCard 
          label="Academic School" 
          value={getSchoolCode(formData.school_id || user?.school_id || user?.student?.school_id)} 
          icon={FiShield} 
        />
        <StatCard 
          label="Verification Status" 
          value={isFullyCleared ? 'Approved' : 'Pending'} 
          highlight={isFullyCleared} 
          icon={isFullyCleared ? FiCheckCircle : FiClock} 
        />
      </div>

      {/* ⚡ ACTION PORTALS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => setActive('form')} 
          className="group relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-slate-50 transition-transform group-hover:scale-110 group-hover:text-blue-50">
            <FiFileText size={120} />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
              <FiFileText className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Modify Application</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Refresh your personal documentation and registry details.</p>
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
              Access Portal <FiChevronRight />
            </div>
          </div>
        </button>

        <button 
          onClick={() => setActive('status')} 
          className="group relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-slate-50 transition-transform group-hover:scale-110 group-hover:text-emerald-50">
            <FiActivity size={120} />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
              <FiActivity className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Live Track Flow</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Analyze real-time status transitions across departments.</p>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              View Analytics <FiChevronRight />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Overview;