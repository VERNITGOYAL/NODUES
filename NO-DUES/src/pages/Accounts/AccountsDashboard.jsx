import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { FiSearch, FiUser, FiMail, FiBook, FiCheckCircle, FiXCircle, FiUpload, FiDownload, FiX, FiEye, FiCheck, FiFilter, FiClock, FiTrendingUp } from 'react-icons/fi';

const AccountsDashboard = () => {
  const { user, logout, authFetch, token } = useAuth();
  const [rollNo, setRollNo] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    cancellationCheque: null,
    aadharCard: null,
    result: null
  });
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionDeptId, setActionDeptId] = useState(null);
  const [actionRemark, setActionRemark] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const applicationPopupRef = useRef(null);

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
      noDuesStatus: 'Pending'
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
      noDuesStatus: 'Pending'
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
      noDuesStatus: 'Pending'
    }
  ];

  const officeMenuItems = [
    { id: 1, label: 'Dashboard', path: '/accounts/dashboard' },
    { id: 2, label: 'Pending', path: '/accounts/pending' },
    { id: 3, label: 'History', path: '/accounts/history' },
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (!rollNo) return;
    
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const student = mockStudentDatabase.find(s => s.rollNo === rollNo);
      setStudentData(student || null);
      setIsLoading(false);
    }, 800);
  };

  const handleFileUpload = (fileType, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleSubmitNoDues = async () => {
    if (!studentData) {
      alert('Please search for a student first');
      return;
    }

    setIsLoading(true);
    try {
      // Check if all documents are uploaded
      if (!uploadedFiles.cancellationCheque || !uploadedFiles.aadharCard || !uploadedFiles.result) {
        alert('Please upload all required documents');
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('roll_number', studentData.rollNo);
      formData.append('student_name', studentData.name);
      formData.append('student_email', studentData.email);
      formData.append('student_mobile', studentData.phone);
      formData.append('course', studentData.course);
      formData.append('department', 'Accounts');
      formData.append('cancellation_cheque', uploadedFiles.cancellationCheque);
      formData.append('aadhar_card', uploadedFiles.aadharCard);
      formData.append('result_document', uploadedFiles.result);

      const API_URL = 'https://gbubackend-gbubackend.pagekite.me/api/approvals/create';
      
      // For file uploads, we need to bypass authFetch to avoid Content-Type header override
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: headers
        // Don't set Content-Type header - let browser set it to multipart/form-data
      });

      let data = {};
      try { 
        data = await res.json(); 
      } catch (e) { 
        console.error('Failed to parse response:', e);
      }

      if (res.ok) {
        alert('No-Dues application submitted successfully!');
        // Reset form
        setStudentData(null);
        setRollNo('');
        setUploadedFiles({
          cancellationCheque: null,
          aadharCard: null,
          result: null
        });
        // Refresh applications list
        const refetchRes = await authFetch('https://gbubackend-gbubackend.pagekite.me/api/approvals/all/enriched', { method: 'GET' });
        let refetchData = [];
        try { refetchData = await refetchRes.json(); } catch (e) { refetchData = []; }
        const allApplications = Array.isArray(refetchData)
          ? refetchData.map(app => ({
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
      } else {
        const errorMsg = data.detail || data.message || `Request failed with status ${res.status}`;
        alert(`Error: ${errorMsg}`);
        console.error('Submit failed:', res.status, data);
      }
    } catch (err) {
      console.error('Failed to submit application:', err);
      alert(`Error: ${err.message || 'Failed to submit application'}`);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar menuItems={officeMenuItems} user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Office Dashboard</h1>
            <p className="text-gray-600">No-Dues Management System</p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Student Search</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="Enter Student Roll Number"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                disabled={isLoading}
              >
                <FiSearch className="mr-2" />
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Student Details */}
          {studentData && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Student Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <FiUser className="text-gray-500 mr-2" />
                  <span className="font-medium">Name:</span>
                  <span className="ml-2">{studentData.name}</span>
                </div>
                
                <div className="flex items-center">
                  <FiMail className="text-gray-500 mr-2" />
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{studentData.email}</span>
                </div>
                
                <div className="flex items-center">
                  <FiBook className="text-gray-500 mr-2" />
                  <span className="font-medium">Course:</span>
                  <span className="ml-2">{studentData.course}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium">Semester:</span>
                  <span className="ml-2">{studentData.semester}</span>
                </div>
              </div>

            
              {/* Document Upload Section */}
              <h3 className="font-semibold mb-3">Required Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Cancellation Cheque</h4>
                  <div className="flex items-center justify-between">
                    {uploadedFiles.cancellationCheque ? (
                      <span className="text-sm text-green-600">Uploaded</span>
                    ) : (
                      <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm hover:bg-indigo-100">
                        <FiUpload className="inline mr-1" />
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload('cancellationCheque', e.target.files[0])}
                          accept=".jpg,.jpeg,.png,.pdf"
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Aadhar Card</h4>
                  <div className="flex items-center justify-between">
                    {uploadedFiles.aadharCard ? (
                      <span className="text-sm text-green-600">Uploaded</span>
                    ) : (
                      <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm hover:bg-indigo-100">
                        <FiUpload className="inline mr-1" />
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload('aadharCard', e.target.files[0])}
                          accept=".jpg,.jpeg,.png,.pdf"
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Final Result</h4>
                  <div className="flex items-center justify-between">
                    {uploadedFiles.result ? (
                      <span className="text-sm text-green-600">Uploaded</span>
                    ) : (
                      <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm hover:bg-indigo-100">
                        <FiUpload className="inline mr-1" />
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload('result', e.target.files[0])}
                          accept=".jpg,.jpeg,.png,.pdf"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* No-Dues Process Checklist */}
              <h3 className="font-semibold mb-3">No-Dues Process Checklist</h3>
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <input type="checkbox" id="check1" className="mr-2" />
                  <label htmlFor="check1">Verify all documents are submitted</label>
                </div>
                <div className="flex items-center mb-2">
                  <input type="checkbox" id="check2" className="mr-2" />
                  <label htmlFor="check2">Confirm fee payment status</label>
                </div>
                <div className="flex items-center mb-2">
                  <input type="checkbox" id="check3" className="mr-2" />
                  <label htmlFor="check3">Check library book return status</label>
                </div>
                <div className="flex items-center mb-2">
                  <input type="checkbox" id="check4" className="mr-2" />
                  <label htmlFor="check4">Verify hostel clearance</label>
                </div>
                <div className="flex items-center mb-2">
                  <input type="checkbox" id="check5" className="mr-2" />
                  <label htmlFor="check5">Confirm no pending lab dues</label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitNoDues}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                >
                  <FiCheckCircle className="mr-2" />
                  Submit No-Dues Application
                </button>
              </div>
            </div>
          )}

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">No-Dues Applications</h2>
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
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
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
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No applications found
                      </td>
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

export default AccountsDashboard;