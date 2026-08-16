import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Royal Clans Admin",
    short_name: "RC Admin",
    description: "Admin panel for the Royal Clans esports tournament platform.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b0e14",
    theme_color: "#0b0e14",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
