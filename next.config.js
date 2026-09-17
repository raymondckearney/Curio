/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pdfkit'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  // pptxgenjs (Session Architect's "Generate Session Materials" export,
  // client-side only) ships an ESM build that statically imports a few
  // Node built-ins it never actually calls in the browser. Its own
  // package.json "browser" field maps them to false, but that's ignored
  // once a package also defines "exports" (as pptxgenjs does) — so the
  // fallback has to be declared here instead.
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        https: false,
        os: false,
        path: false,
      };
      // Strip the "node:" URI scheme webpack itself doesn't resolve, so the
      // fallback map above (which only matches bare specifiers) still applies.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
