"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Banknote, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AdmissionsPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-primary/30 overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[120px]" />
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex-1 flex flex-col lg:flex-row gap-12 items-center">
        
        <div className="flex-1 w-full space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold tracking-wider mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ADMISSIONS OPEN 2026-27
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              Your Journey to Excellence Starts Here
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed max-w-xl">
              Join one of the top engineering colleges in South India. Discover endless opportunities to learn, grow, and innovate.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <button className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-center hover:bg-primary/90 shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 group">
              Apply Online Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-foreground font-bold text-center hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" /> Download Brochure
            </button>
          </motion.div>
        </div>

        <div className="flex-1 w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="grid gap-4"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Simple Online Admission</h3>
                <p className="text-foreground/60 text-sm leading-relaxed">Register online through our portal and complete your application process from the comfort of your home.</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Diverse Courses Offered</h3>
                <p className="text-foreground/60 text-sm leading-relaxed">Choose from top B.E and B.Tech programs in CSE, AI & DS, IT, ECE, EEE, and Mechanical Engineering.</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-400 shrink-0">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Scholarship Opportunities</h3>
                <p className="text-foreground/60 text-sm leading-relaxed">Merit-based scholarships available for outstanding students to support their educational journey.</p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </main>
  );
}
