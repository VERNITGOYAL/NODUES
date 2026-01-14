import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Settings, Menu, Loader2, User, 
  LogOut, Zap, ArrowRight, LayoutDashboard 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminNavigation } from '../../utils/navigation';
import { useNavigate } from 'react-router-dom';

// Widgets & Pages
import DashboardStats from './DashboardStats';
import PerformanceChart from './PerformanceChart';
import RecentLogsWidget from './RecentLogsWidget';
import QuickActions from './QuickActions';
import SystemMetricsWidget from './SystemMetricsWidget';
import UserManagement from './UserManagement';
import SchoolDeptManagement from './SchoolDeptManagement';
import AuditLogs from './AuditLogs';
import Reports from './Reports';
import ApplicationManagement from './ApplicationManagement';

// Modals
import RegisterUserModal from './RegisterUserModal';
import ProfileModal from './ProfileModal';
import LogoutConfirmModal from './LogoutConfirmModal';

const AdminDashboard = () => {
  const { user, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Redirect non-admins away
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const sidebarItems = getAdminNavigation(user?.role);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ students: [], applications: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState({ 
    register: false, 
    profile: false, 
    logout: false 
  });

  const searchRef = useRef(null);
  const settingsRef = useRef(null);

  // Search Logic with Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 3) {
        setIsSearching(true);
        try {
          const res = await authFetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data || { students: [], applications: [] });
            setShowSearchResults(true);
          }
        } catch (error) {
          console.error("Search failed:", error);
          setSearchResults({ students: [], applications: [] });
        } finally {
          setIsSearching(false);
        }
      } else {
        setShowSearchResults(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, authFetch]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Management Overview</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                  Welcome back, <span className="text-blue-600 font-bold">{user?.name}</span>
                </p>
              </div>
              {user?.role === 'dean' && (
                <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                  <Zap size={14} className="text-amber-600 fill-amber-600" />
                  <span className="text-[10px] font-black uppercase text-amber-700 tracking-widest">{user?.school} Access</span>
                </div>
              )}
            </div>
            
            {/* Optimized Stats Row */}
            <DashboardStats stats={{ total: searchResults.students.length }} />
            
            <div className="grid gap-6 lg:grid-cols-7">
              <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <PerformanceChart />
              </div>
              <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <RecentLogsWidget onNavigate={() => setActiveTab('audit')} />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
              <div className="lg:col-span-3">
                <QuickActions 
                  onRegisterUser={() => setModalOpen({ ...modalOpen, register: true })} 
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              </div>
              <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <SystemMetricsWidget />
              </div>
            </div>
          </div>
        );
      case 'applications': return <ApplicationManagement />;
      case 'users': return <UserManagement />;
      case 'schools': return <SchoolDeptManagement />;
      case 'audit': return <AuditLogs />;
      case 'reports': return <Reports />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden h-screen">
      
      {/* HEADER */}
      <header className="h-20 bg-[#1e40af] text-white flex items-center justify-between px-8 shadow-xl z-30 sticky top-0 shrink-0">
        <div className="flex items-center gap-6">
          <button className="md:hidden p-2 hover:bg-blue-700 rounded-xl" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight uppercase">GBU No Dues</h1>
            <span className="text-[9px] font-black text-blue-300 uppercase tracking-[0.3em]">Management Console</span>
          </div>
        </div>

        {/* Search Bar Container */}
        <div className="flex-1 max-w-xl mx-12 hidden md:block relative" ref={searchRef}>
          <div className="relative group">
            {isSearching ? (
              <Loader2 className="absolute left-4 top-3 h-5 w-5 text-blue-400 animate-spin z-10" />
            ) : (
              <Search className="absolute left-4 top-3 h-5 w-5 text-blue-200 group-focus-within:text-blue-600 z-10 transition-colors" />
            )}
            <input
              type="search"
              placeholder="Search Student or ND-ID..."
              className="w-full bg-white/10 hover:bg-white/20 focus:bg-white text-white focus:text-slate-900 placeholder-blue-200 focus:placeholder-slate-400 pl-12 h-11 rounded-2xl border border-white/10 focus:ring-8 focus:ring-blue-400/10 outline-none text-sm shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 3 && setShowSearchResults(true)}
            />
          </div>

          <AnimatePresence>
            {showSearchResults && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-14 left-0 right-0 bg-white border border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden z-[100] p-4"
              >
                <div className="max-h-[350px] overflow-y-auto space-y-2">
                  {searchResults.students.length > 0 ? (
                    searchResults.students.map(s => (
                      <button key={s.id} className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl text-left transition-all group">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">{s.full_name?.[0] || 'S'}</div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-800">{s.full_name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{s.roll_number}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No matching records found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile/Settings */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={settingsRef}>
            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="h-11 w-11 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all active:scale-90">
              <Settings className={`h-5 w-5 ${isSettingsOpen ? 'rotate-90' : ''} transition-transform duration-500`} />
            </button>
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-4 w-64 bg-white border border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden z-50 p-3">
                  <div className="px-4 py-3 mb-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated As</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                  </div>
                  <button onClick={() => { setModalOpen({...modalOpen, profile: true}); setIsSettingsOpen(false); }} className="w-full flex items-center gap-3 p-4 text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors font-bold text-[10px] uppercase tracking-widest">
                    <User size={16} className="text-blue-500" /> My Profile
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-white text-blue-700 flex items-center justify-center font-black text-xs shadow-lg uppercase">
            {user?.name?.substring(0, 2)}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`${isSidebarOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20`}>
          <div className="flex-1 overflow-y-auto py-10 px-6 space-y-3">
            {sidebarItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`w-full flex items-center h-14 px-6 rounded-[1.25rem] text-[10px] uppercase tracking-[0.2em] font-black transition-all group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <item.icon className={`mr-4 h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-slate-300 group-hover:text-blue-500'} transition-transform group-hover:scale-110`} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <button 
              onClick={() => setModalOpen({ ...modalOpen, logout: true })}
              className="w-full flex items-center h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-50 hover:bg-red-100 transition-all group border border-red-100"
            >
              <LogOut className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
          {renderContent()}
        </main>
      </div>

      {/* Global Modals */}
      <RegisterUserModal isOpen={modalOpen.register} onClose={() => setModalOpen(p => ({ ...p, register: false }))} />
      <ProfileModal isOpen={modalOpen.profile} onClose={() => setModalOpen(p => ({ ...p, profile: false }))} />
      <LogoutConfirmModal isOpen={modalOpen.logout} onClose={() => setModalOpen(p => ({ ...p, logout: false }))} />
    </div>
  );
};

export default AdminDashboard;