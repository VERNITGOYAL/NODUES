import React from 'react';
import { FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';

const DashboardFilters = ({ onSearch, filterStatus, setFilterStatus, onRefresh, isLoading }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 p-4 bg-white rounded-xl shadow">
      {/* Search Bar */}
      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3 transition-shadow duration-300 focus-within:shadow-md focus-within:border-indigo-500">
        <FiSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search by name, roll number, or course..."
          className="w-full outline-none text-sm bg-transparent"
          onChange={onSearch}
        />
      </div>

      {/* Filter & Refresh */}
      <div className="flex items-center gap-3 mt-3 md:mt-0">
        <div className='relative flex items-center'>
          <FiFilter className="absolute left-3 text-gray-500 w-4 h-4 pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white transition-colors duration-200 hover:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <button
          onClick={onRefresh}
          className="p-2.5 border border-gray-300 rounded-lg hover:bg-indigo-100/50 transition-colors duration-200 text-gray-600 shadow-sm"
          title="Refresh Data"
        >
          <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
};

export default DashboardFilters;