import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { FiSearch, FiUser, FiMail, FiBook, FiDollarSign, FiCheckCircle, FiXCircle, FiUpload, FiDownload, FiX, FiPhone, FiCalendar, FiFilter, FiEye, FiCheck } from 'react-icons/fi';

const ExamDashboard = () => {
  const { user, logout, authFetch } = useAuth();
  const [rollNo, setRollNo] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({
    cancellationCheque: null,
    aadharCard: null,
    result: null
  });

  // State for applications
  const [applications, setApplications] = useState([]);
  const modalRef = useRef(null);

  const menuItems = [
    { id: 1, label: 'Dashboard', path: '/exam/dashboard' },
    { id: 2, label: 'Pending', path: '/exam/pending' },
    { id: 3, label: 'History', path: '/exam/history' },
  ];

  // Load all applications from backend on component mount
  useEffect(() => {
    const fetchAllApplications = async () => {
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
        setApplications([]);
        console.error('Failed to fetch applications:', err);
      }
    };
    fetchAllApplications();
  }, [authFetch]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedApplication(null);
      }
    };

    if (selectedApplication) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [selectedApplication]);

  // Mock student database
  const mockStudentDatabase = [
    {
      id: 1,
      rollNo: 'GBU2023001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@gbu.ac.in',
      course: 'B.Tech Computer Science',
      semester: '8th',
      phone: '+91 9876543210',
      feesStatus: 'Paid',
      libraryStatus: 'Cleared',
      hostelStatus: 'Cleared',
      noDuesStatus: 'Approved',
      applicationDate: '2025-09-01',
      documents: {
        cancellationCheque: true,
        aadharCard: true,
        result: true
      }
    },
    {
      id: 2,
      rollNo: 'GBU2023002',
      name: 'Priya Singh',
      email: 'priya.singh@gbu.ac.in',
      course: 'MBA',
      semester: '4th',
      phone: '+91 9876543211',
      feesStatus: 'Pending',
      libraryStatus: 'Cleared',
      hostelStatus: 'Pending',
      noDuesStatus: 'Pending',
      applicationDate: '2025-09-02',
      documents: {
        cancellationCheque: true,
        aadharCard: false,
        result: true
      }
    },
    {
      id: 3,
      rollNo: 'GBU2023003',
      name: 'Amit Kumar',
      email: 'amit.kumar@gbu.ac.in',
      course: 'B.Tech Electronics',
      semester: '8th',
      phone: '+91 9876543212',
      feesStatus: 'Paid',
      libraryStatus: 'Pending',
      hostelStatus: 'Cleared',
      noDuesStatus: 'Pending',
      applicationDate: '2025-09-03',
      documents: {
        cancellationCheque: true,
        aadharCard: true,
        result: false
      }
    }
  ];

  const DEPARTMENTS = [
    { id: 1, name: 'Department' },
    { id: 2, name: 'Library' },
    { id: 3, name: 'Hostel' },
    { id: 4, name: 'Accounts' },
    { id: 5, name: 'Sports' },
    { id: 6, name: 'Exam Cell' }
  ];

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedApplication(null);
      }
    };

    if (selectedApplication) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [selectedApplication]);

  // Load all applications from backend on component mount
  useEffect(() => {
    const fetchAllApplications = async () => {
      try {
        const API_URL = 'https://gbubackend-gbubackend.pagekite.me/api/approvals/all/enriched';
        const res = await authFetch(API_URL, { method: 'GET' });
        let data = [];
        try { data = await res.json(); } catch (e) { data = []; }
        // Map backend data to expected shape for table
        const allApplications = Array.isArray(data)
          ? data.map(app => ({
              // support multiple shapes; prefer explicit api keys if present
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
        setPendingApplications(allApplications.filter(app => app.status === 'Pending' || app.status === 'Rejected'));
        setApprovedApplications(allApplications.filter(app => app.status === 'Approved'));
      } catch (err) {
        setApplications([]);
        setPendingApplications([]);
        setApprovedApplications([]);
        console.error('Failed to fetch applications:', err);
      }
    };
    fetchAllApplications();
  }, [authFetch]);

  const handleSearch = () => {
    if (!rollNo) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const student = mockStudentDatabase.find(s => s.rollNo === rollNo);
      setStudentData(student || null);
      setIsLoading(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFileUpload = (fileType, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleSubmitNoDues = () => {
    alert('No-Dues application submitted successfully!');
    setStudentData(null);
    setRollNo('');
    setUploadedFiles({
      cancellationCheque: null,
      aadharCard: null,
      result: null
    });
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    // Find the student data for this application
    const student = mockStudentDatabase.find(s => s.rollNo === application.rollNo);
    setStudentData(student);
  };

  const handleUpdateApplicationStatus = (applicationId, status) => {
    // Update the application status
    const updatedApplications = applications.map(app => 
      app.id === applicationId ? { ...app, status } : app
    );
    
    setApplications(updatedApplications);
    setPendingApplications(updatedApplications.filter(app => app.status === 'Pending' || app.status === 'Rejected'));
    setApprovedApplications(updatedApplications.filter(app => app.status === 'Approved'));
    
    // If we're viewing this application, update it
    if (selectedApplication && selectedApplication.id === applicationId) {
      setSelectedApplication({ ...selectedApplication, status });
    }
    
    alert(`Application status updated to ${status}`);
  };

  const handleDepartmentAction = async (application, departmentId, action, remark) => {
    // action: 'approve' | 'reject'
    if (!application) return;
    if (action === 'reject' && (!remark || !remark.trim())) {
      setActionError('Remark is required when rejecting');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      const payload = { department_id: departmentId, action: action === 'approve' ? 'approve' : 'reject', remark: remark || null };
      const res = await authFetch(`/api/approvals/${application.id}/review`, { method: 'POST', body: JSON.stringify(payload) });
      let body = null;
      try { body = await res.json(); } catch (e) { body = null; }
      if (!res.ok) {
        setActionError(body && body.message ? body.message : `Action failed: ${res.status}`);
        setActionLoading(false);
        return;
      }
      // Update local state to reflect change
      const updatedApplications = applications.map(app => app.id === application.id ? { ...app, status: action === 'approve' ? 'Approved' : 'Rejected', department: DEPARTMENTS.find(d => d.id === departmentId)?.name || app.department } : app);
      setApplications(updatedApplications);
      setPendingApplications(updatedApplications.filter(app => app.status === 'Pending' || app.status === 'Rejected'));
      setApprovedApplications(updatedApplications.filter(app => app.status === 'Approved'));
      setSelectedApplication(prev => prev && prev.id === application.id ? { ...prev, status: action === 'approve' ? 'Approved' : 'Rejected', department: DEPARTMENTS.find(d => d.id === departmentId)?.name || prev.department } : prev);
      setActionLoading(false);
      alert(`Action ${action} succeeded`);
    } catch (e) {
      setActionError(e?.message || String(e));
      setActionLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = String(d.getFullYear()).slice(-2);
      return `${dd}/${mm}/${yy}`;
    } catch (e) { return iso; }
  };

  const renderStatusBadge = (status) => {
    const s = (status || '').toString();
    const key = s.toLowerCase();
    if (['cleared', 'approved'].includes(key)) {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
          <FiCheckCircle className="mr-1" /> {s}
        </span>
      );
    }
    if (['inprogress', 'in_progress', 'in-progress', 'in progress'].includes(key)) {
      return (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
          <FiCalendar className="mr-1" /> {s}
        </span>
      );
    }
    if (['pending'].includes(key)) {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
          <FiCalendar className="mr-1" /> {s}
        </span>
      );
    }
    if (['rejected', 'denied'].includes(key)) {
      return (
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
          <FiXCircle className="mr-1" /> {s}
        </span>
      );
    }
    return (
      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
        {s}
      </span>
    );
  };

  const renderApplicationsTable = (applicationsList) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enrollment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applicationsList.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{app.rollNo}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.enrollment ?? '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.course ?? '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(app.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStatusBadge(app.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewApplication(app)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                      <FiEye className="mr-1" /> View
                    </button>
                    {app.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleUpdateApplicationStatus(app.id, 'Approved')}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <FiCheck className="mr-1" /> Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateApplicationStatus(app.id, 'Rejected')}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <FiX className="mr-1" /> Reject
                        </button>
                      </>
                    )}
                    <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                      <FiDownload className="mr-1" /> Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderApplicationPopup = () => {
    if (!selectedApplication) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div 
          ref={modalRef}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl">
            <div className="flex justify-between items-start">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-1">Application Details</h3>
                <p className="text-indigo-100 text-sm">{selectedApplication.rollNo}</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {/* Student Info */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Student Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Full Name</p>
                  <p className="font-medium text-gray-900">{selectedApplication.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <p className="font-medium text-gray-900">{selectedApplication.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Course</p>
                  <p className="font-medium text-gray-900">{selectedApplication.course}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                  <p className="font-medium text-gray-900">{selectedApplication.mobile}</p>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Application Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Enrollment Number</p>
                  <p className="font-medium text-gray-900">{selectedApplication.enrollment ?? '—'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Application Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedApplication.date)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Department</p>
                  <p className="font-medium text-gray-900">{selectedApplication.department ?? '—'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <div className="mt-1">{renderStatusBadge(selectedApplication.status)}</div>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Department Action</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Department
                  </label>
                  <select 
                    value={actionDeptId ?? (DEPARTMENTS.find(d => d.name === selectedApplication.department)?.id || '')} 
                    onChange={(e) => setActionDeptId(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remark {selectedApplication.status === 'Pending' && '(required for rejection)'}
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
                    onClick={() => handleDepartmentAction(
                      selectedApplication, 
                      actionDeptId || DEPARTMENTS.find(d => d.name === selectedApplication.department)?.id, 
                      'approve', 
                      actionRemark
                    )}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <FiCheck className="mr-2" />
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    disabled={actionLoading}
                    onClick={() => handleDepartmentAction(
                      selectedApplication, 
                      actionDeptId || DEPARTMENTS.find(d => d.name === selectedApplication.department)?.id, 
                      'reject', 
                      actionRemark
                    )}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <FiX className="mr-2" />
                    {actionLoading ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center font-medium shadow-md hover:shadow-lg transition">
                <FiDownload className="mr-2" />
                Download Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    return (
      <>
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FiSearch className="mr-2 text-indigo-600" />
            Student Search
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Student Roll Number (e.g., GBU2023001)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center font-medium shadow-md hover:shadow-lg transition"
              disabled={isLoading}
            >
              <FiSearch className="mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Student Details */}
        {studentData && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Student Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <FiUser className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{studentData.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FiMail className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{studentData.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiBook className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Course</p>
                  <p className="font-medium text-gray-900">{studentData.course}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FiPhone className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Semester</p>
                  <p className="font-medium text-gray-900">{studentData.semester}</p>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <h3 className="font-semibold mb-4 text-gray-800">Required Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {['cancellationCheque', 'aadharCard', 'result'].map((docType) => (
                <div key={docType} className="border-2 border-dashed border-gray-300 rounded-lg p-5 hover:border-indigo-400 transition">
                  <h4 className="font-medium mb-3 text-gray-700">
                    {docType === 'cancellationCheque' ? 'Cancellation Cheque' :
                     docType === 'aadharCard' ? 'Aadhar Card' : 'Final Result'}
                  </h4>
                  <div className="flex items-center justify-between">
                    {uploadedFiles[docType] ? (
                      <div className="flex items-center text-green-600">
                        <FiCheckCircle className="mr-2" />
                        <span className="text-sm font-medium">Uploaded</span>
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm hover:bg-indigo-100 transition flex items-center font-medium">
                        <FiUpload className="mr-2" />
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(docType, e.target.files[0])}
                          accept=".jpg,.jpeg,.png,.pdf"
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* No-Dues Process Checklist */}
            <h3 className="font-semibold mb-4 text-gray-800">No-Dues Process Checklist</h3>
            <div className="bg-gray-50 p-5 rounded-lg mb-6">
              {[
                'Verify all documents are submitted',
                'Confirm fee payment status',
                'Check library book return status',
                'Verify hostel clearance',
                'Confirm no pending lab dues'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center mb-3 last:mb-0">
                  <input type="checkbox" id={`check${idx}`} className="mr-3 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  <label htmlFor={`check${idx}`} className="text-gray-700 cursor-pointer">{item}</label>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmitNoDues}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center font-medium shadow-md hover:shadow-lg transition"
              >
                <FiCheckCircle className="mr-2" />
                Submit No-Dues Application
              </button>
            </div>
          </div>
        )}

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent No-Dues Applications</h2>
            <div className="flex items-center">
              <FiFilter className="text-gray-500 mr-2" />
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Applications</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          {renderApplicationsTable(
            filterStatus === 'all' 
              ? applications 
              : applications.filter(app => 
                  filterStatus === 'approved' ? app.status === 'Approved' :
                  filterStatus === 'pending' ? app.status === 'Pending' :
                  app.status === 'Rejected'
                )
          )}
        </div>
      </>
    );
  };

  const renderPendingApplications = () => {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Pending Applications</h2>
        {pendingApplications.length > 0 ? (
          renderApplicationsTable(pendingApplications)
        ) : (
          <p className="text-gray-500 text-center py-8">No pending applications</p>
        )}
      </div>
    );
  };

  const renderApplicationHistory = () => {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Application History</h2>
        {approvedApplications.length > 0 ? (
          renderApplicationsTable(approvedApplications)
        ) : (
          <p className="text-gray-500 text-center py-8">No application history</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar menuItems={menuItems} user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Exam Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}</p>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">No-Dues Applications</h2>
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
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{app.rollNo || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{app.name || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{app.course || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{app.date ? new Date(app.date).toLocaleDateString() : '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExamDashboard;