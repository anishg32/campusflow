"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, Edit2, Trash2, X, UserPlus, Lock, GraduationCap, ClipboardCheck, CreditCard, Eye } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  registerNumber?: string;
  phoneNumber: string;
  email?: string;
  department: Department;
  year: number;
  section: string;
  parentName?: string;
  parentPhoneNumber?: string;
  gender?: string;
  dateOfBirth?: string | Date;
}

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  
  // Bulk promote state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteTargetYear, setPromoteTargetYear] = useState('next');
  
  // Admin form state
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Admin view student state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState(1);
  const [section, setSection] = useState('A');
  const [parentName, setParentName] = useState('');
  const [parentPhoneNumber, setParentPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Student Privacy form state
  const [privacyVerified, setPrivacyVerified] = useState(false);
  const [verifyRoll, setVerifyRoll] = useState('');
  const [verifyName, setVerifyName] = useState('');
  const [verifyDept, setVerifyDept] = useState('');
  const [verifyYear, setVerifyYear] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Student Unified Dashboard data
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [studentMarks, setStudentMarks] = useState<any[]>([]);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStudents = async (page = 1, append = false) => {
    try {
      let path = `/students?page=${page}&limit=50&`;
      if (filterDept) path += `department=${filterDept}&`;
      if (filterYear) path += `year=${filterYear}&`;
      if (search) path += `search=${search}&`;

      const data = await apiGet<{students: Student[], total: number, page: number, totalPages: number}>(path);
      
      if (append) {
        setStudents(prev => [...prev, ...data.students]);
      } else {
        setStudents(data.students);
      }
      setTotalPages(data.totalPages);
      setPageNumber(data.page);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await apiGet<Department[]>('/departments');
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (user?.role === 'student') return;
    setLoading(true);
    const timer = setTimeout(() => {
      fetchStudents(1, false);
      setSelectedStudentIds([]); // Clear selection when filters change
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterDept, filterYear, user]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudentIds(students.map(s => s._id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleBulkPromote = async () => {
    if (selectedStudentIds.length === 0) return;
    setPromoteLoading(true);
    try {
      const res = await apiPost<any>('/students/promote', { studentIds: selectedStudentIds, targetYear: promoteTargetYear });
      alert(res.message || 'Students promoted successfully');
      setShowPromoteModal(false);
      setSelectedStudentIds([]);
      fetchStudents();
    } catch (error: any) {
      alert(error.message || 'Failed to promote students');
    } finally {
      setPromoteLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setRollNumber('');
    setRegisterNumber('');
    setPhoneNumber('');
    setEmail('');
    setDepartment('');
    setYear(1);
    setSection('A');
    setParentName('');
    setParentPhoneNumber('');
    setGender('');
    setDateOfBirth('');
    setFormError('');
    setEditingStudent(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setRollNumber(student.rollNumber);
    setRegisterNumber(student.registerNumber || '');
    setPhoneNumber(student.phoneNumber);
    setEmail(student.email || '');
    setDepartment(student.department._id);
    setYear(student.year);
    setSection(student.section);
    setParentName(student.parentName || '');
    setParentPhoneNumber(student.parentPhoneNumber || '');
    setGender(student.gender || '');
    setDateOfBirth(student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '');
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const payload = { name, rollNumber, registerNumber, phoneNumber, email, department, year, section, parentName, parentPhoneNumber, gender, dateOfBirth };
      
      if (editingStudent) {
        await apiPut(`/students/${editingStudent._id}`, payload);
      } else {
        await apiPost('/students', payload);
      }

      setShowForm(false);
      resetForm();
      fetchStudents();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await apiDelete(`/students/${id}`);
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedStudentIds.length} students?`)) return;
    try {
      await apiDelete('/students', { studentIds: selectedStudentIds });
      setSelectedStudentIds([]);
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete students');
    }
  };

  // Student specific logic
  const fetchStudentDashboardData = async (studentId: string) => {
    try {
      const [attData, feesData, marksData] = await Promise.all([
        apiGet<any[]>(`/attendance?student=${studentId}`),
        apiGet<any[]>(`/fees?student=${studentId}`),
        apiGet<any[]>(`/marks?student=${studentId}`)
      ]);
      setStudentAttendance(attData);
      setStudentFees(feesData);
      setStudentMarks(marksData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const openViewModal = async (student: Student) => {
    setViewingStudent(student);
    setViewLoading(true);
    setShowViewModal(true);
    await fetchStudentDashboardData(student._id);
    setViewLoading(false);
  };

  const handleVerifyPrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyRoll || !verifyName || !verifyDept || !verifyYear) {
      setVerifyError('Please fill out all verification fields');
      return;
    }
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const data = await apiGet<{students: Student[]}>(
        `/students?verifyRoll=${encodeURIComponent(verifyRoll)}&verifyName=${encodeURIComponent(verifyName)}&verifyDept=${encodeURIComponent(verifyDept)}&verifyYear=${encodeURIComponent(verifyYear)}`
      );
      if (data && data.students && data.students.length > 0) {
        setStudents(data.students);
        setPrivacyVerified(true);
        fetchStudentDashboardData(data.students[0]._id);
      } else {
        setVerifyError('Verification failed. No matching student record found.');
      }
    } catch (err) {
      setVerifyError('Verification failed. Please check your details.');
    } finally {
      setVerifyLoading(false);
    }
  };

  if (user?.role === 'student') {
    if (!privacyVerified) {
      return (
        <div className="space-y-6 max-w-7xl mx-auto flex items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-md">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Student Profile</h1>
              <p className="text-foreground/60 text-sm mt-1">Verify your identity to view your details</p>
            </div>
            <div className="mt-8 bg-card border border-border rounded-xl shadow-lg p-6">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Lock size={24} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-center mb-2">Privacy Verification</h2>
              <p className="text-foreground/60 text-sm text-center mb-6">Please enter your details to view your record.</p>
              
              {verifyError && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium text-center">
                  {verifyError}
                </div>
              )}

              <form onSubmit={handleVerifyPrivacy} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Register Number</label>
                  <input
                    type="text"
                    required
                    value={verifyRoll}
                    onChange={(e) => setVerifyRoll(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="e.g. CS2024001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Full Name</label>
                  <input
                    type="text"
                    required
                    value={verifyName}
                    onChange={(e) => setVerifyName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Exact full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Department</label>
                  <select
                    required
                    value={verifyDept}
                    onChange={(e) => setVerifyDept(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Year of Study</label>
                  <select
                    required
                    value={verifyYear}
                    onChange={(e) => setVerifyYear(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-70 mt-2"
                >
                  {verifyLoading ? 'Verifying...' : 'View My Details'}
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }

    const myProfile = students[0];
    
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-foreground/60 text-sm mt-1">Welcome back, {myProfile?.name}</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shrink-0 z-10">
            {myProfile?.name ? myProfile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'S'}
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 w-full z-10">
            <div>
              <p className="text-foreground/50 text-xs font-medium uppercase tracking-wider mb-1">Full Name</p>
              <p className="font-semibold text-lg">{myProfile?.name}</p>
            </div>
            <div>
              <p className="text-foreground/50 text-xs font-medium uppercase tracking-wider mb-1">Register Number</p>
              <p className="font-mono font-medium text-lg text-primary">{myProfile?.rollNumber}</p>
            </div>
            <div>
              <p className="text-foreground/50 text-xs font-medium uppercase tracking-wider mb-1">Department & Year</p>
              <p className="font-medium">{myProfile?.department?.name} • Year {myProfile?.year}</p>
            </div>
            <div>
              <p className="text-foreground/50 text-xs font-medium uppercase tracking-wider mb-1">Contact</p>
              <p className="font-medium">{myProfile?.phoneNumber}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Attendance Box */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col h-[400px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <ClipboardCheck size={20} />
              </div>
              <h2 className="text-lg font-bold">Attendance</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {studentAttendance.length === 0 ? (
                <p className="text-foreground/50 text-sm text-center py-8">No attendance records.</p>
              ) : (
                studentAttendance.map((record: any) => (
                  <div key={record._id} className="flex items-center justify-between p-3 rounded-lg bg-foreground/[0.02] border border-border/50">
                    <span className="text-sm font-medium">{new Date(record.date).toLocaleDateString()}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${record.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {record.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fees Box */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col h-[400px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <CreditCard size={20} />
              </div>
              <h2 className="text-lg font-bold">Fee Details</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {studentFees.length === 0 ? (
                <p className="text-foreground/50 text-sm text-center py-8">No fee records found.</p>
              ) : (
                studentFees.map((fee: any) => (
                  <div key={fee._id} className="flex flex-col p-3 rounded-lg bg-foreground/[0.02] border border-border/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold">{fee.title}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        fee.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 
                        fee.status === 'Partial' ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {fee.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-foreground/70">
                      <span>Amount: ₹{fee.totalAmount}</span>
                      <span>Paid: ₹{fee.paidAmount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Marks Box */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col h-[400px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <GraduationCap size={20} />
              </div>
              <h2 className="text-lg font-bold">Marks & Grades</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {studentMarks.length === 0 ? (
                <p className="text-foreground/50 text-sm text-center py-8">No marks recorded yet.</p>
              ) : (
                studentMarks.map((mark: any) => (
                  <div key={mark._id} className="flex flex-col p-3 rounded-lg bg-foreground/[0.02] border border-border/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold truncate max-w-[150px]" title={mark.subjectName}>{mark.subjectName}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                        {mark.examType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-foreground/70 mt-1">
                      <span>Score: {mark.marksObtained} / {mark.maxMarks}</span>
                      {mark.grade && <span className="font-bold text-foreground">Grade: {mark.grade}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Students</h1>
            <p className="text-foreground/60 text-xs lg:text-sm mt-0.5">Manage all student records</p>
          </div>
          <button
            onClick={openAddForm}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 text-sm"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
        {selectedStudentIds.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl font-medium hover:bg-red-500/20 transition-colors flex items-center gap-2 shadow-sm text-xs"
            >
              <Trash2 size={14} />
              Delete ({selectedStudentIds.length})
            </button>
            <button
              onClick={() => setShowPromoteModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm text-xs"
            >
              <GraduationCap size={14} />
              Promote ({selectedStudentIds.length})
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-3 lg:p-4 flex flex-col gap-3 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search name, register no, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="flex-1 px-3 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary outline-none transition-all"
          >
            <option value="">All Depts</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>{dept.code}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="flex-1 px-3 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary outline-none transition-all"
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="text-center py-16 text-foreground/40 text-sm">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          Loading students...
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <UserPlus className="mx-auto mb-4 opacity-20" size={40} />
          <p className="text-foreground/50 font-medium">No students found</p>
          <p className="text-foreground/40 text-sm mt-1">Add your first student to get started</p>
        </div>
      ) : (
        <>
          {/* ===== MOBILE CARD VIEW (shown on small screens) ===== */}
          <div className="lg:hidden space-y-3">
            {/* Select All on Mobile */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 text-sm text-foreground/60">
                <input 
                  type="checkbox" 
                  checked={students.length > 0 && selectedStudentIds.length === students.length} 
                  onChange={handleSelectAll} 
                  className="w-4 h-4 rounded accent-primary" 
                />
                Select All
              </label>
              <span className="text-xs text-foreground/40">{students.length} students</span>
            </div>

            {students.map((student, i) => (
              <motion.div
                key={student._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="bg-card border border-border rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input 
                    type="checkbox" 
                    checked={selectedStudentIds.includes(student._id)} 
                    onChange={() => handleSelectStudent(student._id)} 
                    className="w-4 h-4 rounded accent-primary mt-1 shrink-0" 
                  />
                  
                  {/* Avatar */}
                  <div 
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/10 shrink-0 cursor-pointer"
                    onClick={() => openViewModal(student)}
                  >
                    {student.name ? student.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'S'}
                  </div>
                  
                  {/* Info - tap to view */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openViewModal(student)}>
                    <p className="font-semibold text-foreground text-sm truncate">{student.name}</p>
                    <p className="text-xs text-foreground/50 font-mono mt-0.5">{student.rollNumber}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-lg">
                        {student.department?.code || '—'}
                      </span>
                      <span className="text-[10px] text-foreground/40 font-medium">
                        Year {student.year} • Sec {student.section}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => openViewModal(student)}
                      className="p-2 rounded-xl bg-blue-500/10 text-blue-500 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openEditForm(student)}
                      className="p-2 rounded-xl bg-foreground/5 text-foreground/50 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(student._id)}
                      className="p-2 rounded-xl bg-red-500/5 text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Phone row */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                  <Phone size={12} className="text-foreground/30" />
                  <a href={`tel:${student.phoneNumber}`} className="text-xs text-foreground/60 font-medium">
                    {student.phoneNumber}
                  </a>
                  {student.email && (
                    <>
                      <span className="text-foreground/20">|</span>
                      <span className="text-xs text-foreground/40 truncate">{student.email}</span>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ===== DESKTOP TABLE VIEW (hidden on small screens) ===== */}
          <div className="hidden lg:block bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-foreground/[0.02]">
                    <th className="w-12 px-6 py-3">
                      <input type="checkbox" checked={students.length > 0 && selectedStudentIds.length === students.length} onChange={handleSelectAll} className="w-4 h-4 rounded border-border bg-background cursor-pointer accent-primary" />
                    </th>
                    <th className="text-left px-6 py-3 font-semibold text-foreground/70">Name</th>
                    <th className="text-left px-6 py-3 font-semibold text-foreground/70">Roll No.</th>
                    <th className="text-left px-6 py-3 font-semibold text-foreground/70">Phone</th>
                    <th className="text-left px-6 py-3 font-semibold text-foreground/70">Department</th>
                    <th className="text-left px-6 py-3 font-semibold text-foreground/70">Year</th>
                    <th className="text-left px-6 py-3 font-semibold text-foreground/70">Section</th>
                    <th className="text-right px-6 py-3 font-semibold text-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => (
                    <motion.tr
                      key={student._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="px-6 py-3">
                        <input type="checkbox" checked={selectedStudentIds.includes(student._id)} onChange={() => handleSelectStudent(student._id)} className="w-4 h-4 rounded border-border bg-background cursor-pointer accent-primary" />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {student.name ? student.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'S'}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            {student.email && <p className="text-xs text-foreground/50">{student.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono text-foreground/70">{student.rollNumber}</td>
                      <td className="px-6 py-3">
                        <span className="flex items-center gap-1.5 text-foreground/70">
                          <Phone size={12} className="text-foreground/40" />
                          {student.phoneNumber}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md">
                          {student.department?.code || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-foreground/70">{student.year}</td>
                      <td className="px-6 py-3 text-foreground/70">{student.section}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openViewModal(student)}
                            className="p-1.5 rounded-md hover:bg-blue-500/10 text-foreground/50 hover:text-blue-500 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEditForm(student)}
                            className="p-1.5 rounded-md hover:bg-foreground/5 text-foreground/50 hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id)}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-foreground/50 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Load More */}
          {pageNumber < totalPages && (
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={() => fetchStudents(pageNumber + 1, true)}
                disabled={loading}
                className="px-6 py-2.5 bg-card hover:bg-foreground/5 text-foreground/70 rounded-xl border border-border text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Students'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-bold">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-md hover:bg-foreground/5 text-foreground/50 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {formError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium">
                    {formError}
                  </div>
                )}

                <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-foreground/80">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Student full name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground/80">Register Number *</label>
                      <input
                        type="text"
                        required
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="e.g. 111822104001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground/80">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-foreground/80">Email (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="student@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground/80">Parent's Name</label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="Parent full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground/80">Parent's Phone Number</label>
                      <input
                        type="tel"
                        value={parentPhoneNumber}
                        onChange={(e) => setParentPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground/80">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none transition-all"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground/80">Date of Birth</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-foreground/80">Department *</label>
                    <select
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none transition-all"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground/80">Year *</label>
                      <select
                        required
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none transition-all"
                      >
                        <option value={1}>1st Year</option>
                        <option value={2}>2nd Year</option>
                        <option value={3}>3rd Year</option>
                        <option value={4}>4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground/80">Section *</label>
                      <select
                        required
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none transition-all"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-border bg-foreground/[0.02] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="student-form"
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {formLoading ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promote Modal */}
      <AnimatePresence>
        {showPromoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold mb-4">Confirm Bulk Promotion</h2>
              <p className="text-foreground/70 text-sm mb-4">
                You are about to promote <strong>{selectedStudentIds.length}</strong> selected students.
                <br/><br/>
                Note: Students currently in Year 4 will not be promoted further if incrementing, as Year 4 is the maximum.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">Select Target Year</label>
                <select
                  value={promoteTargetYear}
                  onChange={(e) => setPromoteTargetYear(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none transition-all"
                >
                  <option value="next">Increment to Next Year (Automatic)</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPromoteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkPromote}
                  disabled={promoteLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {promoteLoading ? 'Promoting...' : 'Confirm Promotion'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal — Full Screen on Mobile, Centered on Desktop */}
      <AnimatePresence>
        {showViewModal && viewingStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-sm lg:p-10"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 1 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background w-full lg:max-w-6xl lg:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col h-[95dvh] lg:h-[90vh] overflow-hidden border-t border-white/10 lg:border lg:border-border"
            >
              {/* Drag Handle (Mobile) */}
              <div className="lg:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-foreground/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 lg:px-6 py-3 lg:py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {viewingStudent.name ? viewingStudent.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'S'}
                  </div>
                  <div>
                    <h2 className="text-base lg:text-lg font-bold leading-tight">{viewingStudent.name}</h2>
                    <p className="text-xs text-primary font-mono">{viewingStudent.rollNumber}</p>
                  </div>
                </div>
                <button onClick={() => setShowViewModal(false)} className="p-2 rounded-xl hover:bg-white/10 text-foreground/70 transition-colors bg-white/5">
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {viewLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="p-4 lg:p-8 space-y-5 lg:space-y-8 pb-8">
                    
                    {/* Profile Info Grid */}
                    <div className="bg-card border border-border rounded-2xl p-4 lg:p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 relative z-10">
                        <div>
                          <p className="text-foreground/40 text-[10px] lg:text-xs font-medium uppercase tracking-wider mb-1">Department</p>
                          <p className="font-semibold text-sm lg:text-base">{viewingStudent.department?.name}</p>
                        </div>
                        <div>
                          <p className="text-foreground/40 text-[10px] lg:text-xs font-medium uppercase tracking-wider mb-1">Year & Section</p>
                          <p className="font-semibold text-sm lg:text-base">Year {viewingStudent.year} • {viewingStudent.section}</p>
                        </div>
                        <div>
                          <p className="text-foreground/40 text-[10px] lg:text-xs font-medium uppercase tracking-wider mb-1">Phone</p>
                          <a href={`tel:${viewingStudent.phoneNumber}`} className="font-semibold text-sm lg:text-base text-primary">{viewingStudent.phoneNumber}</a>
                        </div>
                        {viewingStudent.email && (
                          <div>
                            <p className="text-foreground/40 text-[10px] lg:text-xs font-medium uppercase tracking-wider mb-1">Email</p>
                            <p className="font-medium text-sm truncate">{viewingStudent.email}</p>
                          </div>
                        )}
                        {viewingStudent.parentName && (
                          <div>
                            <p className="text-foreground/40 text-[10px] lg:text-xs font-medium uppercase tracking-wider mb-1">Parent</p>
                            <p className="font-medium text-sm">{viewingStudent.parentName}</p>
                          </div>
                        )}
                        {viewingStudent.parentPhoneNumber && (
                          <div>
                            <p className="text-foreground/40 text-[10px] lg:text-xs font-medium uppercase tracking-wider mb-1">Parent Phone</p>
                            <p className="font-medium text-sm">{viewingStudent.parentPhoneNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attendance */}
                    <div className="bg-card border border-border rounded-2xl shadow-sm p-4 lg:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                          <ClipboardCheck size={18} />
                        </div>
                        <h2 className="text-base lg:text-lg font-bold">Attendance</h2>
                        <span className="ml-auto text-xs text-foreground/40 font-medium">{studentAttendance.length} records</span>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {studentAttendance.length === 0 ? (
                          <p className="text-foreground/50 text-sm text-center py-6">No attendance records.</p>
                        ) : (
                          studentAttendance.map((record: any) => (
                            <div key={record._id} className="flex items-center justify-between p-3 rounded-xl bg-foreground/[0.02] border border-border/50">
                              <span className="text-sm font-medium">{new Date(record.date).toLocaleDateString()}</span>
                              <span className={`text-xs font-bold px-3 py-1 rounded-lg ${record.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {record.status?.toUpperCase() || 'UNKNOWN'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Fees */}
                    <div className="bg-card border border-border rounded-2xl shadow-sm p-4 lg:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                          <CreditCard size={18} />
                        </div>
                        <h2 className="text-base lg:text-lg font-bold">Fee Details</h2>
                        <span className="ml-auto text-xs text-foreground/40 font-medium">{studentFees.length} records</span>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {studentFees.length === 0 ? (
                          <p className="text-foreground/50 text-sm text-center py-6">No fee records found.</p>
                        ) : (
                          studentFees.map((fee: any) => (
                            <div key={fee._id} className="flex flex-col p-3 rounded-xl bg-foreground/[0.02] border border-border/50">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold">{fee.title}</span>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                                  fee.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 
                                  fee.status === 'Partial' ? 'bg-amber-500/10 text-amber-500' : 
                                  'bg-red-500/10 text-red-500'
                                }`}>
                                  {fee.status?.toUpperCase() || 'PENDING'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-foreground/60 bg-background/50 p-2 rounded-lg">
                                <span>Total: ₹{fee.totalAmount}</span>
                                <span className="font-semibold text-foreground">Paid: ₹{fee.paidAmount}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Marks */}
                    <div className="bg-card border border-border rounded-2xl shadow-sm p-4 lg:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
                          <GraduationCap size={18} />
                        </div>
                        <h2 className="text-base lg:text-lg font-bold">Marks & Grades</h2>
                        <span className="ml-auto text-xs text-foreground/40 font-medium">{studentMarks.length} records</span>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {studentMarks.length === 0 ? (
                          <p className="text-foreground/50 text-sm text-center py-6">No marks recorded yet.</p>
                        ) : (
                          studentMarks.map((mark: any) => (
                            <div key={mark._id} className="flex flex-col p-3 rounded-xl bg-foreground/[0.02] border border-border/50">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm font-bold truncate flex-1 mr-2">{mark.subjectName}</span>
                                <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md bg-primary/10 text-primary shrink-0">
                                  {mark.examType}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-foreground/60">
                                <span>Score: {mark.marksObtained} / {mark.maxMarks}</span>
                                {mark.grade && <span className="font-bold text-foreground bg-background/50 px-2 py-0.5 rounded">Grade: {mark.grade}</span>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
