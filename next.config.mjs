/** @type {import('next').NextConfig} */
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
        headers: [
          ...noCache,
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://app.gohighlevel.com https://*.gohighlevel.com https://*.leadconnectorhq.com;",
          },
        ],
      },
      {
        source: "/admin",
        headers: noCache,
      },
      {
        source: "/api/:path*",
        headers: noCache,
      },
    ];
  },
};

export default nextConfig;
