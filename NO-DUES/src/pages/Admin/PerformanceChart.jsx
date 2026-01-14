import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

// Mapping utility for proper alignment
const DEPT_MAP = {
  'Crc': 'CRC',
  'Library': 'LIB',
  'Sports': 'SPO',
  'Accounts': 'ACC',
  'Laboratories': 'LAB',
  'Hostel': 'HST',
  'Dean': 'SCHOOLS',
  'Lab': 'LAB',
  'Account': 'ACC'
};

const PerformanceChart = () => {
  const { authFetch } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      const response = await authFetch('/api/admin/analytics/performance');
      if (response.ok) {
        const rawData = await response.json();
        
        // Transform and use shortcodes for alignment
        const chartData = rawData.map(dept => ({
          name: DEPT_MAP[dept.dept_name] || dept.dept_name.toUpperCase().substring(0, 3),
          cleared: dept.approved_count,
          pending: dept.pending_count
        }));
        
        setData(chartData);
      }
    };
    fetchPerformanceData();
  }, [authFetch]);

  return (
    <div className="h-full w-full flex flex-col p-2">
      <div className="flex-1 w-full min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 10, left: -25, bottom: 5 }} // Adjusted margins for alignment
            barSize={18} // Smaller bar size for tighter spacing
            barGap={4}   // Tighter gap between Cleared/Pending
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
              interval={0} // Forces every label to show
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              allowDecimals={false}
            />
            
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 900 }}
            />
            
            <Bar dataKey="cleared" name="CLEARED" fill="#1e40af" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" name="PENDING" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;