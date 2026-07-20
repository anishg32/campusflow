"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic GSAP entrance animations
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

  return (
    <main className="relative min-h-screen overflow-x-hidden flex flex-col">
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div ref={heroRef} className="text-center space-y-8 max-w-4xl mx-auto px-4 flex flex-col items-center">
          
          {/* Prominent Logo */}
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

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto font-medium"
          >
            The future of college management. Experience a streamlined, 
            teacher-led attendance and administration platform.
          </motion.p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="px-8 py-4 rounded-full bg-foreground text-background font-semibold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(79,70,229,0.5)] text-center">
              Student Portal
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-full glass font-semibold text-lg hover:scale-105 hover:bg-white/10 transition-all duration-300 text-center">
              Faculty Login
            </Link>
          </div>
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
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">Next-Generation Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {[
            { title: 'AI Face Recognition', desc: 'Seamlessly mark attendance with state-of-the-art liveness detection and embeddings.', img: '/ai_face.png' },
            { title: 'Dynamic QR Attendance', desc: 'Secure, location-verified QR codes that expire in 30 seconds to prevent proxy.', img: '/dynamic_qr.png' },
            { title: 'Real-time Analytics', desc: 'Stunning 3D charts and actionable insights for admins, principals, and HODs.', img: '/analytics.png' }
          ].map((feature, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="glass rounded-[2rem] hover:-translate-y-4 hover:shadow-[0_0_40px_rgba(236,72,153,0.3)] transition-all duration-500 cursor-pointer overflow-hidden flex flex-col border border-white/10"
            >
              <div className="h-56 w-full relative overflow-hidden group">
                <img src={feature.img} alt={feature.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-black/20 to-transparent"></div>
              </div>
              <div className="p-8 flex-1 bg-black/40">
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Attendance Showcase Section */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-t from-background to-transparent">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">Smart Attendance Management</h2>
        <div className="glass w-full max-w-5xl h-[60vh] rounded-[2rem] flex items-center justify-center overflow-hidden relative shadow-[0_0_50px_rgba(79,70,229,0.2)]">
          <img 
            src="/attendance.jpg" 
            alt="Smart Classroom Attendance" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>
    </main>
  );
}
