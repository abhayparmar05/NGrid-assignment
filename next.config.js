/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    turbopack: {
        root: __dirname,
    },
    images: {
        unoptimized: true,
    },
    devIndicators: {
        appIsrStatus: false,
        buildActivity: false,
        buildActivityPosition: 'bottom-right',
    },
}

module.exports = nextConfig
