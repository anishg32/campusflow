"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Calendar, FileText, Settings, LogOut, ScanFace, QrCode, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const studentNavItems = [
  { name: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
  { name: 'Face Attendance', href: '/dashboard/student/face', icon: ScanFace },
  { name: 'QR Attendance', href: '/dashboard/student/qr', icon: QrCode },
  { name: 'Schedule', href: '/dashboard/student/schedule', icon: Calendar },
  { name: 'Leave Requests', href: '/dashboard/student/leaves', icon: FileText },
  { name: 'Settings', href: '/dashboard/student/settings', icon: Settings },
];

const facultyNavItems = [
  { name: 'Overview', href: '/dashboard/faculty', icon: LayoutDashboard },
  { name: 'Manual Attendance', href: '/dashboard/faculty/manual', icon: CheckCircle },
  { name: 'Generate QR', href: '/dashboard/faculty/qr', icon: QrCode },
  { name: 'Face Scanner', href: '/dashboard/faculty/face', icon: ScanFace },
  { name: 'My Students', href: '/dashboard/faculty/students', icon: Users },
  { name: 'Settings', href: '/dashboard/faculty/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Route protection: redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Show nothing while checking auth (prevents flash)
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="aurora-bg"></div>
        <div className="flex flex-col items-center gap-4 z-10">
          <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-foreground/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const isFaculty = user.role === 'faculty' || user.role === 'admin' || user.role === 'principal' || user.role === 'hod';
  const navItems = isFaculty ? facultyNavItems : studentNavItems;

  // Compute display info
  const displayRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className="w-72 glass border-r border-border h-screen flex flex-col fixed left-0 z-50"
      >
        <div className="p-8 flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-12 h-12 object-contain drop-shadow-md"
          />
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 leading-tight">Arunachala Hitech Attendance</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-foreground text-background shadow-lg' : 'hover:bg-foreground/5 text-foreground/70'}`}>
                  <Icon size={20} className={isActive ? 'text-background' : 'text-foreground/70'} />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-red-500 transition-colors duration-300"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <header className="h-20 glass border-b border-border flex items-center justify-between px-8 sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-foreground/5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{user.name}</p>
              <p className="text-xs text-foreground/60">{displayRole}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border-2 border-background cursor-pointer flex items-center justify-center text-white font-bold text-sm">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
        </header>

        <main className="p-8 relative">
          <div className="aurora-bg opacity-30 fixed top-0 left-0 w-full h-full pointer-events-none z-0"></div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
