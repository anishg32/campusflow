"use client";

import { ScanFace, Info } from 'lucide-react';

export default function FaceAttendance() {
  return (
    <div className="space-y-8 h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white mb-4 animate-pulse shadow-[0_0_40px_rgba(79,70,229,0.5)]">
        <ScanFace size={48} />
      </div>
      <h1 className="text-3xl font-bold">Face Recognition</h1>
      <p className="text-foreground/60 max-w-md">
        The face-api.js webcam scanner will initialize here. Make sure your face is well-lit for liveness detection.
      </p>
      
      <button className="mt-8 px-8 py-4 rounded-xl bg-foreground text-background font-bold text-lg hover:bg-foreground/90 transition-all">
        Start Camera
      </button>

      <div className="mt-6 max-w-md p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-foreground/70 flex items-start gap-3">
        <Info size={18} className="text-indigo-500 mt-0.5 shrink-0" />
        <p className="text-left">
          Face attendance is initiated by your faculty through the kiosk or scanner. This page will integrate with face-api.js for real-time recognition once the camera module is configured.
        </p>
      </div>
    </div>
  );
}
