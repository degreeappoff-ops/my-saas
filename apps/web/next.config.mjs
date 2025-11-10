/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pour que Next transpile le package du monorepo
  transpilePackages: ["@repo/db"],
};

export default nextConfig;
