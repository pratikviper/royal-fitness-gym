/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Add remote hosts here when wiring real trainer/gallery imagery.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"],
    // Explicit qualities (required by Next 16; silences the dev warning now).
    qualities: [75, 85],
  },
  // three.js ships untranspiled ESM; keep transpile list explicit for stability.
  transpilePackages: ["three"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
