import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    buildActivityPosition: "bottom-right",
  },
  allowedDevOrigins: [
    'compiler-innocent-regression-pharmacology.trycloudflare.com',
    'skating-specialist-alarm-without.trycloudflare.com',
    '192.168.1.3'
  ],
};

export default nextConfig;
