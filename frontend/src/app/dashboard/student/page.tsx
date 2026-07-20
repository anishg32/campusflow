"use client";

import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, CheckCircle, ScanFace, QrCode } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Student';

  const stats = [
    { label: 'Overall Attendance', value: '85%', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Classes Attended', value: '142', icon: CheckCircle, color: 'text-indigo-500' },
    { label: 'Total Subjects', value: '6', icon: Users, color: 'text-purple-500' },
    { label: 'Upcoming Class', value: '10:30 AM', icon: Clock, color: 'text-pink-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}! 👋</h1>
        <p className="text-foreground/60">Here&apos;s your attendance overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl flex items-center justify-between"
          >
            <div>
              <p className="text-foreground/60 text-sm mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-xl bg-background/50 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Attendance (Left column, takes 2/3 space) */}
        <div className="lg:col-span-2 glass rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
            <span>Subject-wise Attendance</span>
            <button className="text-sm text-indigo-500 hover:underline">View All</button>
          </h2>
          
          <div className="space-y-6">
            {[
              { subject: 'Data Structures & Algorithms', percentage: 92, status: 'Excellent' },
              { subject: 'Database Management Systems', percentage: 78, status: 'Good' },
              { subject: 'Operating Systems', percentage: 65, status: 'Warning' },
              { subject: 'Computer Networks', percentage: 88, status: 'Excellent' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.subject}</span>
                  <span className={`font-bold ${item.percentage < 75 ? 'text-red-500' : 'text-green-500'}`}>{item.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${item.percentage < 75 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (Right column) */}
        <div className="glass rounded-3xl p-8 flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
          
          <button className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
            <ScanFace size={20} />
            Mark Face Attendance
          </button>
          
          <button className="w-full py-4 glass border border-indigo-500/30 rounded-xl font-bold hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2">
            <QrCode size={20} />
            Scan QR Code
          </button>

          <div className="mt-8">
            <h3 className="font-bold mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-background/30 border border-border">
                <div className="w-2 h-10 bg-indigo-500 rounded-full"></div>
                <div>
                  <p className="font-bold text-sm">Data Structures</p>
                  <p className="text-xs text-foreground/60">10:30 AM - 11:30 AM • Room 302</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-background/30 border border-border">
                <div className="w-2 h-10 bg-pink-500 rounded-full"></div>
                <div>
                  <p className="font-bold text-sm">Operating Systems</p>
                  <p className="text-xs text-foreground/60">12:00 PM - 01:00 PM • Room 405</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
