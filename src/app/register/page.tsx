"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import type { ApiError } from '@/lib/api';
import { GraduationCap, Mail, Lock, User as UserIcon, Phone, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(name, email, password, phoneNumber);
      setSuccess('Account created! Redirecting to login...');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background font-sans selection:bg-primary/30">
      
      {/* Left Panel - Branding & Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 bg-background relative flex-col justify-between p-12 overflow-hidden text-foreground border-r border-white/5">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(79, 70, 229, 0.2), transparent 50%)' }} />
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-sm">
            <GraduationCap className="w-7 h-7 text-foreground" />
          </div>
          <div>
            <span className="font-bold text-2xl tracking-tight text-foreground block leading-tight">CampusFlow</span>
            <span className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">Enterprise ERP</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 leading-tight">
              Join the next generation of education management.
            </h1>
            <p className="text-lg text-foreground/60 leading-relaxed mb-8">
              Create your faculty account to access attendance tracking, department management, and real-time student analytics.
            </p>
            
            <div className="flex items-center gap-4 text-foreground/50 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md w-fit">
              <ShieldCheck className="w-8 h-8 text-green-400/80" />
              <div className="text-sm">
                <p className="text-foreground/80 font-medium">Enterprise Security</p>
                <p>Your data is encrypted and secure.</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-foreground/40">
          <span>© {new Date().getFullYear()} CampusFlow Systems</span>
          <span>•</span>
          <a href="#" className="hover:text-foreground/70 transition-colors">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-foreground/70 transition-colors">Terms</a>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-[440px] space-y-8 relative z-10 py-10">
          {/* Mobile Header (Visible only on small screens) */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
             </div>
             <div>
                <span className="font-bold text-xl tracking-tight text-foreground block leading-tight">CampusFlow</span>
             </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Create Account</h2>
            <p className="text-foreground/60">Fill in your details to get started.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              {success}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40 group-focus-within:text-primary transition-colors">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/30 shadow-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40 group-focus-within:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/30 shadow-sm"
                  placeholder="faculty@college.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40 group-focus-within:text-primary transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/30 shadow-sm"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40 group-focus-within:text-primary transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-foreground/30 shadow-sm"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 rounded-xl bg-primary text-primary-foreground font-semibold text-[15px] hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-current opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-foreground/60 pt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
