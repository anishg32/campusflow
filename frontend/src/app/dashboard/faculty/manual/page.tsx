"use client";

import { useState } from 'react';
import { UserCheck, UserX, CheckCircle, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiPost, type ApiError } from '@/lib/api';

export default function ManualAttendance() {
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; smsSent: boolean } | null>(null);
  const [error, setError] = useState('');

  const markAttendance = async (status: 'present' | 'absent') => {
    if (!studentEmail.trim()) {
      setError('Please enter a student email first.');
      return;
    }
    
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const data = await apiPost<{ message: string; smsSent: boolean }>('/attendance/manual', {
        studentEmail: studentEmail.trim(),
        status
      });
      setResult(data);
      setStudentEmail(''); // clear form on success
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 mt-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Manual Attendance</h1>
        <p className="text-foreground/60">Mark student attendance manually. An SMS will be sent automatically.</p>
      </div>

      <div className="glass rounded-3xl p-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm"
          >
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle size={20} />
              {result.message}
            </div>
            {result.smsSent ? (
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Smartphone size={16} /> SMS Notification Sent!
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-yellow-500/80">
                <Smartphone size={16} /> Student has no phone number registered.
              </div>
            )}
          </motion.div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Student Email</label>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-lg"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => markAttendance('present')}
              disabled={loading || !studentEmail.trim()}
              className="py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex flex-col items-center justify-center gap-2 shadow-lg"
            >
              <UserCheck size={28} />
              Mark Present
            </button>

            <button
              onClick={() => markAttendance('absent')}
              disabled={loading || !studentEmail.trim()}
              className="py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex flex-col items-center justify-center gap-2 shadow-lg"
            >
              <UserX size={28} />
              Mark Absent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
