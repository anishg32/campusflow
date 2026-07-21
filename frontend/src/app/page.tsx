"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Users, ClipboardCheck, Building2, Phone } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, {
        y: 50,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.5
      });

      if (cardsRef.current) {
        gsap.from(cardsRef.current.children, {
          y: 100,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
          }
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Student Records',
      desc: 'Store and manage complete student details including roll numbers, contact information, and department assignments.',
      gradient: 'from-indigo-500 to-purple-600',
    },
    {
      icon: Building2,
      title: 'Department Organization',
      desc: 'Organize students by department with easy filtering and management. View department-wise statistics at a glance.',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      icon: ClipboardCheck,
      title: 'Attendance Tracking',
      desc: 'Mark attendance department-wise with a simple, intuitive interface. View historical records and track attendance trends.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Phone,
      title: 'Contact Management',
      desc: 'Store student phone numbers for easy access. Keep parent and student contact details organized and accessible.',
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden flex flex-col">
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div ref={heroRef} className="text-center space-y-8 max-w-4xl mx-auto px-4 flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img 
              src="/logo.png" 
              alt="Arunachala Hitech Logo" 
              className="w-64 md:w-80 lg:w-96 drop-shadow-2xl mb-4"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70"
          >
            Student Management System
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto font-medium"
          >
            A streamlined, teacher-led platform to manage student records, 
            track attendance, and organize departments — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login" className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(79,70,229,0.5)] text-center">
              Teacher Login
            </Link>
            <Link href="/register" className="px-8 py-4 rounded-full glass font-semibold text-lg hover:scale-105 hover:bg-white/10 transition-all duration-300 text-center">
              Create Account
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 animate-bounce">
          <svg className="w-6 h-6 text-foreground/50" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">Powerful Features</h2>
        <p className="text-foreground/60 text-lg mb-16 text-center max-w-2xl">Everything you need to manage your college students efficiently</p>
        
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="glass rounded-[2rem] p-8 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(79,70,229,0.2)] transition-all duration-500 cursor-pointer border border-white/10 group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-foreground/70 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20">
        <div className="glass rounded-[2rem] p-12 max-w-3xl w-full text-center border border-white/10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-foreground/60 mb-8 text-lg">Sign in with your teacher account to begin managing students.</p>
          <Link href="/login" className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(79,70,229,0.4)]">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
