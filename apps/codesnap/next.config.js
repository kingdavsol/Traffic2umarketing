/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@traffic2u/ui', '@traffic2u/database', '@traffic2u/auth'],
  images: {
    domains: ['localhost', 'codesnap.com'],
  },
}

module.exports = nextConfig
