"use client";

import { motion } from 'framer-motion';
import { Users, QrCode, ScanFace, CalendarCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Professor';

  const stats = [
    { label: 'Total Students', value: '450', icon: Users, color: 'text-indigo-500' },
    { label: 'Average Attendance', value: '78%', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Classes Today', value: '4', icon: CalendarCheck, color: 'text-pink-500' },
    { label: 'Low Attendance Alerts', value: '12', icon: AlertCircle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, {firstName}! 📚</h1>
        <p className="text-foreground/60">Manage your classes and mark attendance effortlessly.</p>
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
        
        {/* Quick Actions (Left column) */}
        <div className="glass rounded-3xl p-8 flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-4">Start Attendance Session</h2>
          
          <button className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
            <QrCode size={20} />
            Generate Dynamic QR Code
          </button>
          
          <button className="w-full py-4 glass border border-indigo-500/30 rounded-xl font-bold hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2">
            <ScanFace size={20} />
            Initialize Face Scanner
          </button>

          <p className="text-xs text-foreground/50 text-center mt-2">
            Select a subject first to start a session.
          </p>
        </div>

        {/* Classes Overview (Right columns) */}
        <div className="lg:col-span-2 glass rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
            <span>My Subjects</span>
            <button className="text-sm text-indigo-500 hover:underline">Manage</button>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { code: 'CS301', name: 'Data Structures & Algorithms', students: 120, nextClass: 'Today, 10:30 AM' },
              { code: 'CS305', name: 'Database Management Systems', students: 115, nextClass: 'Today, 02:00 PM' },
              { code: 'CS401', name: 'Artificial Intelligence', students: 90, nextClass: 'Tomorrow, 09:00 AM' },
              { code: 'CS405', name: 'Cloud Computing', students: 125, nextClass: 'Wednesday, 11:30 AM' },
            ].map((subject, i) => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                key={i} 
                className="p-5 rounded-xl border border-border bg-background/30 hover:bg-background/50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-500/20 text-indigo-500 rounded-md">{subject.code}</span>
                  <span className="text-xs text-foreground/50 flex items-center gap-1">
                    <Users size={12} /> {subject.students}
                  </span>
                </div>
                <h3 className="font-bold mb-1 truncate">{subject.name}</h3>
                <p className="text-sm text-foreground/60 flex items-center gap-1 mt-3">
                  <CalendarCheck size={14} /> {subject.nextClass}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
