/** @type {import('next').NextConfig} */
const isExport = process.env.NEXT_PUBLIC_EXPORT === 'true';

const nextConfig = {
  ...(isExport && {
    output: 'export',
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
    images: { unoptimized: true },
    trailingSlash: true,
  }),
};

export default nextConfig;
