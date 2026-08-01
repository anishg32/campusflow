"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ClipboardCheck, Building2, BookOpen, GraduationCap, Calendar, MapPin, PhoneCall, ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import ThreeBackground from '@/components/ThreeBackground';

export default function Home() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;

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
    <main className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-primary/30 overflow-x-hidden">
      
      {/* Background conditionally rendered based on theme */}
      {mounted && currentTheme === 'dark' ? (
        <ThreeBackground />
      ) : (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
      )}


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
              <Link href="/login" className="px-8 py-4 rounded-xl bg-foreground text-background font-bold text-center hover:opacity-90 shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all flex items-center justify-center gap-2 group">
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
                   src="/modern_campus_building.png" 
                   alt="College Automation Campus" 
                   width={800}
                   height={600}
                   className="w-full h-full object-cover rounded-xl"
                   priority
                 />
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

    </main>
  );
}
