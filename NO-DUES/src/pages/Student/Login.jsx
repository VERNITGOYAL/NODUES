import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiLogIn, FiShield, FiArrowLeft, FiX, FiMail, FiKey, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const StudentLogin = () => {
  const { login } = useStudentAuth();
  const navigate = useNavigate();
  
  // Login States
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '' });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' }); // type: 'error' | 'success'

  // --- Login Logic ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { identifier: credentials.identifier, password: credentials.password };
      await login(payload);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMain = () => navigate('/', { replace: true });

  // --- Forgot Password Logic ---

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ ROBUST API HELPER (Fixes "Unexpected end of JSON input")
  const apiRequest = async (endpoint, body) => {
    const BASE_URL = import.meta.env.VITE_API_BASE || ''; 
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Read text first to avoid crashing on empty responses
    const text = await response.text();
    
    let data;
    try {
        data = text ? JSON.parse(text) : {}; 
    } catch (err) {
        throw new Error(`Server returned non-JSON response (${response.status})`);
    }

    if (!response.ok) {
        throw new Error(data.message || data.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    return data;
  };

  // Step 1: Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage({ type: '', text: '' });
    try {
      const res = await apiRequest('/api/verification/forgot-password', { email: resetData.email });
      setResetMessage({ type: 'success', text: res.message || 'OTP sent successfully.' });
      setTimeout(() => {
        setResetStep(2);
        setResetMessage({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setResetMessage({ type: 'error', text: err.message });
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage({ type: '', text: '' });
    try {
      const res = await apiRequest('/api/verification/verify-reset-otp', { email: resetData.email, otp: resetData.otp });
      setResetMessage({ type: 'success', text: res.message || 'OTP verified.' });
      setTimeout(() => {
        setResetStep(3);
        setResetMessage({ type: '', text: '' });
      }, 1000);
    } catch (err) {
      setResetMessage({ type: 'error', text: err.message });
    } finally {
      setResetLoading(false);
    }
  };

  // Step 3: Reset Password
  const resetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage({ type: '', text: '' });
    try {
      const res = await apiRequest('/api/verification/reset-password', { 
        email: resetData.email, 
        otp: resetData.otp, 
        new_password: resetData.newPassword 
      });
      setResetStep(4); // Success View
    } catch (err) {
      setResetMessage({ type: 'error', text: err.message });
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowForgotModal(false);
    setResetStep(1);
    setResetData({ email: '', otp: '', newPassword: '' });
    setResetMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">Gautam Buddha University</h1>
          <p className="text-indigo-700 text-lg">NoDues Management System</p>
          <div className="mt-2">
            <Badge type="primary" className="inline-flex items-center">
              <FiShield className="mr-1" /> Secure Portal
            </Badge>
          </div>
        </motion.div>

        {/* Back button */}
        <button
          onClick={handleBackToMain}
          className="absolute top-6 left-6 p-2 bg-white rounded-md shadow hover:bg-gray-50"
          aria-label="Back to main"
        >
          <FiArrowLeft className="text-gray-700" />
        </button>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Student Login</h2>
            <p className="text-gray-600 mb-6 text-center">Use your credentials to login.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mb-5"
              >
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">Enrollment or Roll Number</label>
                <Input
                  id="identifier"
                  name="identifier"
                  value={credentials.identifier}
                  onChange={handleChange}
                  placeholder="Enter your Enrollment or Roll Number..."
                  required
                  className="w-full"
                  icon={<FiUser className="text-gray-400" />}
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mb-2"
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your Password..."
                  required
                  className="w-full"
                  icon={<FiLock className="text-gray-400" />}
                />
              </motion.div>

              {/* Forgot Password Link */}
              <div className="flex justify-end mb-6">
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                  disabled={loading}
                >
                  {loading ? 'Logging In...' : (
                    <>
                      <FiLogIn className="mr-2 text-white " /> <span className="text-white">Login</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 mr-1">Not registered yet?</span>
              <button
                type="button"
                onClick={() => navigate('/student/register')}
                className="text-indigo-600 hover:underline font-medium"
              >
                Register here
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-6 text-xs text-gray-600"
        >
          <p>© 2025 Gautam Buddha University. All rights reserved.</p>
        </motion.div>
      </div>

      {/* --- FORGOT PASSWORD MODAL --- */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              {/* Modal Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Reset Password</h3>
                <button onClick={closeResetModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {resetMessage.text && (
                  <div className={`mb-4 p-3 rounded-md text-sm ${
                    resetMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 
                    resetMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {resetMessage.text}
                  </div>
                )}

                {/* Step 1: Email Input */}
                {resetStep === 1 && (
                  <form onSubmit={sendOtp}>
                    <p className="text-sm text-gray-600 mb-4">Enter your registered email address. We will send you an OTP to reset your password.</p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <Input
                        name="email"
                        type="email"
                        value={resetData.email}
                        onChange={handleResetChange}
                        placeholder="e.g. student@gbu.ac.in"
                        required
                        icon={<FiMail className="text-gray-400" />}
                        className="w-full"
                      />
                    </div>
                    <Button type="submit" variant="primary" className="w-full" disabled={resetLoading}>
                      {resetLoading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </form>
                )}

                {/* Step 2: OTP Input */}
                {resetStep === 2 && (
                  <form onSubmit={verifyOtp}>
                     <p className="text-sm text-gray-600 mb-4">
                        OTP sent to <span className="font-semibold">{resetData.email}</span>. Please enter it below.
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                      <Input
                        name="otp"
                        type="text"
                        value={resetData.otp}
                        onChange={handleResetChange}
                        placeholder="Enter the code sent to your email"
                        required
                        className="w-full text-center tracking-widest text-lg"
                      />
                    </div>
                    <Button type="submit" variant="primary" className="w-full" disabled={resetLoading}>
                      {resetLoading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                    <div className="mt-3 text-center">
                        <button 
                            type="button" 
                            onClick={() => setResetStep(1)}
                            className="text-xs text-indigo-600 hover:underline"
                        >
                            Wrong email? Go back
                        </button>
                    </div>
                  </form>
                )}

                {/* Step 3: New Password */}
                {resetStep === 3 && (
                  <form onSubmit={resetPassword}>
                    <p className="text-sm text-gray-600 mb-4">OTP Verified. Please create a new password.</p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <Input
                        name="newPassword"
                        type="password"
                        value={resetData.newPassword}
                        onChange={handleResetChange}
                        placeholder="Enter new password"
                        required
                        icon={<FiKey className="text-gray-400" />}
                        className="w-full"
                      />
                    </div>
                    <Button type="submit" variant="primary" className="w-full" disabled={resetLoading}>
                      {resetLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </form>
                )}

                {/* Step 4: Success */}
                {resetStep === 4 && (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheckCircle className="text-green-600 text-3xl" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Password Updated!</h4>
                    <p className="text-gray-600 mb-6">Your password has been reset successfully. You can now login with your new password.</p>
                    <Button onClick={closeResetModal} variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700">
                      <span className="text-white">Back to Login</span>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentLogin;