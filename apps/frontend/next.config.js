/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    transpilePackages: ['shared'],
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
  },
  output: 'standalone',
}

module.exports = nextConfig
