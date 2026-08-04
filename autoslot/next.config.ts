import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this application. Without this, the lockfile in
  // the user directory can be selected as the workspace root, preventing CSS
  // imports from resolving packages installed in this project.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
