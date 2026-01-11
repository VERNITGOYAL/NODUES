import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

// Child Components
import DashboardStats from './DashboardStats';
import DashboardFilters from './DashboardFilters';
import ApplicationsTable from './ApplicationsTable';
import ApplicationActionModal from './ApplicationActionModal';

// Animation variants for the main container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const SchoolDashboard = () => {
  const { user, logout, authFetch } = useAuth();
  
  // State
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Action State
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // --- Data Fetching Logic ---
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Enriched Data
      const enrichedRes = await authFetch('/api/approvals/all/enriched', { method: 'GET' });
      let enriched = [];
      try { enriched = await enrichedRes.json(); } catch (e) { enriched = []; }

      // 2. Fetch Full Data (for stage_id)
      const allRes = await authFetch('/api/approvals/all', { method: 'GET' });
      let allData = [];
      try { allData = await allRes.json(); } catch (e) { allData = []; }

      // 3. Merge Data
      const mapByAppId = new Map();
      if (Array.isArray(allData)) {
        for (const rec of allData) {
          const id = rec.application_id || rec.id || rec._id;
          if (id) mapByAppId.set(String(id), rec);
        }
      }

      const allApplications = Array.isArray(enriched)
        ? enriched.map(app => {
            const appId = app.application_id || app.id || app._id;
            const full = appId ? mapByAppId.get(String(appId)) : null;
            return {
              id: appId,
              application_id: appId,
              rollNo: app.roll_number || app.rollNo || app.student_roll_no || '',
              enrollment: app.enrollment_number || app.enrollmentNumber || '',
              name: app.student_name || app.name || app.full_name || '',
              date: app.created_at || app.application_date || app.date || '',
              status: app.application_status || app.status || 'Pending',
              course: app.course || app.student_course || '',
              email: app.student_email || app.email || '',
              mobile: app.student_mobile || app.mobile || '',
              // Check if backend uses 'school_name' or 'department_name'. Fallback to 'department' if needed.
              school: app.school_name || app.department_name || app.department || '',
              active_stage: (full && full.active_stage) ? full.active_stage : (app.active_stage || app.activeStage || null),
              match: true, 
            };
          })
        : [];

      setApplications(allApplications.filter(app => app.id));
    } catch (err) {
      setApplications([]);
      console.error('Failed to fetch applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [authFetch]);

  // --- Action Logic ---
  const handleSchoolAction = async (application, action, remarksIn) => {
    if (!application) return;
    
    // Validation
    setActionError('');
    if (action === 'reject' && (!remarksIn || !remarksIn.trim())) {
      setActionError('Remarks are required when rejecting');
      return;
    }
  
    const stageId = application?.active_stage?.stage_id || application?.active_stage?.id || null;
    const appId = application?.application_id || application?.id || null;
    
    if (!stageId) {
      setActionError('Missing stage id; cannot perform school action.');
      return;
    }
  
    // Assuming backend still expects 'department_id' key in payload, but we treat it as school_id locally
    // If backend was also renamed, change keys to 'school_id'
    const schoolId = user?.department_id || user?.school_id; 
    
    const verb = action === 'approve' ? 'approve' : 'reject';
    const stageEndpoint = `/api/approvals/${stageId}/${verb}`;
    
    // API Payload
    const payload = { 
        department_id: schoolId || null, // Keeping key as department_id for API compatibility
        remarks: remarksIn || null 
    };
  
    setActionLoading(true);
  
    try {
      const res = await authFetch(stageEndpoint, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
  
      if (!res || !res.ok) {
        let body = null;
        try { body = await res?.json(); } catch (_) {}
        throw new Error(body?.message || `Action failed: ${res?.status}`);
      }
  
      // Optimistic UI Update
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
      const updatedApplications = applications.map(app =>
        (app.application_id || app.id || '').toString() === (appId || '').toString()
          ? { ...app, status: newStatus, active_stage: app.active_stage ? { ...app.active_stage, status: newStatus } : app.active_stage }
          : app
      );
  
      setApplications(updatedApplications);
      setSelectedApplication(null); // Close modal
      alert(`Action ${action} succeeded`);

    } catch (err) {
      console.error('School stage action failed', err);
      setActionError(err?.message || String(err));
    } finally {
      setActionLoading(false);
    }
  };

  // --- Search & Filter Logic ---
  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setApplications((prev) =>
      prev.map((a) => ({
        ...a,
        match: (a.name + a.rollNo + a.enrollment + a.course).toLowerCase().includes(q),
      }))
    );
  };

  const filteredApplications = applications.filter(
    (a) => a.match !== false && (filterStatus === 'all' || a.status.toLowerCase().replace(/[\s-]/g, '') === filterStatus.toLowerCase().replace(/[\s-]/g, ''))
  );

  // Stats Calculation
  const getStatusCount = (statusKey) => applications.filter((a) => (a.status || '').toLowerCase().replace(/[\s-]/g, '') === statusKey).length;
  const stats = {
    total: applications.length,
    pending: getStatusCount('pending') + getStatusCount('inprogress'),
    approved: getStatusCount('approved') + getStatusCount('cleared'),
    rejected: getStatusCount('rejected') + getStatusCount('denied')
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                
                {/* 1. Page Header */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-extrabold mb-1 text-gray-900">
                        {user?.department_name || user?.school_name || 'School'} Review
                    </h1>
                    <p className="text-gray-600 mb-6">Welcome, {user?.name}. Review and process pending No-Dues applications.</p>
                </motion.div>

                {/* 2. Stats Cards */}
                <DashboardStats stats={stats} />

                {/* 3. Filters & Refresh */}
                <motion.div variants={itemVariants}>
                  <DashboardFilters 
                    onSearch={handleSearch}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    onRefresh={fetchApplications}
                    isLoading={isLoading}
                  />
                </motion.div>

                {/* 4. Applications Table */}
                <ApplicationsTable 
                  applications={filteredApplications}
                  isLoading={isLoading}
                  onView={(app) => {
                    setActionError(''); // Clear previous errors
                    setSelectedApplication(app);
                  }}
                />

            </motion.div>
        </main>
      </div>

      {/* 5. Modal / Popup */}
      {selectedApplication && (
        <ApplicationActionModal 
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onAction={handleSchoolAction}
          actionLoading={actionLoading}
          actionError={actionError}
          userSchoolName={user?.department_name || user?.school_name || 'School'}
        />
      )}
    </div>
  );
};

export default SchoolDashboard;