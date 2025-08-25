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
};

export default nextConfig;
