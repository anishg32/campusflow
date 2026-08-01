import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
  allowedDevOrigins: [
    'compiler-innocent-regression-pharmacology.trycloudflare.com',
    'skating-specialist-alarm-without.trycloudflare.com',
    '192.168.1.3'
  ],
};

export default withSerwist(nextConfig);
