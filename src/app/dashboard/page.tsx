"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, ClipboardCheck, TrendingUp, ArrowRight, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api';
import Link from 'next/link';

interface Stats {
  totalStudents: number;
  todayPresent: number;
  todayAbsent: number;
  todayTotal: number;
  todayPercentage: number;
}

interface DepartmentData {
  _id: string;
  name: string;
  code: string;
  studentCount: number;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Teacher';
  const [stats, setStats] = useState<Stats | null>(null);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'student') {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [statsData, deptData] = await Promise.all([
          apiGet<Stats>('/attendance/stats'),
          apiGet<DepartmentData[]>('/departments'),
        ]);
        setStats(statsData);
        setDepartments(deptData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const overviewStats = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
    { label: 'Departments', value: departments.length, icon: Building2, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
    { label: 'Present Today', value: stats?.todayPresent || 0, icon: ClipboardCheck, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
    { label: 'Today\'s Rate', value: `${stats?.todayPercentage || 0}%`, icon: TrendingUp, color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-foreground">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">Welcome back, {firstName}</h1>
        <p className="text-foreground/60">
          {user?.role === 'student' 
            ? 'Welcome to your student portal. Access your academic records and profile.' 
            : 'Here is what\'s happening with your students today.'}
        </p>
      </div>

      {user?.role !== 'student' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {overviewStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card/50 border border-border p-6 rounded-2xl shadow-lg backdrop-blur-md flex items-center justify-between hover:bg-card/80 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-foreground/50 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-foreground">{loading ? '—' : stat.value}</h3>
              </div>
              <div className={`p-3.5 rounded-xl ${stat.bgColor} ${stat.color} shadow-inner border border-border/50`}>
                <stat.icon size={24} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Overview (Admin Only) */}
        {user?.role === 'admin' && (
          <div className="lg:col-span-2 bg-card/50 border border-border rounded-3xl shadow-lg backdrop-blur-md p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Departments Overview</h2>
              <Link href="/dashboard/departments" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center text-foreground/40 py-8 text-sm">Loading data...</div>
            ) : departments.length === 0 ? (
              <div className="text-center text-foreground/40 py-12">
                <Building2 className="mx-auto mb-3 opacity-20" size={32} />
                <p className="text-sm">No departments created yet</p>
                <Link href="/dashboard/departments" className="text-primary text-sm hover:underline mt-2 inline-block font-medium">Add a department</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {departments.slice(0, 5).map((dept, i) => (
                  <motion.div 
                    key={dept._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-inner border border-primary/20">
                        {dept.code.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{dept.name}</p>
                        <p className="text-xs text-foreground/50">{dept.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{dept.studentCount}</p>
                      <p className="text-xs text-foreground/40 uppercase tracking-wider font-semibold">Students</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Faculty View */}
        {user?.role === 'faculty' && (
          <div className="lg:col-span-2 bg-card/50 border border-border rounded-3xl shadow-lg backdrop-blur-md p-10 flex flex-col items-center justify-center text-center">
            <Users className="w-16 h-16 text-primary/40 mb-4" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Faculty Portal</h2>
            <p className="text-foreground/60 mt-2 max-w-md">Access your classes, mark daily student attendance, and upload exam marks directly from the navigation sidebar.</p>
          </div>
        )}

        {/* Student View */}
        {user?.role === 'student' && (
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl shadow-[0_0_30px_rgba(99,102,241,0.05)] backdrop-blur-md p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors" />
              <GraduationCap className="w-12 h-12 text-indigo-400 mb-5 relative z-10" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2 relative z-10">Academic Profile</h2>
              <p className="text-foreground/60 text-sm relative z-10">Access your complete academic history, marks, and grades across all semesters in one unified view.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl shadow-[0_0_30px_rgba(16,185,129,0.05)] backdrop-blur-md p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden group"
            >
              <div className="absolute bottom-0 right-0 -mr-8 -mb-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors" />
              <ClipboardCheck className="w-12 h-12 text-emerald-400 mb-5 relative z-10" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2 relative z-10">Attendance & Fees</h2>
              <p className="text-foreground/60 text-sm relative z-10">Stay on top of your daily attendance records and track your pending or completed fee payments.</p>
            </motion.div>
          </div>
        )}

        {/* Quick Actions & Summary */}
        <div className="flex flex-col gap-6">
          <div className="bg-card/50 border border-border rounded-3xl shadow-lg backdrop-blur-md p-7">
            <h2 className="text-xl font-bold tracking-tight mb-5 text-foreground">Quick Actions</h2>
            <div className="space-y-3">
              {user?.role !== 'student' && (
                <>
                  <Link href="/dashboard/students" className="w-full py-3 px-5 bg-primary/90 text-primary-foreground rounded-xl font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:bg-primary transition-all hover:scale-[1.02] flex items-center gap-3 text-sm">
                    <Users size={18} className="opacity-80" />
                    {user?.role === 'admin' ? 'Add New Student' : 'View Students'}
                  </Link>
                  <Link href="/dashboard/attendance" className="w-full py-3 px-5 bg-card/30 border border-border text-foreground/80 rounded-xl font-medium hover:bg-card/60 hover:text-foreground transition-all flex items-center gap-3 text-sm">
                    <ClipboardCheck size={18} className="opacity-70" />
                    Mark Attendance
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link href="/dashboard/departments" className="w-full py-3 px-5 bg-card/30 border border-border text-foreground/80 rounded-xl font-medium hover:bg-card/60 hover:text-foreground transition-all flex items-center gap-3 text-sm">
                  <Building2 size={18} className="opacity-70" />
                  Manage Departments
                </Link>
              )}
              {user?.role === 'student' && (
                <Link href="/dashboard/students" className="w-full py-4 px-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:scale-[1.02] flex items-center justify-between text-sm group">
                  <span className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Users size={18} className="text-white" />
                    </div>
                    Access My Profile
                  </span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>

          {user?.role !== 'student' && stats && stats.todayTotal > 0 && (
            <div className="bg-card/50 border border-border rounded-3xl shadow-lg backdrop-blur-md p-7">
              <h2 className="text-xl font-bold tracking-tight mb-5 text-foreground">Today's Attendance</h2>
              <div className="space-y-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/60">Present</span>
                  <span className="font-bold text-emerald-400 text-lg">{stats.todayPresent}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/60">Absent</span>
                  <span className="font-bold text-red-400 text-lg">{stats.todayAbsent}</span>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-foreground/50 uppercase tracking-wider font-semibold">Overall Rate</span>
                    <span className="font-bold text-foreground">{stats.todayPercentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-foreground/10 rounded-full overflow-hidden border border-border/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.todayPercentage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
