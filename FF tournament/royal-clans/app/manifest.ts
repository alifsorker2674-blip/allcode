import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Royal Clans",
    short_name: "Royal Clans",
    description:
      "Free Fire & Blood Strike esports tournament platform — join tournaments, host your own, and compete for real prizes.",
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
