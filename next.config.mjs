/** @type {import('next').NextConfig} */
const embedInGhl = {
  key: "Content-Security-Policy",
  value: "frame-ancestors *;",
};

const nextConfig = {
  async headers() {
    const noCache = [
      {
        key: "Cache-Control",
        value: "no-store, no-cache, must-revalidate",
      },
    ];

    return [
      {
        source: "/toggle",
        headers: [...noCache, embedInGhl],
      },
      {
        source: "/admin",
        headers: [...noCache, embedInGhl],
      },
      {
        source: "/api/:path*",
        headers: noCache,
      },
    ];
  },
};

export default nextConfig;
