"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Edit2, Trash2, X, Hash, BookOpen, GraduationCap, ChevronDown, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  loginId?: string;
  role: string;
  phoneNumber?: string;
  department?: { _id: string; name: string; code: string } | null;
  createdAt: string;
}

export default function ManageUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  const [formName, setFormName] = useState('');
  const [formLoginId, setFormLoginId] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<'faculty' | 'student'>('faculty');
  const [formDept, setFormDept] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Created credentials display
  const [createdCredentials, setCreatedCredentials] = useState<{ loginId: string; password: string; name: string } | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      let path = '/users?';
      if (roleFilter !== 'all') path += `role=${roleFilter}&`;
      if (search) path += `search=${encodeURIComponent(search)}&`;
      const data = await apiGet<UserData[]>(path);
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
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

  const resetForm = () => {
    setFormName('');
    setFormLoginId('');
    setFormPassword('');
    setFormPhone('');
    setFormRole('faculty');
    setFormDept('');
    setFormError('');
    setFormSuccess('');
    setEditingUser(null);
    setShowPassword(false);
  };

  const openAddForm = () => {
    resetForm();
    if (formRole === 'faculty') {
      setFormPassword(generateDefaultPassword());
    } else {
      setFormPassword('');
    }
    setShowForm(true);
  };

  const openEditForm = (u: UserData) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormLoginId(u.loginId || '');
    setFormPassword('');
    setFormPhone(u.phoneNumber || '');
    setFormRole(u.role as 'faculty' | 'student');
    setFormDept(u.department?._id || '');
    setFormError('');
    setFormSuccess('');
    setShowForm(true);
  };

  const generateDefaultPassword = () => {
    const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    return pass;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      if (editingUser) {
        const payload: Record<string, unknown> = {
          name: formName,
          loginId: formLoginId,
          phoneNumber: formPhone,
          department: formDept || null,
        };
        if (formPassword) payload.password = formPassword;
        
        await apiPut(`/users/${editingUser._id}`, payload);
        setFormSuccess('User updated successfully!');
      } else {
        const payload = {
          name: formName,
          loginId: formLoginId,
          password: formPassword,
          phoneNumber: formPhone,
          role: formRole,
          department: formDept || undefined,
        };

        await apiPost('/users', payload);
        setCreatedCredentials({
          loginId: formLoginId,
          password: formPassword,
          name: formName,
        });
        setFormSuccess('User created successfully!');
      }

      fetchUsers();
      setTimeout(() => {
        if (!editingUser) return; // Keep form open to show credentials
        setShowForm(false);
        resetForm();
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await apiDelete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-foreground/50">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
            Manage Users
          </h1>
          <p className="text-foreground/60 text-sm">Create and manage faculty login accounts.</p>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card/50 border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 backdrop-blur-md">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); resetForm(); setCreatedCredentials(null); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => { setShowForm(false); resetForm(); setCreatedCredentials(null); }}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-foreground/10 text-foreground/50 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Show created credentials */}
              {createdCredentials && !editingUser ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">Account Created!</h3>
                    <p className="text-foreground/60 text-sm">Share these credentials with {createdCredentials.name}:</p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-background border border-border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-foreground/50 font-medium mb-1">{formRole === 'faculty' ? 'Staff ID' : 'Register Number (Roll No)'}</p>
                        <p className="font-mono font-bold text-lg text-primary">{createdCredentials.loginId}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(createdCredentials.loginId, 'loginId')}
                        className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
                      >
                        {copiedId === 'loginId' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-foreground/40" />}
                      </button>
                    </div>
                    <div className="bg-background border border-border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-foreground/50 font-medium mb-1">Password</p>
                        <p className="font-mono font-bold text-lg">{createdCredentials.password}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(createdCredentials.password, 'password')}
                        className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
                      >
                        {copiedId === 'password' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-foreground/40" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowForm(false); resetForm(); setCreatedCredentials(null); }}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-primary" />
                    </div>
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h3>

                  {formError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-2 mb-5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      {formError}
                    </motion.div>
                  )}

                  {formSuccess && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm flex items-center gap-2 mb-5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      {formSuccess}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground/80">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/30 shadow-sm text-sm"
                        placeholder="John Doe"
                      />
                    </div>

                    {!editingUser && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground/80">Role</label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className={`flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-all ${formRole === 'faculty' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-600' : 'bg-background border-border text-foreground/60'}`}>
                            <input type="radio" name="role" className="hidden" checked={formRole === 'faculty'} onChange={() => { setFormRole('faculty'); setFormPassword(generateDefaultPassword()); }} />
                            <span className="font-semibold text-sm">Faculty</span>
                          </label>
                          <label className={`flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-all ${formRole === 'student' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600' : 'bg-background border-border text-foreground/60'}`}>
                            <input type="radio" name="role" className="hidden" checked={formRole === 'student'} onChange={() => { setFormRole('student'); setFormPassword(''); }} />
                            <span className="font-semibold text-sm">Student</span>
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium mb-1.5 text-foreground/80">
                        {formRole === 'faculty' ? 'Staff ID' : 'Register Number (Roll No)'}
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        <input
                          type="text"
                          required
                          value={formLoginId}
                          onChange={(e) => setFormLoginId(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/30 shadow-sm text-sm"
                          placeholder={formRole === 'faculty' ? 'e.g. FAC001' : 'e.g. 960221104043'}
                          pattern={formRole === 'student' ? '[0-9]{12}' : undefined}
                          title={formRole === 'student' ? 'Register number must be exactly 12 digits' : undefined}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground/80">
                        {formRole === 'student' ? 'Date of Birth (Password)' : 'Password'} {editingUser && <span className="text-foreground/40">(leave blank to keep current)</span>}
                      </label>
                      <div className="relative">
                        {formRole === 'student' ? (
                          <input
                            type="date"
                            required={!editingUser}
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/30 shadow-sm text-sm"
                          />
                        ) : (
                          <>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required={!editingUser}
                              value={formPassword}
                              onChange={(e) => setFormPassword(e.target.value)}
                              className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/30 shadow-sm text-sm"
                              placeholder={editingUser ? '••••••••' : 'Auto-generated password'}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground/80">Phone Number</label>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/30 shadow-sm text-sm"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground/80">Department</label>
                      <div className="relative">
                        <select
                          value={formDept}
                          onChange={(e) => setFormDept(e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm appearance-none cursor-pointer"
                        >
                          <option value="">No Department</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name} ({dept.code})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={formLoading}
                      className="w-full py-3 mt-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {formLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        editingUser ? 'Update User' : 'Create User'
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-foreground/50 text-sm">Loading users...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-card/50 border border-border rounded-3xl shadow-lg backdrop-blur-md p-12 text-center">
          <UserPlus className="w-16 h-16 text-foreground/20 mx-auto mb-5" />
          <h3 className="text-xl font-bold text-foreground mb-2">No Users Found</h3>
          <p className="text-foreground/50 text-sm max-w-sm mx-auto">
            Create faculty accounts so they can login to the portal.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {users.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card/50 border border-border rounded-2xl p-4 shadow-sm backdrop-blur-md"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                    u.role === 'faculty' 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {u.role === 'faculty' ? <BookOpen className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{u.name}</p>
                    <p className="text-xs text-foreground/50 font-mono mt-0.5">{u.loginId || '—'}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${
                        u.role === 'faculty' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>{u.role}</span>
                      {u.department && (
                        <span className="text-[10px] text-foreground/40">{u.department.code}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditForm(u)} className="p-2 rounded-xl bg-foreground/5 text-foreground/50 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(u._id)} className="p-2 rounded-xl bg-red-500/5 text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-card/50 border border-border rounded-2xl shadow-lg backdrop-blur-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-foreground/[0.02]">
                    <th className="text-left px-6 py-3.5 font-semibold text-foreground/70">Name</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-foreground/70">Staff ID / Register No</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-foreground/70">Role</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-foreground/70">Department</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-foreground/70">Phone</th>
                    <th className="text-right px-6 py-3.5 font-semibold text-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            u.role === 'faculty'
                              ? 'bg-indigo-500/10 text-indigo-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-primary font-medium">{u.loginId || '—'}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          u.role === 'faculty'
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {u.role === 'faculty' ? <BookOpen className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-foreground/60">{u.department?.name || '—'}</td>
                      <td className="px-6 py-3.5 text-foreground/60">{u.phoneNumber || '—'}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditForm(u)}
                            className="p-1.5 rounded-md hover:bg-foreground/5 text-foreground/50 hover:text-primary transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-foreground/50 hover:text-red-600 transition-colors"
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
        </>
      )}
    </div>
  );
}
