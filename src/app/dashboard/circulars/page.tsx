"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Send, Users, BookOpen, GraduationCap, Building2, Clock, ChevronDown, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost } from '@/lib/api';

interface CircularData {
  _id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'faculty' | 'student';
  postedBy?: { name: string; role: string };
  department?: { name: string; code: string } | null;
  createdAt: string;
}

interface DepartmentData {
  _id: string;
  name: string;
  code: string;
}

export default function CircularsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [circulars, setCirculars] = useState<CircularData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'faculty' | 'student'>('all');
  const [selectedDept, setSelectedDept] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchCirculars();
    if (isAdmin) {
      fetchDepartments();
    }
  }, [isAdmin]);

  const fetchCirculars = async () => {
    try {
      const data = await apiGet<CircularData[]>('/circulars');
      setCirculars(data);
    } catch (err) {
      console.error('Failed to fetch circulars:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await apiGet<DepartmentData[]>('/departments');
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const handlePostCircular = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title.trim() || !message.trim()) {
      setFormError('Title and message are required.');
      return;
    }

    setPosting(true);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        message: message.trim(),
        targetAudience,
      };
      if (selectedDept) {
        body.department = selectedDept;
      }

      const newCircular = await apiPost<CircularData>('/circulars', body);
      setCirculars((prev) => [newCircular, ...prev]);
      setTitle('');
      setMessage('');
      setTargetAudience('all');
      setSelectedDept('');
      setFormSuccess('Circular posted successfully!');
      setTimeout(() => {
        setFormSuccess('');
        setShowForm(false);
      }, 2000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to post circular.');
    } finally {
      setPosting(false);
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all': return 'Everyone';
      case 'faculty': return 'Faculty Only';
      case 'student': return 'Students Only';
      default: return audience;
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'all': return <Users className="w-3.5 h-3.5" />;
      case 'faculty': return <BookOpen className="w-3.5 h-3.5" />;
      case 'student': return <GraduationCap className="w-3.5 h-3.5" />;
      default: return <Users className="w-3.5 h-3.5" />;
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'all': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'faculty': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'student': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
            Circulars
          </h1>
          <p className="text-foreground/60">
            {isAdmin
              ? 'Post announcements and circulars for faculty and students.'
              : 'View latest announcements and circulars from the administration.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 shrink-0"
          >
            <Megaphone className="w-4 h-4" />
            Post Circular
          </button>
        )}
      </div>

      {/* Admin Post Form */}
      <AnimatePresence>
        {isAdmin && showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-card/50 border border-border rounded-3xl shadow-lg backdrop-blur-md p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Megaphone className="w-5 h-5 text-primary" />
                    </div>
                    New Circular
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 rounded-lg hover:bg-foreground/10 text-foreground/50 hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-2 mb-5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {formError}
                  </motion.div>
                )}

                {formSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm flex items-center gap-2 mb-5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    {formSuccess}
                  </motion.div>
                )}

                <form onSubmit={handlePostCircular} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/30 shadow-sm text-sm"
                      placeholder="e.g. Exam Schedule Update"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Message</label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/30 shadow-sm text-sm resize-none"
                      placeholder="Write your circular message here..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground/80">Target Audience</label>
                      <div className="relative">
                        <select
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value as 'all' | 'faculty' | 'student')}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm appearance-none cursor-pointer"
                        >
                          <option value="all">Everyone</option>
                          <option value="faculty">Faculty Only</option>
                          <option value="student">Students Only</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground/80">Department (Optional)</label>
                      <div className="relative">
                        <select
                          value={selectedDept}
                          onChange={(e) => setSelectedDept(e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm appearance-none cursor-pointer"
                        >
                          <option value="">All Departments (College-wide)</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name} ({dept.code})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={posting}
                    className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {posting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post Circular
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circulars Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-foreground/50 text-sm">Loading circulars...</p>
          </div>
        </div>
      ) : circulars.length === 0 ? (
        <div className="bg-card/50 border border-border rounded-3xl shadow-lg backdrop-blur-md p-12 sm:p-16 text-center">
          <Megaphone className="w-16 h-16 text-foreground/20 mx-auto mb-5" />
          <h3 className="text-xl font-bold text-foreground mb-2">No Circulars Yet</h3>
          <p className="text-foreground/50 text-sm max-w-sm mx-auto">
            {isAdmin
              ? 'Post your first circular to announce something to faculty and students.'
              : 'No circulars have been posted yet. Check back later for announcements.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {circulars.map((circular, i) => (
            <motion.div
              key={circular._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card/50 border border-border rounded-2xl shadow-lg backdrop-blur-md p-5 sm:p-6 hover:bg-card/80 transition-colors relative overflow-hidden group"
            >
              {/* Decorative accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-l-2xl" />

              <div className="pl-4">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <h3 className="text-lg font-bold text-foreground leading-snug">{circular.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getAudienceColor(circular.targetAudience)}`}>
                      {getAudienceIcon(circular.targetAudience)}
                      {getAudienceLabel(circular.targetAudience)}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <p className="text-foreground/70 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                  {circular.message}
                </p>

                {/* Footer */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground/40">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(circular.createdAt)}
                  </span>
                  {circular.postedBy && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {circular.postedBy.name}
                    </span>
                  )}
                  {circular.department && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {circular.department.name}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
