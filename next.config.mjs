/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_SITE_URL: 'https://split.notwatermango.cc/',
    },
    allowedDevOrigins: ["192.168.*.*", "localhost"],
    output: 'export',
};

export default nextConfig;
