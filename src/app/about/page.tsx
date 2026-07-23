"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Target, Lightbulb, Users, Award, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      desc: 'To empower the young Engineers to shine in their future by providing quality education and fostering innovation and research.',
    },
    {
      icon: Lightbulb,
      title: 'Our Vision',
      desc: 'To become a globally recognized center of excellence in engineering education and technology development.',
    },
    {
      icon: Users,
      title: 'Community',
      desc: 'A thriving ecosystem of students, faculty, and industry experts working together to solve real-world problems.',
    },
    {
      icon: Award,
      title: 'Excellence',
      desc: 'Committed to the highest standards of academic integrity, professional ethics, and continuous improvement.',
    }
  ];

  return (
    <main className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-primary/30 overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[120px]" />
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
          className="text-center max-w-3xl mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            About Our Institution
          </h1>
          <p className="text-lg text-foreground/70 leading-relaxed">
            Arunachala Hitech Engineering College is a premier Co-educational Institution run by the visionary Arunachala Group of Educational Institutions. We are dedicated to creating professionals and entrepreneurs who will lead the future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {values.map((v, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors group"
            >
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <v.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{v.title}</h3>
              <p className="text-foreground/60 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
