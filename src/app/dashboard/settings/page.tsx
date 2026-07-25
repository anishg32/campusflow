"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Smartphone, Key, Hash, Save, Check } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuth();
  
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiGet<any>('/settings');
        if (data) {
          setTwilioAccountSid(data.twilioAccountSid || '');
          setTwilioAuthToken(data.twilioAuthToken || '');
          setTwilioPhoneNumber(data.twilioPhoneNumber || '');
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiPost('/settings', {
        twilioAccountSid,
        twilioAuthToken,
        twilioPhoneNumber,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-3xl p-8 mt-6"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Smartphone className="text-indigo-500" /> 
            SMS Provider Configuration
          </h2>
          <p className="text-foreground/60 text-sm mt-1">
            Configure Twilio to enable automated text messages to parents.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-foreground/50">Loading settings...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80 flex items-center gap-2">
                <User size={16} className="text-indigo-400" /> Twilio Account SID
              </label>
              <input
                type="text"
                value={twilioAccountSid}
                onChange={(e) => setTwilioAccountSid(e.target.value)}
                placeholder="e.g. ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80 flex items-center gap-2">
                <Key size={16} className="text-pink-400" /> Twilio Auth Token
              </label>
              <input
                type="password"
                value={twilioAuthToken}
                onChange={(e) => setTwilioAuthToken(e.target.value)}
                placeholder="Enter your secret auth token"
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80 flex items-center gap-2">
                <Hash size={16} className="text-emerald-400" /> Twilio Phone Number
              </label>
              <input
                type="text"
                value={twilioPhoneNumber}
                onChange={(e) => setTwilioPhoneNumber(e.target.value)}
                placeholder="e.g. +1234567890"
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  saved
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                } disabled:opacity-50`}
              >
                {saving ? (
                  'Saving...'
                ) : saved ? (
                  <>
                    <Check size={18} /> Saved!
                  </>
                ) : (
                  <>
                    <Save size={18} /> Save SMS Configuration
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
