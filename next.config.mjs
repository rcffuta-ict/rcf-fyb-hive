/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'nobox-upload-bucket.s3.eu-west-2.amazonaws.com',
                port: '',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**', // allow everything, or narrow it to /con-so-nant/image/upload/**
            },
        ],
    },
    async headers() {
        return [
            {
                // Belt and braces for the hidden ops page: an X-Robots-Tag
                // header applies to every response under /ops, including ones a
                // crawler reaches without parsing HTML, so it can't be indexed
                // even if the URL leaks. Deliberately not in robots.txt — a
                // Disallow rule there would publish the path it protects.
                source: '/ops/:path*',
                headers: [
                    {
                        key: 'X-Robots-Tag',
                        value: 'noindex, nofollow, noarchive, nosnippet',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
