// Basic Dashboard Template for other roles
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/Button';

const HostelsDashboard = () => {
  const { user, logout, authFetch } = useAuth();
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [backendApplications, setBackendApplications] = useState([]);
  
  const menuItems = [
    { id: 1, label: 'Dashboard', path: '/hostels/dashboard' },
    { id: 2, label: 'Pending', path: '/hostels/pending' },
    { id: 3, label: 'History', path: '/hostels/history' },
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
        setBackendApplications(allApplications);
      } catch (err) {
        setBackendApplications([]);
        console.error('Failed to fetch applications:', err);
      }
    };
    fetchAllApplications();
  }, [authFetch]);

  const applications = [
    {
      id: 1,
      title: 'Pending Applications',
      count: 12,
      status: 'pending',
      color: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-600',
      description: 'Applications awaiting review',
    },
    {
      id: 2,
      title: 'Approved Applications',
      count: 45,
      status: 'approved',
      color: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      description: 'Successfully approved applications',
    },
    {
      id: 3,
      title: 'Rejected Applications',
      count: 8,
      status: 'rejected',
      color: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600',
      description: 'Rejected applications',
    },
  ];

  const handleAppClick = (app) => {
    setSelectedApp(app);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedApp(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar menuItems={menuItems} user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Hostels Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => handleAppClick(app)}
                className={`${app.color} ${app.borderColor} cursor-pointer transform transition-all duration-200 hover:shadow-lg hover:scale-105 rounded-lg border-2 p-6 hover:border-opacity-50`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{app.title}</h3>
                    <p className="text-sm text-gray-600">{app.description}</p>
                  </div>
                </div>
                <p className={`text-4xl font-bold mt-4 ${app.textColor}`}>{app.count}</p>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedApp?.title}</DialogTitle>
            <DialogDescription>
              {selectedApp?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className={`${selectedApp?.color} rounded-lg p-6 mb-4`}>
            <p className="text-sm text-gray-600 mb-2">Total Count</p>
            <p className={`text-5xl font-bold ${selectedApp?.textColor}`}>
              {selectedApp?.count}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${selectedApp?.textColor} ${selectedApp?.color}`}>
                {selectedApp?.status}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDialogClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                // Add navigation or action logic here
                handleDialogClose();
              }}
            >
              View Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HostelsDashboard;