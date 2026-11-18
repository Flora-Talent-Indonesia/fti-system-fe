import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/fti/finance", destination: "/finance", permanent: false }];
  },
};

export default nextConfig;
