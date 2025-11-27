// Basic Dashboard Template for other roles
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { FiEye } from 'react-icons/fi';

const LaboratoriesDashboard = () => {
  const { user, logout, authFetch } = useAuth();
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const applicationPopupRef = useRef(null);
  
  const menuItems = [
    { id: 1, label: 'Dashboard', path: '/laboratories/dashboard' },
    { id: 2, label: 'Pending', path: '/laboratories/pending' },
    { id: 3, label: 'History', path: '/laboratories/history' },
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar menuItems={menuItems} user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Template Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Applications Table */}
            <div className="col-span-full bg-white rounded-lg shadow p-6">
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
                            <button onClick={() => setSelectedApplication(app)} className="text-indigo-600 hover:text-indigo-900 flex items-center font-medium">
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaboratoriesDashboard;