import React, { useState } from 'react';
import { X, Building2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CreateDepartmentModal = ({ isOpen, onClose, onSuccess }) => {
  const { authFetch } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phase_number: 2 // Defaulting to Phase 2
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch('/api/admin/departments', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          phase_number: parseInt(formData.phase_number)
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to create department');
      }

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setFormData({ name: '', phase_number: 2 });
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
        
        {/* Header */}
        <div className="relative px-6 py-8 text-center bg-emerald-50/30 border-b border-slate-100">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
            <X className="h-5 w-5" />
          </button>
          <div className="inline-flex p-3 bg-emerald-100 rounded-2xl mb-4 shadow-inner">
            <Building2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Add Central Department</h3>
          <p className="text-xs text-slate-500 mt-1">Register a new administrative authority for the clearance process.</p>
        </div>

        {showSuccess ? (
          <div className="p-12 text-center animate-in fade-in scale-in">
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
               <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Department Registered</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-[10px] rounded-xl flex items-center gap-2 border border-red-100 font-bold uppercase tracking-wide">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Accounts, Library, Sports" 
                  required 
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-center block mb-3">Workflow Phase Assignment</label>
                <div className="grid grid-cols-2 gap-4 px-2">
                  {[2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({...formData, phase_number: num})}
                      className={`py-4 rounded-2xl text-sm font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                        formData.phase_number === num 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200'
                      }`}
                    >
                      <span>Phase {num}</span>
                      <span className={`text-[9px] font-medium uppercase tracking-tighter ${formData.phase_number === num ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {num === 2 ? 'Parallel Clearance' : 'Final Approval'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-4 py-3.5 border border-slate-200 rounded-2xl font-bold text-xs text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-[1.5] px-4 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-emerald-100"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Department'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateDepartmentModal;