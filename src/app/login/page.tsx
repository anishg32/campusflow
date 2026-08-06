"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import type { ApiError } from '@/lib/api';
import { Mail, Lock, ArrowRight, Hash, Calendar } from 'lucide-react';

export default function Login() {
  const [role, setRole] = useState<'Admin' | 'Faculty' | 'Student'>('Admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      if (role === 'Admin') {
        await login({ email: identifier.trim(), password }, role.toLowerCase());
      } else {
        await login({ loginId: identifier.trim(), password }, role.toLowerCase());
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles: ('Admin' | 'Faculty' | 'Student')[] = ['Admin', 'Faculty', 'Student'];

  const getPlaceholder = () => {
    switch (role) {
      case 'Admin': return 'admin@gmail.com';
      case 'Faculty': return 'e.g. FAC001';
      case 'Student': return 'e.g. 960221104043';
    }
  };

  const getLabel = () => {
    switch (role) {
      case 'Admin': return 'Email Address';
      case 'Faculty': return 'Staff ID';
      case 'Student': return 'Register Number (Roll No)';
      default: return 'Login ID';
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background font-sans selection:bg-primary/30">
      
      {/* Left Panel - Branding & Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex w-full bg-background relative flex-col justify-between p-12 overflow-hidden text-foreground border-r border-border">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.15), transparent 50%)' }} />
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Arunachala Hitech</h1>
            <p className="text-xs text-foreground/70">Engineering College</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6 mt-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold leading-tight"
          >
            Next Generation<br/>College ERP System.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-foreground/70 max-w-md text-lg"
          >
            Manage academics, attendance, fees, and placements with a unified, beautifully crafted platform.
          </motion.p>
        </div>

        <div className="relative z-10 text-xs text-foreground/50">
          © {new Date().getFullYear()} Arunachala Hitech Engineering College. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Header (Visible only on small screens) */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
             <div className="p-2 bg-primary rounded-xl shadow-lg overflow-hidden">
                <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
             </div>
             <div className="text-center">
                <h1 className="font-bold text-xl leading-tight">Arunachala Hitech<br/><span className="text-sm font-normal">Engineering College</span></h1>
             </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-3 p-1 bg-[var(--muted)] rounded-xl gap-1">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(''); setIdentifier(''); }}
                className={`relative py-2 text-sm font-medium rounded-lg transition-colors ${
                  role === r ? 'text-primary-foreground' : 'text-[var(--muted-foreground)] hover:text-foreground'
                }`}
              >
                {role === r && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-lg"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{r}</span>
              </button>
            ))}
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

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">{getLabel()}</label>
              <div className="relative">
                {role === 'Admin' ? (
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                ) : (
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                )}
                <input 
                  type={role === 'Admin' ? 'email' : 'text'}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="premium-input !pl-11"
                  placeholder={getPlaceholder()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {role === 'Student' ? 'Date of Birth' : 'Password'}
              </label>
              <div className="relative">
                {role === 'Student' ? (
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                ) : (
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                )}
                <input 
                  type={role === 'Student' ? 'date' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="premium-input !pl-11"
                  placeholder={role === 'Student' ? '' : '••••••••'}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-border text-primary focus:ring-primary bg-background w-4 h-4" />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me for 30 days</label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-current opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  Sign in as {role} 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
            <p className="text-foreground/40">
              Contact your administrator if you need login credentials.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
