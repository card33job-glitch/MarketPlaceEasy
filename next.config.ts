import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permet d'ouvrir le serveur de dev depuis un téléphone sur le Wi-Fi local
  // (IP du Mac ou nom en .local), pas seulement via localhost.
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*", "*.local"],
  devIndicators: false,
};

export default nextConfig;
