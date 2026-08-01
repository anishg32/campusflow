"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Calendar, Check, X as XIcon, MessageCircle, Lock } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface StudentAttendance {
  _id: string;
  name: string;
  rollNumber: string;
  phoneNumber: string;
  parentPhoneNumber?: string;
  status: 'present' | 'absent' | null;
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [studentHistory, setStudentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await apiGet<Department[]>('/departments');
        setDepartments(data);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    if (user?.role !== 'student') {
      fetchDepts();
    }
  }, [user?.role]);

  async function fetchAttendance() {
    setLoading(true);
    setSaved(false);
    try {
      if (user?.role === 'student') {
        const data = await apiGet<any[]>('/attendance');
        setStudentHistory(data);
      } else {
        let url = `/attendance?departmentId=${selectedDept}&date=${selectedDate}`;
        if (selectedYear) {
          url += `&year=${selectedYear}`;
        }
        const data = await apiGet<StudentAttendance[]>(url);
        setStudents(data);
        
        // Pre-populate attendance state from existing records
        const existingAttendance: Record<string, 'present' | 'absent'> = {};
        data.forEach((s) => {
          if (s.status) {
            existingAttendance[s._id] = s.status;
          }
        });
        setAttendance(existingAttendance);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'student' || (selectedDept && selectedDate)) {
      fetchAttendance();
    }
  }, [selectedDept, selectedDate, selectedYear, user?.role]);

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => {
      const current = prev[studentId];
      if (!current || current === 'absent') {
        return { ...prev, [studentId]: 'present' };
      }
      return { ...prev, [studentId]: 'absent' };
    });
    setSaved(false);
  };

  const markAllPresent = () => {
    const all: Record<string, 'present' | 'absent'> = {};
    students.forEach((s) => { all[s._id] = 'present'; });
    setAttendance(all);
    setSaved(false);
  };

  const markAllAbsent = () => {
    const all: Record<string, 'present' | 'absent'> = {};
    students.forEach((s) => { all[s._id] = 'absent'; });
    setAttendance(all);
    setSaved(false);
  };

  const handleSave = async () => {
    if (Object.keys(attendance).length === 0) return;
    
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      await apiPost('/attendance', {
        date: selectedDate,
        departmentId: selectedDept,
        records,
      });

      setSaved(true);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length;

  const sendWhatsAppMessage = (student: StudentAttendance, status: 'present' | 'absent', date: string) => {
    const phone = student.parentPhoneNumber || student.phoneNumber;
    if (!phone) {
      alert("Phone number not available.");
      return;
    }
    const deptName = departments.find(d => d._id === selectedDept)?.name || 'Unknown Department';
    const year = selectedYear || 'Unknown Year';

    const message = `Dear Parent,\n\nThis is to inform you that your child, ${student.name} (Roll No: ${student.rollNumber}), was marked ${status === 'present' ? 'Present' : 'Absent'} on ${new Date(date).toLocaleDateString()}.\n\n\nRegards,\nArunachala hitech Engineering College`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://web.whatsapp.com/send?phone=91${phone}&text=${encodedMessage}`, '_blank');
  };

  if (user?.role === 'student') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <Lock className="w-20 h-20 text-red-500/50 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-foreground/60 max-w-md">You do not have permission to view this page. This area is restricted to Staff only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-foreground/60 text-sm mt-1">{user?.role === 'student' ? 'View your attendance history' : 'Mark and view student attendance'}</p>
      </div>

      {user?.role === 'student' ? (
        <div className="glass rounded-2xl overflow-hidden mt-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-bold text-foreground/60">Date</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-foreground/60">Status</th>
              </tr>
            </thead>
            <tbody>
              {studentHistory.map((record, i) => (
                <motion.tr
                  key={record._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`border-b border-border/50 transition-colors ${
                    record.status === 'present' ? 'bg-emerald-500/5' : record.status === 'absent' ? 'bg-red-500/5' : ''
                  }`}
                >
                  <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      record.status === 'present' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {record.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {studentHistory.length === 0 && !loading && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-foreground/40">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Department</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 outline-none transition-all"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 outline-none transition-all"
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Date</label>
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {!selectedDept ? (
        <div className="glass rounded-3xl p-16 text-center">
          <ClipboardCheck className="mx-auto mb-4 opacity-30" size={64} />
          <p className="text-foreground/40 text-xl font-medium">Select a department to mark attendance</p>
          <p className="text-foreground/30 text-sm mt-2">Choose a department and date above</p>
        </div>
      ) : loading ? (
        <div className="text-center py-16 text-foreground/40">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center">
          <ClipboardCheck className="mx-auto mb-4 opacity-30" size={64} />
          <p className="text-foreground/40 text-xl font-medium">No students in this department</p>
          <p className="text-foreground/30 text-sm mt-2">Add students to this department first</p>
        </div>
      ) : (
        <>
          {/* Quick Actions & Stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={markAllPresent}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-medium hover:bg-emerald-500/20 transition-colors text-sm"
              >
                All Present
              </button>
              <button
                onClick={markAllAbsent}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors text-sm"
              >
                All Absent
              </button>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                Present: <strong>{presentCount}</strong>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Absent: <strong>{absentCount}</strong>
              </span>
              <span className="text-foreground/50">
                Total: {students.length}
              </span>
            </div>
          </div>

          {/* Student List */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 text-sm font-bold text-foreground/60">Student</th>
                    <th className="text-left px-6 py-4 text-sm font-bold text-foreground/60">Roll No.</th>
                    <th className="text-left px-6 py-4 text-sm font-bold text-foreground/60">Phone</th>
                    <th className="text-center px-6 py-4 text-sm font-bold text-foreground/60">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => {
                    const status = attendance[student._id];
                    return (
                      <motion.tr
                        key={student._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`border-b border-border/50 transition-colors ${
                          status === 'present' ? 'bg-emerald-500/5' : status === 'absent' ? 'bg-red-500/5' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-foreground font-bold text-xs">
                              {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <span className="font-medium text-sm">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono">{student.rollNumber}</td>
                        <td className="px-6 py-4 text-sm text-foreground/60">{student.phoneNumber}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setAttendance(prev => ({ ...prev, [student._id]: 'present' }));
                                setSaved(false);
                              }}
                              className={`p-2 rounded-lg transition-all ${
                                status === 'present'
                                  ? 'bg-emerald-500 text-foreground shadow-lg shadow-emerald-500/30'
                                  : 'bg-background/50 border border-border text-foreground/40 hover:border-emerald-500/50 hover:text-emerald-500'
                              }`}
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setAttendance(prev => ({ ...prev, [student._id]: 'absent' }));
                                setSaved(false);
                              }}
                              className={`p-2 rounded-lg transition-all ${
                                status === 'absent'
                                  ? 'bg-red-500 text-foreground shadow-lg shadow-red-500/30'
                                  : 'bg-background/50 border border-border text-foreground/40 hover:border-red-500/50 hover:text-red-500'
                              }`}
                            >
                              <XIcon size={16} />
                            </button>
                            {status && (
                              <>
                                <button
                                  onClick={() => sendWhatsAppMessage(student, status, selectedDate)}
                                  className="p-2 ml-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                                  title="Message Parent via WhatsApp"
                                >
                                  <MessageCircle size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || Object.keys(attendance).length === 0}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3 ${
                saved
                  ? 'bg-emerald-500 text-foreground shadow-lg shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-foreground shadow-lg shadow-indigo-500/20 hover:scale-105'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check size={20} />
                  Attendance Saved!
                </>
              ) : (
                <>
                  <ClipboardCheck size={20} />
                  Save Attendance
                </>
              )}
            </button>
          </div>
        </>
      )}
        </>
      )}
    </div>
  );
}
