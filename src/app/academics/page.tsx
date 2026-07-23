"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, Cpu, Zap, Database, Globe, Wrench, ArrowLeft } from 'lucide-react';

export default function AcademicsPage() {
  const departments = [
    {
      title: 'Computer Science & Engineering',
      degree: 'B.E',
      icon: Globe,
      color: 'text-blue-400',
      bg: 'bg-blue-400/20'
    },
    {
      title: 'Artificial Intelligence & Data Science',
      degree: 'B.Tech',
      icon: Database,
      color: 'text-purple-400',
      bg: 'bg-purple-400/20'
    },
    {
      title: 'Electronics & Communication',
      degree: 'B.E',
      icon: Cpu,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/20'
    },
    {
      title: 'Information Technology',
      degree: 'B.Tech',
      icon: BookOpen,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/20'
    },
    {
      title: 'Electrical & Electronics',
      degree: 'B.E',
      icon: Zap,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/20'
    },
    {
      title: 'Mechanical Engineering',
      degree: 'B.E',
      icon: Wrench,
      color: 'text-orange-400',
      bg: 'bg-orange-400/20'
    }
  ];

  return (
    <main className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-primary/30 overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Header */}
      <header className="w-full bg-background/50 border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm overflow-hidden p-1">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl lg:text-2xl text-foreground leading-tight">Arunachala Hitech</span>
              <span className="text-[10px] lg:text-xs font-bold text-foreground/50 tracking-widest uppercase">Engineering College</span>
            </div>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/" className="text-sm font-semibold flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex-1 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            Academic Programs
          </h1>
          <p className="text-lg text-foreground/70 leading-relaxed">
            We offer cutting-edge undergraduate programs designed to prepare students for the rapidly evolving tech landscape.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {departments.map((dept, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-all overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${dept.bg} rounded-bl-full blur-[40px] opacity-50 group-hover:opacity-100 transition-opacity`} />
              
              <div className={`w-12 h-12 ${dept.bg} rounded-2xl flex items-center justify-center mb-6`}>
                <dept.icon className={`w-6 h-6 ${dept.color}`} />
              </div>
              
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-bold tracking-wider mb-4 border border-white/5">
                {dept.degree} Program
              </div>
              
              <h3 className="text-xl font-bold leading-tight mb-2 pr-4">{dept.title}</h3>
              
              <div className="mt-8 flex items-center text-sm font-semibold text-primary group-hover:translate-x-2 transition-transform cursor-pointer">
                View Syllabus <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
