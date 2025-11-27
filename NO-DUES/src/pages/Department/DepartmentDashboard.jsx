import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { FiSearch, FiUser, FiMail, FiBook, FiCheckCircle, FiXCircle, FiEye, FiFilter, FiClock, FiArchive, FiCheck, FiX, FiMessageSquare, FiDownload } from 'react-icons/fi';

const DepartmentDashboard = () => {
  const { user, logout, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionRemark, setActionRemark] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const applicationPopupRef = useRef(null);

  const departmentMenuItems = [
    { id: 1, label: 'Dashboard', path: '/department/dashboard' },
    { id: 2, label: 'Pending', path: '/department/pending' },
    { id: 3, label: 'History', path: '/department/history' },
  ];

  // Fetch all applications from backend
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const API_URL = 'https://gbubackend-gbubackend.pagekite.me/api/approvals/all/enriched';
        const res = await authFetch(API_URL, { method: 'GET' });
        let data = [];
        try { data = await res.json(); } catch (e) { data = []; }
        
        const allApplications = Array.isArray(data)
          ? data.map(app => ({
              id: app.application_id || app.id || app._id,
              rollNo: app.roll_number || app.rollNo || app.student_roll_no || '',
              enrollment: app.enrollment_number || app.enrollmentNumber || '',
              name: app.student_name || app.name || app.full_name || '',
              date: app.created_at || app.application_date || app.date || '',
              status: app.application_status || app.status || '',
              course: app.course || app.student_course || '',
              email: app.student_email || app.email || '',
              mobile: app.student_mobile || app.mobile || '',
              department: app.department_name || app.department || ''
            }))
          : [];
        
        setApplications(allApplications);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [authFetch]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (applicationPopupRef.current && !applicationPopupRef.current.contains(event.target)) {
        setSelectedApplication(null);
      }
    };

    if (selectedApplication) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedApplication]);

  const handleDepartmentAction = async (application, action, remark) => {
    if (!application) return;
    if (action === 'reject' && (!remark || !remark.trim())) {
      setActionError('Remark is required when rejecting');
      return;
    }

    setActionLoading(true);
    setActionError('');
    
    try {
      const payload = { 
        department_id: user?.department_id, 
        action: action === 'approve' ? 'approve' : 'reject', 
        remark: remark || null 
      };
      
      const res = await authFetch(`/api/approvals/${application.id}/review`, { 
        method: 'POST', 
        body: JSON.stringify(payload) 
      });
      
      let body = null;
      try { body = await res.json(); } catch (e) { body = null; }

      if (res.ok) {
        // Update local applications list
        setApplications(prev => 
          prev.map(app => 
            app.id === application.id 
              ? { ...app, status: action === 'approve' ? 'Approved' : 'Rejected' }
              : app
          )
        );
        setSelectedApplication(null);
        setActionRemark('');
        alert(`Application ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      } else {
        const errMsg = body?.detail || body?.message || `Failed to ${action} application`;
        setActionError(errMsg);
      }
    } catch (err) {
      setActionError(err?.message || `Failed to ${action} application`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'bg-green-100 text-green-800';
    if (status === 'Rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const renderStatusBadge = (status) => {
    return status === 'Cleared' ? (
      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
        <FiCheckCircle className="mr-1" /> Cleared
      </span>
    ) : (
      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
        <FiXCircle className="mr-1" /> Pending
      </span>
    );
  };

  const filteredApplications = filterStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  const renderApplicationsTable = (apps) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apps.length > 0 ? (
              apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{app.rollNo || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{app.name || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{app.course || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{app.date ? new Date(app.date).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedApplication(app)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center font-medium"
                    >
                      <FiEye className="mr-1" /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No applications found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar menuItems={departmentMenuItems} user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Department Dashboard</h1>
            <p className="text-gray-600">No-Dues Application Review</p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-800">{applications.length}</p>
                </div>
                <FiBook className="text-blue-500 text-3xl opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{applications.filter(a => a.status === 'Pending').length}</p>
                </div>
                <FiClock className="text-yellow-500 text-3xl opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{applications.filter(a => a.status === 'Approved').length}</p>
                </div>
                <FiCheckCircle className="text-green-500 text-3xl opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{applications.filter(a => a.status === 'Rejected').length}</p>
                </div>
                <FiXCircle className="text-red-500 text-3xl opacity-20" />
              </div>
            </div>
          </div>

          {/* Filter and Applications Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Applications</h2>
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-500" />
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading applications...</div>
            ) : (
              renderApplicationsTable(filteredApplications)
            )}
          </div>
        </main>
      </div>

      {/* Application Popup */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            ref={applicationPopupRef}
            className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Application Details - {selectedApplication.name}
                </h3>
                <button 
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Application Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Roll Number</label>
                  <p className="text-gray-900 font-medium">{selectedApplication.rollNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Enrollment Number</label>
                  <p className="text-gray-900 font-medium">{selectedApplication.enrollment ?? '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900 font-medium">{selectedApplication.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 font-medium">{selectedApplication.email ?? '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile</label>
                  <p className="text-gray-900 font-medium">{selectedApplication.mobile ?? '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Course</label>
                  <p className="text-gray-900 font-medium">{selectedApplication.course ?? '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Application Date</label>
                  <p className="text-gray-900 font-medium">{selectedApplication.date ? new Date(selectedApplication.date).toLocaleDateString() : '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              {selectedApplication.status === 'Pending' && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Department Action</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remark (required for rejection)
                      </label>
                      <textarea 
                        value={actionRemark} 
                        onChange={(e) => setActionRemark(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter your remarks here..."
                      />
                      {actionError && (
                        <p className="text-red-600 text-sm mt-2">{actionError}</p>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        disabled={actionLoading}
                        onClick={() => handleDepartmentAction(selectedApplication, 'approve', actionRemark)}
                        className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <FiCheck className="mr-2" />
                        {actionLoading ? 'Processing...' : 'Approve'}
                      </button>
                      
                      <button
                        disabled={actionLoading}
                        onClick={() => handleDepartmentAction(selectedApplication, 'reject', actionRemark)}
                        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <FiX className="mr-2" />
                        {actionLoading ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDashboard;
