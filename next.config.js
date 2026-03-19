/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // MVPではexternal画像を使う可能性があるため
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // ローカル画像のfallback用
    unoptimized: true,
  },
};

module.exports = nextConfig;
