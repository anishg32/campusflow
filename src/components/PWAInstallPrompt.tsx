"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share, PlusSquare } from "lucide-react";
import Image from "next/image";

// Declare type for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the user is on iOS
    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Check if already in standalone mode (PWA installed)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

    if (isStandalone) {
      return; // Do not show if already installed
    }

    if (isIosDevice) {
      setIsIOS(true);
      // Wait a few seconds before showing on iOS
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Listen for the native install prompt event (Android / Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show our custom UI
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
          className="fixed top-4 left-4 right-4 z-[9999] max-w-md mx-auto"
        >
          <div className="bg-background/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 relative overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50 pointer-events-none" />
            
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 p-1 flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="App Logo" 
                width={40} 
                height={40} 
                className="object-contain"
              />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                AHEC Portal
              </h3>
              
              {isIOS ? (
                <div className="text-xs text-muted-foreground flex items-center flex-wrap gap-1 mt-1">
                  Tap <Share className="w-3 h-3 inline" /> then <PlusSquare className="w-3 h-3 inline" /> &quot;Add to Home Screen&quot;
                </div>
              ) : (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  Get the app for faster access
                </p>
              )}
            </div>

            {!isIOS && (
              <button
                onClick={handleInstallClick}
                className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
              >
                Download
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
