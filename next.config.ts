import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  basePath: '/holdoumen',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/holdoumen',
        permanent: false,
        basePath: false,
      },
      {
        source: '/login',
        destination: '/holdoumen/login',
        permanent: false,
        basePath: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://holdoumenback-production.up.railway.app/api/:path*',
      },
    ];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
