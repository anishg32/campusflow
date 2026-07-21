"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Users, Trash2, X } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  studentCount: number;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const fetchDepartments = async () => {
    try {
      const data = await apiGet<Department[]>('/departments');
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await apiPost('/departments', { name, code: code.toUpperCase(), description });
      setShowForm(false);
      setName('');
      setCode('');
      setDescription('');
      fetchDepartments();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create department');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, deptName: string) => {
    if (!confirm(`Are you sure you want to delete "${deptName}"?`)) return;
    try {
      await apiDelete(`/departments/${id}`);
      fetchDepartments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete department');
    }
  };

  const gradients = [
    'from-indigo-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-fuchsia-600',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-foreground/60 text-sm mt-1">Manage college departments</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(''); }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {/* Department Grid */}
      {loading ? (
        <div className="text-center py-16 text-foreground/40">Loading departments...</div>
      ) : departments.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center">
          <Building2 className="mx-auto mb-4 opacity-30" size={64} />
          <p className="text-foreground/40 text-xl font-medium">No departments yet</p>
          <p className="text-foreground/30 text-sm mt-2">Create your first department to start organizing students</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, i) => (
            <motion.div
              key={dept._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center shadow-lg`}>
                  <Building2 size={28} className="text-white" />
                </div>
                <button
                  onClick={() => handleDelete(dept._id, dept.name)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className="text-xl font-bold mb-1">{dept.name}</h3>
              <p className="text-sm text-foreground/50 font-mono mb-3">{dept.code}</p>
              {dept.description && (
                <p className="text-sm text-foreground/60 mb-4">{dept.description}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-foreground/60 flex items-center gap-2">
                  <Users size={16} />
                  {dept.studentCount} {dept.studentCount === 1 ? 'Student' : 'Students'}
                </span>
                <a href={`/dashboard/students?dept=${dept._id}`} className="text-sm text-indigo-500 hover:underline">
                  View →
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
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
              className="glass w-full max-w-md rounded-[2rem] p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Add Department</h2>
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
                  <label className="block text-sm font-medium mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Department Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
                    placeholder="e.g. CSE"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                    placeholder="Brief description of the department"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:opacity-90 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Creating...' : 'Create Department'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
