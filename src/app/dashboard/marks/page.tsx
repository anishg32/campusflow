"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, GraduationCap, CheckCircle2, AlertCircle, Trash2, Edit, Bell, TrendingDown, Lightbulb, CheckCircle, Clock } from 'lucide-react';
import { apiGet, apiPost, apiDelete, apiPut } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';

interface Mark {
  _id: string;
  student: { _id: string; name: string; rollNumber: string; year?: number };
  department: { _id: string; name: string; code: string };
  subjectName: string;
  semester: number;
  examType: string;
  marksObtained: number;
  maxMarks: number;
  date: string;
  grade?: string;
}

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  department?: { _id: string; name: string; code: string };
  year: number;
}

const semesterSubjects: Record<string, Record<number, string[]>> = {
  '2021': {
    1: ['Induction Programme', 'Professional English - I', 'Matrices and Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Problem Solving and Python Programming', 'Heritage of Tamils'],
    2: ['Professional English - II', 'Statistics and Numerical Methods', 'Physics for Information Science', 'Basic Electrical and Electronics Engineering', 'Engineering Graphics', 'Programming in C', 'Tamils and Technology'],
    3: ['Discrete Mathematics', 'Digital Principles and Computer Organization', 'Foundations of Data Science', 'Data Structures', 'Object Oriented Programming'],
    4: ['Theory of Computation', 'Artificial Intelligence and Machine Learning', 'Database Management Systems', 'Algorithms', 'Introduction to Operating Systems', 'Environmental Sciences and Sustainability'],
    5: ['Computer Networks', 'Compiler Design', 'Cryptography and Cyber Security', 'Distributed Computing', 'Professional Elective I', 'Professional Elective II', 'Mandatory Course-I'],
    6: ['Object Oriented Software Engineering', 'Embedded Systems and IoT', 'Open Elective - I', 'Professional Elective III', 'Professional Elective IV', 'Professional Elective V', 'Professional Elective VI', 'Mandatory Course-II'],
    7: ['Human Values and Ethics', 'Total Quality Management', 'Industrial Management', 'Project Report Writing', 'Summer Internship'],
    8: ['Project Work/Internship']
  },
  '2025': {
    1: ['Induction Programme', 'Professional English - I', 'Matrices and Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Problem Solving and Python Programming', 'Heritage of Tamils'],
    2: ['Professional English - II', 'Statistics and Numerical Methods', 'Physics for Information Science', 'Basic Electrical and Electronics Engineering', 'Engineering Graphics', 'Programming in C', 'Tamils and Technology'],
    3: ['Discrete Mathematics', 'Digital Principles and Computer Organization', 'Foundations of Data Science', 'Data Structures', 'Object Oriented Programming'],
    4: ['Theory of Computation', 'Artificial Intelligence and Machine Learning', 'Database Management Systems', 'Algorithms', 'Introduction to Operating Systems', 'Environmental Sciences and Sustainability'],
    5: ['Computer Networks', 'Compiler Design', 'Cryptography and Cyber Security', 'Distributed Computing', 'Professional Elective I', 'Professional Elective II', 'Mandatory Course-I'],
    6: ['Object Oriented Software Engineering', 'Embedded Systems and IoT', 'Open Elective - I', 'Professional Elective III', 'Professional Elective IV', 'Professional Elective V', 'Professional Elective VI', 'Mandatory Course-II'],
    7: ['Human Values and Ethics', 'Total Quality Management', 'Industrial Management', 'Project Report Writing', 'Summer Internship'],
    8: ['Project Work/Internship']
  }
};

export default function MarksPage() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterExamType, setFilterExamType] = useState('All');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<'single' | 'bulk-subjects' | 'bulk-students'>('single');
  const [bulkMarks, setBulkMarks] = useState<Record<string, any>>({});
  const [bulkStudentMarks, setBulkStudentMarks] = useState<Record<string, any>>({});
  const [editMark, setEditMark] = useState<Mark | null>(null);
  const [selectedPlanMark, setSelectedPlanMark] = useState<Mark | null>(null);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFilterDept, setReportFilterDept] = useState('');
  const [reportFilterYear, setReportFilterYear] = useState('');
  const [selectedReportStudent, setSelectedReportStudent] = useState('');
  const reportStudentObj = students.find(s => s._id === selectedReportStudent);
  const reportStudentMarks = marks.filter(m => (m.student?._id || m.student) === selectedReportStudent);
  
  const filteredReportStudents = students.filter(s => {
    if (reportFilterDept && ((s.department as any)?._id || s.department) !== reportFilterDept) return false;
    if (reportFilterYear && s.year !== Number(reportFilterYear)) return false;
    return true;
  });

  const [formData, setFormData] = useState({
    regulation: '2021',
    student: '',
    department: '',
    semester: '1',
    subjectName: semesterSubjects['2021'][1][0],
    examType: 'Class Test',
    marksObtained: '',
    maxMarks: '20',
    internalExamMarks: '',
    assignmentMarks: '',
    grade: 'A',
    date: new Date().toISOString().split('T')[0],
  });

  const filteredBulkStudents = students.filter(s => {
    if (formData.department && ((s.department as any)?._id || s.department) !== formData.department) return false;
    if (formData.semester && s.year !== Math.ceil(Number(formData.semester) / 2)) return false;
    return true;
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

  // Auto-apply filter from URL search params (e.g. from notification click)
  const searchParams = useSearchParams();
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'needs-improvement') {
      setFilterExamType('Needs Improvement');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isModalOpen || showReportModal || selectedPlanMark) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, showReportModal, selectedPlanMark]);

  const formScrollRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isModalOpen && formScrollRef.current) {
      setTimeout(() => formScrollRef.current?.focus(), 50);
    }
  }, [isModalOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
        e.preventDefault();
        const scrollAmount = e.key === 'ArrowDown' ? 60 : -60;
        formScrollRef.current?.scrollBy({ top: scrollAmount, behavior: 'auto' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (entryMode === 'bulk-subjects' && !editMark) {
        const payloadArray = [];
        const subjects = semesterSubjects[formData.regulation]?.[Number(formData.semester)] || [];
        for (const subject of subjects) {
          const b = bulkMarks[subject];
          if (!b) continue; // Skip if no data for this subject
          
          let mObt, iMark, aMark;
          if (formData.examType === 'Semester Exam') {
            if (!b.grade) continue;
          } else if (formData.examType.startsWith('Internal Exam')) {
            iMark = b.internalExamMarks ? Number(b.internalExamMarks) : 0;
            aMark = b.assignmentMarks ? Number(b.assignmentMarks) : 0;
            if (!b.internalExamMarks && !b.assignmentMarks) continue; // skip empty
            mObt = iMark + aMark;
          } else {
            if (!b.marksObtained) continue;
            mObt = Number(b.marksObtained);
          }

          payloadArray.push({
            student: formData.student,
            department: formData.department,
            semester: Number(formData.semester),
            examType: formData.examType,
            maxMarks: formData.examType === 'Semester Exam' ? undefined : Number(formData.maxMarks),
            subjectName: subject,
            date: formData.date,
            grade: formData.examType === 'Semester Exam' ? b.grade : undefined,
            internalExamMarks: formData.examType.startsWith('Internal Exam') ? iMark : undefined,
            assignmentMarks: formData.examType.startsWith('Internal Exam') ? aMark : undefined,
            marksObtained: formData.examType === 'Semester Exam' ? undefined : mObt
          });
        }
        
        if (payloadArray.length === 0) {
          alert('Please enter marks for at least one subject');
          return;
        }
        await apiPost('/marks', payloadArray);
      } else if (entryMode === 'bulk-students' && !editMark) {
        const payloadArray = [];
        for (const student of filteredBulkStudents) {
          const b = bulkStudentMarks[student._id];
          if (!b) continue;
          
          let mObt, iMark, aMark;
          if (formData.examType === 'Semester Exam') {
            if (!b.grade) continue;
          } else if (formData.examType.startsWith('Internal Exam')) {
            iMark = b.internalExamMarks ? Number(b.internalExamMarks) : 0;
            aMark = b.assignmentMarks ? Number(b.assignmentMarks) : 0;
            if (!b.internalExamMarks && !b.assignmentMarks) continue;
            mObt = iMark + aMark;
          } else {
            if (!b.marksObtained) continue;
            mObt = Number(b.marksObtained);
          }

          payloadArray.push({
            student: student._id,
            department: formData.department,
            semester: Number(formData.semester),
            examType: formData.examType,
            maxMarks: formData.examType === 'Semester Exam' ? undefined : Number(formData.maxMarks),
            subjectName: formData.subjectName,
            date: formData.date,
            grade: formData.examType === 'Semester Exam' ? b.grade : undefined,
            internalExamMarks: formData.examType.startsWith('Internal Exam') ? iMark : undefined,
            assignmentMarks: formData.examType.startsWith('Internal Exam') ? aMark : undefined,
            marksObtained: formData.examType === 'Semester Exam' ? undefined : mObt
          });
        }
        if (payloadArray.length === 0) {
          alert('Please enter marks for at least one student');
          return;
        }
        await apiPost('/marks', payloadArray);
      } else {
        const payload = {
          ...formData,
          semester: Number(formData.semester),
          marksObtained: formData.examType === 'Semester Exam' || formData.marksObtained === '' ? undefined : Number(formData.marksObtained),
          maxMarks: formData.examType === 'Semester Exam' || formData.maxMarks === '' ? undefined : Number(formData.maxMarks),
          grade: formData.examType === 'Semester Exam' ? formData.grade : undefined,
          internalExamMarks: formData.internalExamMarks ? Number(formData.internalExamMarks) : undefined,
          assignmentMarks: formData.assignmentMarks ? Number(formData.assignmentMarks) : undefined,
        };

        if (editMark) {
          await apiPut(`/marks/${editMark._id}`, payload);
        } else {
          await apiPost('/marks', payload);
        }
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
    
    let inferredRegulation = '2021';
    for (const reg of ['2021', '2025']) {
      if (semesterSubjects[reg]?.[mark.semester || 1]?.includes(mark.subjectName)) {
        inferredRegulation = reg;
        break;
      }
    }

    setFormData({
      regulation: inferredRegulation,
      student: mark.student._id,
      department: mark.department._id,
      semester: mark.semester?.toString() || '1',
      subjectName: mark.subjectName,
      examType: mark.examType,
      marksObtained: mark.marksObtained.toString(),
      maxMarks: mark.maxMarks?.toString() || '100',
      internalExamMarks: (mark as any).internalExamMarks?.toString() || '',
      assignmentMarks: (mark as any).assignmentMarks?.toString() || '',
      grade: mark.grade || 'A',
      date: new Date(mark.date).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      regulation: '2021',
      student: '',
      department: '',
      semester: '1',
      subjectName: semesterSubjects['2021'][1][0],
      examType: 'Class Test 1',
      marksObtained: '',
      maxMarks: '20',
      internalExamMarks: '',
      assignmentMarks: '',
      grade: 'A',
      date: new Date().toISOString().split('T')[0],
    });
    setBulkMarks({});
    setBulkStudentMarks({});
    setEntryMode('single');
    setEditMark(null);
  };

  function getPercentage(m: Mark) {
    if (m.examType === 'Semester Exam' && m.grade) {
      const gradeMap: Record<string, number> = { 'O': 100, 'A+': 90, 'A': 80, 'B+': 70, 'B': 60, 'C': 50, 'U': 0 };
      return gradeMap[m.grade] || 0;
    }
    if (!m.maxMarks || m.maxMarks === 0) return 0;
    return ((m.marksObtained || 0) / m.maxMarks) * 100;
  }

  const failingMarksList = marks.filter(m => {
    if (m.examType === 'Semester Exam') return m.grade === 'U';
    return getPercentage(m) < 50;
  });
  const subjectBreakdown = failingMarksList.reduce((acc, curr) => {
    acc[curr.subjectName] = (acc[curr.subjectName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sortedBreakdown = Object.entries(subjectBreakdown).sort((a, b) => b[1] - a[1]);
  const maxFailingSubjectCount = sortedBreakdown.length > 0 ? sortedBreakdown[0][1] : 1;

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
    if (filterSemester && m.semester?.toString() !== filterSemester) return false;
    if (filterExamType !== 'All' && filterExamType !== 'Needs Improvement') {
      if (m.examType !== filterExamType) return false;
    }
    if (filterExamType === 'Needs Improvement' && (m.examType === 'Semester Exam' ? m.grade !== 'U' : getPercentage(m) >= 50)) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Student Marks</h1>
          <p className="text-foreground/50 mt-1">Manage and track student academic performance</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setShowReportModal(true); }}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/90 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Student Report
          </button>
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
                {marks.length > 0 ? (marks.reduce((sum, m) => sum + getPercentage(m), 0) / marks.length).toFixed(1) : 0}%
              </h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="bg-card/50 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 relative overflow-hidden group shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        >
          <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setFilterExamType('Needs Improvement')}>
              <div className="p-3 bg-red-500/20 text-red-500 rounded-xl relative">
                {failingMarksList.length > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                )}
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-foreground/70 text-sm font-medium">Needs Improvement</p>
                <h3 className="text-3xl font-black text-red-400">
                  {failingMarksList.length}
                </h3>
              </div>
            </div>
            
            {user?.role !== 'student' && failingMarksList.length > 0 && (
              <button 
                onClick={async () => {
                  try {
                    const res = await apiPost<any>('/marks/notify', {});
                    alert(`Alerts sent successfully to ${res.notifiedCount} students!`);
                  } catch (error) {
                    alert('Failed to send alerts.');
                  }
                }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
              >
                <Bell className="w-3.5 h-3.5" /> Notify Students
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Breakdown Chart for Failing Subjects */}
      {failingMarksList.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-foreground/70 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" /> Subjects Needing Attention
          </h4>
          <div className="space-y-3">
            {sortedBreakdown.map(([subject, count]) => {
              const percentage = (count / maxFailingSubjectCount) * 100;
              return (
                <div key={subject} className="flex items-center gap-4">
                  <div className="w-1/4 text-sm font-medium truncate">{subject}</div>
                  <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500/50 to-red-500 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="w-12 text-right text-xs font-bold text-red-400">{count}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* List */}
      <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col gap-4">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full">
            <div className="flex flex-wrap items-center gap-4 flex-1 w-full">
              <select
                value={filterExamType}
                onChange={(e) => setFilterExamType(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 flex-1 sm:flex-none min-w-[160px]"
              >
                {['All', 'Class Test 1', 'Class Test 2', 'Class Test 3', 'Class Test 4', 'Internal Exam 1', 'Internal Exam 2', 'Internal Exam 3', 'Internal Exam 4', 'Revision Exam 1', 'Revision Exam 2', 'Revision Exam 3', 'Semester Exam', 'Needs Improvement'].map(tab => (
                  <option key={tab} value={tab} className="bg-card">{tab}</option>
                ))}
              </select>

              {user?.role !== 'student' && (
                <>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 flex-1 sm:flex-none min-w-[140px]"
                  >
                    <option value="" className="bg-card">All Departments</option>
                    {departments.map(d => <option key={d._id} value={d._id} className="bg-card">{d.name}</option>)}
                  </select>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 flex-1 sm:flex-none min-w-[140px]"
                  >
                    <option value="" className="bg-card">All Years</option>
                    <option value="1" className="bg-card">1st Year</option>
                    <option value="2" className="bg-card">2nd Year</option>
                    <option value="3" className="bg-card">3rd Year</option>
                    <option value="4" className="bg-card">4th Year</option>
                  </select>
                  <select
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 flex-1 sm:flex-none min-w-[140px]"
                  >
                    <option value="" className="bg-card">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem} className="bg-card">Semester {sem}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
            
            <div className="relative w-full xl:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input 
                type="text" 
                placeholder="Search name, roll or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>
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
                const percentage = getPercentage(mark);
                const isPass = mark.examType === 'Semester Exam' ? mark.grade !== 'U' : percentage >= 50;

                return (
                  <tr key={mark._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{mark.student?.name || 'Unknown'}</div>
                      <div className="text-xs text-foreground/40">{mark.student?.rollNumber || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{mark.subjectName}</div>
                      <div className="text-xs text-foreground/40">{mark.department?.code || '-'} • Semester {mark.semester || 1}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/5 text-foreground/80 rounded-lg text-xs font-medium border border-white/10">
                        {mark.examType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {mark.examType === 'Semester Exam' ? (
                        <span className={isPass ? 'text-green-400' : 'text-red-400'}>{mark.grade || '-'}</span>
                      ) : (
                        <>
                          <span className={isPass ? 'text-green-400' : 'text-red-400'}>{mark.marksObtained}</span>
                          <span className="text-foreground/40"> / {mark.maxMarks}</span>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {mark.examType === 'Semester Exam' ? (
                        <span className="text-xs font-medium text-foreground/40">Grade based</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isPass ? 'bg-green-500' : 'bg-red-500'}`} 
                              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{new Date(mark.date).toLocaleDateString()}</td>
                    {(user?.role === 'admin' || user?.role === 'faculty') && (
                      <td className="px-6 py-4 text-right flex justify-end gap-2 items-center h-full pt-6">
                        {!isPass && (
                          <button 
                            onClick={() => setSelectedPlanMark(mark)}
                            className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20 transition-colors"
                            title="Generate Improvement Plan"
                          >
                            <Lightbulb size={14} />
                          </button>
                        )}
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-bold text-foreground">{editMark ? 'Edit Marks' : 'Add Marks'}</h3>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-foreground/50 hover:text-foreground"><X size={20} /></button>
              </div>
              <form ref={formScrollRef} tabIndex={0} onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-1 outline-none">
                {!editMark && (
                  <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 w-full mb-4">
                    <button
                      type="button"
                      onClick={() => setEntryMode('single')}
                      className={`flex-1 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${entryMode === 'single' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-foreground/50 hover:text-foreground'}`}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryMode('bulk-subjects')}
                      className={`flex-1 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${entryMode === 'bulk-subjects' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-foreground/50 hover:text-foreground'}`}
                    >
                      Bulk Subjects
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryMode('bulk-students')}
                      className={`flex-1 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${entryMode === 'bulk-students' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-foreground/50 hover:text-foreground'}`}
                    >
                      Bulk Students
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Regulation</label>
                    <select required value={formData.regulation} onChange={e => {
                      const reg = e.target.value;
                      const sem = Number(formData.semester) || 1;
                      setFormData({...formData, regulation: reg, subjectName: semesterSubjects[reg]?.[sem]?.[0] || ''});
                    }} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                      <option value="2021" className="bg-card">Regulation 2021</option>
                      <option value="2025" className="bg-card">Regulation 2025</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Department</label>
                    <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                      <option value="" className="bg-card">Select Dept</option>
                      {departments.map(d => <option key={d._id} value={d._id} className="bg-card">{d.name}</option>)}
                    </select>
                  </div>
                </div>
                {entryMode !== 'bulk-students' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Student</label>
                    <select required value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                      <option value="" className="bg-card">Select Student</option>
                      {students.filter(s => !formData.department || (s.department as any) === formData.department || (s.department as any)?._id === formData.department).map(s => <option key={s._id} value={s._id} className="bg-card">{s.name} ({s.rollNumber})</option>)}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Semester</label>
                    <select required value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value, subjectName: semesterSubjects[formData.regulation]?.[Number(e.target.value)]?.[0] || ''})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                      {[1,2,3,4,5,6,7,8].map(sem => (
                        <option key={sem} value={sem} className="bg-card">Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                  {entryMode !== 'bulk-subjects' && (
                    <div>
                      <label className="block text-sm font-medium text-foreground/70 mb-1">Subject Name</label>
                      <select required value={formData.subjectName} onChange={e => setFormData({...formData, subjectName: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                        {semesterSubjects[formData.regulation]?.[Number(formData.semester) || 1]?.map(sub => (
                          <option key={sub} value={sub} className="bg-card">{sub}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Exam Type</label>
                  <select 
                    required 
                    value={formData.examType} 
                    onChange={e => {
                      const type = e.target.value;
                      let max = formData.maxMarks;
                      if (type.startsWith('Class Test')) max = '20';
                      if (type.startsWith('Internal Exam') || type.startsWith('Revision Exam')) max = '100';
                      setFormData({...formData, examType: type, maxMarks: max});
                    }} 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <optgroup label="Class Tests">
                      <option value="Class Test 1" className="bg-card">Class Test 1 (Max 20)</option>
                      <option value="Class Test 2" className="bg-card">Class Test 2 (Max 20)</option>
                      <option value="Class Test 3" className="bg-card">Class Test 3 (Max 20)</option>
                      <option value="Class Test 4" className="bg-card">Class Test 4 (Max 20)</option>
                    </optgroup>
                    <optgroup label="Internal Exams">
                      <option value="Internal Exam 1" className="bg-card">Internal Exam 1 (Max 100: 60+40)</option>
                      <option value="Internal Exam 2" className="bg-card">Internal Exam 2 (Max 100: 60+40)</option>
                      <option value="Internal Exam 3" className="bg-card">Internal Exam 3 (Max 100: 60+40)</option>
                      <option value="Internal Exam 4" className="bg-card">Internal Exam 4 (Max 100: 60+40)</option>
                    </optgroup>
                    <optgroup label="Revision Exams">
                      <option value="Revision Exam 1" className="bg-card">Revision Exam 1 (Max 100)</option>
                      <option value="Revision Exam 2" className="bg-card">Revision Exam 2 (Max 100)</option>
                      <option value="Revision Exam 3" className="bg-card">Revision Exam 3 (Max 100)</option>
                    </optgroup>
                    <option value="Semester Exam" className="bg-card">Semester Exam</option>
                  </select>
                </div>
                {entryMode === 'bulk-subjects' ? (
                  <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                    {semesterSubjects[formData.regulation]?.[Number(formData.semester)]?.map(subject => (
                      <div key={subject} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
                        <p className="text-sm font-medium flex-1 pr-2 leading-tight">{subject}</p>
                        <div className="w-full sm:w-[220px] grid grid-cols-2 gap-2 shrink-0">
                          {formData.examType.startsWith('Internal Exam') ? (
                            <>
                              <input type="number" min="0" max="60" placeholder="Exam (60)" value={bulkMarks[subject]?.internalExamMarks || ''} onChange={e => {
                                setBulkMarks(prev => ({...prev, [subject]: {...prev[subject], internalExamMarks: e.target.value}}))
                              }} className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                              <input type="number" min="0" max="40" placeholder="Assg (40)" value={bulkMarks[subject]?.assignmentMarks || ''} onChange={e => {
                                setBulkMarks(prev => ({...prev, [subject]: {...prev[subject], assignmentMarks: e.target.value}}))
                              }} className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                            </>
                          ) : formData.examType === 'Semester Exam' ? (
                            <div className="col-span-2">
                              <select value={bulkMarks[subject]?.grade || ''} onChange={e => {
                                setBulkMarks(prev => ({...prev, [subject]: {...prev[subject], grade: e.target.value}}))
                              }} className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                                <option value="" className="bg-card">Select Grade</option>
                                <option value="O" className="bg-card">O</option>
                                <option value="A+" className="bg-card">A+</option>
                                <option value="A" className="bg-card">A</option>
                                <option value="B+" className="bg-card">B+</option>
                                <option value="B" className="bg-card">B</option>
                                <option value="C" className="bg-card">C</option>
                                <option value="U" className="bg-card">U (Fail)</option>
                              </select>
                            </div>
                          ) : (
                            <div className="col-span-2">
                              <input type="number" min="0" max={formData.maxMarks} placeholder={`Marks Obtained (Max ${formData.maxMarks})`} value={bulkMarks[subject]?.marksObtained || ''} onChange={e => {
                                setBulkMarks(prev => ({...prev, [subject]: {...prev[subject], marksObtained: e.target.value}}))
                              }} className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : entryMode === 'bulk-students' ? (
                  <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                    {filteredBulkStudents.map(student => (
                      <div key={student._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
                        <div className="flex-1 pr-2">
                          <p className="text-sm font-medium leading-tight">{student.name}</p>
                          <p className="text-xs text-foreground/50">{student.rollNumber}</p>
                        </div>
                        <div className="w-full sm:w-[220px] grid grid-cols-2 gap-2 shrink-0">
                          {formData.examType.startsWith('Internal Exam') ? (
                            <>
                              <input type="number" min="0" max="60" placeholder="Exam (60)" value={bulkStudentMarks[student._id]?.internalExamMarks || ''} onChange={e => {
                                setBulkStudentMarks(prev => ({...prev, [student._id]: {...prev[student._id], internalExamMarks: e.target.value}}))
                              }} className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                              <input type="number" min="0" max="40" placeholder="Assg (40)" value={bulkStudentMarks[student._id]?.assignmentMarks || ''} onChange={e => {
                                setBulkStudentMarks(prev => ({...prev, [student._id]: {...prev[student._id], assignmentMarks: e.target.value}}))
                              }} className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                            </>
                          ) : formData.examType === 'Semester Exam' ? (
                            <div className="col-span-2">
                              <select value={bulkStudentMarks[student._id]?.grade || ''} onChange={e => {
                                setBulkStudentMarks(prev => ({...prev, [student._id]: {...prev[student._id], grade: e.target.value}}))
                              }} className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                                <option value="" className="bg-card">Select Grade</option>
                                <option value="O" className="bg-card">O</option>
                                <option value="A+" className="bg-card">A+</option>
                                <option value="A" className="bg-card">A</option>
                                <option value="B+" className="bg-card">B+</option>
                                <option value="B" className="bg-card">B</option>
                                <option value="C" className="bg-card">C</option>
                                <option value="U" className="bg-card">U (Fail)</option>
                              </select>
                            </div>
                          ) : (
                            <div className="col-span-2">
                              <input type="number" min="0" max={formData.maxMarks} placeholder={`Max ${formData.maxMarks}`} value={bulkStudentMarks[student._id]?.marksObtained || ''} onChange={e => {
                                setBulkStudentMarks(prev => ({...prev, [student._id]: {...prev[student._id], marksObtained: e.target.value}}))
                              }} className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredBulkStudents.length === 0 && (
                      <p className="text-sm text-foreground/50 text-center py-4">No students found for this department and semester.</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {formData.examType.startsWith('Internal Exam') ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-foreground/70 mb-1">Exam Marks (Max 60)</label>
                          <input type="number" min="0" max="60" required={entryMode === 'single'} value={formData.internalExamMarks || ''} onChange={e => {
                            const val = e.target.value;
                            const assg = formData.assignmentMarks || '';
                            setFormData({...formData, internalExamMarks: val, marksObtained: (val === '' && assg === '') ? '' : (Number(val) + Number(assg)).toString()});
                          }} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground/70 mb-1">Assignment Marks (Max 40)</label>
                          <input type="number" min="0" max="40" required={entryMode === 'single'} value={formData.assignmentMarks || ''} onChange={e => {
                            const val = e.target.value;
                            const int = formData.internalExamMarks || '';
                            setFormData({...formData, assignmentMarks: val, marksObtained: (int === '' && val === '') ? '' : (Number(int) + Number(val)).toString()});
                          }} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                        </div>
                      </>
                    ) : formData.examType === 'Semester Exam' ? (
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-foreground/70 mb-1">Grade *</label>
                        <select required={entryMode === 'single'} value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                          <option value="O" className="bg-card">O</option>
                          <option value="A+" className="bg-card">A+</option>
                          <option value="A" className="bg-card">A</option>
                          <option value="B+" className="bg-card">B+</option>
                          <option value="B" className="bg-card">B</option>
                          <option value="C" className="bg-card">C</option>
                          <option value="U" className="bg-card">U (Fail)</option>
                        </select>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-foreground/70 mb-1">Marks Obtained</label>
                          <input type="number" min="0" max={formData.maxMarks} required={entryMode === 'single'} value={formData.marksObtained} onChange={e => setFormData({...formData, marksObtained: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground/70 mb-1">Max Marks</label>
                          <input type="number" min="1" required={entryMode === 'single'} value={formData.maxMarks} onChange={e => setFormData({...formData, maxMarks: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50" />
                        </div>
                      </>
                    )}
                  </div>
                )}
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
      
      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">Student Performance Report</h3>
                <button onClick={() => { setShowReportModal(false); setSelectedReportStudent(''); }} className="text-foreground/50 hover:text-foreground"><X size={20} /></button>
              </div>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Department</label>
                  <select value={reportFilterDept} onChange={e => { setReportFilterDept(e.target.value); setSelectedReportStudent(''); }} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                    <option value="" className="bg-card">All Departments</option>
                    {departments.map(d => <option key={d._id} value={d._id} className="bg-card">{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Year</label>
                  <select value={reportFilterYear} onChange={e => { setReportFilterYear(e.target.value); setSelectedReportStudent(''); }} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                    <option value="" className="bg-card">All Years</option>
                    <option value="1" className="bg-card">1st Year</option>
                    <option value="2" className="bg-card">2nd Year</option>
                    <option value="3" className="bg-card">3rd Year</option>
                    <option value="4" className="bg-card">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Select Student</label>
                  <select value={selectedReportStudent} onChange={e => setSelectedReportStudent(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50">
                    <option value="" className="bg-card">-- Select a Student --</option>
                    {filteredReportStudents.map(s => <option key={s._id} value={s._id} className="bg-card">{s.name} ({s.rollNumber})</option>)}
                  </select>
                </div>
              </div>
              {selectedReportStudent && reportStudentObj ? (
                <div className="flex-1 overflow-auto">
                  <div className="mb-4">
                    <p className="font-semibold text-lg">{reportStudentObj.name}</p>
                    <p className="text-foreground/50 text-sm">Roll No: {reportStudentObj.rollNumber} • Dept: {departments.find(d => d._id === ((reportStudentObj.department as any)?._id || reportStudentObj.department))?.code || '-'}</p>
                  </div>
                  <div className="overflow-x-auto pb-4">
                    <table className="w-full text-left text-sm text-foreground/70 min-w-max">
                      <thead className="bg-black/20 text-foreground/50 border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3 font-medium">Subject</th>
                          {Array.from(new Set(reportStudentMarks.map(m => m.examType))).sort().map(examType => (
                            <th key={examType} className="px-4 py-3 font-medium whitespace-nowrap">{examType}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {Array.from(new Set(reportStudentMarks.map(m => m.subjectName))).map(subject => (
                          <tr key={subject} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{subject}</td>
                            {Array.from(new Set(reportStudentMarks.map(m => m.examType))).sort().map(examType => {
                              const m = reportStudentMarks.find(mark => mark.subjectName === subject && mark.examType === examType);
                              return (
                                <td key={examType} className="px-4 py-3">
                                  {m ? (
                                    m.examType === 'Semester Exam' ? (
                                      <span className={m.grade !== 'U' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>{m.grade}</span>
                                    ) : (
                                      <span className={getPercentage(m as any) >= 50 ? 'text-green-400' : 'text-red-400'}>{m.marksObtained}/{m.maxMarks}</span>
                                    )
                                  ) : (
                                    <span className="text-foreground/30">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-foreground/50 h-32">
                  Select a student to view their report card.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Improvement Plan Modal */}
      <AnimatePresence>
        {selectedPlanMark && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSelectedPlanMark(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-card/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-500 to-orange-500" />
              
              <div className="flex justify-between items-start mb-6 mt-2">
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" /> Improvement Plan
                  </h3>
                  <p className="text-sm text-foreground/50 mt-1">
                    For {selectedPlanMark.student?.name || 'Student'} in {selectedPlanMark.subjectName}
                  </p>
                </div>
                <button onClick={() => setSelectedPlanMark(null)} className="p-2 text-foreground/50 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              {(() => {
                const percentage = getPercentage(selectedPlanMark);
                const isCritical = percentage < 30;
                return (
                  <div className="space-y-6">
                    <div className={`p-4 rounded-xl border ${isCritical ? 'bg-red-500/10 border-red-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                      <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isCritical ? 'text-red-400' : 'text-orange-400'}`}>
                        <AlertCircle className="w-4 h-4" /> Current Status: {isCritical ? 'Critical Attention Required' : 'Needs Targeted Practice'}
                      </h4>
                      <p className="text-xs text-foreground/70 leading-relaxed">
                        The student scored {percentage.toFixed(1)}% in {selectedPlanMark.subjectName}. 
                        {isCritical 
                          ? ' Immediate intervention is recommended to build foundational understanding.'
                          : ' With focused revision on key weak areas, the student can easily reach a passing grade.'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground/90 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" /> Recommended Action Items
                      </h4>
                      <ul className="space-y-2 text-sm text-foreground/70">
                        {isCritical ? (
                          <>
                            <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span> Mandatory after-school tutoring for {selectedPlanMark.subjectName} basics.</li>
                            <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span> Schedule a Parent-Teacher meeting this week.</li>
                            <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span> Complete the foundational worksheets 1-5 before next class.</li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span> Review mistakes from the recent {selectedPlanMark.examType}.</li>
                            <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span> Practice past year papers for {selectedPlanMark.subjectName}.</li>
                            <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span> Join the weekend peer-study group.</li>
                          </>
                        )}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                      <button 
                        onClick={() => setSelectedPlanMark(null)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-foreground rounded-xl text-sm font-medium transition-colors"
                      >
                        Close
                      </button>
                      <button 
                        onClick={() => {
                          alert('Improvement Plan sent to student and parent successfully!');
                          setSelectedPlanMark(null);
                        }}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                      >
                        <Bell className="w-4 h-4" /> Send Plan to Student
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
