"use client";

import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Mail, Hash, Building2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and sessions.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center sm:items-start sm:flex-row gap-6 sm:gap-10"
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-primary to-purple-600 shadow-xl flex items-center justify-center text-white font-bold text-3xl sm:text-4xl border-4 border-background shrink-0">
          {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mt-2 capitalize">
              <ShieldCheck className="w-4 h-4" />
              {user.role}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
            {user.email && (
              <div className="flex items-center gap-3 text-muted-foreground justify-center sm:justify-start">
                <Mail className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium text-foreground">{user.email}</span>
              </div>
            )}
            
            {user.loginId && (
              <div className="flex items-center gap-3 text-muted-foreground justify-center sm:justify-start">
                <Hash className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium text-foreground">{user.loginId}</span>
              </div>
            )}

            {user.department && (
              <div className="flex items-center gap-3 text-muted-foreground justify-center sm:justify-start">
                <Building2 className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium text-foreground">{user.department}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 shadow-sm mt-8"
      >
        <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Logging out will clear your active session. You will need to sign in again to access the dashboard.
        </p>
        <button 
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-red-500/20 transition-all flex items-center gap-2 justify-center w-full sm:w-auto"
        >
          <LogOut className="w-5 h-5" />
          Log Out Now
        </button>
      </motion.div>
    </div>
  );
}
