"use client";

import { useState } from 'react';
import { QrCode, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiPost, type ApiError } from '@/lib/api';

export default function QRScan() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [geoStatus, setGeoStatus] = useState<string>('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    setGeoStatus('Getting your location...');

    try {
      // Get geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      setGeoStatus(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

      const data = await apiPost<{ message: string }>('/attendance/qr/scan', {
        token: token.trim(),
        latitude,
        longitude,
      });

      setResult({ type: 'success', message: data.message });
      setToken('');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.message) {
        setResult({ type: 'error', message: apiErr.message });
      } else {
        setResult({ type: 'error', message: 'Could not get location or scan QR. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white mb-4 shadow-[0_0_40px_rgba(236,72,153,0.5)]">
        <QrCode size={48} />
      </div>
      <h1 className="text-3xl font-bold">Scan QR Code</h1>
      <p className="text-foreground/60 max-w-md">
        Enter the QR token displayed by your faculty. Your GPS location will be verified automatically.
      </p>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md p-4 rounded-xl flex items-center gap-3 ${
            result.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-500'
              : 'bg-red-500/10 border border-red-500/30 text-red-500'
          }`}
        >
          {result.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span className="text-sm">{result.message}</span>
        </motion.div>
      )}

      <form onSubmit={handleScan} className="w-full max-w-md space-y-4">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste QR token here..."
          required
          className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all text-center font-mono text-sm"
        />

        <button
          type="submit"
          disabled={loading || !token.trim()}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </>
          ) : (
            <>
              <MapPin size={18} />
              Mark Attendance
            </>
          )}
        </button>
      </form>

      {geoStatus && (
        <p className="text-xs text-foreground/40 flex items-center gap-1">
          <MapPin size={12} /> {geoStatus}
        </p>
      )}
    </div>
  );
}
