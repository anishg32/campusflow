"use client";

import { useState, useEffect, useRef } from 'react';
import { QrCode, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiPost, type ApiError } from '@/lib/api';

interface QRResponse {
  qrToken: string;
  expiresAt: string;
}

export default function FacultyQR() {
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<QRResponse | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer
  useEffect(() => {
    if (qrData?.expiresAt) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((new Date(qrData.expiresAt).getTime() - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          setQrData(null);
        }
      };
      updateTimer();
      intervalRef.current = setInterval(updateTimer, 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [qrData]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setQrData(null);
    setLoading(true);

    try {
      const data = await apiPost<QRResponse>('/attendance/qr/generate', {
        subjectId: subjectId.trim(),
      });
      setQrData(data);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to generate QR session');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (qrData?.qrToken) {
      navigator.clipboard.writeText(qrData.qrToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Generate QR Attendance</h1>
        <p className="text-foreground/60">Create a dynamic QR token for your class. It expires in 30 seconds.</p>
      </div>

      <div className="glass rounded-3xl p-8 max-w-xl mx-auto">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm flex items-center gap-2"
          >
            <XCircle size={18} />
            {error}
          </motion.div>
        )}

        {!qrData ? (
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Subject ID</label>
              <input
                type="text"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                placeholder="Enter MongoDB Subject ID"
                required
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
              />
              <p className="text-xs text-foreground/40 mt-2">
                The ObjectId of the subject from the database
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !subjectId.trim()}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <QrCode size={20} />
                  Generate QR Session
                </>
              )}
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-green-500">
              <CheckCircle size={24} />
              <span className="font-bold text-lg">QR Session Active</span>
            </div>

            <div className="p-6 rounded-2xl bg-background/50 border border-border">
              <p className="text-xs text-foreground/50 mb-2 uppercase tracking-wider">QR Token</p>
              <p className="font-mono text-sm break-all select-all leading-relaxed">{qrData.qrToken}</p>
            </div>

            <button
              onClick={copyToken}
              className="w-full py-3 glass border border-indigo-500/30 rounded-xl font-bold hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle size={18} className="text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Token
                </>
              )}
            </button>

            <div className={`flex items-center justify-center gap-2 text-lg font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
              <Clock size={20} />
              <span>Expires in {timeLeft}s</span>
            </div>

            <button
              onClick={() => { setQrData(null); setSubjectId(''); }}
              className="text-sm text-foreground/50 hover:text-foreground transition-colors"
            >
              Generate Another
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
