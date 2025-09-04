/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from ngrok domains during development
  allowedDevOrigins: [
    "*.ngrok.io",
    "*.ngrok-free.app",
    "*.ngrok.app",
    // Add your specific ngrok domain if needed
    "https://537c691c0e0e.ngrok-free.app",
  ],
};

export default nextConfig;
