/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    // Optimize for faster loads
    compress: true,
    poweredByHeader: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            {
                protocol: 'http',
                hostname: "127.0.0.1",
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
        ],
    },
};

export default nextConfig;
