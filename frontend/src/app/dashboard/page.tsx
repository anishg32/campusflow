"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, ClipboardCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api';

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
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
    { label: 'Departments', value: departments.length, icon: Building2, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
    { label: 'Present Today', value: stats?.todayPresent || 0, icon: ClipboardCheck, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    { label: 'Today\'s Rate', value: `${stats?.todayPercentage || 0}%`, icon: TrendingUp, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, {firstName}! 👋</h1>
        <p className="text-foreground/60">Here&apos;s an overview of your student management system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl flex items-center justify-between"
          >
            <div>
              <p className="text-foreground/60 text-sm mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold">{loading ? '—' : stat.value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${stat.bgColor} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Overview */}
        <div className="glass rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
            <span>Departments</span>
            <a href="/dashboard/departments" className="text-sm text-indigo-500 hover:underline">View All</a>
          </h2>
          
          {loading ? (
            <div className="text-center text-foreground/40 py-8">Loading...</div>
          ) : departments.length === 0 ? (
            <div className="text-center text-foreground/40 py-8">
              <Building2 className="mx-auto mb-3 opacity-30" size={40} />
              <p>No departments yet</p>
              <a href="/dashboard/departments" className="text-indigo-500 text-sm hover:underline mt-2 inline-block">Add a department →</a>
            </div>
          ) : (
            <div className="space-y-4">
              {departments.slice(0, 5).map((dept, i) => (
                <motion.div 
                  key={dept._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-background/30 border border-border hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {dept.code.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{dept.name}</p>
                      <p className="text-xs text-foreground/50">{dept.code}</p>
                    </div>
                  </div>
                  <span className="text-sm text-foreground/70 flex items-center gap-1">
                    <Users size={14} /> {dept.studentCount}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-3xl p-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          
          <a href="/dashboard/students" className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
            <Users size={20} />
            Add New Student
          </a>
          
          <a href="/dashboard/attendance" className="w-full py-4 glass border border-indigo-500/30 rounded-xl font-bold hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2">
            <ClipboardCheck size={20} />
            Mark Attendance
          </a>

          <a href="/dashboard/departments" className="w-full py-4 glass border border-pink-500/30 rounded-xl font-bold hover:bg-pink-500/10 transition-colors flex items-center justify-center gap-2">
            <Building2 size={20} />
            Manage Departments
          </a>

          {/* Today's Summary */}
          {stats && stats.todayTotal > 0 && (
            <div className="mt-4 p-6 rounded-xl bg-background/30 border border-border">
              <h3 className="font-bold mb-4">Today&apos;s Attendance</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Present</span>
                  <span className="font-bold text-emerald-500">{stats.todayPresent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Absent</span>
                  <span className="font-bold text-red-500">{stats.todayAbsent}</span>
                </div>
                <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.todayPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  ></motion.div>
                </div>
                <p className="text-xs text-foreground/50 text-center">{stats.todayPercentage}% attendance rate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
