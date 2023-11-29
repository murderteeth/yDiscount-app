/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['raw.githubusercontent.com', 'assets.smold.app']
  },
  env: {
    WALLETCONNECT_PROJECT_NAME: process.env.WALLETCONNECT_PROJECT_NAME,
    WALLETCONNECT_PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID,
    SMOL_ASSETS_URL: process.env.SMOL_ASSETS_URL,
  }
}

module.exports = nextConfig
