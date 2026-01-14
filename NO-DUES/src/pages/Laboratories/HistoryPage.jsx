import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiClock, FiCheckCircle, FiXCircle, FiSearch, 
  FiRefreshCw, FiCalendar, FiUser, FiHash 
} from 'react-icons/fi';
import RoleLayout from '../../components/common/RoleLayout';
import { useAuth } from '../../contexts/AuthContext';

const HistoryPage = () => {
  const { authFetch } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/approvals/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    item.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.display_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderActionBadge = (action) => {
    const isApproved = action?.toLowerCase() === 'approved';
    return (
      <span className={`flex items-center w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
        isApproved ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
      }`}>
        {isApproved ? <FiCheckCircle className="mr-1.5" /> : <FiXCircle className="mr-1.5" />}
        {action}
      </span>
    );
  };

  return (
    <RoleLayout>
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Approval History</h1>
            <p className="text-slate-500 text-xs font-medium">Audit logs for your past administrative actions</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Query audit logs..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-full md:w-64 shadow-sm transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchHistory}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-sm transition-all active:scale-95"
            >
              <FiRefreshCw size={18} className={isLoading ? 'animate-spin text-blue-500' : ''} />
            </button>
          </div>
        </div>

        {/* ✅ List Container with fixed height for roughly 6 items */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[500px]">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Archives...</p>
            </div>
          ) : filteredHistory.length > 0 ? (
            /* ✅ overflow-y-auto + h-[520px] locks the height so only ~6 items show */
            <div className="overflow-y-auto h-[560px] custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Profile</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Final Action</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Remarks / Feedback</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredHistory.map((item, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      key={item.timestamp + index}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            {item.student_name}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-widest border border-blue-100 uppercase">
                              {item.display_id}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                               # {item.roll_number}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {renderActionBadge(item.action)}
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs text-slate-500 italic max-w-xs truncate font-medium" title={item.remarks}>
                          "{item.remarks || 'Standard approval'}"
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                            <FiCalendar size={12} className="text-slate-400" /> 
                            {new Date(item.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                            <FiClock size={12} className="text-slate-300" /> 
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px]">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                 <FiClock className="text-slate-200 text-4xl" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Archive Empty</h3>
              <p className="text-xs text-slate-400 font-medium mt-2">No past actions recorded.</p>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default HistoryPage;