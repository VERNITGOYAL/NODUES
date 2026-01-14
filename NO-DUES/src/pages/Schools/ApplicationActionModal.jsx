import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiX, FiCheck, FiDownload, FiCheckCircle, FiClock, 
  FiXCircle, FiUser, FiBook, FiHome, FiFileText, FiMapPin,
  FiRefreshCw 
} from 'react-icons/fi';
const renderStatusBadge = (status) => {
  const s = (status || 'Pending').toString();
  const key = s.toLowerCase().replace(/[\s-]/g, '');
  
  const styles = {
    cleared: "bg-green-100 text-green-800",
    approved: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    inprogress: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
    denied: "bg-red-100 text-red-800"
  };

  return (
    <span className={`${styles[key] || "bg-gray-100 text-gray-800"} text-xs font-bold px-3 py-1 rounded-full flex items-center w-fit uppercase tracking-wider`}>
      {key.includes('pending') || key.includes('progress') ? <FiClock className="mr-1" /> : 
       key.includes('reject') ? <FiXCircle className="mr-1" /> : <FiCheckCircle className="mr-1" />}
      {s}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const ApplicationActionModal = ({ application, onClose, onAction, actionLoading, actionError, userSchoolName }) => {
  const popupRef = useRef(null);
  const [remark, setRemark] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!application) return null;

  // ✅ UPDATED MAPPING: strictly using the fields from your provided ApplicationRead schema
  const email = application.student_email || application.email;
  const mobile = application.student_mobile || application.mobile;
  const address = application.permanent_address || '—';
  const name = application.student_name || application.name;
  const rollNo = application.roll_number || '—';
  const enrollment = application.enrollment_number || '—';
  const proofUrl = application.proof_document_url || application.proof_url;

  const statusKey = (application.status || '').toLowerCase().replace(/[\s-]/g, '');
  
  // ✅ FIX: Verify if stage_id exists on active_stage OR if active_stage is the ID itself
  const stageId = application.active_stage?.stage_id || application.active_stage?.id || application.stage_id;
  const isActionable = ['pending', 'inprogress', 'in_progress'].includes(statusKey) && stageId;

  // ✅ WRAPPER FUNCTION: Ensures the remark is sent as an object to prevent 400 Bad Request
  const handleInternalAction = (type) => {
    // If your backend Pydantic model expects a string, send 'remark'
    // If it expects a JSON body (common), send { remarks: remark }
    const actionPayload = { remarks: remark }; 
    onAction(application, type, actionPayload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        ref={popupRef}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b bg-gray-50 sticky top-0 z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                Application: <span className="text-indigo-600 font-mono">{application.display_id || 'NEW'}</span>
              </h2>
              {renderStatusBadge(application.status)}
            </div>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1 uppercase tracking-widest">
              <FiMapPin className="text-indigo-500" /> {application.current_location || "Processing"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-all">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-10">
          <section>
            <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-2">
              <FiUser /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><label className="text-xs text-gray-400 block mb-1 uppercase tracking-tighter">Full Name</label><p className="font-semibold text-gray-800">{name}</p></div>
              <div><label className="text-xs text-gray-400 block mb-1 uppercase tracking-tighter">Email</label><p className="font-medium text-gray-700 break-all">{email || '—'}</p></div>
              <div><label className="text-xs text-gray-400 block mb-1 uppercase tracking-tighter">Phone</label><p className="font-medium text-gray-700">{mobile || '—'}</p></div>
              <div className="md:col-span-3">
                <label className="text-xs text-gray-400 block mb-1 uppercase tracking-tighter">Permanent Address</label>
                <p className="font-medium text-gray-700">{address}</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section>
              <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-2">
                <FiBook /> Academic Profile
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="text-xs text-gray-400 block mb-1 uppercase tracking-tighter">Roll No.</label><p className="font-bold text-gray-800">{rollNo}</p></div>
                <div><label className="text-xs text-gray-400 block mb-1 uppercase tracking-tighter">Enrollment</label><p className="font-medium text-gray-700">{enrollment}</p></div>
                <div className="col-span-2"><label className="text-xs text-gray-400 block mb-1 uppercase tracking-tighter">Department/School</label><p className="font-medium text-gray-700">{application.school_name || userSchoolName || '—'}</p></div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-2">
                <FiHome /> Hostel Details
              </h3>
              {application.is_hosteller ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded font-bold uppercase">Resident</span>
                  </div>
                  <div><label className="text-xs text-gray-400 block mb-1 uppercase tracking-tighter">Hostel</label><p className="font-medium text-gray-700">{application.hostel_name || '—'}</p></div>
                  <div><label className="text-xs text-gray-400 block mb-1 uppercase tracking-tighter">Room</label><p className="font-medium text-gray-700">{application.hostel_room || '—'}</p></div>
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 italic">Day Scholar</p>
                </div>
              )}
            </section>
          </div>

          {/* Action Area */}
          {isActionable ? (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <FiFileText className="text-indigo-600" /> Department Action
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-widest">Review Remarks</label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Provide a reason for approval/rejection..."
                  />
                  {actionError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs mt-3 font-bold flex items-center gap-1 uppercase tracking-tight">
                      <FiXCircle /> {typeof actionError === 'object' ? JSON.stringify(actionError) : actionError}
                    </motion.p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleInternalAction('approve')}
                    className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <FiRefreshCw className="animate-spin" /> : <FiCheck />} Approve
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleInternalAction('reject')}
                    className="flex-1 bg-white border-2 border-rose-600 text-rose-600 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FiX /> Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
              <p className="text-xs text-amber-700 font-bold uppercase tracking-widest">
                ReadOnly: Current Status {application.status}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between items-center sticky bottom-0 z-10">
          <button onClick={onClose} className="text-[10px] font-black text-gray-400 hover:text-gray-800 transition-colors uppercase tracking-[0.2em]">
            Dismiss
          </button>
          
          {proofUrl && (
            <button 
              onClick={() => window.open(proofUrl, '_blank')}
              className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-900 shadow-md transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
            >
              <FiDownload /> View Document
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ApplicationActionModal;