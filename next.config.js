/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    WALLETCONNECT_PROJECT_NAME: process.env.WALLETCONNECT_PROJECT_NAME,
    WALLETCONNECT_PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID,
  }
}

module.exports = nextConfig
