import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheck, FiDownload, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const renderStatusBadge = (status) => {
  const s = (status || '').toString();
  const key = s.toLowerCase().replace(/[\s-]/g, '');
  if (['cleared', 'approved'].includes(key)) return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiCheckCircle className="mr-1" /> {s}</span>;
  if (['inprogress', 'in_progress', 'pending'].includes(key)) return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiClock className="mr-1" /> {s}</span>;
  if (['rejected', 'denied'].includes(key)) return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiXCircle className="mr-1" /> {s}</span>;
  return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">{s}</span>;
};

const ApplicationActionModal = ({ application, onClose, onAction, actionLoading, actionError, userSchoolName }) => {
  const popupRef = useRef(null);
  const [remark, setRemark] = useState('');

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!application) return null;

  const statusKey = (application.status || '').toLowerCase().replace(/[\s-]/g, '');
  const isActionable = ['pending', 'inprogress', 'in_progress'].includes(statusKey);

  const handleActionClick = (type) => {
    onAction(application, type, remark);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        ref={popupRef}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
              <p className="text-sm text-gray-500 mt-1">Review and take action on this application</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <FiX size={24} />
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              {[
                ['Student Name', application.name],
                ['Roll Number', application.rollNo],
                ['Enrollment', application.enrollment],
                ['Course', application.course],
              ].map(([label, val]) => (
                <div key={label}>
                  <label className="text-sm font-medium text-gray-500">{label}</label>
                  <p className="text-gray-900 font-semibold">{val || '—'}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[
                ['Email', application.email],
                ['Mobile', application.mobile],
                ['Date', new Date(application.date).toLocaleDateString()],
              ].map(([label, val]) => (
                <div key={label}>
                  <label className="text-sm font-medium text-gray-500">{label}</label>
                  <p className="text-gray-900">{val || '—'}</p>
                </div>
              ))}
               <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{renderStatusBadge(application.status)}</div>
                </div>
            </div>
          </div>

          {/* Actions */}
          {isActionable && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">School Action</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actioning School</label>
                  <div className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2.5 font-semibold text-gray-900 shadow-sm">
                    {userSchoolName}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remark (required for rejection)</label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Enter your remarks here..."
                  />
                  {actionError && <p className="text-red-600 text-sm mt-2">{actionError}</p>}
                </div>

                <div className="flex space-x-3">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleActionClick('approve')}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                  >
                    <FiCheck className="mr-2" />
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleActionClick('reject')}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                  >
                    <FiX className="mr-2" />
                    {actionLoading ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Close</button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center transition-colors">
              <FiDownload className="mr-2" /> Download Documents
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ApplicationActionModal;