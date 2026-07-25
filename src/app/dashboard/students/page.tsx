"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, Edit2, Trash2, X, UserPlus, Lock, GraduationCap, ClipboardCheck, CreditCard } from 'lucide-react';
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
  phoneNumber: string;
  email?: string;
  department: Department;
  year: number;
  section: string;
  parentName?: string;
  parentPhoneNumber?: string;
}

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  
  // Admin form state
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState(1);
  const [section, setSection] = useState('A');
  const [parentName, setParentName] = useState('');
  const [parentPhoneNumber, setParentPhoneNumber] = useState('');

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

  const fetchStudents = async () => {
    try {
      let path = '/students?';
      if (filterDept) path += `department=${filterDept}&`;
      if (filterYear) path += `year=${filterYear}&`;
      if (search) path += `search=${search}&`;

      const data = await apiGet<Student[]>(path);
      setStudents(data);
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
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterDept, filterYear, user]);

  const resetForm = () => {
    setName('');
    setRollNumber('');
    setPhoneNumber('');
    setEmail('');
    setDepartment('');
    setYear(1);
    setSection('A');
    setParentName('');
    setParentPhoneNumber('');
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
    setPhoneNumber(student.phoneNumber);
    setEmail(student.email || '');
    setDepartment(student.department._id);
    setYear(student.year);
    setSection(student.section);
    setParentName(student.parentName || '');
    setParentPhoneNumber(student.parentPhoneNumber || '');
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const payload = { name, rollNumber, phoneNumber, email, department, year, section, parentName, parentPhoneNumber };
      
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

  // Student specific logic
  const fetchStudentDashboardData = async () => {
    try {
      const [attData, feesData, marksData] = await Promise.all([
        apiGet<any[]>('/attendance'),
        apiGet<any[]>('/fees'),
        apiGet<any[]>('/marks')
      ]);
      setStudentAttendance(attData);
      setStudentFees(feesData);
      setStudentMarks(marksData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
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
      const data = await apiGet<Student[]>(
        `/students?verifyRoll=${verifyRoll}&verifyName=${verifyName}&verifyDept=${verifyDept}&verifyYear=${verifyYear}`
      );
      if (data && data.length > 0) {
        setStudents(data);
        setPrivacyVerified(true);
        fetchStudentDashboardData();
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
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Roll Number</label>
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
            {myProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S'}
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 w-full z-10">
            <div>
              <p className="text-foreground/50 text-xs font-medium uppercase tracking-wider mb-1">Full Name</p>
              <p className="font-semibold text-lg">{myProfile?.name}</p>
            </div>
            <div>
              <p className="text-foreground/50 text-xs font-medium uppercase tracking-wider mb-1">Roll Number</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Attendance Box */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 lg:col-span-1 flex flex-col h-[400px]">
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
                      {record.status.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fees Box */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 lg:col-span-1 flex flex-col h-[400px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <CreditCard size={20} />
              </div>
              <h2 className="text-lg font-bold">Fee Status</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {studentFees.length === 0 ? (
                <p className="text-foreground/50 text-sm text-center py-8">No fee records.</p>
              ) : (
                studentFees.map((fee: any) => (
                  <div key={fee._id} className="p-4 rounded-xl bg-foreground/[0.02] border border-border/50">
                    <p className="font-semibold text-sm mb-1">{fee.title}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-foreground">₹{fee.totalAmount}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${fee.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        {fee.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Marks Box */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 lg:col-span-1 flex flex-col h-[400px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                <GraduationCap size={20} />
              </div>
              <h2 className="text-lg font-bold">Latest Marks</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {studentMarks.length === 0 ? (
                <p className="text-foreground/50 text-sm text-center py-8">No mark records.</p>
              ) : (
                studentMarks.map((mark: any) => (
                  <div key={mark._id} className="p-4 rounded-xl bg-foreground/[0.02] border border-border/50">
                    <p className="font-semibold text-sm mb-1">{mark.subject}</p>
                    <p className="text-xs text-foreground/50 mb-3">{mark.examType}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${(mark.marksObtained / mark.totalMarks) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-sm">{mark.marksObtained}/{mark.totalMarks}</span>
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-foreground/60 text-sm mt-1">Manage all student records in the system</p>
        </div>
        <button
          onClick={openAddForm}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm text-sm"
        >
          <UserPlus size={16} />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search by name, roll number, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none transition-all min-w-[200px]"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>{dept.name}</option>
          ))}
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none transition-all min-w-[150px]"
        >
          <option value="">All Years</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-foreground/40 text-sm">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-16">
            <UserPlus className="mx-auto mb-4 opacity-20" size={40} />
            <p className="text-foreground/50 font-medium">No students found</p>
            <p className="text-foreground/40 text-sm mt-1">Add your first student to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-foreground/[0.02]">
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
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
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
        )}
      </div>

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
                      <label className="block text-sm font-medium mb-1.5 text-foreground/80">Roll Number *</label>
                      <input
                        type="text"
                        required
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="e.g. CS2024001"
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
    </div>
  );
}
