"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, GraduationCap, CheckCircle2, AlertCircle, Trash2, Edit } from 'lucide-react';
import { apiGet, apiPost, apiDelete, apiPut } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Mark {
  _id: string;
  student: { _id: string; name: string; rollNumber: string; year?: number };
  department: { _id: string; name: string; code: string };
  subjectName: string;
  examType: string;
  marksObtained: number;
  maxMarks: number;
  date: string;
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

export default function MarksPage() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterExamType, setFilterExamType] = useState('All');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMark, setEditMark] = useState<Mark | null>(null);
  
  const [formData, setFormData] = useState({
    student: '',
    department: '',
    subjectName: '',
    examType: 'Class Test',
    marksObtained: '',
    maxMarks: '100',
    date: new Date().toISOString().split('T')[0],
  });
  
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [marksRes, deptsRes, studentsRes] = await Promise.all([
        apiGet<Mark[]>('/marks'),
        apiGet<Department[]>('/departments'),
        apiGet<Student[]>('/students')
      ]);
      setMarks(marksRes);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMark) {
        await apiPut(`/marks/${editMark._id}`, {
          ...formData,
          marksObtained: Number(formData.marksObtained),
          maxMarks: Number(formData.maxMarks),
        });
      } else {
        await apiPost('/marks', {
          ...formData,
          marksObtained: Number(formData.marksObtained),
          maxMarks: Number(formData.maxMarks),
        });
      }
      setIsModalOpen(false);
      setEditMark(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save mark:', error);
      alert(error.message || 'Failed to save marks. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mark record?')) return;
    try {
      await apiDelete(`/marks/${id}`);
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete mark:', error);
      alert(error.message || 'Failed to delete mark.');
    }
  };

  const openEditModal = (mark: Mark) => {
    setEditMark(mark);
    setFormData({
      student: mark.student._id,
      department: mark.department._id,
      subjectName: mark.subjectName,
      examType: mark.examType,
      marksObtained: mark.marksObtained.toString(),
      maxMarks: mark.maxMarks.toString(),
      date: new Date(mark.date).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      student: '',
      department: '',
      subjectName: '',
      examType: 'Class Test',
      marksObtained: '',
      maxMarks: '100',
      date: new Date().toISOString().split('T')[0],
    });
    setEditMark(null);
  };

  const filteredMarks = marks.filter(m => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        (m.student?.name?.toLowerCase() || '').includes(searchLower) || 
        (m.student?.rollNumber?.toLowerCase() || '').includes(searchLower) ||
        (m.subjectName?.toLowerCase() || '').includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    if (filterDept && (m.department?._id || m.department) !== filterDept) return false;
    if (filterYear && m.student?.year?.toString() !== filterYear) return false;
    if (filterExamType !== 'All' && filterExamType !== 'Needs Improvement' && m.examType !== filterExamType) return false;
    if (filterExamType === 'Needs Improvement' && getPercentage(m.marksObtained, m.maxMarks) >= 50) return false;

    return true;
  });

  const getPercentage = (obtained: number, max: number) => {
    if (!max || max === 0) return 0;
    return (obtained / max) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Student Marks</h1>
          <p className="text-foreground/50 mt-1">Manage and track student academic performance</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'faculty') && (
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Marks
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 text-primary rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-foreground/50 text-sm">Total Records</p>
              <h3 className="text-2xl font-bold text-foreground">{marks.length}</h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-foreground/50 text-sm">Avg Percentage</p>
              <h3 className="text-2xl font-bold text-foreground">
                {marks.length > 0 ? (marks.reduce((sum, m) => sum + getPercentage(m.marksObtained, m.maxMarks), 0) / marks.length).toFixed(1) : 0}%
              </h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          onClick={() => setFilterExamType('Needs Improvement')}
          className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-card/80 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-foreground/50 text-sm">Needs Improvement</p>
              <h3 className="text-2xl font-bold text-foreground">
                {marks.filter(m => getPercentage(m.marksObtained, m.maxMarks) < 50).length}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* List */}
      <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto whitespace-nowrap">
            {['All', 'Class Test', 'Internal Exam', 'Semester Exam', 'Needs Improvement'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilterExamType(tab)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterExamType === tab ? 'bg-primary text-primary-foreground shadow-lg' : 'text-foreground/50 hover:text-foreground'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search by student name, roll or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
            />
          </div>
          {user?.role !== 'student' && (
            <>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
              >
                <option value="" className="bg-card">All Departments</option>
                {departments.map(d => <option key={d._id} value={d._id} className="bg-card">{d.name}</option>)}
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
              >
                <option value="" className="bg-card">All Years</option>
                <option value="1" className="bg-card">1st Year</option>
                <option value="2" className="bg-card">2nd Year</option>
                <option value="3" className="bg-card">3rd Year</option>
                <option value="4" className="bg-card">4th Year</option>
              </select>
            </>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground/70">
            <thead className="bg-black/20 text-foreground/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Exam Type</th>
                <th className="px-6 py-4 font-medium">Marks</th>
                <th className="px-6 py-4 font-medium">Percentage</th>
                <th className="px-6 py-4 font-medium">Date</th>
                {(user?.role === 'admin' || user?.role === 'faculty') && <th className="px-6 py-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-foreground/50">
                    <div className="flex justify-center"><div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" /></div>
                  </td>
                </tr>
              ) : filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-foreground/50">No marks found.</td>
                </tr>
              ) : filteredMarks.map((mark) => {
                const percentage = getPercentage(mark.marksObtained, mark.maxMarks);
                const isPass = percentage >= 50;

                return (
                  <tr key={mark._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{mark.student?.name || 'Unknown'}</div>
                      <div className="text-xs text-foreground/40">{mark.student?.rollNumber || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{mark.subjectName}</div>
                      <div className="text-xs text-foreground/40">{mark.department?.code || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/5 text-foreground/80 rounded-lg text-xs font-medium border border-white/10">
                        {mark.examType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <span className={isPass ? 'text-green-400' : 'text-red-400'}>{mark.marksObtained}</span>
                      <span className="text-foreground/40"> / {mark.maxMarks}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isPass ? 'bg-green-500' : 'bg-red-500'}`} 
                            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{new Date(mark.date).toLocaleDateString()}</td>
                    {(user?.role === 'admin' || user?.role === 'faculty') && (
                      <td className="px-6 py-4 text-right flex justify-end gap-2 items-center h-full pt-6">
                        <button 
                          onClick={() => openEditModal(mark)}
                          className="p-1.5 bg-white/10 text-foreground/70 rounded-lg hover:bg-white/20 transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(mark._id)}
                          className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">{editMark ? 'Edit Marks' : 'Add Marks'}</h3>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-foreground/50 hover:text-foreground"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Department</label>
                  <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                    <option value="" className="bg-card">Select Dept</option>
                    {departments.map(d => <option key={d._id} value={d._id} className="bg-card">{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Student</label>
                  <select required value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                    <option value="" className="bg-card">Select Student</option>
                    {students.filter(s => !formData.department || (s.department as any) === formData.department || (s.department as any)?._id === formData.department).map(s => <option key={s._id} value={s._id} className="bg-card">{s.name} ({s.rollNumber})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Subject Name</label>
                  <input type="text" placeholder="e.g. Mathematics" required value={formData.subjectName} onChange={e => setFormData({...formData, subjectName: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Exam Type</label>
                  <select required value={formData.examType} onChange={e => setFormData({...formData, examType: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                    <option value="Class Test" className="bg-card">Class Test</option>
                    <option value="Internal Exam" className="bg-card">Internal Exam</option>
                    <option value="Semester Exam" className="bg-card">Semester Exam</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Marks Obtained</label>
                    <input type="number" required min="0" max={formData.maxMarks} value={formData.marksObtained} onChange={e => setFormData({...formData, marksObtained: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Max Marks</label>
                    <input type="number" required min="1" value={formData.maxMarks} onChange={e => setFormData({...formData, maxMarks: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Date</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium mt-6 hover:bg-primary/90 transition-colors">
                  {editMark ? 'Update Marks' : 'Save Marks'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
