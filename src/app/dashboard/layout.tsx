"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Building2, ClipboardCheck, Settings, LogOut, GraduationCap, Menu, X, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/dashboard/students', icon: Users },
  { name: 'Departments', href: '/dashboard/departments', icon: Building2 },
  { name: 'Attendance', href: '/dashboard/attendance', icon: ClipboardCheck },
  { name: 'Fees', href: '/dashboard/fees', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
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
        <div className="flex flex-col items-center gap-4 z-10">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-foreground/60 text-sm font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden font-sans selection:bg-primary/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, rgba(100,100,100,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,100,100,0.2) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="w-72 bg-card/80 backdrop-blur-xl border-r border-border h-screen flex flex-col fixed left-0 z-50 shadow-2xl shadow-black/10 dark:shadow-black/50"
          >
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground block leading-tight">College</span>
                  <span className="text-[10px] uppercase tracking-widest text-foreground/50 font-semibold">Automation</span>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-muted rounded-lg text-foreground/70">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <div className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'hover:bg-muted text-foreground/60 hover:text-foreground'}`}>
                      <Icon size={20} className={isActive ? 'text-primary-foreground' : 'opacity-70'} />
                      <span className="font-medium text-[15px]">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 mt-auto border-t border-border">
              <button 
                onClick={logout}
                className="flex items-center gap-4 px-4 py-3.5 w-full rounded-xl hover:bg-red-500/10 text-foreground/60 hover:text-red-500 transition-colors duration-300"
              >
                <LogOut size={20} className="opacity-70" />
                <span className="font-medium text-[15px]">Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 z-10 flex flex-col ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted text-foreground/70 transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-foreground">{user.name}</p>
              <p className="text-xs text-foreground/50 capitalize">{user.role || 'Teacher'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-600 border border-border shadow-lg cursor-pointer flex items-center justify-center text-white font-bold text-sm hover:scale-105 transition-transform">
              {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-10 relative flex-1 overflow-y-auto">
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
