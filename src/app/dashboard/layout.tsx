"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Building2, ClipboardCheck, Settings, LogOut, GraduationCap, Menu, X, CreditCard, Megaphone, UserCog, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';
import Image from 'next/image';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Manage Users', href: '/dashboard/users', icon: UserCog },
  { name: 'Students', href: '/dashboard/students', icon: Users },
  { name: 'Departments', href: '/dashboard/departments', icon: Building2 },
  { name: 'Attendance', href: '/dashboard/attendance', icon: ClipboardCheck },
  { name: 'Fees', href: '/dashboard/fees', icon: CreditCard },
  { name: 'Study Materials', href: '/dashboard/materials', icon: BookOpen },
  { name: 'Marks', href: '/dashboard/marks', icon: GraduationCap },
  { name: 'Circulars', href: '/dashboard/circulars', icon: Megaphone },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  
  // Route protection
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="h-[100dvh] bg-background flex items-center justify-center pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
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

  const visibleNavItems = navItems.filter(item => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'faculty') {
      return ['Overview', 'Students', 'Attendance', 'Marks', 'Study Materials', 'Circulars'].includes(item.name);
    }
    if (user?.role === 'student') {
      return ['Overview', 'Students', 'Attendance', 'Marks', 'Study Materials', 'Circulars'].includes(item.name);
    }
    return false;
  });

  return (
    <div className="min-h-[100dvh] bg-background flex font-sans selection:bg-primary/30 w-full relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, rgba(100,100,100,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,100,100,0.2) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden lg:flex w-[280px] fixed left-0 top-0 bottom-0 z-50 p-4">
        <div className="bg-card/40 backdrop-blur-3xl border border-white/10 h-full w-full flex flex-col rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          <div className="p-6 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-lg p-1">
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
              </div>
              <div>
                <span className="text-sm font-extrabold text-foreground block leading-tight tracking-tight">Arunachala Hitech</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-foreground/50 font-bold">Engineering</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto relative z-10 custom-scrollbar">
            {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const displayName = (user?.role === 'student' && item.name === 'Students') ? 'My Profile' : item.name;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <div className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'hover:bg-white/5 text-foreground/60 hover:text-foreground border border-transparent'}`}>
                      <Icon size={18} className={isActive ? 'text-primary' : 'group-hover:scale-110 transition-transform duration-300'} />
                      <span className={`font-semibold text-sm`}>{displayName}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(79,70,229,0.8)]" />}
                    </div>
                  </Link>
                );
            })}
          </nav>

          <div className="p-4 mt-auto border-t border-white/5 relative z-10">
            <button 
              onClick={logout}
              className="flex items-center gap-3.5 px-4 py-3 w-full rounded-2xl hover:bg-red-500/10 text-foreground/60 hover:text-red-500 transition-all duration-300 border border-transparent hover:border-red-500/20 group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-semibold text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 z-10 flex flex-col lg:ml-[280px] pb-[calc(68px+env(safe-area-inset-bottom))] lg:pb-0 pt-[env(safe-area-inset-top)]`}>
        {/* Floating Header */}
        <div className="px-4 lg:px-8 pt-4 lg:pt-6 sticky top-[env(safe-area-inset-top)] z-40">
          <header className="h-16 bg-card/40 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-between px-4 lg:px-6 shadow-xl shadow-black/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-3 relative z-10 lg:hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-lg p-0.5">
                  <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
                </div>
                <span className="text-sm font-extrabold text-foreground tracking-tight">AHEC Portal</span>
            </div>
            
            <div className="flex items-center gap-3 lg:gap-5 relative z-10 ml-auto">
              <ThemeToggle />
              <NotificationBell />
              <div className="h-8 w-px bg-white/10 hidden sm:block mx-1" />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground leading-none">{user.name}</p>
                <p className="text-xs text-foreground/50 capitalize mt-1 font-medium">{user.role || 'Teacher'}</p>
              </div>
              <Link href="/dashboard/profile">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-purple-600 border border-white/20 shadow-lg cursor-pointer flex items-center justify-center text-white font-bold text-xs hover:scale-105 hover:shadow-primary/50 transition-all duration-300">
                  {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              </Link>
            </div>
          </header>
        </div>

        <main className="p-4 lg:p-8 relative flex-1 w-full mx-auto">
          <div className="relative z-10 h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-3xl border-t border-white/10 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-[68px] px-1 overflow-x-auto custom-scrollbar gap-1">
          {visibleNavItems.filter(item => !['Departments', 'Settings'].includes(item.name)).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const displayName = item.name === 'Overview' ? 'Home' : item.name;
            
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className="flex-1 min-w-[55px] flex flex-col items-center justify-center gap-1.5 h-full relative group -webkit-tap-highlight-transparent"
              >
                {isActive && (
                   <motion.div
                     layoutId="bottom-nav-indicator"
                     className="absolute inset-0 bg-primary/10 rounded-2xl m-1"
                     transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                   />
                )}
                <Icon 
                  size={22} 
                  className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-foreground/50 group-hover:text-foreground/80'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`relative z-10 text-[10px] font-semibold transition-colors duration-300 ${isActive ? 'text-primary' : 'text-foreground/50'}`}>
                  {displayName}
                </span>
              </Link>
            );
          })}
          
          <button 
            onClick={logout}
            className="flex-1 flex flex-col items-center justify-center gap-1.5 h-full relative group -webkit-tap-highlight-transparent"
          >
            <LogOut 
              size={22} 
              className="relative z-10 text-foreground/50 group-hover:text-red-500 transition-colors duration-300" 
              strokeWidth={2}
            />
            <span className="relative z-10 text-[10px] font-semibold text-foreground/50 group-hover:text-red-500 transition-colors duration-300">
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
