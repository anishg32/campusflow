"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Search, Plus, X, IndianRupee, AlertCircle, CheckCircle2, Trash2, History, Lock } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Fee {
  _id: string;
  student: { _id: string; name: string; rollNumber: string; year?: number };
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
  const [filterYear, setFilterYear] = useState('');
  const [filterDept, setFilterDept] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  // Form states
  const [newFee, setNewFee] = useState({ departmentId: '', studentId: '', title: '', tuitionFee: '', busFee: '', sportsFee: '', bookFee: '', examFee: '', dueFee: '', dueDate: '', bulk: false, year: '', semester: '' });
  const [payDetails, setPayDetails] = useState({ amount: '', method: 'Cash', reference: '' });
  
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feesRes, deptsRes, studentsRes] = await Promise.all([
        apiGet<Fee[]>('/fees'),
        apiGet<Department[]>('/departments'),
        apiGet<any>('/students?limit=10000')
      ]);
      setFees(feesRes);
      setDepartments(deptsRes);
      setStudents(studentsRes.students || []);
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
    const tuition = Number(newFee.tuitionFee || 0);
    const bus = Number(newFee.busFee || 0);
    const sports = Number(newFee.sportsFee || 0);
    const book = Number(newFee.bookFee || 0);
    const exam = Number(newFee.examFee || 0);
    const due = Number(newFee.dueFee || 0);
    const totalAmount = tuition + bus + sports + book + exam + due;

    if (totalAmount <= 0) {
      alert("Total amount must be greater than 0");
      return;
    }

    try {
      await apiPost('/fees', {
        ...newFee,
        totalAmount,
        tuitionFee: tuition,
        busFee: bus,
        sportsFee: sports,
        bookFee: book,
        examFee: exam,
        dueFee: due
      });
      setIsAddModalOpen(false);
      setNewFee({ departmentId: '', studentId: '', title: '', tuitionFee: '', busFee: '', sportsFee: '', bookFee: '', examFee: '', dueFee: '', dueDate: '', bulk: false, year: '', semester: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to create fee:', error);
      alert('Failed to create fee. Please check inputs.');
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
    } catch (error: any) {
      console.error('Failed to pay fee:', error);
      alert(error.message || 'Payment failed.');
    }
  };

  const handleDeleteFee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
    try {
      await apiDelete(`/fees/${id}`);
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete fee:', error);
      alert(error.message || 'Failed to delete fee.');
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
            table { border-collapse: collapse; margin-top: 20px; width: 100%; }
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
              <p>Name: ${fee.student?.name || 'N/A'}</p>
              <p>Roll No: ${fee.student?.rollNumber || 'N/A'}</p>
              <p>Department: ${fee.department?.name || 'N/A'}</p>
            </div>
            <div>
              <h3>Fee Details</h3>
              <p>Title: ${fee.title || 'N/A'}</p>
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

  const filteredFees = fees.filter(f => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        (f.student?.name?.toLowerCase() || '').includes(searchLower) || 
        (f.student?.rollNumber?.toLowerCase() || '').includes(searchLower) ||
        (f.title?.toLowerCase() || '').includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    if (filterYear && f.student?.year?.toString() !== filterYear) return false;
    if (filterDept && (f.department?._id || f.department) !== filterDept) return false;

    if (filterTab === 'All') return true;
    if (filterTab === 'Pending') return f.status !== 'Paid';
    if (filterTab === 'Paid') return f.status === 'Paid';
    return true;
  });

  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = fees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0);

  if (user?.role === 'faculty') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <Lock className="w-20 h-20 text-red-500/50 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-foreground/60 max-w-md">You do not have permission to view or manage fees. This area is restricted to Administrators only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Student Fees</h1>
          <p className="text-foreground/50 mt-1">Manage and track student fee invoices</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
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
            <div className="p-3 bg-primary/20 text-primary rounded-xl">
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
        <div className="p-4 lg:p-6 border-b border-white/10 flex flex-col lg:flex-row gap-4">
          <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 w-full lg:w-auto overflow-x-auto shrink-0">
            {['All', 'Pending', 'Paid'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab as any)}
                className={`flex-1 lg:flex-none px-4 lg:px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filterTab === tab ? 'bg-primary text-primary-foreground shadow-lg' : 'text-foreground/50 hover:text-foreground'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input 
                type="text" 
                placeholder="Search by name, roll or invoice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
              />
            </div>
            {(user?.role as string) !== 'student' && (
              <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full sm:w-auto bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="" className="bg-card">All Depts</option>
                  {departments.map(d => <option key={d._id} value={d._id} className="bg-card">{d.name}</option>)}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full sm:w-auto bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="" className="bg-card">All Years</option>
                  <option value="1" className="bg-card">1st Year</option>
                  <option value="2" className="bg-card">2nd Year</option>
                  <option value="3" className="bg-card">3rd Year</option>
                  <option value="4" className="bg-card">4th Year</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ===== MOBILE CARD VIEW ===== */}
        <div className="lg:hidden p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
          ) : filteredFees.length === 0 ? (
            <div className="text-center py-8 text-foreground/50 text-sm">No invoices found.</div>
          ) : filteredFees.map((fee) => (
            <div key={fee._id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{fee.title}</h4>
                  <p className="text-xs text-foreground/50 mt-0.5">{fee.student?.name || 'Unknown'} • {fee.student?.rollNumber || '-'}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-medium border ${
                  fee.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  fee.status === 'Partial' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {fee.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-y border-white/10 my-3">
                <div>
                  <p className="text-[10px] text-foreground/50">Total Amount</p>
                  <p className="font-medium text-foreground text-sm">₹{fee.totalAmount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-foreground/50">Paid</p>
                  <p className="font-medium text-green-400 text-sm">₹{fee.paidAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-[10px] text-foreground/50 flex flex-col">
                  Due: <span className="text-xs text-foreground/70">{new Date(fee.dueDate).toLocaleDateString()}</span>
                </p>
                <div className="flex gap-1.5">
                  {fee.status !== 'Paid' && (
                    <button 
                      onClick={() => { setSelectedFee(fee); setIsPayModalOpen(true); }}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium shadow-md shadow-primary/20"
                    >
                      Pay
                    </button>
                  )}
                  {(fee.status === 'Paid' || fee.status === 'Partial') && (
                    <>
                      <button 
                        onClick={() => { setSelectedFee(fee); setIsHistoryModalOpen(true); }}
                        className="p-1.5 bg-white/10 text-foreground/70 rounded-lg"
                      >
                        <History size={14} />
                      </button>
                      <button 
                        onClick={() => handlePrintReceipt(fee)}
                        className="px-2 py-1.5 bg-white/10 text-foreground/70 rounded-lg text-[10px] font-medium"
                      >
                        Receipt
                      </button>
                    </>
                  )}
                  {(user?.role === 'admin' || user?.role === 'faculty') && (
                    <button
                      onClick={() => handleDeleteFee(fee._id)}
                      className="p-1.5 bg-red-500/10 text-red-400 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== DESKTOP TABLE VIEW ===== */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground/70">
            <thead className="bg-black/20 text-foreground/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice</th>
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
                  <td colSpan={8} className="px-6 py-8 text-center text-foreground/50">
                    <div className="flex justify-center"><div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" /></div>
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-foreground/50">No invoices found.</td>
                </tr>
              ) : filteredFees.map((fee) => (
                <tr key={fee._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{fee.title}</div>
                    <div className="text-xs text-foreground/40">{fee.department?.code || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{fee.student?.name || 'Unknown'}</div>
                    <div className="text-xs text-foreground/40">{fee.student?.rollNumber || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium">{fee.department?.code || '-'}</span>
                  </td>
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
                  <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                    {fee.status !== 'Paid' && (
                      <button 
                        onClick={() => { setSelectedFee(fee); setIsPayModalOpen(true); }}
                        className="px-3 py-1.5 bg-primary/20 text-primary-400 rounded-lg text-xs font-medium hover:bg-primary/30 transition-colors"
                      >
                        Pay
                      </button>
                    )}
                    {(fee.status === 'Paid' || fee.status === 'Partial') && (
                      <>
                        <button 
                          onClick={() => { setSelectedFee(fee); setIsHistoryModalOpen(true); }}
                          className="p-1.5 bg-white/10 text-foreground/70 rounded-lg hover:bg-white/20 transition-colors"
                          title="View History"
                        >
                          <History size={14} />
                        </button>
                        <button 
                          onClick={() => handlePrintReceipt(fee)}
                          className="px-3 py-1.5 bg-white/10 text-foreground/70 rounded-lg text-xs font-medium hover:bg-white/20 transition-colors"
                        >
                          Receipt
                        </button>
                      </>
                    )}
                    {(user?.role === 'admin' || user?.role === 'faculty') && (
                      <button
                        onClick={() => handleDeleteFee(fee._id)}
                        className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Delete Invoice"
                      >
                        <Trash2 size={14} />
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-bold text-foreground">Generate Invoice</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-foreground/50 hover:text-foreground"><X size={20} /></button>
              </div>
              <div className="overflow-y-auto pr-2 -mr-2">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Year</label>
                    <select value={newFee.year} onChange={e => setNewFee({...newFee, year: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                      <option value="" className="bg-card">All Years</option>
                      {[1, 2, 3, 4].map(y => <option key={y} value={y} className="bg-card">Year {y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Semester</label>
                    <select value={newFee.semester} onChange={e => setNewFee({...newFee, semester: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                      <option value="" className="bg-card">All Sems</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className="bg-card">Sem {s}</option>)}
                    </select>
                  </div>
                </div>
                {!newFee.bulk && (
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Student</label>
                    <select required value={newFee.studentId} onChange={e => setNewFee({...newFee, studentId: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                      <option value="" className="bg-card">Select Student</option>
                      {students
                        .filter(s => {
                          if (newFee.departmentId && (s as any).department !== newFee.departmentId && (s as any).department?._id !== newFee.departmentId) return false;
                          if (newFee.year && (s as any).year?.toString() !== newFee.year.toString()) return false;
                          return true;
                        })
                        .map(s => <option key={s._id} value={s._id} className="bg-card">{s.name} ({s.rollNumber})</option>)}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Tuition Fee (₹)</label>
                    <input type="number" min="0" value={newFee.tuitionFee} onChange={e => setNewFee({...newFee, tuitionFee: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Bus Fee (₹)</label>
                    <input type="number" min="0" value={newFee.busFee} onChange={e => setNewFee({...newFee, busFee: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Sports Fee (₹)</label>
                    <input type="number" min="0" value={newFee.sportsFee} onChange={e => setNewFee({...newFee, sportsFee: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Book Fee (₹)</label>
                    <input type="number" min="0" value={newFee.bookFee} onChange={e => setNewFee({...newFee, bookFee: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Exam Fee (₹)</label>
                    <input type="number" min="0" value={newFee.examFee} onChange={e => setNewFee({...newFee, examFee: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Due Fee (₹)</label>
                    <input type="number" min="0" value={newFee.dueFee} onChange={e => setNewFee({...newFee, dueFee: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <p className="text-sm font-medium text-foreground/70">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">₹{(Number(newFee.tuitionFee || 0) + Number(newFee.busFee || 0) + Number(newFee.sportsFee || 0) + Number(newFee.bookFee || 0) + Number(newFee.examFee || 0) + Number(newFee.dueFee || 0)).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Due Date</label>
                  <input type="date" required value={newFee.dueDate} onChange={e => setNewFee({...newFee, dueDate: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium mt-6 shrink-0 hover:bg-primary/90 transition-colors">Create Invoice{newFee.bulk ? 's' : ''}</button>
              </form>
              </div>
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
                <p className="flex justify-between"><span>Student:</span> <span className="font-medium text-foreground">{selectedFee.student?.name}</span></p>
                <p className="flex justify-between"><span>Fee Title:</span> <span className="font-medium text-foreground">{selectedFee.title}</span></p>
                <p className="flex justify-between"><span>Total Fee:</span> <span className="font-medium text-foreground">₹{selectedFee.totalAmount.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>Already Paid:</span> <span className="font-medium text-green-400">₹{selectedFee.paidAmount.toLocaleString()}</span></p>
                <div className="h-px bg-white/10 my-2" />
                <p className="font-medium text-foreground flex justify-between"><span>Remaining:</span> <span className="text-red-400">₹{(selectedFee.totalAmount - selectedFee.paidAmount).toLocaleString()}</span></p>
              </div>

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
                      <option value="GPay" className="bg-card">GPay</option>
                      <option value="UPI" className="bg-card">Other UPI</option>
                      <option value="Bank Transfer" className="bg-card">Bank Transfer</option>
                      <option value="Card" className="bg-card">Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Reference No.</label>
                    <input type="text" placeholder="e.g., UPI ID / Txn ID" value={payDetails.reference} onChange={e => setPayDetails({...payDetails, reference: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-green-500 text-foreground rounded-xl font-medium mt-6 hover:bg-green-600 transition-colors">Record Payment</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedFee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Payment History</h3>
                  <p className="text-sm text-foreground/60 mt-1">{selectedFee.title} - {selectedFee.student?.name}</p>
                </div>
                <button onClick={() => { setIsHistoryModalOpen(false); setSelectedFee(null); }} className="text-foreground/50 hover:text-foreground"><X size={20} /></button>
              </div>

              {selectedFee.payments && selectedFee.payments.length > 0 ? (
                <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden text-sm">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10 text-foreground/70">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Method</th>
                        <th className="px-4 py-3 font-medium">Ref</th>
                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedFee.payments.map((p, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-foreground/70">{new Date(p.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-foreground/70">{p.method}</td>
                          <td className="px-4 py-3 text-foreground/50 font-mono text-xs">{p.reference || '-'}</td>
                          <td className="px-4 py-3 font-medium text-green-400 text-right">₹{p.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-white/10 bg-white/5">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 font-semibold text-right text-foreground">Total Paid:</td>
                        <td className="px-4 py-3 font-bold text-green-400 text-right">₹{selectedFee.paidAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-foreground/50">
                  <p>No payments recorded yet.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
