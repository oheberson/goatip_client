"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ManifestUpdater() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const currentTheme = resolvedTheme || theme;
    const themeColor = currentTheme === "dark" ? "#0f172a" : "#ffffff";

    // Create a dynamic manifest with the current theme color
    const manifest = {
      name: "GOATIP - Ajudante Fantasy",
      short_name: "Goatip",
      description: "Crie os melhores times fantasy com análises de dados",
      start_url: "/",
      display: "standalone",
      background_color: themeColor,
      theme_color: themeColor,
      orientation: "portrait",
      scope: "/",
      icons: [
        {
          src: "/icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "maskable any",
        },
      ],
      categories: ["sports", "games", "entertainment"],
      lang: "en",
      dir: "ltr",
    };

    // Create a blob URL for the dynamic manifest
    const manifestBlob = new Blob([JSON.stringify(manifest)], {
      type: "application/json",
    });
    const manifestURL = URL.createObjectURL(manifestBlob);

    // Update the manifest link
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      // Clean up the previous blob URL
      if (manifestLink.href.startsWith("blob:")) {
        URL.revokeObjectURL(manifestLink.href);
      }
      manifestLink.href = manifestURL;
    }

    // Cleanup function
    return () => {
      URL.revokeObjectURL(manifestURL);
    };
  }, [theme, resolvedTheme]);

  return null;
}
