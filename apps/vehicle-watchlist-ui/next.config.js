//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  // static export only for production builds
  ...(process.env.NODE_ENV === 'production'
    ? {
        output: 'export',
        images: {
          unoptimized: true,
        },
      }
    : {
        // API rewrites for development
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: 'http://localhost:3000/api/:path*',
            },
          ];
        },
      }),
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
