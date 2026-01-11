import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiEye, FiList, FiRefreshCw, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// Helper Functions
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
  const key = s.toLowerCase().replace(/[\s-]/g, '');
  if (['cleared', 'approved'].includes(key)) {
    return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiCheckCircle className="mr-1" /> {s}</span>;
  }
  if (['inprogress', 'in_progress', 'pending'].includes(key)) {
    return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiClock className="mr-1" /> {s}</span>;
  }
  if (['rejected', 'denied'].includes(key)) {
    return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiXCircle className="mr-1" /> {s}</span>;
  }
  return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">{s}</span>;
};

const ApplicationsTable = ({ applications, isLoading, onView }) => {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6"
      variants={itemVariants}
    >
      <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Application List</h3>
      
      {isLoading ? (
        <div className="text-center py-12 text-gray-500 flex flex-col items-center">
          <FiRefreshCw className="animate-spin w-6 h-6 mb-3 text-indigo-500" />
          <p>Loading applications...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Roll No', 'Name', 'Course', 'Date', 'Status', 'Action'].map(head => (
                   <th key={head} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{head}</th>
                ))}
              </tr>
            </thead>
            <motion.tbody 
              className="bg-white divide-y divide-gray-200"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {applications.map((app) => (
                <motion.tr 
                  key={app.id} 
                  className="hover:bg-indigo-50/50 transition-colors duration-200"
                  variants={itemVariants}
                >
                  <td className="px-6 py-4 text-gray-900 font-semibold">{app.rollNo || '—'}</td>
                  <td className="px-6 py-4 text-gray-700">{app.name || '—'}</td>
                  <td className="px-6 py-4 text-gray-700">{app.course || '—'}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <div className='flex items-center'>
                        <FiCalendar className='mr-1 text-gray-400 text-sm' />
                        {formatDate(app.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">{renderStatusBadge(app.status)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onView(app)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center font-medium p-2 rounded-lg hover:bg-indigo-100"
                    >
                      <FiEye className="mr-1 w-4 h-4" /> View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>

          {applications.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-lg">
              <FiList className='mx-auto w-8 h-8 mb-2 text-gray-400' />
              No applications found for the current filters.
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ApplicationsTable;