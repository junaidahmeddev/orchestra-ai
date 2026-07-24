/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  experimental: {
    serverComponentsExternalPackages: ["isolated-vm"],
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;