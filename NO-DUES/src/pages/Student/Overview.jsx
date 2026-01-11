import React from 'react';
import { FiUser, FiFileText, FiActivity } from 'react-icons/fi';

const SCHOOL_CODE_MAP = {
  1: 'SOICT',
  2: 'SOM',
  3: 'SOE',
  4: 'SOBT',
  5: 'SOVSAS',
  6: 'SOHSS',
};

function getSchoolCode(schoolId) {
  if (!schoolId) return '';
  return SCHOOL_CODE_MAP[Number(schoolId)] || '';
}

const StatCard = ({ label, value, highlight }) => (
  <div className={`p-4 rounded-xl border ${highlight ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
    <div className={`text-lg font-bold truncate ${highlight ? 'text-emerald-700' : 'text-slate-900'}`}>
      {value || '—'}
    </div>
  </div>
);

const Overview = ({ user, formData, stepStatuses, setActive }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {formData.fullName?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-slate-500 mb-8 max-w-2xl">
            Track your clearance process, manage your application, and stay updated with real-time status changes.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatCard label="Enrollment No" value={formData.enrollmentNumber || user?.enrollment_number} />
            <StatCard label="Roll No" value={formData.rollNumber || user?.roll_number} />
            <StatCard 
              label="School" 
              value={getSchoolCode(formData.school_id || user?.school_id || user?.student?.school_id) || '—'} 
            />
            <StatCard 
              label="Status" 
              value={stepStatuses.every(s => s.status === 'completed') ? 'Cleared' : 'Pending'} 
              highlight={stepStatuses.every(s => s.status === 'completed')} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => setActive('form')} 
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FiFileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Edit Application</h3>
          <p className="text-sm text-slate-500">Update your personal details and documents.</p>
        </button>

        <button 
          onClick={() => setActive('status')} 
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FiActivity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Track Progress</h3>
          <p className="text-sm text-slate-500">View real-time status of your clearances.</p>
        </button>
      </div>
    </div>
  );
};

export default Overview;