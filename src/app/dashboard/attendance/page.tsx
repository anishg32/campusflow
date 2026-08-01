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
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto pb-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-foreground/60 text-xs lg:text-sm mt-0.5">{(user?.role as string) === 'student' ? 'View your attendance history' : 'Mark and view student attendance'}</p>
      </div>

      {(user?.role as string) === 'student' ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden mt-4 lg:mt-6 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-foreground/[0.02]">
                <th className="text-left px-4 lg:px-6 py-3 font-semibold text-foreground/70">Date</th>
                <th className="text-left px-4 lg:px-6 py-3 font-semibold text-foreground/70">Status</th>
              </tr>
            </thead>
            <tbody>
              {studentHistory.map((record, i) => (
                <motion.tr
                  key={record._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`border-b border-border hover:bg-foreground/[0.02] transition-colors ${
                    record.status === 'present' ? 'bg-emerald-500/5' : record.status === 'absent' ? 'bg-red-500/5' : ''
                  }`}
                >
                  <td className="px-4 lg:px-6 py-3 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-4 lg:px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] lg:text-xs font-bold ${
                      record.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {record.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {studentHistory.length === 0 && !loading && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-foreground/40 text-sm">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-3 lg:p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary outline-none transition-all"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary outline-none transition-all"
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          {!selectedDept ? (
            <div className="bg-card border border-border rounded-2xl p-12 lg:p-16 text-center shadow-sm">
              <ClipboardCheck className="mx-auto mb-4 opacity-20" size={48} />
              <p className="text-foreground/50 text-base lg:text-lg font-medium">Select a department to mark attendance</p>
              <p className="text-foreground/30 text-sm mt-1">Choose a department and date above</p>
            </div>
          ) : loading ? (
            <div className="text-center py-16 text-foreground/40 text-sm">
              <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 lg:p-16 text-center shadow-sm">
              <ClipboardCheck className="mx-auto mb-4 opacity-20" size={48} />
              <p className="text-foreground/50 text-base font-medium">No students in this department</p>
              <p className="text-foreground/30 text-sm mt-1">Add students to this department first</p>
            </div>
          ) : (
            <>
              {/* Quick Actions & Stats */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllPresent}
                    className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-medium hover:bg-emerald-500/20 transition-colors text-xs lg:text-sm"
                  >
                    All Present
                  </button>
                  <button
                    onClick={markAllAbsent}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors text-xs lg:text-sm"
                  >
                    All Absent
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs lg:text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Present: <strong>{presentCount}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    Absent: <strong>{absentCount}</strong>
                  </span>
                  <span className="text-foreground/40">
                    Total: {students.length}
                  </span>
                </div>
              </div>

              {/* ===== MOBILE CARD VIEW ===== */}
              <div className="lg:hidden space-y-2.5">
                {students.map((student, i) => {
                  const status = attendance[student._id];
                  return (
                    <motion.div
                      key={student._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.25 }}
                      className={`bg-card border rounded-2xl p-4 shadow-sm transition-colors ${
                        status === 'present' ? 'border-emerald-500/30 bg-emerald-500/5' : 
                        status === 'absent' ? 'border-red-500/30 bg-red-500/5' : 
                        'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold text-xs border border-primary/10 shrink-0">
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{student.name}</p>
                          <p className="text-[11px] text-foreground/50 font-mono mt-0.5">{student.rollNumber}</p>
                        </div>
                        
                        {/* Present/Absent Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setAttendance(prev => ({ ...prev, [student._id]: 'present' }));
                              setSaved(false);
                            }}
                            className={`p-2.5 rounded-xl transition-all ${
                              status === 'present'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-foreground/5 border border-border text-foreground/40'
                            }`}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setAttendance(prev => ({ ...prev, [student._id]: 'absent' }));
                              setSaved(false);
                            }}
                            className={`p-2.5 rounded-xl transition-all ${
                              status === 'absent'
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                : 'bg-foreground/5 border border-border text-foreground/40'
                            }`}
                          >
                            <XIcon size={16} />
                          </button>
                          {status && (
                            <button
                              onClick={() => sendWhatsAppMessage(student, status, selectedDate)}
                              className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 transition-colors"
                              title="WhatsApp Parent"
                            >
                              <MessageCircle size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* ===== DESKTOP TABLE VIEW ===== */}
              <div className="hidden lg:block bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-foreground/[0.02]">
                        <th className="text-left px-6 py-3 font-semibold text-foreground/70">Student</th>
                        <th className="text-left px-6 py-3 font-semibold text-foreground/70">Roll No.</th>
                        <th className="text-left px-6 py-3 font-semibold text-foreground/70">Phone</th>
                        <th className="text-center px-6 py-3 font-semibold text-foreground/70">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, i) => {
                        const status = attendance[student._id];
                        return (
                          <motion.tr
                            key={student._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className={`border-b border-border/50 hover:bg-foreground/[0.02] transition-colors ${
                              status === 'present' ? 'bg-emerald-500/5' : status === 'absent' ? 'bg-red-500/5' : ''
                            }`}
                          >
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                  {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <span className="font-medium text-foreground">{student.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 font-mono text-foreground/70">{student.rollNumber}</td>
                            <td className="px-6 py-3 text-foreground/60">{student.phoneNumber}</td>
                            <td className="px-6 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setAttendance(prev => ({ ...prev, [student._id]: 'present' }));
                                    setSaved(false);
                                  }}
                                  className={`p-2 rounded-lg transition-all ${
                                    status === 'present'
                                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
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
                                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                      : 'bg-background/50 border border-border text-foreground/40 hover:border-red-500/50 hover:text-red-500'
                                  }`}
                                >
                                  <XIcon size={16} />
                                </button>
                                {status && (
                                  <button
                                    onClick={() => sendWhatsAppMessage(student, status, selectedDate)}
                                    className="p-2 ml-1 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                    title="Message Parent via WhatsApp"
                                  >
                                    <MessageCircle size={16} />
                                  </button>
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
              <div className="flex justify-end sticky bottom-4 z-30 pt-4 pb-2">
                <button
                  onClick={handleSave}
                  disabled={saving || Object.keys(attendance).length === 0}
                  className={`px-6 lg:px-8 py-3 lg:py-3.5 rounded-2xl font-bold text-sm lg:text-base transition-all flex items-center gap-2.5 shadow-xl ${
                    saved
                      ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                      : 'bg-primary text-primary-foreground shadow-primary/30 hover:scale-105'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <Check size={18} />
                      Saved!
                    </>
                  ) : (
                    <>
                      <ClipboardCheck size={18} />
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
