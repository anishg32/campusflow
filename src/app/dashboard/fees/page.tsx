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
  title: string;
  totalAmount: number;
  paidAmount: number;
  status: 'Pending' | 'Partial' | 'Paid';
  dueDate: string;
  payments: { amount: number; date: string; method: string; reference?: string }[];
}

interface Department {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  department?: { _id: string; name: string; code: string };
}

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [filterTab, setFilterTab] = useState<'All' | 'Pending' | 'Paid'>('All');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  // Form states
  const [newFee, setNewFee] = useState({ departmentId: '', studentId: '', title: '', totalAmount: '', dueDate: '', bulk: false, year: '' });
  const [payDetails, setPayDetails] = useState({ amount: '', method: 'Cash', reference: '' });
  
  const { user } = useAuth();



  async function fetchData() {
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('/fees', {
        ...newFee,
        totalAmount: Number(newFee.totalAmount)
      });
      setIsAddModalOpen(false);
      setNewFee({ departmentId: '', studentId: '', title: '', totalAmount: '', dueDate: '', bulk: false, year: '' });
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
        amount: Number(payDetails.amount),
        method: payDetails.method,
        reference: payDetails.reference
      });
      setIsPayModalOpen(false);
      setSelectedFee(null);
      setPayDetails({ amount: '', method: 'Cash', reference: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to pay fee:', error);
    }
  };

  const handlePrintReceipt = (fee: Fee) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>Fee Receipt - ${fee.student.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            table { w-full: 100%; border-collapse: collapse; margin-top: 20px; width: 100%; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { background: #f9f9f9; }
            .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FEE RECEIPT</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="details">
            <div>
              <h3>Student Details</h3>
              <p>Name: ${fee.student.name}</p>
              <p>Roll No: ${fee.student.rollNumber}</p>
              <p>Department: ${fee.department.name}</p>
            </div>
            <div>
              <h3>Fee Details</h3>
              <p>Title: ${fee.title}</p>
              <p>Due Date: ${new Date(fee.dueDate).toLocaleDateString()}</p>
              <p>Status: ${fee.status}</p>
            </div>
          </div>
          <h3>Payment History</h3>
          <table>
            <tr><th>Date</th><th>Method</th><th>Reference</th><th>Amount</th></tr>
            ${fee.payments?.map(p => `
              <tr>
                <td>${new Date(p.date).toLocaleDateString()}</td>
                <td>${p.method}</td>
                <td>${p.reference || '-'}</td>
                <td>Rs. ${p.amount.toLocaleString()}</td>
              </tr>
            `).join('') || '<tr><td colspan="4">No payments found</td></tr>'}
          </table>
          <div class="total">
            <p>Total Fee: Rs. ${fee.totalAmount.toLocaleString()}</p>
            <p>Total Paid: Rs. ${fee.paidAmount.toLocaleString()}</p>
            <p>Balance Due: Rs. ${(fee.totalAmount - fee.paidAmount).toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.rollNumber.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterTab === 'All') return true;
    
    const fee = fees.find(f => f.student?._id === s._id);
    if (filterTab === 'Pending') return fee ? fee.status !== 'Paid' : true;
    if (filterTab === 'Paid') return fee?.status === 'Paid';
    return true;
  });

  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = fees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Student Fees</h1>
          <p className="text-foreground/50 mt-1">Manage and track student fee payments</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary text-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Generate Invoice
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-foreground/50 text-sm">Total Collected</p>
              <h3 className="text-2xl font-bold text-foreground">₹{totalCollected.toLocaleString()}</h3>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-foreground/50 text-sm">Total Pending</p>
              <h3 className="text-2xl font-bold text-foreground">₹{totalPending.toLocaleString()}</h3>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 text-primary-400 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-foreground/50 text-sm">Total Invoices</p>
              <h3 className="text-2xl font-bold text-foreground">{fees.length}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fees List */}
      <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
            {['All', 'Pending', 'Paid'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab as any)}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${filterTab === tab ? 'bg-primary text-white shadow-lg' : 'text-foreground/50 hover:text-foreground'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search by student name or roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground/70">
            <thead className="bg-black/20 text-foreground/50 border-b border-white/10">
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
                  <td colSpan={7} className="px-6 py-8 text-center text-foreground/50">
                    <div className="flex justify-center"><div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" /></div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-foreground/50">No students found.</td>
                </tr>
              ) : filteredStudents.map((student) => {
                const fee = fees.find(f => f.student?._id === student._id);
                
                return (
                <tr key={student._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{student.name}</div>
                    <div className="text-xs text-foreground/40">{student.rollNumber}</div>
                  </td>
                  <td className="px-6 py-4">{fee ? fee.department.code : (student.department?.code || '-')}</td>
                  <td className="px-6 py-4 font-medium">{fee ? `₹${fee.totalAmount.toLocaleString()}` : '-'}</td>
                  <td className="px-6 py-4">{fee ? `₹${fee.paidAmount.toLocaleString()}` : '-'}</td>
                  <td className="px-6 py-4">
                    {fee ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        fee.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        fee.status === 'Partial' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {fee.status}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-white/5 text-foreground/50 border-white/10">
                        No Invoice
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{fee ? new Date(fee.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {fee ? (
                      <>
                        {fee.status !== 'Paid' && (
                          <button 
                            onClick={() => { setSelectedFee(fee); setIsPayModalOpen(true); }}
                            className="px-3 py-1.5 bg-primary/20 text-primary-400 rounded-lg text-xs font-medium hover:bg-primary/30 transition-colors"
                          >
                            Pay Fee
                          </button>
                        )}
                        {(fee.status === 'Paid' || fee.status === 'Partial') && (
                          <button 
                            onClick={() => handlePrintReceipt(fee)}
                            className="px-3 py-1.5 bg-white/10 text-foreground/70 rounded-lg text-xs font-medium hover:bg-white/20 transition-colors"
                          >
                            Receipt
                          </button>
                        )}
                      </>
                    ) : (
                      user?.role === 'admin' && (
                        <button 
                          onClick={() => { 
                            setNewFee(prev => ({ ...prev, studentId: student._id, departmentId: student.department?._id || '' }));
                            setIsAddModalOpen(true); 
                          }}
                          className="px-3 py-1.5 bg-white/10 text-foreground/70 rounded-lg text-xs font-medium hover:bg-white/20 transition-colors"
                        >
                          Generate
                        </button>
                      )
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">Generate Invoice</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-foreground/50 hover:text-foreground"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateFee} className="space-y-4">
                <div className="flex items-center gap-2 mb-4 p-3 bg-black/20 rounded-xl border border-white/10">
                  <input type="checkbox" id="bulk" checked={newFee.bulk} onChange={e => setNewFee({...newFee, bulk: e.target.checked})} className="w-4 h-4 rounded bg-black/40 border-white/20 text-primary focus:ring-primary focus:ring-offset-black" />
                  <label htmlFor="bulk" className="text-sm font-medium text-foreground">Bulk Generate for Department</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Fee Title</label>
                  <input type="text" placeholder="e.g. Semester 3 Tuition" required value={newFee.title} onChange={e => setNewFee({...newFee, title: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Department</label>
                  <select required value={newFee.departmentId} onChange={e => setNewFee({...newFee, departmentId: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                    <option value="" className="bg-card">Select Dept</option>
                    {departments.map(d => <option key={d._id} value={d._id} className="bg-card">{d.name}</option>)}
                  </select>
                </div>
                {!newFee.bulk ? (
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Student</label>
                    <select required value={newFee.studentId} onChange={e => setNewFee({...newFee, studentId: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                      <option value="" className="bg-card">Select Student</option>
                      {students.filter(s => !newFee.departmentId || (s as any).department === newFee.departmentId || (s as any).department?._id === newFee.departmentId).map(s => <option key={s._id} value={s._id} className="bg-card">{s.name} ({s.rollNumber})</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Year</label>
                    <select value={newFee.year} onChange={e => setNewFee({...newFee, year: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                      <option value="" className="bg-card">All Years</option>
                      {[1, 2, 3, 4].map(y => <option key={y} value={y} className="bg-card">Year {y}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Total Amount (₹)</label>
                  <input type="number" required value={newFee.totalAmount} onChange={e => setNewFee({...newFee, totalAmount: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Due Date</label>
                  <input type="date" required value={newFee.dueDate} onChange={e => setNewFee({...newFee, dueDate: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-primary text-foreground rounded-xl font-medium mt-6">Create Invoice{newFee.bulk ? 's' : ''}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay Fee Modal */}
      <AnimatePresence>
        {isPayModalOpen && selectedFee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">Record Payment</h3>
                <button onClick={() => { setIsPayModalOpen(false); setSelectedFee(null); }} className="text-foreground/50 hover:text-foreground"><X size={20} /></button>
              </div>
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 space-y-2 text-sm text-foreground/70">
                <p className="flex justify-between"><span>Student:</span> <span className="font-medium text-foreground">{selectedFee.student.name}</span></p>
                <p className="flex justify-between"><span>Fee Title:</span> <span className="font-medium text-foreground">{selectedFee.title}</span></p>
                <p className="flex justify-between"><span>Total Fee:</span> <span className="font-medium text-foreground">₹{selectedFee.totalAmount.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>Already Paid:</span> <span className="font-medium text-green-400">₹{selectedFee.paidAmount.toLocaleString()}</span></p>
                <div className="h-px bg-white/10 my-2" />
                <p className="font-medium text-foreground flex justify-between"><span>Remaining:</span> <span className="text-red-400">₹{(selectedFee.totalAmount - selectedFee.paidAmount).toLocaleString()}</span></p>
              </div>

              {selectedFee.payments && selectedFee.payments.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Payment History</h4>
                  <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-3 py-2 font-medium">Date</th>
                          <th className="px-3 py-2 font-medium">Method</th>
                          <th className="px-3 py-2 font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedFee.payments.map((p, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-foreground/70">{new Date(p.date).toLocaleDateString()}</td>
                            <td className="px-3 py-2 text-foreground/70">{p.method}</td>
                            <td className="px-3 py-2 font-medium text-green-400">₹{p.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <form onSubmit={handlePayFee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Payment Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input 
                      type="number" 
                      required 
                      max={selectedFee.totalAmount - selectedFee.paidAmount}
                      value={payDetails.amount} 
                      onChange={e => setPayDetails({...payDetails, amount: e.target.value})} 
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Payment Method</label>
                    <select required value={payDetails.method} onChange={e => setPayDetails({...payDetails, method: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                      <option value="Cash" className="bg-card">Cash</option>
                      <option value="UPI" className="bg-card">UPI</option>
                      <option value="Bank Transfer" className="bg-card">Bank Transfer</option>
                      <option value="Card" className="bg-card">Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Reference No.</label>
                    <input type="text" placeholder="Optional" value={payDetails.reference} onChange={e => setPayDetails({...payDetails, reference: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-green-500 text-foreground rounded-xl font-medium mt-6 hover:bg-green-600 transition-colors">Record Payment</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
