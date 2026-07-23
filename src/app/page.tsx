"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ClipboardCheck, Building2, BookOpen, GraduationCap, Calendar, MapPin, PhoneCall, ArrowRight } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Users,
      title: 'Student Profiles',
      desc: 'Maintain comprehensive records of student details, academic history, and contact information.',
    },
    {
      icon: Building2,
      title: 'Department Management',
      desc: 'Organize data across CSE, ECE, EEE, MECH, CIVIL, IT, and AI departments effectively.',
    },
    {
      icon: ClipboardCheck,
      title: 'Daily Attendance',
      desc: 'Track and monitor student attendance with easy-to-use digital registers for faculty.',
    },
    {
      icon: BookOpen,
      title: 'Academic Performance',
      desc: 'Record internal assessments, university grades, and generate automated performance reports.',
    },
    {
      icon: Calendar,
      title: 'Timetable Scheduling',
      desc: 'Manage class schedules, faculty allocations, and lab timings without conflicts.',
    },
    {
      icon: PhoneCall,
      title: 'Parent Communication',
      desc: 'Keep parents informed about attendance shortages and academic progress.',
    }
  ];

  return (
    <main className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-primary/30 overflow-hidden">
      
      {/* Abstract Background for whole page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Main Navigation */}
      <header className="w-full bg-background/50 border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm overflow-hidden p-1">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl lg:text-2xl text-foreground leading-tight">Arunachala Hitech</span>
              <span className="text-[10px] lg:text-xs font-bold text-foreground/50 tracking-widest uppercase">Engineering College</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <nav className="hidden md:flex gap-6 text-sm font-semibold text-foreground/60 mr-4">
              <Link href="/about" className="hover:text-foreground transition-colors">About Us</Link>
              <Link href="/academics" className="hover:text-foreground transition-colors">Academics</Link>
              <Link href="/admissions" className="hover:text-foreground transition-colors">Admissions</Link>
            </nav>
            <Link href="/login" className="text-sm font-bold text-foreground/80 hover:text-foreground transition-colors">
              Staff Login
            </Link>
            <Link href="/register" className="text-sm font-bold px-6 py-2.5 bg-primary/90 text-foreground rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:bg-primary transition-all">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col justify-center border-b border-white/5 py-12 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Text Content */}
          <div className="flex-1 space-y-6 z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 leading-[1.15]">
                Empowering Education Through <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Digital Innovation</span>
              </h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-foreground/60 leading-relaxed max-w-2xl"
            >
              Welcome to the official Management Information System for Arunachala Hitech Engineering College. A secure and centralized platform for faculty to manage attendance, internal marks, and student profiles efficiently.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link href="/login" className="px-8 py-4 rounded-xl bg-white text-slate-950 font-bold text-center hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all flex items-center justify-center gap-2 group">
                Access Staff Portal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-foreground font-bold text-center hover:bg-white/10 transition-all backdrop-blur-md">
                View Modules
              </Link>
            </motion.div>
          </div>

          {/* Image Content */}
          <div className="flex-1 w-full relative z-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.3)] border border-white/10 bg-card/50 p-1"
            >
              <div className="aspect-[4/3] rounded-xl overflow-hidden relative">
                 <Image 
                   src="/campus.png" 
                   alt="College Automation Campus" 
                   width={800}
                   height={600}
                   className="w-full h-full object-cover rounded-xl"
                   priority
                 />
                 
                 {/* Floating Badge */}
                 <motion.div 
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.5 }}
                   className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-white/10 flex items-center gap-3"
                 >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <ClipboardCheck className="text-emerald-400 w-4 h-4" /> 
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Live Sync</p>
                      <p className="text-[10px] text-foreground/50 uppercase tracking-wider">Attendance System</p>
                    </div>
                 </motion.div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">Core Modules</h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-6"></div>
            <p className="text-foreground/60 text-lg">
              Our comprehensive ERP suite simplifies administrative tasks, allowing faculty to focus more on teaching and student development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white/5 rounded-2xl p-8 border border-white/10 shadow-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30 group-hover:scale-110 group-hover:bg-primary/40 transition-all duration-300 text-primary">
                  <feature.icon className="w-7 h-7 text-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-foreground/50 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-background/80 border-t border-white/10 py-12 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-white/5 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center shadow-lg overflow-hidden p-1">
                  <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
                </div>
                <span className="font-bold text-xl text-foreground">Arunachala Hitech</span>
              </div>
              <p className="text-sm text-foreground/50 leading-relaxed">Engineering College<br/>Central Campus<br/>Main City.</p>
            </div>
            <div>
              <h4 className="text-foreground font-bold mb-4 tracking-wide">Quick Links</h4>
              <ul className="space-y-3 text-sm text-foreground/50">
                <li><Link href="https://www.annauniv.edu" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Anna University</Link></li>
                <li><Link href="https://www.aicte-india.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">AICTE Approvals</Link></li>
                <li><Link href="https://ndl.iitkgp.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Library Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-bold mb-4 tracking-wide">System Support</h4>
              <ul className="space-y-3 text-sm text-foreground/50">
                <li><Link href="mailto:it-helpdesk@college.edu" className="hover:text-foreground transition-colors">IT Helpdesk</Link></li>
                <li><Link href="mailto:erp-support@college.edu" className="hover:text-foreground transition-colors">ERP Guidelines</Link></li>
                <li><Link href="mailto:support@college.edu" className="hover:text-foreground transition-colors">Report an Issue</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foreground/40">
            <p>© {new Date().getFullYear()} Arunachala Hitech Engineering College. All rights reserved.</p>
            <p>Designed by the Department of Computer Science</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
