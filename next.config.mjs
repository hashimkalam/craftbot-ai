/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/graphql",
        destination:
          "https://assistly-ai-8sw6-pnnx8w3v0-hashim-kalams-projects.vercel.app/api/graphql",
      },
    ];
  },
};

export default nextConfig;
