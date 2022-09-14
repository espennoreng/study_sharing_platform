/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/REL1001/:slug*",
        destination: "/dokumenter/religion-og-etikk",
        permanent: true,
      },
      {
        source: "/REA3001/:slug*",
        destination: "/dokumenter/biologi",
        permanent: true,
      },
      {
        source: "/IDR3005/:slug*",
        destination: "/dokumenter/breddeidrett",
        permanent: true,
      },
      {
        source: "/REA3008/:slug*",
        destination: "/dokumenter/geofag",
        permanent: true,
      },
      {
        source: "/GEO1001/:slug*",
        destination: "/dokumenter/geografi",
        permanent: true,
      },
      {
        source: "/HIS1003/:slug*",
        destination: "/dokumenter/historie",
        permanent: true,
      },
      {
        source: "/REA3005/:slug*",
        destination: "/dokumenter/kjemi",
        permanent: true,
      },
      {
        source: "/SAM3005/:slug*",
        destination: "/dokumenter/markedsføring-og-ledelse",
        permanent: true,
      },
      {
        source: "/NAT1002/:slug*",
        destination: "/dokumenter/naturfag",
        permanent: true,
      },
      {
        source: "/NOR1211/:slug*",
        destination: "/dokumenter/norsk",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
