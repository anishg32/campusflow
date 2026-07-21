"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Phone, Edit2, Trash2, X, UserPlus } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

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
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState(1);
  const [section, setSection] = useState('A');
  const [parentName, setParentName] = useState('');
  const [parentPhoneNumber, setParentPhoneNumber] = useState('');

  const fetchStudents = async () => {
    try {
      let path = '/students?';
      if (filterDept) path += `department=${filterDept}&`;
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
    setLoading(true);
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterDept]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-foreground/60 text-sm mt-1">Manage all student records</p>
        </div>
        <button
          onClick={openAddForm}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <UserPlus size={18} />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search by name, roll number, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 outline-none transition-all min-w-[200px]"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>{dept.name}</option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-foreground/40">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-16">
            <UserPlus className="mx-auto mb-4 opacity-30" size={48} />
            <p className="text-foreground/40 text-lg">No students found</p>
            <p className="text-foreground/30 text-sm mt-1">Add your first student to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-sm font-bold text-foreground/60">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-foreground/60">Roll No.</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-foreground/60">Phone</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-foreground/60">Department</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-foreground/60">Year</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-foreground/60">Section</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-foreground/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-foreground/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          {student.email && <p className="text-xs text-foreground/40">{student.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{student.rollNumber}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} className="text-foreground/40" />
                        {student.phoneNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 bg-indigo-500/15 text-indigo-400 rounded-lg">
                        {student.department?.code || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{student.year}</td>
                    <td className="px-6 py-4 text-sm">{student.section}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(student)}
                          className="p-2 rounded-lg hover:bg-foreground/10 text-foreground/60 hover:text-indigo-500 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/60 hover:text-red-500 transition-colors"
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-lg rounded-[2rem] p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-foreground/10">
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Student full name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Roll Number *</label>
                    <input
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="e.g. CS2024001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="student@email.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Parent's Name</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Parent full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Parent's Phone Number</label>
                    <input
                      type="tel"
                      value={parentPhoneNumber}
                      onChange={(e) => setParentPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Department *</label>
                  <select
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Year *</label>
                    <select
                      required
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Section *</label>
                    <select
                      required
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:opacity-90 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formLoading ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
