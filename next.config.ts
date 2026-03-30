import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  async redirects() {
    return [
      { source: '/admin-users', destination: '/admin/users', permanent: true },
      { source: '/admin-loans', destination: '/admin/loans', permanent: true },
      { source: '/admin-branches', destination: '/admin/branches', permanent: true },
      { source: '/admin/system', destination: '/admin/system-settings', permanent: true },
      { source: '/acc-disbursements', destination: '/acc/disbursements-pending', permanent: true },
    ];
  },
};

export default nextConfig;
