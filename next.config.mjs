import createNextIntlPlugin from "next-intl/plugin"

/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    unoptimized: true, // Disable image optimization
  },
}

const withNextIntl = createNextIntlPlugin("./app/api/i18n/requests.ts")
export default withNextIntl(nextConfig)
