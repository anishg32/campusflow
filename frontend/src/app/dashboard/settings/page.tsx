"use client";

import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-foreground/60 text-sm mt-1">Your account details</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8"
      >
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/20">
            {user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-foreground/60 text-sm">Teacher Account</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-background/30 border border-border">
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500">
              <User size={20} />
            </div>
            <div>
              <p className="text-xs text-foreground/50 uppercase tracking-wider">Full Name</p>
              <p className="font-medium">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-background/30 border border-border">
            <div className="p-3 rounded-lg bg-pink-500/10 text-pink-500">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs text-foreground/50 uppercase tracking-wider">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-background/30 border border-border">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-xs text-foreground/50 uppercase tracking-wider">Role</p>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
