"use client";

import { useAuth } from '@/context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="glass rounded-3xl p-8 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-foreground/60 mb-1">Full Name</label>
            <input type="text" disabled value={user?.name || ''} className="w-full bg-background/50 border border-border rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm text-foreground/60 mb-1">Email</label>
            <input type="text" disabled value={user?.email || ''} className="w-full bg-background/50 border border-border rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm text-foreground/60 mb-1">Role</label>
            <input type="text" disabled value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} className="w-full bg-background/50 border border-border rounded-lg px-4 py-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
