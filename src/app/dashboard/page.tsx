"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, ClipboardCheck, TrendingUp, ArrowRight } from 'lucide-react';
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
  }, []);

  const overviewStats = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
    { label: 'Departments', value: departments.length, icon: Building2, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
    { label: 'Present Today', value: stats?.todayPresent || 0, icon: ClipboardCheck, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
    { label: 'Today\'s Rate', value: `${stats?.todayPercentage || 0}%`, icon: TrendingUp, color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-white">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Welcome back, {firstName}</h1>
        <p className="text-white/60">Here is what's happening with your students today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg backdrop-blur-md flex items-center justify-between hover:bg-white/10 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-white/50 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{loading ? '—' : stat.value}</h3>
            </div>
            <div className={`p-3.5 rounded-xl ${stat.bgColor} ${stat.color} shadow-inner border border-white/5`}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Overview */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl shadow-lg backdrop-blur-md p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-white">Departments Overview</h2>
            <Link href="/dashboard/departments" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center text-white/40 py-8 text-sm">Loading data...</div>
          ) : departments.length === 0 ? (
            <div className="text-center text-white/40 py-12">
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
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-inner border border-primary/20">
                      {dept.code.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-white">{dept.name}</p>
                      <p className="text-xs text-white/50">{dept.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{dept.studentCount}</p>
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Students</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Summary */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl shadow-lg backdrop-blur-md p-7">
            <h2 className="text-xl font-bold tracking-tight mb-5 text-white">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/dashboard/students" className="w-full py-3 px-5 bg-primary/90 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:bg-primary transition-all hover:scale-[1.02] flex items-center gap-3 text-sm">
                <Users size={18} className="opacity-80" />
                Add New Student
              </Link>
              <Link href="/dashboard/attendance" className="w-full py-3 px-5 bg-white/5 border border-white/10 text-white/80 rounded-xl font-medium hover:bg-white/10 hover:text-white transition-all flex items-center gap-3 text-sm">
                <ClipboardCheck size={18} className="opacity-70" />
                Mark Attendance
              </Link>
              <Link href="/dashboard/departments" className="w-full py-3 px-5 bg-white/5 border border-white/10 text-white/80 rounded-xl font-medium hover:bg-white/10 hover:text-white transition-all flex items-center gap-3 text-sm">
                <Building2 size={18} className="opacity-70" />
                Manage Departments
              </Link>
            </div>
          </div>

          {/* Today's Summary */}
          {stats && stats.todayTotal > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-3xl shadow-lg backdrop-blur-md p-7">
              <h2 className="text-xl font-bold tracking-tight mb-5 text-white">Today's Attendance</h2>
              <div className="space-y-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Present</span>
                  <span className="font-bold text-emerald-400 text-lg">{stats.todayPresent}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Absent</span>
                  <span className="font-bold text-red-400 text-lg">{stats.todayAbsent}</span>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-white/50 uppercase tracking-wider font-semibold">Overall Rate</span>
                    <span className="font-bold text-white">{stats.todayPercentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
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
