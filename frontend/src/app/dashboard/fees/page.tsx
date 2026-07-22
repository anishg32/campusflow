"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Search, Plus, X, IndianRupee, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Fee {
  _id: string;
  student: { _id: string; name: string; rollNumber: string };
  department: { _id: string; name: string; code: string };
  totalAmount: number;
  paidAmount: number;
  status: 'Pending' | 'Partial' | 'Paid';
  dueDate: string;
}

interface Department {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
}

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  // Form states
  const [newFee, setNewFee] = useState({ departmentId: '', studentId: '', totalAmount: '', dueDate: '' });
  const [payAmount, setPayAmount] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feesRes, deptsRes, studentsRes] = await Promise.all([
        apiGet<Fee[]>('/fees'),
        apiGet<Department[]>('/departments'),
        apiGet<Student[]>('/students')
      ]);
      setFees(feesRes);
      setDepartments(deptsRes);
      setStudents(studentsRes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('/fees', {
        ...newFee,
        totalAmount: Number(newFee.totalAmount)
      });
      setIsAddModalOpen(false);
      setNewFee({ departmentId: '', studentId: '', totalAmount: '', dueDate: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to create fee:', error);
    }
  };

  const handlePayFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    try {
      await apiPost(`/fees/${selectedFee._id}/pay`, {
        amount: Number(payAmount)
      });
      setIsPayModalOpen(false);
      setSelectedFee(null);
      setPayAmount('');
      fetchData();
    } catch (error) {
      console.error('Failed to pay fee:', error);
    }
  };

  const filteredFees = fees.filter(f => 
    f.student.name.toLowerCase().includes(search.toLowerCase()) || 
    f.student.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = fees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Student Fees</h1>
          <p className="text-white/50 mt-1">Manage and track student fee payments</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Generate Invoice
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/50 text-sm">Total Collected</p>
              <h3 className="text-2xl font-bold text-white">₹{totalCollected.toLocaleString()}</h3>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/50 text-sm">Total Pending</p>
              <h3 className="text-2xl font-bold text-white">₹{totalPending.toLocaleString()}</h3>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 text-primary-400 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/50 text-sm">Total Invoices</p>
              <h3 className="text-2xl font-bold text-white">{fees.length}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fees List */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search by student name or roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-black/20 text-white/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Paid</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-white/50">
                    <div className="flex justify-center"><div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" /></div>
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-white/50">No fee records found.</td>
                </tr>
              ) : filteredFees.map((fee) => (
                <tr key={fee._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{fee.student.name}</div>
                    <div className="text-xs text-white/40">{fee.student.rollNumber}</div>
                  </td>
                  <td className="px-6 py-4">{fee.department.code}</td>
                  <td className="px-6 py-4 font-medium">₹{fee.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">₹{fee.paidAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      fee.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      fee.status === 'Partial' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    {fee.status !== 'Paid' && (
                      <button 
                        onClick={() => { setSelectedFee(fee); setIsPayModalOpen(true); }}
                        className="px-3 py-1.5 bg-primary/20 text-primary-400 rounded-lg text-xs font-medium hover:bg-primary/30 transition-colors"
                      >
                        Pay Fee
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Generate Invoice</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateFee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Department</label>
                  <select required value={newFee.departmentId} onChange={e => setNewFee({...newFee, departmentId: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50">
                    <option value="" className="bg-slate-900">Select Dept</option>
                    {departments.map(d => <option key={d._id} value={d._id} className="bg-slate-900">{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Student</label>
                  <select required value={newFee.studentId} onChange={e => setNewFee({...newFee, studentId: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50">
                    <option value="" className="bg-slate-900">Select Student</option>
                    {students.filter(s => !newFee.departmentId || (s as any).department === newFee.departmentId || (s as any).department?._id === newFee.departmentId).map(s => <option key={s._id} value={s._id} className="bg-slate-900">{s.name} ({s.rollNumber})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Total Amount (₹)</label>
                  <input type="number" required value={newFee.totalAmount} onChange={e => setNewFee({...newFee, totalAmount: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Due Date</label>
                  <input type="date" required value={newFee.dueDate} onChange={e => setNewFee({...newFee, dueDate: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-xl font-medium mt-6">Create Invoice</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay Fee Modal */}
      <AnimatePresence>
        {isPayModalOpen && selectedFee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Record Payment</h3>
                <button onClick={() => { setIsPayModalOpen(false); setSelectedFee(null); }} className="text-white/50 hover:text-white"><X size={20} /></button>
              </div>
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                <p className="text-sm text-white/70 flex justify-between"><span>Student:</span> <span className="font-medium text-white">{selectedFee.student.name}</span></p>
                <p className="text-sm text-white/70 flex justify-between"><span>Total Fee:</span> <span className="font-medium text-white">₹{selectedFee.totalAmount.toLocaleString()}</span></p>
                <p className="text-sm text-white/70 flex justify-between"><span>Already Paid:</span> <span className="font-medium text-green-400">₹{selectedFee.paidAmount.toLocaleString()}</span></p>
                <div className="h-px bg-white/10 my-2" />
                <p className="text-sm font-medium text-white flex justify-between"><span>Remaining:</span> <span className="text-red-400">₹{(selectedFee.totalAmount - selectedFee.paidAmount).toLocaleString()}</span></p>
              </div>
              <form onSubmit={handlePayFee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Payment Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input 
                      type="number" 
                      required 
                      max={selectedFee.totalAmount - selectedFee.paidAmount}
                      value={payAmount} 
                      onChange={e => setPayAmount(e.target.value)} 
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary/50" 
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-green-500 text-white rounded-xl font-medium mt-6 hover:bg-green-600 transition-colors">Record Payment</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
